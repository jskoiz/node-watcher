import React, { PropsWithChildren } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { fontIntent } from '../../lib/fonts';
import { spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { screenLayout } from './ScreenScaffold';

export function SectionBlock({
  children,
  contentStyle,
  description,
  descriptionStyle,
  eyebrow,
  eyebrowStyle,
  inset = true,
  spacingMode = 'default',
  style,
  title,
  titleStyle,
  titleVariant = 'section',
}: PropsWithChildren<{
  contentStyle?: StyleProp<ViewStyle>;
  description?: string;
  descriptionStyle?: StyleProp<TextStyle>;
  eyebrow?: string;
  eyebrowStyle?: StyleProp<TextStyle>;
  inset?: boolean;
  spacingMode?: 'default' | 'tight';
  style?: StyleProp<ViewStyle>;
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  titleVariant?: 'section' | 'screen';
}>) {
  const theme = useTheme();
  const hasHeader = Boolean(eyebrow || title || description);

  return (
    <View
      style={[
        styles.base,
        inset ? styles.inset : null,
        spacingMode === 'tight' ? styles.tight : null,
        style,
      ]}
    >
      {hasHeader ? (
        <View style={styles.header}>
          {eyebrow ? (
            <Text style={[styles.eyebrow, { color: theme.textMuted }, eyebrowStyle]}>
              {eyebrow}
            </Text>
          ) : null}
          {title ? (
            <Text
              style={[
                titleVariant === 'screen' ? styles.screenTitle : styles.sectionTitle,
                {
                  color: theme.textPrimary,
                  fontFamily:
                    titleVariant === 'screen'
                      ? fontIntent.editorialHeadline
                      : fontIntent.uiSans,
                },
                titleStyle,
              ]}
            >
              {title}
            </Text>
          ) : null}
          {description ? (
            <Text style={[styles.description, { color: theme.textSecondary }, descriptionStyle]}>
              {description}
            </Text>
          ) : null}
        </View>
      ) : null}
      {children ? <View style={[hasHeader ? styles.content : null, contentStyle]}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    marginBottom: screenLayout.sectionGap,
  },
  inset: {
    paddingHorizontal: screenLayout.gutter,
  },
  tight: {
    marginBottom: screenLayout.sectionGapTight,
  },
  header: {
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  screenTitle: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  sectionTitle: {
    fontSize: typography.bodySmall,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  description: {
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  content: {
    marginTop: screenLayout.headerGap,
  },
});
