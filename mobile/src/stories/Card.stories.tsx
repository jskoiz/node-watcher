import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { Text } from 'react-native';
import { Card } from '../design/primitives';
import { withStorySurface } from './support';

function CardPreview({
  accent,
  body,
  title,
  variant,
}: {
  accent?: string;
  body: string;
  title: string;
  variant?: React.ComponentProps<typeof Card>['variant'];
}) {
  return (
    <Card accent={accent} variant={variant}>
      <Text style={{ color: '#2C2420', fontSize: 18, fontWeight: '700' }}>{title}</Text>
      <Text style={{ color: '#7A7068', marginTop: 8 }}>{body}</Text>
    </Card>
  );
}

const meta = {
  title: 'Design/Card',
  component: CardPreview,
  decorators: [withStorySurface()],
  args: {
    body: 'Use for primary content blocks.',
    title: 'Default surface',
  },
} satisfies Meta<typeof CardPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
};

export const Glass: Story = {
  args: {
    body: 'Use for lighter hero overlays.',
    title: 'Glass surface',
    variant: 'glass',
  },
};

export const Accented: Story = {
  args: {
    accent: '#8BAA7A',
    body: 'Use when the section needs a color cue.',
    title: 'Accented card',
  },
};
