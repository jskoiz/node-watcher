import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { HomeQuickFilters } from '../features/discovery/components/HomeQuickFilters';
import type { QuickFilterKey } from '../features/discovery/components/discoveryFilters';
import { withStoryScreenFrame } from './support';

const meta = {
  title: 'Discovery/HomeQuickFilters',
  component: HomeQuickFilters,
  decorators: [withStoryScreenFrame({ height: 180 })],
  args: {
    activeFilterCount: 0,
    activeQuickFilter: 'all',
    onPressFilter: () => undefined,
    onPressRefine: () => undefined,
  },
} satisfies Meta<typeof HomeQuickFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const ActiveFilters: Story = {
  render: () => {
    const [activeFilter, setActiveFilter] = useState<QuickFilterKey>('all');
    const [activeCount] = useState(3);

    return (
      <HomeQuickFilters
        activeFilterCount={activeCount}
        activeQuickFilter={activeFilter}
        onPressFilter={setActiveFilter}
        onPressRefine={() => undefined}
      />
    );
  },
};
