import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../../design/primitives';
import { styles } from '../onboarding.styles';
import { DISCOVERY_PREFERENCE_OPTIONS } from './constants';
import { OnboardingFullscreenStep, OnboardingStepIntro } from './OnboardingStepLayout';
import type { OnboardingStepProps } from './types';

export function DiscoveryPreferenceStep({
  data,
  goNext,
  insets,
  setValue,
  theme,
}: OnboardingStepProps) {
  return (
    <OnboardingFullscreenStep
      footer={<Button label="Continue" onPress={goNext} />}
      insetsBottom={insets.bottom}
      scrollable
    >
      <OnboardingStepIntro
        title="Who do you want to see?"
        subtitle="Set your discovery preference now. You can change it later in profile."
        theme={theme}
      />
      <Text style={[styles.discoveryCaption, { color: theme.textSecondary }]}>
        This controls who appears in discovery: men, women, or both.
      </Text>
      <View style={styles.intentCards}>
        {DISCOVERY_PREFERENCE_OPTIONS.map((option) => {
          const selected = data.discoveryPreference === option.key;

          return (
            <Pressable
              key={option.key}
              onPress={() => setValue('discoveryPreference', option.key)}
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
              accessibilityLabel={`${option.label}. ${option.subtitle}`}
              accessibilityHint={selected ? 'Selected' : 'Double tap to choose this option'}
            >
              <Text style={[styles.intentCardTitle, { color: selected ? theme.primary : theme.textPrimary }]}>
                {option.label}
              </Text>
              <Text style={[styles.intentCardSub, { color: theme.textSecondary }]}>{option.subtitle}</Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingFullscreenStep>
  );
}
