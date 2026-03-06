import React, { PropsWithChildren } from 'react';
import { ImageBackground, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { radii, spacing } from '../../theme/tokens';

interface AppCardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  /** 'default' | 'elevated' | 'flat' | 'glass' | 'imageCard' */
  variant?: 'default' | 'elevated' | 'flat' | 'glass' | 'imageCard';
  /** Left accent strip color */
  accent?: string;
  /** Image URI for imageCard variant */
  imageUri?: string;
}

export default function AppCard({ children, style, variant = 'default', accent, imageUri }: AppCardProps) {
  const theme = useTheme();

  const getBg = () => {
    if (variant === 'flat') return 'transparent';
    if (variant === 'glass') return theme.surfaceGlass;
    return theme.surface;
  };

  const getShadow = (): ViewStyle => {
    if (variant === 'elevated') return {
      shadowColor: '#000',
      shadowOpacity: 0.35,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    };
    if (variant === 'glass') return {
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    };
    return {
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    };
  };

  if (variant === 'imageCard' && imageUri) {
    return (
      <ImageBackground
        source={{ uri: imageUri }}
        style={[styles.card, styles.imageCard, style]}
        imageStyle={{ borderRadius: 20 }}
      >
        <View style={styles.imageOverlay}>
          {children}
        </View>
      </ImageBackground>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: getBg(),
          borderColor: variant === 'flat' ? 'transparent' : theme.border,
          borderWidth: variant === 'flat' ? 0 : 1,
          ...getShadow(),
        },
        style,
      ]}
    >
      {/* Left accent strip */}
      {accent ? (
        <View style={[styles.accentStrip, { backgroundColor: accent }]} />
      ) : null}
      <View style={accent ? styles.accentContent : undefined}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: spacing.lg,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  accentStrip: {
    width: 4,
    borderRadius: 2,
    marginRight: spacing.md,
    alignSelf: 'stretch',
  },
  accentContent: {
    flex: 1,
  },
  imageCard: {
    padding: 0,
    overflow: 'hidden',
  },
  imageOverlay: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    padding: spacing.lg,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
});
