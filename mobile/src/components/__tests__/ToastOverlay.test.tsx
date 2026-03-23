import React from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import { ToastOverlay } from '../ui/ToastOverlay';
import { useToastStore } from '../../store/toastStore';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('ToastOverlay', () => {
  it('renders nothing when there are no toasts', () => {
    const { queryByTestId } = render(<ToastOverlay />);
    expect(queryByTestId('toast-overlay')).toBeNull();
  });

  it('renders a toast when one is added', () => {
    const { getByText, getByTestId } = render(<ToastOverlay />);

    act(() => {
      useToastStore.getState().show('Test toast', 'success');
    });

    expect(getByTestId('toast-overlay')).toBeTruthy();
    expect(getByText('Test toast')).toBeTruthy();
  });

  it('auto-dismisses a toast after its duration', () => {
    const { getByText, queryByText } = render(<ToastOverlay />);

    act(() => {
      useToastStore.getState().show('Ephemeral', 'info', 1000);
    });

    expect(getByText('Ephemeral')).toBeTruthy();

    // Advance past the duration + animation
    act(() => {
      jest.advanceTimersByTime(1200);
    });

    // The toast should be dismissed from the store
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('dismisses a toast on press', () => {
    const { getByText } = render(<ToastOverlay />);

    act(() => {
      useToastStore.getState().show('Tappable', 'warning');
    });

    fireEvent.press(getByText('Tappable'));

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
