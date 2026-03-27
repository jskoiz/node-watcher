import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { Chip } from '../design/primitives';
import { withStorySurface } from './support';

const meta = {
  title: 'Design/Chip',
  component: Chip,
  decorators: [withStorySurface()],
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: {
    label: 'Running',
    onPress: () => undefined,
  },
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      <Chip label="Running" active onPress={() => undefined} />
      <Chip label="Strength" onPress={() => undefined} />
      <Chip label="Mobility" onPress={() => undefined} />
      <Chip label="Read only" active interactive={false} />
    </View>
  ),
};

export const Active: Story = {
  args: {
    label: 'Running',
    active: true,
    onPress: () => undefined,
  },
};

export const Inactive: Story = {
  args: {
    label: 'Strength',
    active: false,
    onPress: () => undefined,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Outdoors',
    active: true,
    interactive: false,
  },
};
