import { act, renderHook, waitFor } from '@testing-library/react-native';
import { createQueryTestHarness } from '../../../../lib/testing/queryTestHarness';
import { queryKeys } from '../../../../lib/query/queryKeys';
import { useProfile } from '../useProfile';

const mockGetProfile = jest.fn();
const mockUpdateFitness = jest.fn();
const mockUpdateProfile = jest.fn();
const mockUploadPhoto = jest.fn();
const mockUpdatePhoto = jest.fn();
const mockDeletePhoto = jest.fn();
const mockSetUser = jest.fn();
const mockInvalidateProfileSurfaces = jest.fn();

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

jest.mock('../../../../store/authStore', () => ({
  useAuthStore: {
    getState: () => ({
      setUser: (...args: unknown[]) => mockSetUser(...args),
    }),
  },
}));

jest.mock('../../../../lib/query/queryInvalidation', () => ({
  invalidateProfileSurfaces: (...args: unknown[]) => mockInvalidateProfileSurfaces(...args),
}));

describe('useProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns profile data on success', async () => {
    const profile = { id: 'u1', firstName: 'Alice', age: 28 };
    mockGetProfile.mockResolvedValue({ data: profile });

    const { wrapper } = createQueryTestHarness();
    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.profile).toEqual(profile);
    expect(mockSetUser).toHaveBeenCalledWith(profile);
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

  it('syncs mutation responses into the profile cache and auth store', async () => {
    const initialProfile = { id: 'u1', firstName: 'Alice', photos: [] };
    const updatedProfile = { id: 'u1', firstName: 'Alice', photos: [{ id: 'photo-1' }] };
    mockGetProfile.mockResolvedValue({ data: initialProfile });
    mockUploadPhoto.mockResolvedValue({ data: updatedProfile });

    const { queryClient, wrapper } = createQueryTestHarness();
    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(async () => {
      await result.current.uploadPhoto({ uri: 'file:///tmp/photo.jpg' });
    });

    expect(queryClient.getQueryData(queryKeys.profile.current())).toEqual(updatedProfile);
    expect(mockSetUser).toHaveBeenLastCalledWith(updatedProfile);
    expect(mockInvalidateProfileSurfaces).toHaveBeenCalledWith(queryClient);
  });

  it('updates cached bio completeness immediately after a successful profile save', async () => {
    const initialProfile = {
      id: 'u1',
      firstName: 'Alice',
      birthdate: '1994-05-10T00:00:00.000Z',
      photos: [{ id: 'photo-1' }, { id: 'photo-2' }],
      profile: { bio: '', city: 'Honolulu' },
      fitnessProfile: {
        intensityLevel: 'moderate',
        primaryGoal: 'connection',
        prefersMorning: true,
        prefersEvening: false,
      },
    };
    const updatedProfile = {
      ...initialProfile,
      profile: {
        ...initialProfile.profile,
        bio: 'Sunrise runs, surf checks, and low-pressure plans.',
      },
    };
    mockGetProfile.mockResolvedValue({ data: initialProfile });
    mockUpdateProfile.mockResolvedValue({ data: updatedProfile });

    const { queryClient, wrapper } = createQueryTestHarness();
    queryClient.setQueryData(queryKeys.discovery.profileCompleteness(), {
      score: 88,
      total: 8,
      earned: 7,
      prompts: ['Write a bio (20+ chars) so people know your vibe.'],
      missing: [{ field: 'bio', label: 'Add a bio', route: 'EditProfile' }],
    });

    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(async () => {
      await result.current.updateProfile({
        bio: updatedProfile.profile.bio,
      });
    });

    expect(queryClient.getQueryData(queryKeys.discovery.profileCompleteness())).toEqual({
      score: 100,
      total: 8,
      earned: 8,
      prompts: [],
      missing: [],
    });
  });

  it('does not regress completed bio state when the next fitness response carries stale profile basics', async () => {
    const initialProfile = {
      id: 'u1',
      firstName: 'Alice',
      birthdate: '1994-05-10T00:00:00.000Z',
      photos: [{ id: 'photo-1' }, { id: 'photo-2' }],
      profile: { bio: '', city: 'Honolulu' },
      fitnessProfile: {
        intensityLevel: 'moderate',
        primaryGoal: 'connection',
        prefersMorning: true,
        prefersEvening: false,
      },
    };
    const updatedProfile = {
      ...initialProfile,
      profile: {
        ...initialProfile.profile,
        bio: 'Sunrise runs, surf checks, and low-pressure plans.',
      },
    };
    const staleFitnessResponse = {
      ...updatedProfile,
      profile: initialProfile.profile,
      fitnessProfile: {
        ...updatedProfile.fitnessProfile,
        intensityLevel: 'high',
      },
    };
    mockGetProfile.mockResolvedValue({ data: initialProfile });
    mockUpdateProfile.mockResolvedValue({ data: updatedProfile });
    mockUpdateFitness.mockResolvedValue({ data: staleFitnessResponse });

    const { queryClient, wrapper } = createQueryTestHarness();
    queryClient.setQueryData(queryKeys.discovery.profileCompleteness(), {
      score: 88,
      total: 8,
      earned: 7,
      prompts: ['Write a bio (20+ chars) so people know your vibe.'],
      missing: [{ field: 'bio', label: 'Add a bio', route: 'EditProfile' }],
    });

    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(async () => {
      await result.current.updateProfile({
        bio: updatedProfile.profile.bio,
      });
      await result.current.updateFitness({
        intensityLevel: 'high',
      });
    });

    expect(queryClient.getQueryData(queryKeys.profile.current())).toEqual({
      ...updatedProfile,
      fitnessProfile: staleFitnessResponse.fitnessProfile,
    });
    expect(queryClient.getQueryData(queryKeys.discovery.profileCompleteness())).toEqual({
      score: 100,
      total: 8,
      earned: 8,
      prompts: [],
      missing: [],
    });
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
});
