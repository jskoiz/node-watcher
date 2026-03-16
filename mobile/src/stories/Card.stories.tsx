import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { Card } from '../design/primitives';

const meta = {
  title: 'Design/Card',
  component: Card,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F8F7F4' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card>
      <Text style={{ color: '#1A1A1A', fontSize: 18, fontWeight: '700' }}>Default surface</Text>
      <Text style={{ color: '#64748B', marginTop: 8 }}>Use for primary content blocks.</Text>
    </Card>
  ),
};

export const Glass: Story = {
  render: () => (
    <Card variant="glass">
      <Text style={{ color: '#1A1A1A', fontSize: 18, fontWeight: '700' }}>Glass surface</Text>
      <Text style={{ color: '#64748B', marginTop: 8 }}>Use for lighter hero overlays.</Text>
    </Card>
  ),
};

export const Accented: Story = {
  render: () => (
    <Card accent="#10B981">
      <Text style={{ color: '#1A1A1A', fontSize: 18, fontWeight: '700' }}>Accented card</Text>
      <Text style={{ color: '#64748B', marginTop: 8 }}>Use when the section needs a color cue.</Text>
    </Card>
  ),
};
