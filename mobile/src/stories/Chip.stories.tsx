import type { Meta, StoryObj } from '@storybook/react-native';
import { Chip } from '../design/primitives';
import { withStorySurface } from './support';

const meta = {
  title: 'Design/Chip',
  component: Chip,
  decorators: [withStorySurface()],
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    label: 'Running',
    active: true,
    accentColor: '#C4A882',
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
    accentColor: '#8BAA7A',
  },
};
