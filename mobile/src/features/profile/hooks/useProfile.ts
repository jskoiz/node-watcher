import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProfileCompleteness, User } from '../../../api/types';
import { profileApi } from '../../../services/api';
import { queryKeys } from '../../../lib/query/queryKeys';
import { invalidateProfileSurfaces } from '../../../lib/query/queryInvalidation';
import { useAuthStore } from '../../../store/authStore';
import { useEffect } from 'react';

/** Sync the returned User back into authStore so screens reading authStore.user stay current. */
function syncUserToAuthStore(user: User) {
  useAuthStore.getState().setUser(user);
}

const PROFILE_COMPLETENESS_TOTAL = 8;
const PROFILE_COMPLETENESS_BIO_MIN_CHARS = 20;

function buildProfileCompleteness(user: User): ProfileCompleteness {
  const checks = [
    {
      field: 'firstName',
      label: 'Add your first name',
      route: 'EditProfile',
      prompt: 'Add your first name.',
      ok: Boolean(user.firstName?.trim()),
    },
    {
      field: 'birthdate',
      label: 'Add your birthday',
      route: 'EditProfile',
      prompt: 'Add your birthday.',
      ok: Boolean((user as User & { birthdate?: string | null }).birthdate),
    },
    {
      field: 'bio',
      label: 'Add a bio',
      route: 'EditProfile',
      prompt: 'Write a bio (20+ chars) so people know your vibe.',
      ok: (user.profile?.bio?.trim().length ?? 0) >= PROFILE_COMPLETENESS_BIO_MIN_CHARS,
    },
    {
      field: 'city',
      label: 'Set your city',
      route: 'EditProfile',
      prompt: 'Add your city for better nearby matches.',
      ok: Boolean(user.profile?.city?.trim()),
    },
    {
      field: 'photos',
      label: 'Add more photos',
      route: 'EditPhotos',
      prompt: 'Upload at least 2 profile photos.',
      ok: (user.photos?.length ?? 0) >= 2,
    },
    {
      field: 'primaryGoal',
      label: 'Set a fitness goal',
      route: 'EditFitness',
      prompt: 'Set a primary fitness goal.',
      ok: Boolean(user.fitnessProfile?.primaryGoal?.trim()),
    },
    {
      field: 'intensityLevel',
      label: 'Choose your intensity',
      route: 'EditFitness',
      prompt: 'Choose your training intensity.',
      ok: Boolean(user.fitnessProfile?.intensityLevel?.trim()),
    },
    {
      field: 'availability',
      label: 'Set your availability',
      route: 'EditFitness',
      prompt: 'Set your availability (morning/evening).',
      ok: Boolean(user.fitnessProfile?.prefersMorning || user.fitnessProfile?.prefersEvening),
    },
  ];

  const earned = checks.filter((check) => check.ok).length;

  return {
    score: Math.round((earned / PROFILE_COMPLETENESS_TOTAL) * 100),
    total: PROFILE_COMPLETENESS_TOTAL,
    earned,
    prompts: checks.filter((check) => !check.ok).map((check) => check.prompt),
    missing: checks
      .filter((check) => !check.ok)
      .map(({ field, label, route }) => ({ field, label, route })),
  };
}

function syncUserToCaches(queryClient: ReturnType<typeof useQueryClient>, user: User) {
  queryClient.setQueryData(queryKeys.profile.current(), user);
  queryClient.setQueryData(
    queryKeys.discovery.profileCompleteness(),
    buildProfileCompleteness(user),
  );
  syncUserToAuthStore(user);
}

function mergeUserProfile(
  queryClient: ReturnType<typeof useQueryClient>,
  user: User,
): User {
  const currentUser = queryClient.getQueryData<User>(queryKeys.profile.current());
  if (!currentUser?.profile) {
    return user;
  }

  return {
    ...user,
    profile: currentUser.profile,
  };
}

export function useProfile() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.profile.current(),
    queryFn: async (): Promise<User> => (await profileApi.getProfile()).data,
  });

  useEffect(() => {
    if (query.data) {
      syncUserToAuthStore(query.data);
    }
  }, [query.data]);

  const updateFitness = useMutation({
    mutationFn: profileApi.updateFitness,
    onSuccess: (response) => {
      syncUserToCaches(queryClient, mergeUserProfile(queryClient, response.data));
      void invalidateProfileSurfaces(queryClient);
    },
  });
  const updateProfile = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (response) => {
      syncUserToCaches(queryClient, response.data);
      void invalidateProfileSurfaces(queryClient);
    },
  });
  const uploadPhoto = useMutation({
    mutationFn: profileApi.uploadPhoto,
    onSuccess: (response) => {
      syncUserToCaches(queryClient, response.data);
      void invalidateProfileSurfaces(queryClient);
    },
  });
  const updatePhoto = useMutation({
    mutationFn: async ({
      photoId,
      payload,
    }: {
      photoId: string;
      payload: Parameters<typeof profileApi.updatePhoto>[1];
    }) => profileApi.updatePhoto(photoId, payload),
    onSuccess: (response) => {
      syncUserToCaches(queryClient, response.data);
      void invalidateProfileSurfaces(queryClient);
    },
  });
  const deletePhoto = useMutation({
    mutationFn: profileApi.deletePhoto,
    onSuccess: (response) => {
      syncUserToCaches(queryClient, response.data);
      void invalidateProfileSurfaces(queryClient);
    },
  });

  return {
    ...query,
    profile: query.data ?? null,
    updateFitness: updateFitness.mutateAsync,
    updateProfile: updateProfile.mutateAsync,
    uploadPhoto: uploadPhoto.mutateAsync,
    updatePhoto: updatePhoto.mutateAsync,
    deletePhoto: deletePhoto.mutateAsync,
    isSavingFitness: updateFitness.isPending,
    isSavingProfile: updateProfile.isPending,
    isUploadingPhoto: uploadPhoto.isPending,
    isUpdatingPhoto: updatePhoto.isPending,
    isDeletingPhoto: deletePhoto.isPending,
  };
}
