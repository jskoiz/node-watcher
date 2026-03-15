import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { Button, Card, Input, StatePanel } from '../primitives';

describe('design primitives', () => {
  it('renders button labels and handles presses', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Join BRDG" onPress={onPress} />);
    fireEvent.press(getByText('Join BRDG'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders button loading state without crashing', () => {
    const { toJSON } = render(<Button label="Loading" onPress={() => undefined} loading />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders card children inside a flex wrapper', () => {
    const { getByText } = render(
      <Card>
        <Text>Content</Text>
      </Card>,
    );
    const content = getByText('Content');
    const wrapperView = content.parent?.parent;
    const flatStyle = StyleSheet.flatten(wrapperView?.props?.style ?? {});
    expect(flatStyle?.flex).toBe(1);
  });

  it('renders image card children', () => {
    const { getByText } = render(
      <Card variant="imageCard" imageUri="https://example.com/photo.jpg">
        <Text>Image content</Text>
      </Card>,
    );
    expect(getByText('Image content')).toBeTruthy();
  });

  it('renders input labels, values, and errors', () => {
    const { getByDisplayValue, getByText } = render(
      <Input label="Email" value="jordan@example.com" error="Too short" onChangeText={() => undefined} />,
    );
    expect(getByText('Email')).toBeTruthy();
    expect(getByDisplayValue('jordan@example.com')).toBeTruthy();
    expect(getByText('Too short')).toBeTruthy();
  });

  it('renders state panels and fires actions', () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <StatePanel title="Could not load" description="Try again soon." actionLabel="Retry" onAction={onAction} isError />,
    );
    fireEvent.press(getByText('Retry'));
    expect(getByText('Could not load')).toBeTruthy();
    expect(getByText('Try again soon.')).toBeTruthy();
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
