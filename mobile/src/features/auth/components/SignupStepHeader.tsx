import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppBackButton from '../../../components/ui/AppBackButton';
import { GlassView } from '../../../design/primitives';
import { useTheme } from '../../../theme/useTheme';
import { spacing, typography } from '../../../theme/tokens';

type SignupStepHeaderProps = {
  currentStep: number;
  onBack: () => void;
  stepLabels: string[];
  subtitle: string;
  title: string;
  totalSteps: number;
  disabled?: boolean;
};

export function SignupStepHeader({
  currentStep,
  disabled,
  onBack,
  stepLabels,
  subtitle,
  title,
  totalSteps,
}: SignupStepHeaderProps) {
  const theme = useTheme();

  return (
    <>
      <AppBackButton onPress={onBack} disabled={disabled} />

      <GlassView tier="light" tint={theme.accentSubtle} borderRadius={999} style={styles.brandStrip}>
        <Text style={[styles.brandStripText, { color: theme.accent }]}>CREATE ACCOUNT</Text>
      </GlassView>

      <View style={styles.progressRow}>
        {stepLabels.map((stepLabel, index) => (
          <View key={stepLabel} style={styles.progressItem}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: index <= currentStep ? theme.primary : theme.border,
                  width: index === currentStep ? 28 : 8,
                  opacity: index < currentStep ? 0.5 : 1,
                },
              ]}
            />
            <Text
              style={[
                styles.dotLabel,
                {
                  color: index === currentStep ? theme.primary : theme.textMuted,
                  fontWeight: index === currentStep ? '700' : '500',
                },
              ]}
            >
              {stepLabel}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.stepHeader}>
        <Text style={[styles.stepNum, { color: theme.accent }]}>
          Step {currentStep + 1} of {totalSteps}
        </Text>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  brandStrip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  brandStripText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  progressItem: {
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotLabel: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
  stepHeader: {
    marginBottom: spacing.xxl,
  },
  stepNum: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: spacing.sm,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: typography.body,
    lineHeight: 24,
    maxWidth: 300,
  },
});
