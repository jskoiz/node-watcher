import type { Meta, StoryObj } from '@storybook/react-native';
import { EventCard } from '../features/events/explore/ExploreCards';
import { makeEventSummary, withStorySurface } from './support';

const meta = {
  title: 'Events/ExploreEventCard',
  component: EventCard,
  decorators: [withStorySurface({ centered: false })],
} satisfies Meta<typeof EventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentUserId: 'user-1',
    event: makeEventSummary({
      attendeesCount: 4,
      category: 'Hiking',
      host: { id: 'host-2', firstName: 'Nia' },
      id: 'event-1',
      location: 'Makapuu Trail',
      startsAt: '2026-03-15T16:00:00.000Z',
      title: 'Makapuu Sunrise Hike',
    }),
    onInvite: () => undefined,
    onOpen: () => undefined,
  },
};
