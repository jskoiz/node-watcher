import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button } from '../../../design/primitives';
import { summaryStyles, styles } from '../onboarding.styles';
import { ENVIRONMENTS, FREQUENCY_OPTIONS, SCHEDULE_OPTIONS, formatActivitySummary, getIntentLabel } from './constants';
import { OnboardingStepFooter, OnboardingStepIntro } from './OnboardingStepLayout';
import type { SummaryStepProps } from './types';

function SummaryRow({
  label,
  value,
  textMuted,
  textPrimary,
}: {
  label: string;
  value: string;
  textMuted: string;
  textPrimary: string;
}) {
  return (
    <View style={summaryStyles.row}>
      <Text style={[summaryStyles.label, { color: textMuted }]}>{label.toUpperCase()}</Text>
      <Text style={[summaryStyles.value, { color: textPrimary }]} numberOfLines={2}>
        {value || '—'}
      </Text>
    </View>
  );
}

function SummaryDivider({ color }: { color: string }) {
  return <View style={[summaryStyles.divider, { backgroundColor: color }]} />;
}

export function SummaryStep({ data, insets, onNext, theme }: SummaryStepProps) {
  const freqOpt = FREQUENCY_OPTIONS.find((f) => f.key === data.frequencyLabel);

  return (
    <ScrollView contentContainerStyle={[styles.stepContent, { paddingBottom: 120 + insets.bottom }]} showsVerticalScrollIndicator={false}>
      <OnboardingStepIntro title="Your profile" subtitle="Here's a summary of what you told us." theme={theme} />

      <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <SummaryRow label="Intent" value={getIntentLabel(data.intent)} textMuted={theme.textMuted} textPrimary={theme.textPrimary} />
        <SummaryDivider color={theme.border} />
        <SummaryRow label="Movement" value={formatActivitySummary(data.activities.slice(0, 4))} textMuted={theme.textMuted} textPrimary={theme.textPrimary} />
        <SummaryDivider color={theme.border} />
        <SummaryRow
          label="Trains"
          value={freqOpt ? `${freqOpt.label} / week` : data.frequencyLabel}
          textMuted={theme.textMuted}
          textPrimary={theme.textPrimary}
        />
        <SummaryDivider color={theme.border} />
        <SummaryRow
          label="Environment"
          value={data.environment.map((k) => ENVIRONMENTS.find((e) => e.key === k)?.label || k).join(' · ')}
          textMuted={theme.textMuted}
          textPrimary={theme.textPrimary}
        />
        <SummaryDivider color={theme.border} />
        <SummaryRow
          label="Schedule"
          value={data.schedule.map((k) => SCHEDULE_OPTIONS.find((s) => s.key === k)?.label || k).join(' · ')}
          textMuted={theme.textMuted}
          textPrimary={theme.textPrimary}
        />
      </View>
      <OnboardingStepFooter insetsBottom={insets.bottom} minimumBottomPadding={32}>
        <Button label="Looks good" onPress={onNext} />
      </OnboardingStepFooter>
    </ScrollView>
  );
}
