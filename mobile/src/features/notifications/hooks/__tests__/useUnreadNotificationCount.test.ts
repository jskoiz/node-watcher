import { renderHook, waitFor } from '@testing-library/react-native';
import { useUnreadNotificationCount } from '../useUnreadNotificationCount';

const mockList = jest.fn();

jest.mock('../../../../services/api', () => ({
  notificationsApi: {
    list: (...args: unknown[]) => mockList(...args),
  },
}));

describe('useUnreadNotificationCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the unread count from notifications data', async () => {
    mockList.mockResolvedValue({
      data: [
        { id: '1', readAt: null },
        { id: '2', readAt: '2026-03-18T00:00:00.000Z' },
        { id: '3', readAt: null },
      ],
    });

    const { result } = renderHook(() => useUnreadNotificationCount());

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(2);
    });
  });
});
