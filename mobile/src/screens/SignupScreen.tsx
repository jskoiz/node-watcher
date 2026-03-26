import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
  Controller,
  useForm,
  useWatch,
  type Control,
  type FieldErrors,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/authStore';
import { normalizeApiError } from '../api/errors';
import { ControlledInputField } from '../components/form/ControlledInputField';
import { DateField } from '../components/form/DateField';
import { SheetSelectField } from '../components/form/SheetSelectField';
import { useStepFlow } from '../components/form/useStepFlow';
import { Button, GlassView } from '../design/primitives';
import { GENDER_OPTIONS } from '../constants/signup';
import { AuthFooterLinkRow, AuthScreenShell } from '../features/auth/components/AuthScreenShell';
import { SignupStepHeader } from '../features/auth/components/SignupStepHeader';
import { useTheme } from '../theme/useTheme';
import { radii, spacing } from '../theme/tokens';
import {
  signupSchema,
  type SignupFormValues,
} from '../features/auth/schema';
import type { RootStackScreenProps } from '../core/navigation/types';

type SignupStepViewContext = {
  control: Control<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
  isSubmitting: boolean;
  onSubmitStep: () => void;
};

type SignupStepDefinition = {
  key: string;
  title: string;
  subtitle: string;
  submitLabel: string;
  formLabel: string;
  fields: Array<keyof SignupFormValues>;
  canProceed: (values: SignupFormValues) => boolean;
  renderFields: (context: SignupStepViewContext) => React.ReactNode;
};

const SIGNUP_STEPS: SignupStepDefinition[] = [
  {
    key: 'account',
    title: "What's your name?",
    subtitle: "We'll use this on your profile.",
    submitLabel: 'Continue',
    formLabel: 'Account',
    fields: ['firstName'],
    canProceed: (values) => values.firstName.trim().length > 0,
    renderFields: ({ control, isSubmitting, onSubmitStep }) => (
      <ControlledInputField
        control={control}
        name="firstName"
        label="First name"
        placeholder="Alex"
        disabled={isSubmitting}
        autoFocus
        autoCapitalize="words"
        autoComplete="name-given"
        textContentType="givenName"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => {
          void onSubmitStep();
        }}
      />
    ),
  },
  {
    key: 'profile',
    title: 'Create your login',
    subtitle: "You'll use these to sign in.",
    submitLabel: 'Continue',
    formLabel: 'Profile',
    fields: ['email', 'password'],
    canProceed: (values) => values.email.trim().length > 0 && values.password.trim().length > 0,
    renderFields: ({ control, isSubmitting, onSubmitStep }) => (
      <>
        <ControlledInputField
          control={control}
          name="email"
          label="Email"
          placeholder="you@example.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          disabled={isSubmitting}
          autoFocus
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => {
            void onSubmitStep();
          }}
        />
        <ControlledInputField
          control={control}
          name="password"
          label="Password"
          placeholder="At least 8 characters"
          secureTextEntry
          disabled={isSubmitting}
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          submitBehavior="submit"
          onSubmitEditing={() => {
            void onSubmitStep();
          }}
        />
      </>
    ),
  },
  {
    key: 'done',
    title: 'Almost done',
    subtitle: 'Helps us personalize your experience.',
    submitLabel: 'Create my account',
    formLabel: 'Done',
    fields: ['birthdate', 'gender'],
    canProceed: (values) => values.birthdate.length > 0 && values.gender.trim().length > 0,
    renderFields: ({ control, errors, isSubmitting }) => (
      <>
        <Controller
          control={control}
          name="birthdate"
          render={({ field: { onChange, value } }) => (
            <DateField
              label="Birthday"
              placeholder="Choose your birthdate"
              value={value}
              onChange={onChange}
              error={errors.birthdate?.message}
              disabled={isSubmitting}
              maximumDate={new Date()}
              sheetTitle="Choose your birthdate"
              sheetSubtitle="You must be 18 or older."
            />
          )}
        />
        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <SheetSelectField
              label="I identify as"
              placeholder="Choose a gender"
              options={[...GENDER_OPTIONS]}
              value={value}
              onSelect={onChange}
              disabled={isSubmitting}
              error={errors.gender?.message}
              sheetTitle="Choose a gender"
              sheetSubtitle=""
            />
          )}
        />
      </>
    ),
  },
];

export type SignupScreenViewProps = {
  canProceed: boolean;
  control: Control<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
  isSubmitting: boolean;
  onBack: () => void;
  onNavigateLogin: () => void;
  onSubmitStep: () => void;
  step: number;
};

export function SignupScreenView({
  canProceed,
  control,
  errors,
  isSubmitting,
  onBack,
  onNavigateLogin,
  onSubmitStep,
  step,
}: SignupScreenViewProps) {
  const theme = useTheme();
  const currentStep = SIGNUP_STEPS[step];

  return (
    <AuthScreenShell
      leading={(
        <SignupStepHeader
          currentStep={step}
          disabled={isSubmitting}
          onBack={onBack}
          stepLabels={SIGNUP_STEPS.map((signupStep) => signupStep.formLabel)}
          subtitle={currentStep.subtitle}
          title={currentStep.title}
          totalSteps={SIGNUP_STEPS.length}
        />
      )}
      card={(
        <GlassView tier="frosted" borderRadius={radii.xxl} specularHighlight style={styles.formCard}>
          <Text style={[styles.formKicker, { color: theme.textMuted }]}>{currentStep.formLabel.toUpperCase()}</Text>
          {currentStep.renderFields({
            control,
            errors,
            isSubmitting,
            onSubmitStep,
          })}
          <Button
            label={currentStep.submitLabel}
            onPress={() => {
              void onSubmitStep();
            }}
            loading={isSubmitting}
            disabled={!canProceed || isSubmitting}
            style={styles.ctaButton}
          />
        </GlassView>
      )}
      footer={step === 0 ? (
        <AuthFooterLinkRow
          prompt="Already have an account? "
          linkLabel="Sign in"
          onPress={onNavigateLogin}
          accessibilityLabel="Sign in"
          style={styles.footer}
        />
      ) : undefined}
      contentContainerStyle={styles.content}
    />
  );
}

export default function SignupScreen({
  navigation,
}: RootStackScreenProps<'Signup'>) {
  const signup = useAuthStore((state) => state.signup);
  const { goBack, goNext, isLastStep, step } = useStepFlow({ totalSteps: SIGNUP_STEPS.length });
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    defaultValues: {
      birthdate: '',
      email: '',
      firstName: '',
      gender: '',
      password: '',
    },
    resolver: zodResolver(signupSchema),
    shouldUnregister: false,
  });
  const currentStep = SIGNUP_STEPS[step];
  const watchedFields = useWatch({ control, name: currentStep.fields });

  const handleNext = async () => {
    const isValid = await trigger(currentStep.fields, { shouldFocus: true });
    if (!isValid) return;
    if (!isLastStep) {
      goNext();
    } else {
      await handleSubmit(
        async (values) => {
          try {
            await signup({
              email: values.email.trim().toLowerCase(),
              password: values.password,
              firstName: values.firstName.trim(),
              birthdate: values.birthdate,
              gender: values.gender,
            });
          } catch (error) {
            Alert.alert("Couldn't create account", normalizeApiError(error).message);
          }
        },
        () => undefined,
      )();
    }
  };

  const canProceed = useMemo(() => {
    // Build a partial values object from the watched fields for the current step
    const stepValues = Object.fromEntries(
      currentStep.fields.map((field, i) => [field, (watchedFields[i] as string) ?? '']),
    );
    // Fill in defaults for fields not in the current step
    const fullValues: SignupFormValues = {
      birthdate: '',
      email: '',
      firstName: '',
      gender: '',
      password: '',
      ...stepValues,
    };
    return currentStep.canProceed(fullValues);
  }, [currentStep, watchedFields]);

  return (
    <SignupScreenView
      canProceed={canProceed}
      control={control}
      errors={errors}
      isSubmitting={isSubmitting}
      onBack={() => (step > 0 ? goBack() : navigation.goBack())}
      onNavigateLogin={() => navigation.goBack()}
      onSubmitStep={handleNext}
      step={step}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  formCard: {
    padding: spacing.xxl,
  },
  formKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: spacing.lg,
  },
  ctaButton: {
    marginTop: spacing.sm,
    width: '100%',
  },
  footer: {
    marginTop: spacing.xxxl,
  },
});
