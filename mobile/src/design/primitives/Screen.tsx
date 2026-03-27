import React, { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { type Edge } from 'react-native-safe-area-context';
import { ScreenScaffold } from './ScreenScaffold';

export function Screen({
  children,
  backgroundColor,
  padding = 16,
  edges = ['top', 'bottom'],
}: PropsWithChildren<{
  backgroundColor?: string;
  edges?: Edge[];
  padding?: number;
}>) {
  return (
    <ScreenScaffold edges={edges} backgroundColor={backgroundColor} style={styles.container}>
      <View style={[styles.content, { padding }]}>{children}</View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
