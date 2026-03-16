import React from 'react';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

interface AppIconProps {
  accessibilityLabel?: string;
  name: FeatherName | string;
  size?: number;
  color?: string;
  style?: React.ComponentProps<typeof Feather>['style'];
}

export default function AppIcon({ accessibilityLabel, name, size = 18, color, style }: AppIconProps) {
  const theme = useTheme();

  return (
    <Feather
      name={name as FeatherName}
      size={size}
      color={color ?? theme.textPrimary}
      style={style}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'}
    />
  );
}
