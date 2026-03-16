import type { Meta, StoryObj } from '@storybook/react-native';
import {
  EventDetailView,
} from '../screens/EventDetailScreen';
import { makeEventDetail, withStoryScreenFrame } from './support';

const meta = {
  title: 'Screens/EventDetail',
  component: EventDetailView,
  decorators: [withStoryScreenFrame({ height: 920, width: 430 })],
  args: {
    errorMessage: null,
    event: makeEventDetail(),
    isJoining: false,
    isLoading: false,
    onBack: () => undefined,
    onJoin: () => undefined,
    onRefresh: () => undefined,
  },
} satisfies Meta<typeof EventDetailView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Joined: Story = {
  args: {
    event: makeEventDetail({
      attendeesCount: 9,
      joined: true,
    }),
  },
};

export const Loading: Story = {
  args: {
    event: null,
    isLoading: true,
  },
};

export const ErrorState: Story = {
  args: {
    errorMessage: 'The event could not be loaded.',
    event: null,
  },
};
