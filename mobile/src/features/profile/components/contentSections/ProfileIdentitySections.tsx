import React from 'react';
import { View } from 'react-native';
import type { User } from '../../../../api/types';
import { LocationField } from '../../../../components/form/LocationField';
import type { LocationSuggestion } from '../../../locations/locationSuggestions';
import { Card, SectionBlock } from '../../../../design/primitives';
import { ACTIVITY_OPTIONS } from '../profile.helpers';
import { EditableField, PhotoManager, TagPill } from '../ProfileSections';
import { profileStyles as styles } from '../profile.styles';
import type { PhotoOperationState } from '../../hooks/usePhotoManager';

export function ProfileBasicsSection({
  bio,
  city,
  editMode,
  knownLocationSuggestions,
  onSelectCitySuggestion,
  onSetBio,
  onSetCity,
}: {
  bio: string;
  city: string;
  editMode: boolean;
  knownLocationSuggestions: LocationSuggestion[];
  onSelectCitySuggestion: (suggestion: LocationSuggestion) => void;
  onSetBio: (value: string) => void;
  onSetCity: (value: string) => void;
}) {
  return (
    <SectionBlock eyebrow="Profile basics">
      <Card style={styles.fieldsCard}>
        {editMode ? (
          <LocationField
            kind="city"
            label="City"
            knownSuggestions={knownLocationSuggestions}
            value={city}
            onChangeText={onSetCity}
            onSelectSuggestion={onSelectCitySuggestion}
            placeholder="Honolulu"
            sheetTitle="Choose your city"
            sheetSubtitle="Use recent places, known BRDG spots, or curated city suggestions."
          />
        ) : (
          <EditableField
            label="City"
            value={city}
            onChangeText={onSetCity}
            placeholder="Honolulu"
            editMode={false}
          />
        )}
        <View style={styles.fieldDivider} />
        <EditableField
          label="Bio"
          value={bio}
          onChangeText={onSetBio}
          placeholder="Write a short bio"
          editMode={editMode}
          multiline
          inputProps={{
            autoCorrect: true,
            maxLength: 280,
            returnKeyType: 'done',
            scrollEnabled: false,
          }}
        />
      </Card>
    </SectionBlock>
  );
}

export function ProfileIntentSection({
  editMode,
  intentDating,
  intentFriends,
  intentWorkout,
  onSetIntentDating,
  onSetIntentFriends,
  onSetIntentWorkout,
}: {
  editMode: boolean;
  intentDating: boolean;
  intentFriends: boolean;
  intentWorkout: boolean;
  onSetIntentDating: (value: boolean) => void;
  onSetIntentFriends: (value: boolean) => void;
  onSetIntentWorkout: (value: boolean) => void;
}) {
  return (
    <SectionBlock eyebrow="Intent">
      <View style={styles.tagCloud}>
        <TagPill
          label="Dating"
          selected={intentDating}
          onPress={() => onSetIntentDating(!intentDating)}
          interactive={editMode}
        />
        <TagPill
          label="Workout"
          selected={intentWorkout}
          onPress={() => onSetIntentWorkout(!intentWorkout)}
          interactive={editMode}
        />
        <TagPill
          label="Friends"
          selected={intentFriends}
          onPress={() => onSetIntentFriends(!intentFriends)}
          interactive={editMode}
        />
      </View>
    </SectionBlock>
  );
}

export function ProfilePhotosSection({
  editMode,
  editingPhotos,
  onDeletePhoto,
  onMakePrimaryPhoto,
  onMovePhotoLeft,
  onMovePhotoRight,
  onUploadPhoto,
  photoOperation,
  profile,
}: {
  editMode: boolean;
  editingPhotos: boolean;
  onDeletePhoto: (photoId: string) => void;
  onMakePrimaryPhoto: (photoId: string) => void;
  onMovePhotoLeft: (photoId: string) => void;
  onMovePhotoRight: (photoId: string) => void;
  onUploadPhoto: () => void;
  photoOperation: PhotoOperationState;
  profile: User;
}) {
  return (
    <SectionBlock eyebrow="Photos">
      <PhotoManager
        canEdit={editMode}
        isBusy={editingPhotos}
        onDelete={onDeletePhoto}
        onMakePrimary={onMakePrimaryPhoto}
        onMoveLeft={onMovePhotoLeft}
        onMoveRight={onMovePhotoRight}
        onUpload={onUploadPhoto}
        operation={photoOperation}
        photos={profile.photos ?? []}
      />
    </SectionBlock>
  );
}

export function ProfileMovementIdentitySection({
  editMode,
  onSetSelectedActivities,
  selectedActivities,
}: {
  editMode: boolean;
  onSetSelectedActivities: (value: string) => void;
  selectedActivities: string[];
}) {
  return (
    <SectionBlock eyebrow="Movement identity">
      <View style={styles.tagCloud}>
        {ACTIVITY_OPTIONS.map(({ label, value }) => (
          <TagPill
            key={value}
            label={label}
            selected={selectedActivities.includes(value)}
            onPress={() => editMode && onSetSelectedActivities(value)}
            interactive={editMode}
          />
        ))}
      </View>
    </SectionBlock>
  );
}
