import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import SwipeDeck from '../components/SwipeDeck';
import { HomeHero } from '../features/discovery/components/HomeHero';
import { HomeQuickFilters } from '../features/discovery/components/HomeQuickFilters';
import type { QuickFilterKey } from '../features/discovery/components/discoveryFilters';
import { makeDiscoveryUser, withStoryScreenFrame } from './support';

const mockProfiles = [
  makeDiscoveryUser({
    firstName: 'Nia',
    id: 'story-1',
    profile: {
      bio: 'Trail girl with a soft spot for matcha runs and last-minute waterfall detours.',
      city: 'Manoa',
      intentDating: true,
      intentWorkout: true,
    },
  }),
  makeDiscoveryUser({
    age: 30,
    distanceKm: 8,
    firstName: 'Mason',
    id: 'story-2',
    profile: {
      bio: 'Beach workouts, compact weekday blocks, and low-pressure coffee after.',
      city: 'Kakaako',
      intentDating: false,
      intentWorkout: true,
    },
  }),
];

const meta = {
  title: 'Discovery/SwipeDeck',
  component: SwipeDeck,
  decorators: [withStoryScreenFrame({ height: 720, width: 390 })],
} satisfies Meta<typeof SwipeDeck>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SmallPhonePreview: Story = {
  args: {
    cardHeight: 620,
    data: mockProfiles,
    onPress: () => undefined,
    onSwipeLeft: () => undefined,
    onSwipeRight: () => undefined,
  },
};

export const DiscoveryScreenPreview: Story = {
  args: {
    cardHeight: 620,
    data: mockProfiles,
    onPress: () => undefined,
    onSwipeLeft: () => undefined,
    onSwipeRight: () => undefined,
  },
  render: () => {
    const [activeFilter, setActiveFilter] = React.useState<QuickFilterKey>('all');

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FDFBF8',
          paddingTop: 16,
        }}
      >
        <HomeHero
          feedCount={17}
          filterCount={1}
          greeting="Evening, Lana"
          intentOption={{ label: 'Open to both', color: '#8BAA7A' }}
          onPressNotifications={() => undefined}
          unreadCount={4}
        />
        <HomeQuickFilters
          activeFilterCount={1}
          activeQuickFilter={activeFilter}
          onPressFilter={setActiveFilter}
          onPressRefine={() => undefined}
        />
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 4, paddingBottom: 8 }}>
          <SwipeDeck
            cardHeight={620}
            data={mockProfiles}
            onPress={() => undefined}
            onSwipeLeft={() => undefined}
            onSwipeRight={() => undefined}
          />
        </View>
        <View style={{ height: 90, backgroundColor: 'rgba(253,251,248,0.92)' }} />
      </View>
    );
  },
};
