import type { Animated } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import type { UseFormSetValue } from 'react-hook-form';
import type { Theme } from '../../../theme/tokens';
import type { SessionIntent } from '../../../types/sessionIntent';

export interface OnboardingData {
  intent: SessionIntent;
  discoveryPreference: 'men' | 'women' | 'both';
  activities: string[];
  frequencyLabel: string;
  intensityLevel: string;
  weeklyFrequencyBand: string;
  environment: string[];
  schedule: string[];
  socialComfort: string;
}

export interface OnboardingStepProps {
  data: OnboardingData;
  goNext: () => void;
  insets: EdgeInsets;
  setValue: UseFormSetValue<OnboardingData>;
  theme: Theme;
  toggleArray: (arr: string[], key: string) => string[];
}

export interface SummaryStepProps
  extends Omit<OnboardingStepProps, 'goNext' | 'setValue' | 'toggleArray'> {
  onNext: () => void;
}

export interface ReadyStepProps {
  insets: EdgeInsets;
  isSubmitting: boolean;
  pulseAnim: Animated.Value;
  submitOnboarding: () => void;
  theme: Theme;
}
