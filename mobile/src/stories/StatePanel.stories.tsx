import type { Meta, StoryObj } from '@storybook/react-native';
import { StatePanel } from '../design/primitives';
import { withStorySurface } from './support';

const meta = {
  title: 'Design/StatePanel',
  component: StatePanel,
  decorators: [withStorySurface()],
} satisfies Meta<typeof StatePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    title: 'Loading discovery',
    loading: true,
  },
};

export const Error: Story = {
  args: {
    title: 'Could not load events',
    description: 'Network request timed out.',
    actionLabel: 'Retry',
    onAction: () => undefined,
    isError: true,
  },
};
