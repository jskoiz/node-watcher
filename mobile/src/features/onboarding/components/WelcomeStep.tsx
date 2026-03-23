import React from 'react';
import { Text, View } from 'react-native';
import { Button } from '../../../design/primitives';
import AppIcon from '../../../components/ui/AppIcon';
import { spacing } from '../../../theme/tokens';
import { styles } from '../onboarding.styles';
import type { OnboardingStepProps } from './types';

export function WelcomeStep({ insets, goNext, theme }: Pick<OnboardingStepProps, 'goNext' | 'insets' | 'theme'>) {
  return (
    <View style={styles.fullScreenStep}>
      <View style={styles.welcomeContent}>
        <View style={[styles.welcomeIconWrap, { backgroundColor: theme.primarySubtle }]}>
          <AppIcon name="activity" size={30} color={theme.primary} />
        </View>
        <Text style={[styles.welcomeHeadline, { color: theme.textPrimary }]}>
          Welcome to BRDG
        </Text>
        <Text style={[styles.welcomeBody, { color: theme.textSecondary }]}>
          Connect with people through the activities you love.
        </Text>
      </View>
      <View style={[styles.stepFooter, { paddingBottom: Math.max(insets.bottom + 8, spacing.xxl) }]}>
        <Button label="Get started" onPress={goNext} />
      </View>
    </View>
  );
}
