import React from 'react';
import { Text, View } from 'react-native';
import { Button } from '../../../design/primitives';
import AppIcon from '../../../components/ui/AppIcon';
import { styles } from '../onboarding.styles';
import { OnboardingStepFooter } from './OnboardingStepLayout';
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
      <OnboardingStepFooter insetsBottom={insets.bottom}>
        <Button label="Get started" onPress={goNext} />
      </OnboardingStepFooter>
    </View>
  );
}
