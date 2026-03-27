import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { Button } from '../design/primitives';
import { withStorySurface } from './support';

const meta = {
  title: 'Design/Button',
  component: Button,
  decorators: [withStorySurface()],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: {
    label: 'Join BRDG',
    onPress: () => undefined,
  },
  render: () => (
    <View style={{ gap: 12, width: '100%' }}>
      <Button label="Join BRDG" onPress={() => undefined} />
      <Button label="Maybe later" onPress={() => undefined} variant="secondary" />
      <Button label="Create activity" onPress={() => undefined} variant="accent" />
      <Button label="Loading state" onPress={() => undefined} loading />
      <Button label="Small secondary" onPress={() => undefined} size="sm" variant="secondary" />
      <Button label="Glass prominent" onPress={() => undefined} variant="glassProminent" />
    </View>
  ),
};

export const Primary: Story = {
  args: {
    label: 'Join BRDG',
    onPress: () => undefined,
  },
};

export const Secondary: Story = {
  args: {
    label: 'Maybe Later',
    onPress: () => undefined,
    variant: 'secondary',
  },
};

export const Accent: Story = {
  args: {
    label: 'Create Activity',
    onPress: () => undefined,
    variant: 'accent',
  },
};

export const Loading: Story = {
  args: {
    label: 'Creating activity',
    loading: true,
    onPress: () => undefined,
    variant: 'primary',
  },
};

export const SmallSecondary: Story = {
  args: {
    label: 'View details',
    onPress: () => undefined,
    size: 'sm',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    label: 'Skip',
    onPress: () => undefined,
    variant: 'ghost',
  },
};

export const Danger: Story = {
  args: {
    label: 'Delete account',
    onPress: () => undefined,
    variant: 'danger',
  },
};

export const Glass: Story = {
  args: {
    label: 'Glass Button',
    onPress: () => undefined,
    variant: 'glass',
  },
};

export const GlassProminent: Story = {
  args: {
    label: 'Glass Prominent',
    onPress: () => undefined,
    variant: 'glassProminent',
  },
};
