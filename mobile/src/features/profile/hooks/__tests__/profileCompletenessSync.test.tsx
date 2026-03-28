import { act, renderHook, waitFor } from '@testing-library/react-native';
import { createQueryTestHarness } from '../../../../lib/testing/queryTestHarness';
import { useProfile } from '../useProfile';
import { useProfileCompleteness } from '../useProfileCompleteness';

const mockGetProfile = jest.fn();
const mockUpdateProfile = jest.fn();
const mockProfileCompleteness = jest.fn();
const mockSetUser = jest.fn();

jest.mock('../../../../services/api', () => ({
  profileApi: {
    getProfile: (...args: unknown[]) => mockGetProfile(...args),
    updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
    updateFitness: jest.fn(),
    uploadPhoto: jest.fn(),
    updatePhoto: jest.fn(),
    deletePhoto: jest.fn(),
  },
  discoveryApi: {
    profileCompleteness: (...args: unknown[]) => mockProfileCompleteness(...args),
  },
}));

jest.mock('../../../../store/authStore', () => ({
  useAuthStore: {
    getState: () => ({
      setUser: (...args: unknown[]) => mockSetUser(...args),
    }),
  },
}));

describe('profile completeness cache sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not let a stale completeness refetch reopen the profile completion prompt after a bio save', async () => {
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
    mockProfileCompleteness
      .mockResolvedValueOnce({
        data: {
          score: 88,
          total: 8,
          earned: 7,
          prompts: ['Write a bio (20+ chars) so people know your vibe.'],
          missing: [{ field: 'bio', label: 'Add a bio', route: 'EditProfile' }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          score: 88,
          total: 8,
          earned: 7,
          prompts: ['Write a bio (20+ chars) so people know your vibe.'],
          missing: [{ field: 'bio', label: 'Add a bio', route: 'EditProfile' }],
        },
      });

    const { wrapper } = createQueryTestHarness();
    const { result } = renderHook(
      () => ({
        profile: useProfile(),
        completeness: useProfileCompleteness(),
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.profile.isSuccess).toBe(true);
      expect(result.current.completeness.isSuccess).toBe(true);
    });

    await act(async () => {
      await result.current.profile.updateProfile({
        bio: updatedProfile.profile.bio,
      });
    });

    expect(mockProfileCompleteness).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(result.current.completeness.score).toBe(100);
      expect(result.current.completeness.missing).toEqual([]);
    });
  });
});
