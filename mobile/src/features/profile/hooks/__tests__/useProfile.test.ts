import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { User } from '../../../../api/types';
import { queryKeys } from '../../../../lib/query/queryKeys';
import { createQueryTestHarness } from '../../../../lib/testing/queryTestHarness';
import { useAuthStore } from '../../../../store/authStore';
import { useProfile } from '../useProfile';

const mockGetProfile = jest.fn();
const mockUpdateFitness = jest.fn();
const mockUpdateProfile = jest.fn();
const mockUploadPhoto = jest.fn();
const mockUpdatePhoto = jest.fn();
const mockDeletePhoto = jest.fn();

jest.mock('../../../../services/api', () => ({
  profileApi: {
    getProfile: (...args: unknown[]) => mockGetProfile(...args),
    updateFitness: (...args: unknown[]) => mockUpdateFitness(...args),
    updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
    uploadPhoto: (...args: unknown[]) => mockUploadPhoto(...args),
    updatePhoto: (...args: unknown[]) => mockUpdatePhoto(...args),
    deletePhoto: (...args: unknown[]) => mockDeletePhoto(...args),
  },
}));

function createProfileUser(
  overrides: Partial<User> & {
    profile?: Partial<NonNullable<User['profile']>>;
    fitnessProfile?: Partial<NonNullable<User['fitnessProfile']>>;
  } = {},
): User {
  const base: User = {
    id: 'u1',
    email: 'alice@example.com',
    firstName: 'Alice',
    isOnboarded: true,
    profile: {
      bio: 'Original bio',
      intentDating: false,
      intentWorkout: true,
      intentFriends: false,
    },
    fitnessProfile: {
      intensityLevel: 'moderate',
      weeklyFrequencyBand: '3-4',
      primaryGoal: 'connection',
      favoriteActivities: 'Running',
    },
    photos: [
      {
        id: 'photo-1',
        storageKey: 'photo-1',
        isPrimary: true,
        isHidden: false,
        sortOrder: 0,
      },
      {
        id: 'photo-2',
        storageKey: 'photo-2',
        isPrimary: false,
        isHidden: false,
        sortOrder: 1,
      },
    ],
  };

  return {
    ...base,
    ...overrides,
    profile: {
      ...base.profile,
      ...(overrides.profile ?? {}),
    },
    fitnessProfile: {
      ...base.fitnessProfile,
      ...(overrides.fitnessProfile ?? {}),
    },
  };
}

describe('useProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ token: null, user: null, isLoading: false });
  });

  it('returns profile data on success', async () => {
    const profile = { id: 'u1', firstName: 'Alice', age: 28 };
    mockGetProfile.mockResolvedValue({ data: profile });

    const { wrapper } = createQueryTestHarness();
    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.profile).toEqual(profile);
  });

  it('returns null profile on API failure', async () => {
    mockGetProfile.mockRejectedValue(new Error('Network error'));

    const { wrapper } = createQueryTestHarness();
    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.profile).toBeNull();
  });

  it('starts in loading state', () => {
    mockGetProfile.mockReturnValue(new Promise(() => {}));

    const { wrapper } = createQueryTestHarness();
    const { result } = renderHook(() => useProfile(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.profile).toBeNull();
  });

  it('exposes mutation helpers', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'u1' } });

    const { wrapper } = createQueryTestHarness();
    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(typeof result.current.updateFitness).toBe('function');
    expect(typeof result.current.updateProfile).toBe('function');
    expect(typeof result.current.uploadPhoto).toBe('function');
    expect(typeof result.current.updatePhoto).toBe('function');
    expect(typeof result.current.deletePhoto).toBe('function');
  });

  it('syncs fitness updates into the auth store and invalidates the profile write scope', async () => {
    const fullUser = createProfileUser();
    mockGetProfile.mockResolvedValue({ data: fullUser });
    mockUpdateFitness.mockResolvedValue({
      data: createProfileUser({
        fitnessProfile: {
          intensityLevel: 'high',
          weeklyFrequencyBand: '5+',
          primaryGoal: 'strength',
        },
      }),
    });

    const { queryClient, wrapper } = createQueryTestHarness();
    queryClient.setQueryData(queryKeys.discovery.feed(), []);
    queryClient.setQueryData(queryKeys.discovery.profileCompleteness(), {
      score: 1,
      total: 5,
      earned: 1,
      prompts: [],
      missing: [],
    });
    queryClient.setQueryData(queryKeys.matches.list(), []);
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useProfile(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(async () => {
      await result.current.updateFitness({
        intensityLevel: 'high',
        weeklyFrequencyBand: '5+',
        primaryGoal: 'strength',
        favoriteActivities: 'Running',
        prefersMorning: true,
      });
    });

    expect(useAuthStore.getState().user).toEqual({
      id: 'u1',
      email: 'alice@example.com',
      firstName: 'Alice',
      isOnboarded: true,
      profile: {
        intentDating: false,
        intentWorkout: true,
        intentFriends: false,
      },
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.profile.all(),
      refetchType: 'active',
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.discovery.all(),
      refetchType: undefined,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.matches.list(),
      refetchType: undefined,
    });
  });

  it('merges profile updates into the cached user and auth store projection', async () => {
    const fullUser = createProfileUser();
    mockGetProfile.mockResolvedValue({ data: fullUser });
    mockUpdateProfile.mockResolvedValue({
      data: {
        userId: 'u1',
        bio: 'New bio',
        city: 'Honolulu',
        intentDating: true,
      },
    });

    const { queryClient, wrapper } = createQueryTestHarness();
    const { result } = renderHook(() => useProfile(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(async () => {
      await result.current.updateProfile({
        bio: 'New bio',
        city: 'Honolulu',
        intentDating: true,
      });
    });

    await waitFor(() =>
      expect(useAuthStore.getState().user).toEqual({
        id: 'u1',
        email: 'alice@example.com',
        firstName: 'Alice',
        isOnboarded: true,
        profile: {
          intentDating: true,
          intentWorkout: true,
          intentFriends: false,
        },
      }),
    );
  });

  it('invalidates the profile write scope for photo mutations', async () => {
    mockGetProfile.mockResolvedValue({ data: createProfileUser() });
    mockUploadPhoto.mockResolvedValue({ data: undefined });
    mockUpdatePhoto.mockResolvedValue({ data: undefined });
    mockDeletePhoto.mockResolvedValue({ data: undefined });

    const { queryClient, wrapper } = createQueryTestHarness();
    queryClient.setQueryData(queryKeys.discovery.feed(), []);
    queryClient.setQueryData(queryKeys.discovery.profileCompleteness(), {
      score: 1,
      total: 5,
      earned: 1,
      prompts: [],
      missing: [],
    });
    queryClient.setQueryData(queryKeys.matches.list(), []);
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useProfile(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(async () => {
      await result.current.uploadPhoto({
        uri: 'file://photo.jpg',
        mimeType: 'image/jpeg',
        fileName: 'photo.jpg',
      });
    });

    await act(async () => {
      await result.current.updatePhoto({
        photoId: 'photo-1',
        payload: { isPrimary: true },
      });
    });

    await act(async () => {
      await result.current.deletePhoto('photo-2');
    });

    expect(invalidateSpy).toHaveBeenCalledTimes(9);
  });
});
