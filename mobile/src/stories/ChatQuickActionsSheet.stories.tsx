import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { Button } from '../design/primitives';
import { useSheetController } from '../design/sheets/useSheetController';
import {
  ChatQuickActionsSheet,
} from '../features/chat/components/ChatQuickActionsSheet';
import { withStoryScreenFrame } from './support';

function ChatQuickActionsSheetStory() {
  const sheet = useSheetController();

  React.useEffect(() => {
    sheet.open();
  }, [sheet.open]);

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', padding: 20 }}>
      <Button label="Open quick actions" onPress={sheet.open} variant="secondary" />
      <ChatQuickActionsSheet
        controller={sheet.sheetProps}
        onClose={sheet.close}
        onSelectMessage={() => undefined}
      />
    </View>
  );
}

const meta = {
  title: 'Chat/ChatQuickActionsSheet',
  component: ChatQuickActionsSheetStory,
  decorators: [withStoryScreenFrame({ height: 820 })],
} satisfies Meta<typeof ChatQuickActionsSheetStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
