import React from 'react';
import { Animated, Text, View } from 'react-native';
import { Button } from '../../../design/primitives';
import AppIcon from '../../../components/ui/AppIcon';
import { styles } from '../onboarding.styles';
import { OnboardingStepFooter } from './OnboardingStepLayout';
import type { ReadyStepProps } from './types';

export function ReadyStep({ insets, isSubmitting, pulseAnim, submitOnboarding, theme }: ReadyStepProps) {
  return (
    <View style={styles.fullScreenStep}>
      <View style={styles.holyShitContent}>
        <Animated.View style={[styles.countBadge, { backgroundColor: theme.primary, transform: [{ scale: pulseAnim }] }]}>
          <AppIcon name="users" size={36} color={theme.white} />
          <Text style={[styles.countLabel, { color: theme.white }]}>near you</Text>
        </Animated.View>

        <Text style={[styles.holyShitHeadline, { color: theme.textPrimary }]}>
          People near you
        </Text>
        <Text style={[styles.holyShitBody, { color: theme.textSecondary }]}>
          People near you are waiting with matching activities, schedule, and vibe.
        </Text>

        <View style={styles.avatarGrid}>
          {(['activity', 'circle', 'wind', 'map', 'triangle'] as const).map((iconName, i) => (
            <View
              key={iconName}
              style={[
                styles.avatarBlur,
                {
                  backgroundColor: i % 2 === 0 ? theme.primarySubtle : theme.accentSubtle,
                  borderColor: i % 2 === 0 ? theme.primary : theme.accent,
                },
              ]}
            >
              <AppIcon name={iconName} size={18} color={i % 2 === 0 ? theme.primary : theme.accent} />
            </View>
          ))}
        </View>
      </View>

      <OnboardingStepFooter insetsBottom={insets.bottom}>
        <Button
          label={isSubmitting ? 'Setting up your profile…' : 'Meet them now'}
          onPress={submitOnboarding}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </OnboardingStepFooter>
    </View>
  );
}
