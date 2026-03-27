import React, { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { lightTheme, radii } from '../../theme/tokens';

type StoryScreenFrameProps = PropsWithChildren<{
  backgroundColor?: string;
  centered?: boolean;
  height?: number;
  style?: StyleProp<ViewStyle>;
  width?: number;
}>;

export function StoryScreenFrame({
  backgroundColor = lightTheme.background,
  centered = true,
  children,
  height = 844,
  style,
  width = 390,
}: StoryScreenFrameProps) {
  return (
    <View
      style={[
        styles.outer,
        centered ? styles.outerCentered : null,
        { backgroundColor },
        style,
      ]}
    >
      <View
        style={[
          styles.frame,
          {
            backgroundColor,
            height,
            width,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    padding: 24,
  },
  outerCentered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    overflow: 'hidden',
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: lightTheme.stroke,
    shadowColor: lightTheme.shadowColor,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
});
