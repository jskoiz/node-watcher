import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { spacing, type Theme } from '../../../theme/tokens';
import { styles } from '../onboarding.styles';

type OnboardingStepIntroProps = {
  title: string;
  subtitle: string;
  theme: Theme;
};

type OnboardingFullscreenStepProps = {
  children: React.ReactNode;
  footer: React.ReactNode;
  insetsBottom: number;
  justifyContent?: 'flex-start' | 'space-between' | 'center';
  scrollable?: boolean;
};

type OnboardingStepFooterProps = {
  children: React.ReactNode;
  insetsBottom: number;
  minimumBottomPadding?: number;
};

export function OnboardingStepIntro({
  subtitle,
  theme,
  title,
}: OnboardingStepIntroProps) {
  return (
    <View>
      <Text style={[styles.stepHeadline, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
    </View>
  );
}

export function OnboardingStepFooter({
  children,
  insetsBottom,
  minimumBottomPadding = spacing.xxl,
}: OnboardingStepFooterProps) {
  return (
    <View style={[styles.stepFooter, { paddingBottom: Math.max(insetsBottom + 8, minimumBottomPadding) }]}>
      {children}
    </View>
  );
}

export function OnboardingFullscreenStep({
  children,
  footer,
  insetsBottom,
  justifyContent = 'flex-start',
  scrollable = false,
}: OnboardingFullscreenStepProps) {
  const body = scrollable ? (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <View style={[styles.fullScreenStep, { justifyContent }]}>
      {body}
      <OnboardingStepFooter insetsBottom={insetsBottom}>{footer}</OnboardingStepFooter>
    </View>
  );
}
