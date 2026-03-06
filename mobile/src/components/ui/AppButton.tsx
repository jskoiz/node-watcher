import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { radii, spacing, typography } from '../../theme/tokens';

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  style?: ViewStyle;
}

export default function AppButton({ label, onPress, disabled, loading, variant = 'primary', style }: AppButtonProps) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 2 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
  };

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.primary,
          borderColor: theme.primary,
          shadowColor: theme.primary,
          shadowOpacity: 0.45,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.primary,
        };
      case 'accent':
        return {
          backgroundColor: theme.accent,
          borderColor: theme.accent,
          shadowColor: theme.accent,
          shadowOpacity: 0.35,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.border,
        };
      case 'danger':
        return {
          backgroundColor: theme.danger,
          borderColor: theme.danger,
          shadowColor: theme.danger,
          shadowOpacity: 0.30,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 5,
        };
    }
  };

  const getLabelColor = () => {
    switch (variant) {
      case 'primary': return theme.white;
      case 'secondary': return theme.primary;
      case 'accent': return '#0D1117'; // dark text on mint green
      case 'ghost': return theme.textSecondary;
      case 'danger': return theme.white;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={({ pressed }) => [{ opacity: isDisabled ? 0.48 : pressed ? 0.88 : 1 }]}
    >
      <Animated.View
        style={[
          styles.base,
          getContainerStyle(),
          style,
          { transform: [{ scale }] },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' || variant === 'danger' || variant === 'accent' ? theme.white : theme.primary}
            size="small"
          />
        ) : (
          <Text style={[styles.label, { color: getLabelColor() }]}>{label}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  label: {
    fontSize: typography.body,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
