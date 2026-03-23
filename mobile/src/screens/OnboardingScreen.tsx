import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/authStore';
import { useProfile } from '../features/profile/hooks/useProfile';
import { normalizeApiError } from '../api/errors';
import AppBackButton from '../components/ui/AppBackButton';
import AppBackdrop from '../components/ui/AppBackdrop';
import { useTheme } from '../theme/useTheme';
import type { RootStackScreenProps } from '../core/navigation/types';
import { onboardingSchema } from '../features/onboarding/schema';
import { styles } from '../features/onboarding/onboarding.styles';
import {
  ACTIVITIES,
  ActivitiesStep,
  EnvironmentStep,
  FrequencyStep,
  IntentStep,
  ReadyStep,
  ScheduleStep,
  STEP_CHAPTERS,
  SocialStep,
  SummaryStep,
  TOTAL_STEPS,
  WelcomeStep,
} from '../features/onboarding/components';
import type { OnboardingData } from '../features/onboarding/components';

export default function OnboardingScreen({
  navigation,
}: RootStackScreenProps<'Onboarding'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const { updateFitness } = useProfile();

  const [step, setStep] = useState(0);
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<OnboardingData>({
    defaultValues: {
      intent: 'both',
      activities: [],
      frequencyLabel: '3-4',
      intensityLevel: 'moderate',
      weeklyFrequencyBand: '3-4',
      environment: [],
      schedule: [],
      socialComfort: '',
    },
    resolver: zodResolver(onboardingSchema),
  });
  const data = watch();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const progress = (step + 1) / TOTAL_STEPS;

  const toggleArray = (arr: string[], key: string): string[] =>
    arr.includes(key) ? arr.filter((item) => item !== key) : [...arr, key];

  const transitionToStep = (nextStep: number) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) transitionToStep(step + 1);
  };

  const goBack = () => {
    if (step > 0) transitionToStep(step - 1);
    else if (navigation.canGoBack()) navigation.goBack();
  };

  const submitOnboarding = handleSubmit(
    async (values) => {
      try {
        await updateFitness({
          intensityLevel: values.intensityLevel,
          weeklyFrequencyBand: values.weeklyFrequencyBand,
          primaryGoal:
            values.intent === 'dating'
              ? 'connection'
              : values.intent === 'workout'
                ? 'performance'
                : 'both',
          favoriteActivities: values.activities
            .map((key) => ACTIVITIES.find((activity) => activity.key === key)?.label ?? key)
            .join(', '),
          prefersMorning: values.schedule.includes('morning'),
          prefersEvening: values.schedule.includes('evening'),
        });
        if (user) setUser({ ...user, isOnboarded: true });
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } catch (error) {
        Alert.alert('Could not save profile', normalizeApiError(error).message);
      }
    },
    (errors) => {
      const firstError = Object.values(errors)[0];
      const message = firstError?.message ?? 'Please complete all steps before continuing.';
      Alert.alert('Missing info', String(message));
    },
  );

  useEffect(() => {
    pulseLoopRef.current?.stop();
    pulseLoopRef.current = null;
    pulseAnim.setValue(1);

    if (step !== TOTAL_STEPS - 1) {
      return undefined;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );

    pulseLoopRef.current = pulseLoop;
    pulseLoop.start();

    return () => {
      pulseLoop.stop();
      if (pulseLoopRef.current === pulseLoop) {
        pulseLoopRef.current = null;
      }
      pulseAnim.setValue(1);
    };
  }, [pulseAnim, step]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <AppBackdrop />
      <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: theme.primary,
              width: `${progress * 100}%`,
            },
          ]}
        />
      </View>

      {step > 0 && (
        <View style={styles.backButtonRow}>
          <AppBackButton onPress={goBack} disabled={isSubmitting} style={{ marginBottom: 0 }} />
        </View>
      )}

      <View style={styles.shellHeader}>
        <Text style={[styles.chapterLabel, { color: theme.accent }]}>{STEP_CHAPTERS[step]}</Text>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {step === 0 ? (
          <WelcomeStep goNext={goNext} insets={insets} theme={theme} />
        ) : step === 1 ? (
          <IntentStep data={data} goNext={goNext} insets={insets} setValue={setValue} theme={theme} toggleArray={toggleArray} />
        ) : step === 2 ? (
          <ActivitiesStep data={data} goNext={goNext} insets={insets} setValue={setValue} theme={theme} toggleArray={toggleArray} />
        ) : step === 3 ? (
          <FrequencyStep data={data} goNext={goNext} insets={insets} setValue={setValue} theme={theme} toggleArray={toggleArray} />
        ) : step === 4 ? (
          <EnvironmentStep data={data} goNext={goNext} insets={insets} setValue={setValue} theme={theme} toggleArray={toggleArray} />
        ) : step === 5 ? (
          <ScheduleStep data={data} goNext={goNext} insets={insets} setValue={setValue} theme={theme} toggleArray={toggleArray} />
        ) : step === 6 ? (
          <SocialStep data={data} goNext={goNext} insets={insets} setValue={setValue} theme={theme} toggleArray={toggleArray} />
        ) : step === 7 ? (
          <SummaryStep data={data} insets={insets} onNext={goNext} theme={theme} />
        ) : step === 8 ? (
          <ReadyStep
            insets={insets}
            isSubmitting={isSubmitting}
            pulseAnim={pulseAnim}
            submitOnboarding={submitOnboarding}
            theme={theme}
          />
        ) : (
          <View />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}
