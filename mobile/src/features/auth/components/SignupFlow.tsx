import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { DateField } from '../../../components/form/DateField';
import { SheetSelectField } from '../../../components/form/SheetSelectField';
import AppBackButton from '../../../components/ui/AppBackButton';
import AppBackdrop from '../../../components/ui/AppBackdrop';
import { Button, GlassView, Input } from '../../../design/primitives';
import { GENDER_OPTIONS } from '../../../constants/signup';
import { useTheme } from '../../../theme/useTheme';
import { radii, spacing, typography } from '../../../theme/tokens';
import type { SignupFormValues } from '../schema';

const STEPS = 3;
const STEP_LABELS = ['Account', 'Profile', 'Done'];
const STEP_TITLES = ["What's your name?", 'Create your login', 'Almost done'];
const STEP_SUBTITLES = [
  "We'll use this on your profile.",
  "You'll use these to sign in.",
  'Helps us personalize your experience.',
];

export type SignupFlowProps = {
  birthdate: string;
  canProceed: boolean;
  control: Control<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
  gender: string;
  handleBack?: () => void;
  handleSubmitStep?: () => void;
  isSubmitting: boolean;
  onBack?: () => void;
  onNavigateLogin: () => void;
  onSubmitStep?: () => void;
  step: number;
};

export function SignupFlow({
  birthdate,
  canProceed,
  control,
  errors,
  gender,
  handleBack,
  handleSubmitStep,
  isSubmitting,
  onBack,
  onNavigateLogin,
  onSubmitStep,
  step,
}: SignupFlowProps) {
  const theme = useTheme();
  const birthdateError = errors.birthdate?.message;
  const resolvedBackHandler = handleBack ?? onBack ?? (() => undefined);
  const resolvedSubmitHandler =
    handleSubmitStep ?? onSubmitStep ?? (() => undefined);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppBackdrop />

          <AppBackButton onPress={resolvedBackHandler} disabled={isSubmitting} />

          <GlassView tier="light" tint={theme.accentSubtle} borderRadius={999} style={styles.brandStrip}>
            <Text style={[styles.brandStripText, { color: theme.accent }]}>CREATE ACCOUNT</Text>
          </GlassView>

          <View style={styles.progressRow}>
            {Array.from({ length: STEPS }).map((_, i) => (
              <View key={i} style={styles.progressItem}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i < step ? theme.primary : i === step ? theme.primary : theme.border,
                      width: i === step ? 28 : 8,
                      opacity: i < step ? 0.5 : 1,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.dotLabel,
                    {
                      color: i === step ? theme.primary : theme.textMuted,
                      fontWeight: i === step ? '700' : '500',
                    },
                  ]}
                >
                  {STEP_LABELS[i]}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.stepHeader}>
            <Text style={[styles.stepNum, { color: theme.accent }]}>
              Step {step + 1} of {STEPS}
            </Text>
            <Text style={[styles.title, { color: theme.textPrimary }]}>{STEP_TITLES[step]}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{STEP_SUBTITLES[step]}</Text>
          </View>

          <GlassView tier="frosted" borderRadius={radii.xxl} specularHighlight style={styles.formCard}>
            <Text style={[styles.formKicker, { color: theme.textMuted }]}>{STEP_LABELS[step].toUpperCase()}</Text>
            {step === 0 && (
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onBlur, onChange, value } }) => (
                  <Input
                    label="First name"
                    placeholder="Alex"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    editable={!isSubmitting}
                    error={errors.firstName?.message}
                    autoFocus
                    autoCapitalize="words"
                    autoComplete="given-name"
                    textContentType="givenName"
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={() => {
                      void resolvedSubmitHandler();
                    }}
                  />
                )}
              />
            )}
            {step === 1 && (
              <>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onBlur, onChange, value } }) => (
                    <Input
                      label="Email"
                      placeholder="you@example.com"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      autoCapitalize="none"
                      autoComplete="email"
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      editable={!isSubmitting}
                      error={errors.email?.message}
                      autoFocus
                      returnKeyType="next"
                      submitBehavior="submit"
                      onSubmitEditing={() => {
                        void resolvedSubmitHandler();
                      }}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onBlur, onChange, value } }) => (
                    <Input
                      label="Password"
                      placeholder="At least 8 characters"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      secureTextEntry
                      editable={!isSubmitting}
                      error={errors.password?.message}
                      autoCapitalize="none"
                      autoComplete="new-password"
                      textContentType="newPassword"
                      returnKeyType="done"
                      submitBehavior="submit"
                      onSubmitEditing={() => {
                        void resolvedSubmitHandler();
                      }}
                    />
                  )}
                />
              </>
            )}
            {step === 2 && (
              <>
                <Controller
                  control={control}
                  name="birthdate"
                  render={({ field: { onChange } }) => (
                    <DateField
                      label="Birthday"
                      placeholder="Choose your birthdate"
                      value={birthdate}
                      onChange={onChange}
                      error={birthdateError}
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
                  render={({ field: { onChange } }) => (
                    <SheetSelectField
                      label="I identify as"
                      placeholder="Choose a gender"
                      options={[...GENDER_OPTIONS]}
                      value={gender}
                      onSelect={onChange}
                      disabled={isSubmitting}
                      error={errors.gender?.message}
                      sheetTitle="Choose a gender"
                      sheetSubtitle=""
                    />
                  )}
                />
              </>
            )}

            <Button
              label={step < STEPS - 1 ? 'Continue' : 'Create my account'}
                  onPress={() => {
                    void resolvedSubmitHandler();
                  }}
              loading={isSubmitting}
              disabled={!canProceed || isSubmitting}
              style={styles.ctaButton}
            />
          </GlassView>

          {step === 0 && (
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.textMuted }]}>Already have an account? </Text>
              <Pressable
                onPress={onNavigateLogin}
                accessibilityRole="link"
                accessibilityLabel="Sign in"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{ minHeight: 44, justifyContent: 'center' }}
              >
                <Text style={[styles.footerLink, { color: theme.accent }]}>Sign in</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  brandStrip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  brandStripText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  progressItem: {
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotLabel: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
  stepHeader: {
    marginBottom: spacing.xxl,
  },
  stepNum: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: spacing.sm,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: typography.body,
    lineHeight: 24,
    maxWidth: 300,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: typography.body,
  },
  footerLink: {
    fontSize: typography.body,
    fontWeight: '700',
  },
});
