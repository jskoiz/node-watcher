import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { CreateActivityPicker } from '../CreateActivityPicker';

jest.mock('../../../../components/ui/AppIcon', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return ({ color, name }: { color: string; name: string }) => (
    <Text accessibilityLabel={`icon-${name}-${color}`}>{name}</Text>
  );
});

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

describe('CreateActivityPicker', () => {
  it('renders unselected activity labels with readable contrast before choosing one', () => {
    render(<CreateActivityPicker selectedActivity="" onSelectActivity={() => undefined} />);

    const liftLabel = screen.getByText('Lift');
    const labelStyle = StyleSheet.flatten(liftLabel.props.style);

    expect(labelStyle).toEqual(
      expect.objectContaining({
        color: 'rgba(92,84,76,0.86)',
      }),
    );

    expect(screen.getAllByLabelText('icon-activity-rgba(92,84,76,0.78)').length).toBeGreaterThan(0);
  });
});
