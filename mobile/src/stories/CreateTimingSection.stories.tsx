import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { CreateTimingSection } from '../features/events/create/CreateTimingSection';
import { withStorySurface } from './support';

const meta = {
  title: 'Create/CreateTimingSection',
  component: CreateTimingSection,
  decorators: [withStorySurface({ centered: false })],
  argTypes: {
    onChangeSpots: { action: 'spotsChanged' },
    onSelectSkill: { action: 'skillChanged' },
    onSelectTime: { action: 'timeChanged' },
    onSelectWhen: { action: 'whenChanged' },
  },
  args: {
    onChangeSpots: () => undefined,
    onSelectSkill: () => undefined,
    onSelectTime: () => undefined,
    onSelectWhen: () => undefined,
    selectedTime: 'Before work',
    selectedWhen: 'Tomorrow',
    skillLevel: 'Intermediate',
    spots: 4,
  },
} satisfies Meta<typeof CreateTimingSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TimingError: Story = {
  args: {
    selectedTime: '',
    selectedWhen: '',
    timingError: 'Choose a day and time before continuing.',
  },
};

export const WithoutSpots: Story = {
  args: {
    onChangeSpots: undefined,
    spots: undefined,
  },
  render: (args) => (
    <View>
      <CreateTimingSection {...args} />
    </View>
  ),
};
