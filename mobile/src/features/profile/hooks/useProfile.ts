import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdatePhotoPayload, User } from '../../../api/types';
import { profileApi } from '../../../services/api';
import { queryKeys } from '../../../lib/query/queryKeys';
import { applyPhotoUpdate, patchProfile } from '../../../lib/query/queryData';
import {
  invalidateQueryScopes,
  queryInvalidationScopes,
} from '../../../lib/query/queryInvalidation';
import { beginOptimisticUpdate } from '../../../lib/query/optimisticUpdates';
import { useAuthStore } from '../../../store/authStore';

export function useProfile() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.profile.current(),
    queryFn: async () => (await profileApi.getProfile() as { data: User }).data,
  });

  useEffect(() => {
    if (query.data) {
      useAuthStore.getState().setUser(query.data);
    }
  }, [query.data]);

  const updateFitness = useMutation({
    mutationFn: async (payload: Parameters<typeof profileApi.updateFitness>[0]) =>
      (await profileApi.updateFitness(payload) as { data: User }).data,
    onMutate: async (payload) =>
      beginOptimisticUpdate(queryClient, [
        {
          queryKey: queryKeys.profile.current(),
          exact: true,
          updater: (current) => {
            const user = current as User | undefined;
            if (!user) {
              return user;
            }

            return {
              ...user,
              fitnessProfile: {
                ...user.fitnessProfile,
                ...payload,
              },
            };
          },
        },
      ]),
    onError: (_error, _payload, context) => {
      context?.rollback();
    },
    onSuccess: (response) => {
      patchProfile(queryClient, () => response);
    },
    onSettled: () => {
      void invalidateQueryScopes(queryClient, queryInvalidationScopes.profileWrite);
    },
  });
  const updateProfile = useMutation({
    mutationFn: async (payload: Parameters<typeof profileApi.updateProfile>[0]) =>
      (
        await profileApi.updateProfile(payload) as {
          data: User['profile'] & { userId?: string };
        }
      ).data,
    onMutate: async (payload) =>
      beginOptimisticUpdate(queryClient, [
        {
          queryKey: queryKeys.profile.current(),
          exact: true,
          updater: (current) => {
            const user = current as User | undefined;
            if (!user) {
              return user;
            }

            return {
              ...user,
              profile: {
                ...user.profile,
                ...payload,
              },
            };
          },
        },
      ]),
    onError: (_error, _payload, context) => {
      context?.rollback();
    },
    onSuccess: (response) => {
      const { userId: _userId, ...profile } = response;
      patchProfile(queryClient, (current) =>
        current
          ? {
              ...current,
              profile: {
                ...current.profile,
                ...profile,
              },
            }
          : current,
      );
    },
    onSettled: () => {
      void invalidateQueryScopes(queryClient, queryInvalidationScopes.profileWrite);
    },
  });
  const uploadPhoto = useMutation({
    mutationFn: async (payload: Parameters<typeof profileApi.uploadPhoto>[0]) =>
      (
        await profileApi.uploadPhoto(payload) as {
          data: unknown;
        }
      ).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.profile.current(),
      });
    },
    onSettled: () => {
      void invalidateQueryScopes(queryClient, queryInvalidationScopes.profileWrite);
    },
  });
  const updatePhoto = useMutation({
    mutationFn: async ({
      photoId,
      payload,
    }: {
      photoId: string;
      payload: UpdatePhotoPayload;
    }) =>
      (
        await profileApi.updatePhoto(photoId, payload) as {
          data: unknown;
        }
      ).data,
    onMutate: async ({ photoId, payload }) =>
      beginOptimisticUpdate(queryClient, [
        {
          queryKey: queryKeys.profile.current(),
          exact: true,
          updater: (current) => {
            const user = current as User | undefined;
            if (!user) {
              return user;
            }

            return {
              ...user,
              photos: applyPhotoUpdate(user.photos, photoId, payload),
            };
          },
        },
      ]),
    onError: (_error, _payload, context) => {
      context?.rollback();
    },
    onSettled: () => {
      void invalidateQueryScopes(queryClient, queryInvalidationScopes.profileWrite);
    },
  });
  const deletePhoto = useMutation({
    mutationFn: async (photoId: string) =>
      (await profileApi.deletePhoto(photoId) as { data: unknown }).data,
    onMutate: async (photoId) =>
      beginOptimisticUpdate(queryClient, [
        {
          queryKey: queryKeys.profile.current(),
          exact: true,
          updater: (current) => {
            const user = current as User | undefined;
            if (!user) {
              return user;
            }

            return {
              ...user,
              photos: user.photos?.filter((photo) => photo.id !== photoId),
            };
          },
        },
      ]),
    onError: (_error, _payload, context) => {
      context?.rollback();
    },
    onSettled: () => {
      void invalidateQueryScopes(queryClient, queryInvalidationScopes.profileWrite);
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
