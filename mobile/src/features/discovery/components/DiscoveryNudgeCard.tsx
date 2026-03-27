import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../design/primitives';
import { useTheme } from '../../../theme/useTheme';
import { radii, spacing, typography } from '../../../theme/tokens';

interface DiscoveryNudgeCardProps {
  score: number;
  onPress: () => void;
}

export function DiscoveryNudgeCard({ score, onPress }: DiscoveryNudgeCardProps) {
  const theme = useTheme();
  if (score >= 60) return null;

  const barColor = score >= 40 ? theme.success : theme.accentPrimary;

  return (
    <Pressable onPress={onPress} testID="discovery-nudge-card" accessibilityRole="button" accessibilityLabel="Complete your profile to get more matches">
      <Card style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Complete your profile</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Finish your profile to get more matches</Text>

        <View style={styles.progressRow}>
          <View style={[styles.trackOuter, { backgroundColor: theme.stroke }]}>
            <View
              style={[styles.trackFill, { width: `${Math.min(score, 100)}%`, backgroundColor: barColor }]}
            />
          </View>
          <Text style={[styles.percentage, { color: theme.accentPrimary }]}>{score}%</Text>
        </View>

        <View style={[styles.ctaRow, { backgroundColor: theme.accentSoft }]}>
          <Text style={[styles.ctaText, { color: theme.accentPrimary }]}>Tap to complete</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.body,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    lineHeight: 20,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  trackOuter: {
    flex: 1,
    height: 6,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  percentage: {
    fontSize: typography.bodySmall,
    fontWeight: '900',
    minWidth: 36,
    textAlign: 'right',
  },
  ctaRow: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.pill,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
