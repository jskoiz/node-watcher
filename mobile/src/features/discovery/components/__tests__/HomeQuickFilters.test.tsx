import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { HomeQuickFilters } from '../HomeQuickFilters';

jest.mock('../../../../components/ui/AppIcon', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return () => <Text>icon</Text>;
});

describe('HomeQuickFilters', () => {
  it('shows refine count in label when filters are active', () => {
    const { getByText, getByLabelText } = render(
      <HomeQuickFilters
        activeFilterCount={3}
        activeQuickFilter="all"
        onPressFilter={() => undefined}
        onPressRefine={() => undefined}
      />,
    );

    expect(getByText('Refine (3)')).toBeTruthy();
    expect(getByLabelText('3 active filters, refine your discovery feed')).toBeTruthy();
  });

  it('fires refine action and supports zero-active filter state', () => {
    const handleRefine = jest.fn();
    const handleFilter = jest.fn();

    const { getByText } = render(
      <HomeQuickFilters
        activeFilterCount={0}
        activeQuickFilter="all"
        onPressFilter={handleFilter}
        onPressRefine={handleRefine}
      />,
    );

    fireEvent.press(getByText('Refine'));
    expect(handleRefine).toHaveBeenCalledTimes(1);
    fireEvent.press(getByText('Strength'));
    expect(handleFilter).toHaveBeenCalledWith('strength');
  });
});

