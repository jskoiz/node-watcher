import React from 'react';
import {
  Pressable,
  type StyleProp,
  Text,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { primitiveStyles } from './primitiveStyles';

export function Chip({
  accentColor,
  active = false,
  interactive = true,
  label,
  onPress,
  style,
  textStyle,
}: {
  accentColor?: string;
  active?: boolean;
  interactive?: boolean;
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const theme = useTheme();
  const fillColor = active ? accentColor ?? theme.selectedFill : theme.chipSurface;
  const textColor = active ? accentColor ?? theme.selectedText : theme.textSecondary;
  return (
    <Pressable
      onPress={interactive ? onPress : undefined}
      disabled={!interactive}
      accessibilityRole={interactive ? 'button' : 'text'}
      accessibilityState={interactive ? { selected: active } : undefined}
      accessibilityLabel={label}
      style={[
        primitiveStyles.chip,
        { backgroundColor: fillColor, opacity: interactive ? 1 : 0.72 },
        style,
      ]}
    >
      <Text style={[primitiveStyles.chipText, { color: textColor }, textStyle]}>{label}</Text>
    </Pressable>
  );
}
