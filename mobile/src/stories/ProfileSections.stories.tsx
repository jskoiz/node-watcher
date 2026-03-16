import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import {
  EditableField,
  PhotoManager,
  TagPill,
} from '../features/profile/components/ProfileSections';
import type { PhotoOperationState } from '../features/profile/hooks/useProfileEditor';
import { withStorySurface, makeUser } from './support';

function ProfileSectionsStory({
  editMode,
  photoOperation,
}: {
  editMode: boolean;
  photoOperation: PhotoOperationState;
}) {
  const profile = makeUser();

  return (
    <View style={{ gap: 24 }}>
      <EditableField
        editMode={editMode}
        label="Bio"
        multiline
        onChangeText={() => undefined}
        placeholder="Tell people what kind of movement and company you want."
        value="Sunrise movement, low-pressure plans, and good pacing."
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <TagPill color="#D4A59A" interactive={editMode} label="Dating" onPress={() => undefined} selected />
        <TagPill color="#C4A882" interactive={editMode} label="Workout" onPress={() => undefined} selected={false} />
        <TagPill color="#8BAA7A" interactive={editMode} label="Friends" onPress={() => undefined} selected />
      </View>
      <PhotoManager
        canEdit={editMode}
        isBusy={Boolean(photoOperation)}
        onDelete={() => undefined}
        onMakePrimary={() => undefined}
        onMoveLeft={() => undefined}
        onMoveRight={() => undefined}
        onUpload={() => undefined}
        operation={photoOperation}
        photos={profile.photos ?? []}
      />
    </View>
  );
}

const meta = {
  title: 'Profile/ProfileSections',
  component: ProfileSectionsStory,
  decorators: [withStorySurface({ centered: false })],
  args: {
    editMode: true,
    photoOperation: null,
  },
} satisfies Meta<typeof ProfileSectionsStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Editing: Story = {};

export const ReadOnly: Story = {
  args: {
    editMode: false,
  },
};

export const UploadingPhoto: Story = {
  args: {
    photoOperation: {
      type: 'upload',
      label: 'Uploading photo… 62%',
      progress: 62,
    },
  },
};
