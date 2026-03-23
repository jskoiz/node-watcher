import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../../design/primitives';
import { spacing } from '../../../theme/tokens';
import { styles } from '../onboarding.styles';
import { FREQUENCY_OPTIONS } from './constants';
import type { OnboardingStepProps } from './types';

export function FrequencyStep({ data, goNext, insets, setValue, theme }: OnboardingStepProps) {
  return (
    <View style={[styles.fullScreenStep, { justifyContent: 'flex-start' }]}>
      <View>
        <Text style={[styles.stepHeadline, { color: theme.textPrimary }]}>
          How often do you train?
        </Text>
        <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
          We'll match you with similar energy.
        </Text>
      </View>
      <View style={styles.largeCards}>
        {FREQUENCY_OPTIONS.map((opt) => {
          const selected = data.frequencyLabel === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => {
                setValue('frequencyLabel', opt.key);
                setValue('weeklyFrequencyBand', opt.key);
                setValue('intensityLevel', opt.intensity);
              }}
              style={[
                styles.largeCard,
                {
                  backgroundColor: selected ? theme.primarySubtle : theme.surface,
                  borderColor: selected ? theme.primary : theme.border,
                  borderWidth: selected ? 2 : 1.5,
                  minHeight: 48,
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${opt.label} per week. ${opt.subtitle}`}
            >
              <Text style={[styles.largeCardLabel, { color: selected ? theme.primary : theme.textPrimary }]}>
                {opt.label}
              </Text>
              <Text style={[styles.largeCardSub, { color: theme.textSecondary }]}>{opt.subtitle}</Text>
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
