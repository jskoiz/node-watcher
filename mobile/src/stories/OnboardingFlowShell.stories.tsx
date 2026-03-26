import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { OnboardingFlowShell } from '../features/onboarding/components';
import { useTheme } from '../theme/useTheme';
import { spacing, typography } from '../theme/tokens';
import { withStoryScreenFrame } from './support';

function OnboardingFlowShellStory({
  chapter,
  progress,
  showBackButton,
}: {
  chapter: string;
  progress: number;
  showBackButton: boolean;
}) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;

  return (
    <OnboardingFlowShell
      chapter={chapter}
      contentOpacity={opacity}
      isSubmitting={false}
      onBack={() => undefined}
      progress={progress}
      showBackButton={showBackButton}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{chapter}</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          Shared onboarding chrome keeps progress and navigation logic outside the flow controller.
        </Text>
      </View>
    </OnboardingFlowShell>
  );
}

const meta = {
  title: 'Onboarding/FlowShell',
  component: OnboardingFlowShellStory,
  decorators: [withStoryScreenFrame({ centered: false, height: 920 })],
  args: {
    chapter: 'Activities',
    progress: 0.33,
    showBackButton: true,
  },
} satisfies Meta<typeof OnboardingFlowShellStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Welcome: Story = {
  args: {
    chapter: 'Welcome',
    progress: 1 / 9,
    showBackButton: false,
  },
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  body: {
    fontSize: typography.body,
    lineHeight: 24,
    maxWidth: 320,
  },
});
