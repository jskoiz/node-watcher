import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../../design/primitives';
import AppIcon from '../../../components/ui/AppIcon';
import { spacing } from '../../../theme/tokens';
import { styles } from '../onboarding.styles';
import { ENVIRONMENTS } from './constants';
import type { OnboardingStepProps } from './types';

export function EnvironmentStep({ data, goNext, insets, setValue, theme, toggleArray }: OnboardingStepProps) {
  return (
    <View style={[styles.fullScreenStep, { justifyContent: 'flex-start' }]}>
      <View>
        <Text style={[styles.stepHeadline, { color: theme.textPrimary }]}>
          Where do you like to train?
        </Text>
        <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
          Pick all that apply.
        </Text>
      </View>
      <View style={styles.activityGrid}>
        {ENVIRONMENTS.map((env) => {
          const selected = data.environment.includes(env.key);
          return (
            <Pressable
              key={env.key}
              onPress={() => setValue('environment', toggleArray(data.environment, env.key))}
              style={[
                styles.activityTile,
                {
                  backgroundColor: selected ? theme.accentSubtle : theme.surface,
                  borderColor: selected ? theme.accent : theme.border,
                  borderWidth: selected ? 2 : 1.5,
                },
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={env.label}
            >
              <View style={[styles.activityIconWrap, { backgroundColor: selected ? theme.accentSubtle : theme.surfaceElevated }]}>
                <AppIcon name={env.icon} size={16} color={selected ? theme.accent : theme.textSecondary} />
              </View>
              <Text style={[styles.activityLabel, { color: selected ? theme.accent : theme.textPrimary }]}>
                {env.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.stepFooter, { paddingBottom: Math.max(insets.bottom + 8, spacing.xxl) }]}>
        <Button label="Continue" onPress={goNext} disabled={data.environment.length === 0} />
      </View>
    </View>
  );
}
