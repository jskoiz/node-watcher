import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore, type Toast, type ToastVariant } from '../../store/toastStore';
import { lightTheme, radii, spacing, typography } from '../../theme/tokens';

const VARIANT_STYLES: Record<ToastVariant, { bg: string; text: string }> = {
  success: { bg: lightTheme.success, text: '#FFFFFF' },
  error: { bg: lightTheme.danger, text: '#FFFFFF' },
  warning: { bg: lightTheme.warning, text: lightTheme.textPrimary },
  info: { bg: lightTheme.accent, text: '#FFFFFF' },
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => dismiss(toast.id));
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [dismiss, opacity, toast.duration, toast.id, translateY]);

  const colors = VARIANT_STYLES[toast.variant];

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: colors.bg, opacity, transform: [{ translateY }] },
      ]}
    >
      <Pressable
        onPress={() => dismiss(toast.id)}
        style={styles.toastPressable}
        accessibilityRole="alert"
      >
        <Text style={[styles.toastText, { color: colors.text }]} numberOfLines={2}>
          {toast.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function ToastOverlay() {
  const toasts = useToastStore((s) => s.toasts);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      style={[styles.container, { top: insets.top + spacing.sm }]}
      pointerEvents="box-none"
      testID="toast-overlay"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    marginBottom: spacing.sm,
    borderRadius: radii.sm,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  toastPressable: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  toastText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    textAlign: 'center',
  },
});
