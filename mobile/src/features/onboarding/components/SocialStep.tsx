import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../../design/primitives';
import AppIcon from '../../../components/ui/AppIcon';
import { spacing } from '../../../theme/tokens';
import { styles } from '../onboarding.styles';
import { SOCIAL_OPTIONS } from './constants';
import type { OnboardingStepProps } from './types';

export function SocialStep({ data, goNext, insets, setValue, theme }: OnboardingStepProps) {
  return (
    <View style={[styles.fullScreenStep, { justifyContent: 'flex-start' }]}>
      <View>
        <Text style={[styles.stepHeadline, { color: theme.textPrimary }]}>
          How do you prefer to meet?
        </Text>
        <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
          How you prefer to connect.
        </Text>
      </View>
      <View style={styles.socialCards}>
        {SOCIAL_OPTIONS.map((opt) => {
          const selected = data.socialComfort === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setValue('socialComfort', opt.key)}
              style={[
                styles.socialCard,
                {
                  backgroundColor: selected ? theme.primarySubtle : theme.surface,
                  borderColor: selected ? theme.primary : theme.border,
                  borderWidth: selected ? 2 : 1.5,
                  minHeight: 56,
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${opt.label}. ${opt.subtitle}`}
            >
              <View style={[styles.socialCardIconWrap, { backgroundColor: selected ? theme.primarySubtle : theme.surfaceElevated }]}>
                <AppIcon name={opt.icon} size={16} color={selected ? theme.primary : theme.textSecondary} />
              </View>
              <View style={styles.socialCardText}>
                <Text style={[styles.socialCardTitle, { color: selected ? theme.primary : theme.textPrimary }]}>
                  {opt.label}
                </Text>
                <Text style={[styles.socialCardSub, { color: theme.textSecondary }]}>{opt.subtitle}</Text>
              </View>
              {selected && (
                <View style={[styles.checkDot, { backgroundColor: theme.primary }]}>
                  <AppIcon name="check" size={12} color={theme.textInverse} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.stepFooter, { paddingBottom: Math.max(insets.bottom + 8, spacing.xxl) }]}>
        <Button label="Continue" onPress={goNext} disabled={!data.socialComfort} />
      </View>
    </View>
  );
}
