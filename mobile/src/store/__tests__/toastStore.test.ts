import { resetToastStateForTests, useToastStore, showToast } from '../toastStore';
import { act } from '@testing-library/react-native';

beforeEach(() => {
  resetToastStateForTests();
  jest.restoreAllMocks();
});

describe('toastStore', () => {
  it('adds a toast with default variant and duration', () => {
    act(() => {
      useToastStore.getState().show('Hello');
    });

    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({
      message: 'Hello',
      variant: 'info',
      duration: 3000,
    });
    expect(toasts[0].id).toBeTruthy();
  });

  it('adds a toast with custom variant and duration', () => {
    act(() => {
      useToastStore.getState().show('Error!', 'error', 5000);
    });

    const toast = useToastStore.getState().toasts[0];
    expect(toast.variant).toBe('error');
    expect(toast.duration).toBe(5000);
  });

  it('dismisses a single toast by id', () => {
    act(() => {
      useToastStore.getState().show('A');
      useToastStore.getState().show('B');
    });

    const [first] = useToastStore.getState().toasts;
    act(() => {
      useToastStore.getState().dismiss(first.id);
    });

    const remaining = useToastStore.getState().toasts;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].message).toBe('B');
  });

  it('dismisses all toasts', () => {
    act(() => {
      useToastStore.getState().show('A');
      useToastStore.getState().show('B');
    });

    act(() => {
      useToastStore.getState().dismissAll();
    });

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('exposes a standalone showToast helper', () => {
    act(() => {
      showToast('standalone', 'warning');
    });

    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({ message: 'standalone', variant: 'warning' });
  });

  it('dedupes repeated toasts within the default window', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1000);

    act(() => {
      showToast('offline', 'error', undefined, { dedupeKey: 'network' });
      showToast('offline', 'error', undefined, { dedupeKey: 'network' });
    });

    expect(useToastStore.getState().toasts).toHaveLength(1);
  });

  it('allows a deduped toast after the window expires', () => {
    const nowSpy = jest.spyOn(Date, 'now');
    nowSpy.mockReturnValue(1000);
    act(() => {
      showToast('offline', 'error', undefined, { dedupeKey: 'network' });
    });

    nowSpy.mockReturnValue(6000);
    act(() => {
      showToast('offline', 'error', undefined, { dedupeKey: 'network' });
    });

    expect(useToastStore.getState().toasts).toHaveLength(2);
  });
});
