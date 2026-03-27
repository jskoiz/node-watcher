import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { Text, View } from 'react-native';
import {
  AppBottomSheet,
  APP_BOTTOM_SHEET_SNAP_POINTS,
} from '../design/sheets/AppBottomSheet';
import { useSheetController } from '../design/sheets/useSheetController';
import { Button, Chip, Input, SectionBlock } from '../design/primitives';
import { useTheme } from '../theme/useTheme';
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
  const theme = useTheme();

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
        <SectionBlock
          eyebrow="Quick plan"
          inset={false}
          spacingMode="tight"
          title="Shared sheet shell"
          description="Discovery, create, explore, and chat can all compose this shell."
        >
          <View style={{ gap: 12 }}>
            <Input
              label="Activity"
              onChangeText={() => undefined}
              placeholder="Choose an activity"
              value="Sunrise run"
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Chip label="Moderate pace" active onPress={() => undefined} />
              <Chip label="Coffee after" onPress={() => undefined} />
            </View>
            <Text style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 20 }}>
              Use the same shell for focused decisions, short forms, and layered flows.
            </Text>
          </View>
        </SectionBlock>
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

export const FormSheet: Story = {
  args: {
    snapPoints: APP_BOTTOM_SHEET_SNAP_POINTS.form,
    subtitle: 'Longer form content should still use the same shared shell.',
    title: 'Create details',
  },
};
