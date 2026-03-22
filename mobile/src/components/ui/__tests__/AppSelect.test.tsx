import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import AppSelect from '../AppSelect';

describe('AppSelect', () => {
  it('provides explicit accessibility labels for the trigger and options', () => {
    const onSelect = jest.fn();

    render(
      <AppSelect
        label="Intensity"
        onSelect={onSelect}
        options={[
          { label: 'Easy', value: 'easy' },
          { label: 'Moderate', value: 'moderate' },
          { label: 'Hard', value: 'hard' },
        ]}
        placeholder="Choose intensity"
        value="moderate"
      />,
    );

    fireEvent.press(screen.getByLabelText('Intensity: Moderate'));
    fireEvent.press(screen.getByLabelText('Hard'));

    expect(onSelect).toHaveBeenCalledWith('hard');
  });

  it('shows a fallback message when the options array is empty', () => {
    render(
      <AppSelect
        label="Category"
        onSelect={jest.fn()}
        options={[]}
        placeholder="Pick a category"
        value=""
      />,
    );

    fireEvent.press(screen.getByLabelText('Category: Pick a category'));
    expect(screen.getByText('No options available')).toBeTruthy();
  });
});
