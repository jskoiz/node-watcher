import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../../design/primitives';
import AppIcon from '../../../components/ui/AppIcon';
import { spacing } from '../../../theme/tokens';
import { styles } from '../onboarding.styles';
import { SCHEDULE_OPTIONS } from './constants';
import type { OnboardingStepProps } from './types';

export function ScheduleStep({ data, goNext, insets, setValue, theme, toggleArray }: OnboardingStepProps) {
  return (
    <View style={[styles.fullScreenStep, { justifyContent: 'flex-start' }]}>
      <View>
        <Text style={[styles.stepHeadline, { color: theme.textPrimary }]}>
          When do you prefer to move?
        </Text>
        <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
          Select all that apply.
        </Text>
      </View>
      <View style={styles.largeCards}>
        {SCHEDULE_OPTIONS.map((opt) => {
          const selected = data.schedule.includes(opt.key);
          return (
            <Pressable
              key={opt.key}
              onPress={() => setValue('schedule', toggleArray(data.schedule, opt.key))}
              style={[
                styles.scheduleCard,
                {
                  backgroundColor: selected ? theme.accentSubtle : theme.surface,
                  borderColor: selected ? theme.accent : theme.border,
                  borderWidth: selected ? 2 : 1.5,
                  minHeight: 48,
                },
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={opt.label}
            >
              <View style={[styles.scheduleIconWrap, { backgroundColor: selected ? theme.accentSubtle : theme.surfaceElevated }]}>
                <AppIcon name={opt.icon} size={16} color={selected ? theme.accent : theme.textSecondary} />
              </View>
              <Text style={[styles.largeCardLabel, { color: selected ? theme.accent : theme.textPrimary }]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.stepFooter, { paddingBottom: Math.max(insets.bottom + 8, spacing.xxl) }]}>
        <Button label="Continue" onPress={goNext} disabled={data.schedule.length === 0} />
      </View>
    </View>
  );
}
