import React from 'react';
import type { Animated } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import type { UseFormSetValue } from 'react-hook-form';
import type { Theme } from '../../../theme/tokens';
import { ActivitiesStep } from './ActivitiesStep';
import { EnvironmentStep } from './EnvironmentStep';
import { FrequencyStep } from './FrequencyStep';
import { IntentStep } from './IntentStep';
import { ReadyStep } from './ReadyStep';
import { ScheduleStep } from './ScheduleStep';
import { SocialStep } from './SocialStep';
import { SummaryStep } from './SummaryStep';
import type { OnboardingData } from './types';
import { WelcomeStep } from './WelcomeStep';

type ToggleArray = (arr: string[], key: string) => string[];

export type OnboardingStepRenderContext = {
  data: OnboardingData;
  goNext: () => void;
  insets: EdgeInsets;
  isSubmitting: boolean;
  pulseAnim: Animated.Value;
  setValue: UseFormSetValue<OnboardingData>;
  submitOnboarding: () => void;
  theme: Theme;
  toggleArray: ToggleArray;
};

export type OnboardingStepDefinition = {
  chapter: string;
  showBackButton: boolean;
  render: (context: OnboardingStepRenderContext) => React.ReactNode;
};

export const ONBOARDING_STEP_DEFINITIONS: OnboardingStepDefinition[] = [
  {
    chapter: 'Welcome',
    showBackButton: false,
    render: ({ goNext, insets, theme }) => (
      <WelcomeStep goNext={goNext} insets={insets} theme={theme} />
    ),
  },
  {
    chapter: 'Intent',
    showBackButton: true,
    render: ({ data, goNext, insets, setValue, theme, toggleArray }) => (
      <IntentStep
        data={data}
        goNext={goNext}
        insets={insets}
        setValue={setValue}
        theme={theme}
        toggleArray={toggleArray}
      />
    ),
  },
  {
    chapter: 'Activities',
    showBackButton: true,
    render: ({ data, goNext, insets, setValue, theme, toggleArray }) => (
      <ActivitiesStep
        data={data}
        goNext={goNext}
        insets={insets}
        setValue={setValue}
        theme={theme}
        toggleArray={toggleArray}
      />
    ),
  },
  {
    chapter: 'Frequency',
    showBackButton: true,
    render: ({ data, goNext, insets, setValue, theme, toggleArray }) => (
      <FrequencyStep
        data={data}
        goNext={goNext}
        insets={insets}
        setValue={setValue}
        theme={theme}
        toggleArray={toggleArray}
      />
    ),
  },
  {
    chapter: 'Environment',
    showBackButton: true,
    render: ({ data, goNext, insets, setValue, theme, toggleArray }) => (
      <EnvironmentStep
        data={data}
        goNext={goNext}
        insets={insets}
        setValue={setValue}
        theme={theme}
        toggleArray={toggleArray}
      />
    ),
  },
  {
    chapter: 'Schedule',
    showBackButton: true,
    render: ({ data, goNext, insets, setValue, theme, toggleArray }) => (
      <ScheduleStep
        data={data}
        goNext={goNext}
        insets={insets}
        setValue={setValue}
        theme={theme}
        toggleArray={toggleArray}
      />
    ),
  },
  {
    chapter: 'Social',
    showBackButton: true,
    render: ({ data, goNext, insets, setValue, theme, toggleArray }) => (
      <SocialStep
        data={data}
        goNext={goNext}
        insets={insets}
        setValue={setValue}
        theme={theme}
        toggleArray={toggleArray}
      />
    ),
  },
  {
    chapter: 'Summary',
    showBackButton: true,
    render: ({ data, goNext, insets, theme }) => (
      <SummaryStep data={data} insets={insets} onNext={goNext} theme={theme} />
    ),
  },
  {
    chapter: 'Ready',
    showBackButton: true,
    render: ({ insets, isSubmitting, pulseAnim, submitOnboarding, theme }) => (
      <ReadyStep
        insets={insets}
        isSubmitting={isSubmitting}
        pulseAnim={pulseAnim}
        submitOnboarding={submitOnboarding}
        theme={theme}
      />
    ),
  },
];
