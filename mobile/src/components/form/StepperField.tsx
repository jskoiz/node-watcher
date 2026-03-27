import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { fieldStyles } from './fieldStyles';

export function StepperField({
  disabled,
  helperText,
  label,
  max,
  min,
  onChange,
  value,
}: {
  disabled?: boolean;
  helperText?: string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}) {
  const theme = useTheme();
  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <View style={fieldStyles.wrapper}>
      <Text style={[fieldStyles.label, { color: theme.textMuted }]}>{label}</Text>
      <View
        style={[
          fieldStyles.trigger,
          {
            backgroundColor: disabled ? theme.subduedSurface : theme.fieldSurface,
            borderColor: theme.stroke,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        ]}
      >
        <Pressable
          accessibilityLabel={`Decrease ${label}`}
          disabled={disabled || atMin}
          onPress={() => onChange(Math.max(min, value - 1))}
          style={[
            fieldStyles.stepperButton,
            { opacity: disabled || atMin ? 0.36 : 1, backgroundColor: theme.chipSurface },
          ]}
        >
          <Text style={[fieldStyles.stepperSymbol, { color: theme.textPrimary }]}>-</Text>
        </Pressable>
        <Text style={[fieldStyles.stepperValue, { color: theme.textPrimary }]}>{value}</Text>
        <Pressable
          accessibilityLabel={`Increase ${label}`}
          disabled={disabled || atMax}
          onPress={() => onChange(Math.min(max, value + 1))}
          style={[
            fieldStyles.stepperButton,
            { opacity: disabled || atMax ? 0.36 : 1, backgroundColor: theme.selectedFill },
          ]}
        >
          <Text style={[fieldStyles.stepperSymbol, { color: theme.selectedText }]}>+</Text>
        </Pressable>
      </View>
      {helperText ? <Text style={[fieldStyles.helperText, { color: theme.textMuted }]}>{helperText}</Text> : null}
    </View>
  );
}
