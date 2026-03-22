import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import type { User } from '../../../api/types';
import { normalizeApiError } from '../../../api/errors';
import { triggerErrorHaptic, triggerSelectionHaptic, triggerSuccessHaptic } from '../../../lib/interaction/feedback';
import { buildPhotoReorderPlan } from './profilePhotoHelpers';

export type PhotoOperationState =
  | { type: 'upload'; label: string; progress: number; photoId?: undefined }
  | { type: 'primary' | 'delete' | 'reorder'; label: string; photoId: string; progress?: undefined }
  | null;

export function usePhotoManager({
  profile,
  refetch,
  uploadPhoto,
  updatePhoto,
  deletePhoto,
  setError,
}: {
  profile: User | null;
  refetch: () => Promise<unknown>;
  uploadPhoto: (payload: {
    uri: string;
    mimeType?: string | null;
    fileName?: string | null;
    onProgress?: (progress: number) => void;
  }) => Promise<unknown>;
  updatePhoto: (payload: { photoId: string; payload: { isPrimary?: boolean; sortOrder?: number } }) => Promise<unknown>;
  deletePhoto: (photoId: string) => Promise<unknown>;
  setError: (error: string | null) => void;
}) {
  const [photoOperation, setPhotoOperation] = useState<PhotoOperationState>(null);

  const pickAndUploadPhoto = async () => {
    setError(null);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('Photo library permission is required to upload photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.72,
      });
      if (result.canceled || !result.assets.length) return;
      const asset = result.assets[0];
      setPhotoOperation({ type: 'upload', label: 'Uploading photo\u2026', progress: 5 });
      await uploadPhoto({
        uri: asset.uri,
        mimeType: asset.mimeType,
        fileName: asset.fileName,
        onProgress: (progress) => {
          setPhotoOperation({
            type: 'upload',
            label: progress >= 100 ? 'Finalizing photo\u2026' : `Uploading photo\u2026 ${progress}%`,
            progress,
          });
        },
      });
      void triggerSuccessHaptic();
      await refetch();
      setPhotoOperation(null);
    } catch (err) {
      setPhotoOperation(null);
      void triggerErrorHaptic();
      setError(normalizeApiError(err).message);
    }
  };

  const updatePhotoOrder = async (photoId: string, direction: 'left' | 'right') => {
    const reorderPlan = buildPhotoReorderPlan(profile?.photos, photoId, direction);
    if (!reorderPlan) return;

    try {
      setPhotoOperation({ type: 'reorder', photoId, label: 'Reordering photos\u2026' });
      await Promise.all([
        updatePhoto({ photoId: reorderPlan.currentPhotoId, payload: { sortOrder: reorderPlan.targetSortOrder } }),
        updatePhoto({ photoId: reorderPlan.targetPhotoId, payload: { sortOrder: reorderPlan.currentSortOrder } }),
      ]);
      void triggerSelectionHaptic();
      await refetch();
      setPhotoOperation(null);
    } catch (err) {
      setPhotoOperation(null);
      void triggerErrorHaptic();
      setError(normalizeApiError(err).message);
    }
  };

  return {
    photoOperation,
    isEditingPhotos: photoOperation !== null,
    uploadPhoto: pickAndUploadPhoto,
    makePrimaryPhoto: async (photoId: string) => {
      try {
        setPhotoOperation({ type: 'primary', photoId, label: 'Setting primary photo\u2026' });
        await updatePhoto({ photoId, payload: { isPrimary: true } });
        void triggerSelectionHaptic();
        await refetch();
        setPhotoOperation(null);
      } catch (err) {
        setPhotoOperation(null);
        void triggerErrorHaptic();
        setError(normalizeApiError(err).message);
      }
    },
    movePhotoLeft: async (photoId: string) => updatePhotoOrder(photoId, 'left'),
    movePhotoRight: async (photoId: string) => updatePhotoOrder(photoId, 'right'),
    removePhoto: async (photoId: string) => {
      try {
        setPhotoOperation({ type: 'delete', photoId, label: 'Removing photo\u2026' });
        await deletePhoto(photoId);
        void triggerSuccessHaptic();
        await refetch();
        setPhotoOperation(null);
      } catch (err) {
        setPhotoOperation(null);
        void triggerErrorHaptic();
        setError(normalizeApiError(err).message);
      }
    },
  };
}
