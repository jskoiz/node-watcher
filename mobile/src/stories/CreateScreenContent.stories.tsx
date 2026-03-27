import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useRef } from 'react';
import { ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { createLocationSuggestion } from '../features/locations/locationSuggestions';
import { CreateScreenContent } from '../features/events/create/CreateScreenContent';
import type { CreateEventFormValues } from '../features/events/schema';
import { lightTheme } from '../theme/tokens';
import { makeEventSummary, withStoryScreenFrame } from './support';

function CreateScreenContentStory({
  canPost = false,
  created = false,
  selectedActivity = 'Sunrise Run',
  selectedTime = '6:30 AM',
  selectedWhen = 'Tomorrow',
  skillLevel = 'All levels',
  submitError = null,
  timingError,
  where = 'Magic Island',
}: {
  canPost?: boolean;
  created?: boolean;
  selectedActivity?: string;
  selectedTime?: string;
  selectedWhen?: string;
  skillLevel?: string;
  submitError?: string | null;
  timingError?: string;
  where?: string;
}) {
  const keyboardScrollRef = useRef<ScrollView | null>(null);
  const { control } = useForm<CreateEventFormValues>({
    defaultValues: {
      note: 'Easy pace. Bring water.',
      where,
    } as CreateEventFormValues,
  });

  return (
    <CreateScreenContent
      canPost={canPost}
      control={control}
      createdEvent={
        created
          ? makeEventSummary({
              title: selectedActivity,
              location: where,
            })
          : null
      }
      errors={{}}
      isSubmitting={false}
      keyboardScrollRef={keyboardScrollRef}
      knownLocationSuggestions={[
        createLocationSuggestion('Magic Island', 'Ala Moana', 'curated'),
        createLocationSuggestion('Kakaako Waterfront', 'Honolulu', 'curated'),
      ]}
      noteInputFocus={() => undefined}
      onChangeSpots={() => undefined}
      onClearSubmitError={() => undefined}
      onPost={() => undefined}
      onSelectActivity={() => undefined}
      onSelectSkill={() => undefined}
      onSelectTime={() => undefined}
      onSelectWhen={() => undefined}
      onShareCreatedEvent={() => undefined}
      onViewCreatedEvent={() => undefined}
      resetSuccessState={() => undefined}
      selectedActivity={selectedActivity}
      selectedColor={lightTheme.accentPrimary}
      selectedTime={selectedTime}
      selectedWhen={selectedWhen}
      skillLevel={skillLevel}
      spots={5}
      submitError={submitError}
      timingError={timingError}
      where={where}
    />
  );
}

const meta = {
  title: 'Screens/CreateScreenContent',
  component: CreateScreenContentStory,
  decorators: [withStoryScreenFrame({ height: 960, width: 430 })],
} satisfies Meta<typeof CreateScreenContentStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    canPost: true,
  },
};

export const NeedsTiming: Story = {
  args: {
    selectedTime: '',
    timingError: 'Choose a time to finish this plan.',
  },
};

export const Posted: Story = {
  args: {
    canPost: true,
    created: true,
  },
};
