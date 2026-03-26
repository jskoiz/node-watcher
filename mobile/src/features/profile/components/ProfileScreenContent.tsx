import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ProfileCompletenessMissingItem, User } from '../../../api/types';
import { profileStyles as styles } from './profile.styles';
import type { PhotoOperationState } from '../hooks/usePhotoManager';
import { isHapticsEnabled, setHapticsEnabled, loadHapticsPreference } from '../../../lib/interaction/feedback';
import type { LocationSuggestion } from '../../locations/locationSuggestions';
import { ProfileEditBar } from './ProfileEditBar';
import { ProfileHero } from './ProfileHero';
import {
  ProfileAccountDeletionSection,
  ProfileBasicsSection,
  ProfileCompletenessSection,
  ProfileErrorBanner,
  ProfileFitnessProfileSection,
  ProfileIntentSection,
  ProfileLogoutButton,
  ProfileMovementIdentitySection,
  ProfilePhotosSection,
  ProfileScheduleSection,
} from './ProfileScreenContentSections';
import { ProfileSettingsSection } from './ProfileSettingsSection';

export function ProfileScreenContent({
  completenessScore,
  completenessMissing,
  deletingAccount,
  editingPhotos,
  bio,
  city,
  editMode,
  errorMessage,
  intensityLevel,
  intentDating,
  intentFriends,
  intentWorkout,
  isRefetching,
  isSavingProfile,
  isSavingFitness,
  knownLocationSuggestions,
  navigation,
  onCancelEdit,
  onConfirmDeleteAccount,
  onDeletePhoto,
  onMakePrimaryPhoto,
  onMovePhotoLeft,
  onMovePhotoRight,
  onRefresh,
  onLogout,
  onSave,
  onSetBio,
  onSetCity,
  onSelectCitySuggestion,
  onSetIntensityLevel,
  onSetIntentDating,
  onSetIntentFriends,
  onSetIntentWorkout,
  onSetPrimaryGoal,
  onSetSelectedActivities,
  onSetSelectedSchedule,
  onSetWeeklyFrequencyBand,
  onToggleBuildInfo,
  onUploadPhoto,
  photoOperation,
  primaryGoal,
  profile,
  selectedActivities,
  selectedSchedule,
  showBuildInfo,
  weeklyFrequencyBand,
}: {
  completenessScore: number;
  completenessMissing: ProfileCompletenessMissingItem[];
  deletingAccount: boolean;
  editingPhotos: boolean;
  bio: string;
  city: string;
  editMode: boolean;
  errorMessage: string | null;
  intensityLevel: string;
  intentDating: boolean;
  intentFriends: boolean;
  intentWorkout: boolean;
  isRefetching: boolean;
  isSavingProfile: boolean;
  isSavingFitness: boolean;
  knownLocationSuggestions: LocationSuggestion[];
  navigation: { navigate: (screen: string, params?: Record<string, unknown>) => void };
  onCancelEdit: () => void;
  onConfirmDeleteAccount: () => void;
  onDeletePhoto: (photoId: string) => void;
  onMakePrimaryPhoto: (photoId: string) => void;
  onMovePhotoLeft: (photoId: string) => void;
  onMovePhotoRight: (photoId: string) => void;
  onRefresh: () => void;
  onLogout: () => void;
  onSave: () => void;
  onSetBio: (value: string) => void;
  onSetCity: (value: string) => void;
  onSelectCitySuggestion: (suggestion: LocationSuggestion) => void;
  onSetIntensityLevel: (value: string) => void;
  onSetIntentDating: (value: boolean) => void;
  onSetIntentFriends: (value: boolean) => void;
  onSetIntentWorkout: (value: boolean) => void;
  onSetPrimaryGoal: (value: string) => void;
  onSetSelectedActivities: (value: string) => void;
  onSetSelectedSchedule: (value: string) => void;
  onSetWeeklyFrequencyBand: (value: string) => void;
  onToggleBuildInfo: () => void;
  onUploadPhoto: () => void;
  photoOperation: PhotoOperationState;
  primaryGoal: string;
  profile: User;
  selectedActivities: string[];
  selectedSchedule: string[];
  showBuildInfo: boolean;
  weeklyFrequencyBand: string;
}) {
  const [hapticsOn, setHapticsOn] = useState(isHapticsEnabled);

  useEffect(() => {
    loadHapticsPreference().then(setHapticsOn).catch(() => {});
  }, []);

  const handleToggleHaptics = (enabled: boolean) => {
    setHapticsOn(enabled);
    void setHapticsEnabled(enabled);
  };

  const isSaving = isSavingFitness || isSavingProfile;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#C4A882" />}
      >
        <ProfileHero profile={profile} primaryGoal={primaryGoal} />

        <ProfileCompletenessSection
          completenessScore={completenessScore}
          completenessMissing={completenessMissing}
          editMode={editMode}
          onSave={onSave}
        />

        <ProfileEditBar
          editMode={editMode}
          isSaving={isSaving}
          onCancelEdit={onCancelEdit}
          onSave={onSave}
        />

        <ProfileErrorBanner errorMessage={errorMessage} />

        <ProfileBasicsSection
          bio={bio}
          city={city}
          editMode={editMode}
          knownLocationSuggestions={knownLocationSuggestions}
          onSelectCitySuggestion={onSelectCitySuggestion}
          onSetBio={onSetBio}
          onSetCity={onSetCity}
        />

        <ProfileIntentSection
          editMode={editMode}
          intentDating={intentDating}
          intentFriends={intentFriends}
          intentWorkout={intentWorkout}
          onSetIntentDating={onSetIntentDating}
          onSetIntentFriends={onSetIntentFriends}
          onSetIntentWorkout={onSetIntentWorkout}
        />

        <ProfilePhotosSection
          editMode={editMode}
          editingPhotos={editingPhotos}
          onDeletePhoto={onDeletePhoto}
          onMakePrimaryPhoto={onMakePrimaryPhoto}
          onMovePhotoLeft={onMovePhotoLeft}
          onMovePhotoRight={onMovePhotoRight}
          onUploadPhoto={onUploadPhoto}
          photoOperation={photoOperation}
          profile={profile}
        />

        <ProfileMovementIdentitySection
          editMode={editMode}
          onSetSelectedActivities={onSetSelectedActivities}
          selectedActivities={selectedActivities}
        />

        <ProfileFitnessProfileSection
          editMode={editMode}
          intensityLevel={intensityLevel}
          onSetIntensityLevel={onSetIntensityLevel}
          onSetPrimaryGoal={onSetPrimaryGoal}
          onSetWeeklyFrequencyBand={onSetWeeklyFrequencyBand}
          primaryGoal={primaryGoal}
          weeklyFrequencyBand={weeklyFrequencyBand}
        />

        <ProfileScheduleSection
          editMode={editMode}
          onSetSelectedSchedule={onSetSelectedSchedule}
          selectedSchedule={selectedSchedule}
        />

        <ProfileSettingsSection
          hapticsOn={hapticsOn}
          navigation={navigation}
          onToggleBuildInfo={onToggleBuildInfo}
          onToggleHaptics={handleToggleHaptics}
          showBuildInfo={showBuildInfo}
        />

        <ProfileAccountDeletionSection
          deletingAccount={deletingAccount}
          onConfirmDeleteAccount={onConfirmDeleteAccount}
        />

        <ProfileLogoutButton onLogout={onLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}
