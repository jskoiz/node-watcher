import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../../design/primitives';
import AppIcon from '../../../components/ui/AppIcon';
import { spacing } from '../../../theme/tokens';
import { styles } from '../onboarding.styles';
import type { OnboardingStepProps } from './types';

const INTENT_OPTIONS = [
  { key: 'dating', icon: 'heart', title: 'Dating', sub: 'Meet someone special through shared movement' },
  { key: 'workout', icon: 'activity', title: 'Training Partner', sub: 'Find your perfect training companion' },
  { key: 'both', icon: 'shuffle', title: 'Open to both', sub: 'Keep it open to chemistry and momentum.' },
] as const;

export function IntentStep({ data, goNext, insets, setValue, theme }: OnboardingStepProps) {
  return (
    <View style={[styles.fullScreenStep, { justifyContent: 'flex-start' }]}>
      <View>
        <Text style={[styles.stepHeadline, { color: theme.textPrimary }]}>
          What brings you to BRDG?
        </Text>
        <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
          This helps us personalize your feed.
        </Text>
      </View>
      <View style={styles.intentCards}>
        {INTENT_OPTIONS.map((opt) => {
          const selected = data.intent === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setValue('intent', opt.key)}
              style={[
                styles.intentCard,
                {
                  backgroundColor: selected ? theme.primarySubtle : theme.surface,
                  borderColor: selected ? theme.primary : theme.border,
                  borderWidth: selected ? 2 : 1.5,
                  minHeight: 56,
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${opt.title}. ${opt.sub}`}
            >
              <View style={[styles.intentCardIconWrap, { backgroundColor: selected ? theme.primarySubtle : theme.surfaceElevated }]}>
                <AppIcon name={opt.icon} size={18} color={selected ? theme.primary : theme.textSecondary} />
              </View>
              <Text style={[styles.intentCardTitle, { color: selected ? theme.primary : theme.textPrimary }]}>
                {opt.title}
              </Text>
              <Text style={[styles.intentCardSub, { color: theme.textSecondary }]}>{opt.sub}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.stepFooter, { paddingBottom: Math.max(insets.bottom + 8, spacing.xxl) }]}>
        <Button label="Continue" onPress={goNext} />
      </View>
    </View>
  );
}
