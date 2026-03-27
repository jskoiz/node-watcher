import React, { PropsWithChildren } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import AppBackdrop from '../../components/ui/AppBackdrop';
import { spacing } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

export const screenLayout = {
  gutter: spacing.xxl,
  sectionGap: spacing.xxl,
  sectionGapTight: spacing.xl,
  headerGap: spacing.lg,
  headerCopyGap: spacing.sm,
  contentGap: spacing.lg,
  screenBottomPadding: spacing.xxxl,
} as const;

export function ScreenScaffold({
  backgroundColor,
  children,
  edges = ['top', 'bottom'],
  style,
  withBackdrop = true,
}: PropsWithChildren<{
  backgroundColor?: string;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  withBackdrop?: boolean;
}>) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.container,
        { backgroundColor: backgroundColor ?? theme.background },
        style,
      ]}
    >
      {withBackdrop ? <AppBackdrop /> : null}
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
