import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { Button } from '../design/primitives';
import { useSheetController } from '../design/sheets/useSheetController';
import {
  ExploreQuickActionsSheet,
} from '../features/events/explore/ExploreQuickActionsSheet';
import type { ExploreCategory } from '../features/events/explore/explore.data';
import { withStoryScreenFrame } from './support';

function ExploreQuickActionsSheetStory({
  activeCategory,
}: {
  activeCategory: ExploreCategory;
}) {
  const sheet = useSheetController();

  React.useEffect(() => {
    sheet.open();
  }, [sheet.open]);

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', padding: 20 }}>
      <Button label="Open explore actions" onPress={sheet.open} variant="secondary" />
      <ExploreQuickActionsSheet
        activeCategory={activeCategory}
        controller={sheet.sheetProps}
        onClose={sheet.close}
        onOpenCreate={() => undefined}
        onOpenMyEvents={() => undefined}
        onSelectCategory={() => undefined}
      />
    </View>
  );
}

const meta = {
  title: 'Events/ExploreQuickActionsSheet',
  component: ExploreQuickActionsSheetStory,
  decorators: [withStoryScreenFrame({ height: 900 })],
  args: {
    activeCategory: 'Events' as ExploreCategory,
  },
} satisfies Meta<typeof ExploreQuickActionsSheetStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CommunityFocus: Story = {
  args: {
    activeCategory: 'Community',
  },
};
