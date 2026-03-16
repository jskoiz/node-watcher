import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import type { User } from '../../../api/types';
import { normalizeApiError } from '../../../api/errors';
import { triggerErrorHaptic, triggerSelectionHaptic, triggerSuccessHaptic } from '../../../lib/interaction/feedback';
import { buildSchedulePreferences, parseFavoriteActivities } from '../components/profile.helpers';

function toggleValue(values: string[], nextValue: string) {
  return values.includes(nextValue)
    ? values.filter((value) => value !== nextValue)
    : [...values, nextValue];
}

export function useProfileEditor({
  profile,
  refetch,
  updateFitness,
  updateProfile,
  uploadPhoto,
  updatePhoto,
  deletePhoto,
}: {
  profile: User | null;
  refetch: () => Promise<unknown>;
  updateFitness: (payload: {
    intensityLevel: string;
    weeklyFrequencyBand: string;
    primaryGoal: string;
    favoriteActivities: string;
    prefersMorning?: boolean;
    prefersEvening?: boolean;
  }) => Promise<unknown>;
  updateProfile: (payload: {
    bio?: string;
    city?: string;
    intentDating?: boolean;
    intentWorkout?: boolean;
    intentFriends?: boolean;
  }) => Promise<unknown>;
  uploadPhoto: (payload: {
    uri: string;
    mimeType?: string | null;
    fileName?: string | null;
  }) => Promise<unknown>;
  updatePhoto: (payload: { photoId: string; payload: { isPrimary?: boolean; sortOrder?: number } }) => Promise<unknown>;
  deletePhoto: (photoId: string) => Promise<unknown>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showBuildInfo, setShowBuildInfo] = useState(false);
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [intensityLevel, setIntensityLevel] = useState('');
  const [intentDating, setIntentDating] = useState(false);
  const [intentWorkout, setIntentWorkout] = useState(false);
  const [intentFriends, setIntentFriends] = useState(false);
  const [weeklyFrequencyBand, setWeeklyFrequencyBand] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string[]>([]);

  useEffect(() => {
    if (!profile) return;
    setBio(profile.profile?.bio || '');
    setCity(profile.profile?.city || '');
    setIntensityLevel(profile.fitnessProfile?.intensityLevel || '');
    setIntentDating(Boolean(profile.profile?.intentDating));
    setIntentWorkout(Boolean(profile.profile?.intentWorkout));
    setIntentFriends(Boolean(profile.profile?.intentFriends));
    setWeeklyFrequencyBand(profile.fitnessProfile?.weeklyFrequencyBand || '');
    setPrimaryGoal(profile.fitnessProfile?.primaryGoal || '');
    setSelectedActivities(parseFavoriteActivities(profile.fitnessProfile?.favoriteActivities));
    setSelectedSchedule(buildSchedulePreferences(profile.fitnessProfile));
  }, [profile]);

  const resetFromProfile = () => {
    if (!profile) return;
    setBio(profile.profile?.bio || '');
    setCity(profile.profile?.city || '');
    setIntensityLevel(profile.fitnessProfile?.intensityLevel || '');
    setIntentDating(Boolean(profile.profile?.intentDating));
    setIntentWorkout(Boolean(profile.profile?.intentWorkout));
    setIntentFriends(Boolean(profile.profile?.intentFriends));
    setWeeklyFrequencyBand(profile.fitnessProfile?.weeklyFrequencyBand || '');
    setPrimaryGoal(profile.fitnessProfile?.primaryGoal || '');
    setSelectedActivities(parseFavoriteActivities(profile.fitnessProfile?.favoriteActivities));
    setSelectedSchedule(buildSchedulePreferences(profile.fitnessProfile));
  };

  const save = async () => {
    if (!editMode) {
      setEditMode(true);
      return;
    }

    setError(null);
    try {
      await updateProfile({
        bio: bio.trim(),
        city: city.trim(),
        intentDating,
        intentWorkout,
        intentFriends,
      });
      await updateFitness({
        intensityLevel,
        weeklyFrequencyBand,
        primaryGoal,
        favoriteActivities: selectedActivities.join(', '),
        prefersMorning: selectedSchedule.includes('Morning'),
        prefersEvening: selectedSchedule.includes('Evening'),
      });
      void triggerSuccessHaptic();
      setEditMode(false);
      await refetch();
    } catch (err) {
      void triggerErrorHaptic();
      setError(normalizeApiError(err).message);
    }
  };

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
        quality: 0.8,
        allowsEditing: true,
      });
      if (result.canceled || !result.assets.length) return;
      const asset = result.assets[0];
      await uploadPhoto({
        uri: asset.uri,
        mimeType: asset.mimeType,
        fileName: asset.fileName,
      });
      void triggerSuccessHaptic();
      await refetch();
    } catch (err) {
      void triggerErrorHaptic();
      setError(normalizeApiError(err).message);
    }
  };

  const updatePhotoOrder = async (photoId: string, direction: 'left' | 'right') => {
    const photos = (profile?.photos ?? []).filter((photo) => !photo.isHidden);
    const index = photos.findIndex((photo) => photo.id === photoId);
    const target = direction === 'left' ? photos[index - 1] : photos[index + 1];
    if (index === -1 || !target) return;

    try {
      await Promise.all([
        updatePhoto({ photoId, payload: { sortOrder: target.sortOrder } }),
        updatePhoto({ photoId: target.id, payload: { sortOrder: photos[index].sortOrder } }),
      ]);
      void triggerSelectionHaptic();
      await refetch();
    } catch (err) {
      void triggerErrorHaptic();
      setError(normalizeApiError(err).message);
    }
  };

  return {
    error,
    editMode,
    showBuildInfo,
    bio,
    city,
    intensityLevel,
    intentDating,
    intentWorkout,
    intentFriends,
    weeklyFrequencyBand,
    primaryGoal,
    selectedActivities,
    selectedSchedule,
    setError,
    setBio,
    setCity,
    setIntensityLevel,
    setIntentDating,
    setIntentWorkout,
    setIntentFriends,
    setWeeklyFrequencyBand,
    setPrimaryGoal,
    setShowBuildInfo,
    toggleActivity: (value: string) => setSelectedActivities((current) => toggleValue(current, value)),
    toggleSchedule: (value: string) => setSelectedSchedule((current) => toggleValue(current, value)),
    cancelEdit: () => {
      resetFromProfile();
      setEditMode(false);
      setError(null);
    },
    save,
    uploadPhoto: pickAndUploadPhoto,
    makePrimaryPhoto: async (photoId: string) => {
      try {
        await updatePhoto({ photoId, payload: { isPrimary: true } });
        void triggerSelectionHaptic();
        await refetch();
      } catch (err) {
        void triggerErrorHaptic();
        setError(normalizeApiError(err).message);
      }
    },
    movePhotoLeft: async (photoId: string) => updatePhotoOrder(photoId, 'left'),
    movePhotoRight: async (photoId: string) => updatePhotoOrder(photoId, 'right'),
    removePhoto: async (photoId: string) => {
      try {
        await deletePhoto(photoId);
        void triggerSuccessHaptic();
        await refetch();
      } catch (err) {
        void triggerErrorHaptic();
        setError(normalizeApiError(err).message);
      }
    },
  };
}
