import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { normalizeApiError } from '../api/errors';
import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import { useTheme } from '../theme/useTheme';
import { spacing, typography } from '../theme/tokens';

export default function LoginScreen({ navigation }: any) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const login = useAuthStore((state) => state.login);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = 'Email is required.';
    if (!password.trim()) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (error) {
      setSubmitError(normalizeApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0D1117' }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Abstract graphic shapes */}
          <View style={styles.bgShapes} pointerEvents="none">
            <View style={[styles.bgCircle, styles.bgCircle1]} />
            <View style={[styles.bgCircle, styles.bgCircle2]} />
            <View style={[styles.bgCircle, styles.bgCircle3]} />
          </View>

          {/* BRDG Wordmark */}
          <View style={styles.hero}>
            <Text style={styles.wordmark}>BRDG</Text>
            <Text style={[styles.tagline, { color: theme.textMuted }]}>
              Meet people who match your pace.
            </Text>
          </View>

          {/* Form card */}
          <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <AppInput
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={(v) => { setEmail(v); if (errors.email) setErrors((p) => ({ ...p, email: '' })); }}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!submitting}
              error={errors.email}
            />
            <AppInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={(v) => { setPassword(v); if (errors.password) setErrors((p) => ({ ...p, password: '' })); }}
              secureTextEntry
              editable={!submitting}
              error={errors.password}
            />

            {submitError ? (
              <View style={[styles.errorBanner, { backgroundColor: theme.dangerSubtle, borderColor: theme.danger }]}>
                <Text style={[styles.errorBannerText, { color: theme.danger }]}>{submitError}</Text>
              </View>
            ) : null}

            <AppButton
              label="Sign in"
              onPress={handleLogin}
              loading={submitting}
              style={styles.ctaButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textMuted }]}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Signup')} disabled={submitting}>
              <Text style={[styles.footerLink, { color: theme.accent }]}>Join BRDG</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxxl,
    paddingBottom: spacing.xxxl,
  },
  // Background decorative shapes
  bgShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.07,
  },
  bgCircle1: {
    width: 320,
    height: 320,
    backgroundColor: '#7C6AF7',
    top: -80,
    right: -80,
  },
  bgCircle2: {
    width: 200,
    height: 200,
    backgroundColor: '#34D399',
    bottom: 100,
    left: -60,
  },
  bgCircle3: {
    width: 140,
    height: 140,
    backgroundColor: '#F59E0B',
    top: '35%',
    right: -40,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xxxxl,
  },
  wordmark: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 44,
    marginBottom: spacing.md,
    color: '#7C6AF7',
  },
  tagline: {
    fontSize: typography.body,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  formCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.xxl,
    shadowColor: '#000',
    shadowOpacity: 0.30,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  ctaButton: {
    marginTop: spacing.sm,
    width: '100%',
  },
  errorBanner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxxxl,
  },
  footerText: {
    fontSize: typography.body,
  },
  footerLink: {
    fontSize: typography.body,
    fontWeight: '700',
  },
});
