import { renderHook } from '@testing-library/react-native';
import { useUnreadNotificationCount } from '../useUnreadNotificationCount';

const mockUseNotifications = jest.fn();

jest.mock('../useNotifications', () => ({
  useNotifications: (...args: unknown[]) => mockUseNotifications(...args),
}));

describe('useUnreadNotificationCount', () => {
  it('returns the unread count from notifications hook', () => {
    mockUseNotifications.mockReturnValue({
      unreadCount: 3,
    });

    const { result } = renderHook(() => useUnreadNotificationCount());

    expect(result.current).toHaveProperty('unreadCount', 3);
  });
});
