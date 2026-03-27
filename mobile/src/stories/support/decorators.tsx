import React from 'react';
import { View } from 'react-native';
import { lightTheme } from '../../theme/tokens';
import { StoryScreenFrame } from './StoryScreenFrame';

type StoryDecoratorOptions = {
  backgroundColor?: string;
  centered?: boolean;
  height?: number;
  padding?: number;
  width?: number;
};

export function withStorySurface(options: StoryDecoratorOptions = {}) {
  const {
    backgroundColor = lightTheme.background,
    centered = true,
    padding = 24,
  } = options;

  return (Story: React.ComponentType) => (
    <View
      style={{
        flex: 1,
        alignItems: centered ? 'center' : 'stretch',
        justifyContent: centered ? 'center' : 'flex-start',
        padding,
        backgroundColor,
      }}
    >
      <Story />
    </View>
  );
}

export function withStoryBottomSurface(options: StoryDecoratorOptions = {}) {
  const {
    backgroundColor = lightTheme.background,
    padding = 24,
  } = options;

  return (Story: React.ComponentType) => (
    <View
      style={{
        flex: 1,
        justifyContent: 'flex-end',
        padding,
        backgroundColor,
      }}
    >
      <Story />
    </View>
  );
}

export function withStoryScreenFrame(options: StoryDecoratorOptions = {}) {
  const {
    backgroundColor = lightTheme.background,
    centered = true,
    height,
    width,
  } = options;

  return (Story: React.ComponentType) => (
    <StoryScreenFrame
      backgroundColor={backgroundColor}
      centered={centered}
      height={height}
      width={width}
    >
      <Story />
    </StoryScreenFrame>
  );
}
