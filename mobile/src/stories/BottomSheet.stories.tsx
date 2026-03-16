import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { Text, View } from 'react-native';
import {
  AppBottomSheet,
  APP_BOTTOM_SHEET_SNAP_POINTS,
} from '../design/sheets/AppBottomSheet';
import { useSheetController } from '../design/sheets/useSheetController';
import { Button, Card } from '../design/primitives';
import { withStoryScreenFrame } from './support';

function BottomSheetStory({
  snapPoints = APP_BOTTOM_SHEET_SNAP_POINTS.standard,
  subtitle = 'Shared shell for layered BRDG flows.',
  title = 'Interaction sheet',
}: {
  snapPoints?: ReadonlyArray<string | number>;
  subtitle?: string;
  title?: string;
}) {
  const sheet = useSheetController();

  React.useEffect(() => {
    sheet.open();
  }, [sheet.open]);

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', padding: 24 }}>
      <Button label="Open sheet" onPress={sheet.open} />
      <AppBottomSheet
        {...sheet.sheetProps}
        title={title}
        subtitle={subtitle}
        snapPoints={snapPoints}
      >
        <Card>
          <Text style={{ color: '#2C2420', fontSize: 18, fontWeight: '800' }}>Reusable content</Text>
          <Text style={{ color: '#7A7068', marginTop: 8 }}>
            Discovery, create, explore, and chat can all compose this shell.
          </Text>
        </Card>
      </AppBottomSheet>
    </View>
  );
}

const meta = {
  title: 'Design/BottomSheet',
  component: BottomSheetStory,
  decorators: [withStoryScreenFrame({ height: 860 })],
  args: {
    snapPoints: APP_BOTTOM_SHEET_SNAP_POINTS.standard,
    subtitle: 'Shared shell for layered BRDG flows.',
    title: 'Interaction sheet',
  },
} satisfies Meta<typeof BottomSheetStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    snapPoints: APP_BOTTOM_SHEET_SNAP_POINTS.compact,
    subtitle: 'Use this when the content is short and action-led.',
    title: 'Quick action sheet',
  },
};
