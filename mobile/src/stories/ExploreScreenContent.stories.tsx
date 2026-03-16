import type { Meta, StoryObj } from '@storybook/react-native';
import { ExploreScreenContent } from '../features/events/explore/ExploreScreenContent';
import { ACTIVITY_SPOTS } from '../features/events/explore/explore.data';
import type { ExploreCategory } from '../features/events/explore/explore.data';
import { makeEventSummary, withStoryScreenFrame } from './support';

function ExploreScreenContentStory({
  activeCategory = 'Events',
  errorMessage = null,
  eventCount = 3,
  isLoading = false,
  showCommunity = false,
  showEvents = true,
  showSpots = false,
}: {
  activeCategory?: ExploreCategory;
  errorMessage?: string | null;
  eventCount?: number;
  isLoading?: boolean;
  showCommunity?: boolean;
  showEvents?: boolean;
  showSpots?: boolean;
}) {
  const events = Array.from({ length: eventCount }).map((_, index) =>
    makeEventSummary({
      id: `event-${index + 1}`,
      title: [
        'Makapuu sunrise hike',
        'Kaimuki boxing social',
        'Magic Island recovery jog',
      ][index] ?? `Event ${index + 1}`,
      attendeesCount: 5 + index,
      joined: index === 1,
    }),
  );

  return (
    <ExploreScreenContent
      activeCategory={activeCategory}
      currentUserId="user-1"
      errorMessage={errorMessage}
      eventSectionTitle="This week"
      events={events}
      isLoading={isLoading}
      isRefreshing={false}
      onInvite={() => undefined}
      onOpenCreate={() => undefined}
      onOpenEvent={() => undefined}
      onOpenMyEvents={() => undefined}
      onPressNotifications={() => undefined}
      onRefresh={() => undefined}
      onSelectCategory={() => undefined}
      showCommunity={showCommunity}
      showEvents={showEvents}
      showSpots={showSpots}
      spots={ACTIVITY_SPOTS.slice(0, 4)}
      spotsSectionTitle="Nearby spots"
      unreadCount={3}
    />
  );
}

const meta = {
  title: 'Screens/ExploreScreenContent',
  component: ExploreScreenContentStory,
  decorators: [withStoryScreenFrame({ height: 900 })],
} satisfies Meta<typeof ExploreScreenContentStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    isLoading: true,
    eventCount: 0,
  },
};

export const ErrorState: Story = {
  args: {
    errorMessage: 'Network request timed out.',
    eventCount: 0,
  },
};

export const EmptyEvents: Story = {
  args: {
    eventCount: 0,
  },
};

export const SpotsAndCommunity: Story = {
  args: {
    activeCategory: 'Community',
    showCommunity: true,
    showEvents: false,
    showSpots: true,
  },
};
