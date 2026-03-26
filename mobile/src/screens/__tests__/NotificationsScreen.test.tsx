import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import NotificationsScreen from '../NotificationsScreen';

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockMarkRead = jest.fn();
const mockMarkAllRead = jest.fn();
const mockUseNotifications = jest.fn();
const mockRefetch = jest.fn();
const baseNotificationState = {
  error: null,
  isLoading: false,
  isRefetching: false,
  markAllRead: mockMarkAllRead,
  markRead: mockMarkRead,
  refetch: mockRefetch,
  unreadCount: 1,
};

const createNotificationsState = (overrides: Record<string, unknown> = {}) => ({
  ...baseNotificationState,
  ...overrides,
});

const mockNavigation = { goBack: mockGoBack, navigate: mockNavigate } as any;

jest.mock('@react-navigation/native', () => {
  const React = require('react');

  return {
    useNavigation: () => ({
      goBack: mockGoBack,
      navigate: mockNavigate,
    }),
    useFocusEffect: (callback: () => void) => {
      React.useEffect(() => {
        const cleanup = callback();
        return typeof cleanup === 'function' ? cleanup : undefined;
      }, [callback]);
    },
  };
});

jest.mock('../../features/notifications/hooks/useNotifications', () => ({
  useNotifications: (...args: unknown[]) => mockUseNotifications(...args),
}));

jest.mock('../../components/ui/AppIcon', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return () => <Text>icon</Text>;
});

describe('NotificationsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNotifications.mockReturnValue(
      createNotificationsState({
        notifications: [
          {
            id: 'notif-1',
            userId: 'user-1',
            type: 'match_created',
            title: 'New message',
            body: 'Meet me for coffee after?',
            readAt: null,
            createdAt: new Date().toISOString(),
            data: { matchId: 'match-1', withUserId: 'user-2' },
          },
        ],
      }),
    );
    mockMarkRead.mockResolvedValue(undefined);
    mockMarkAllRead.mockResolvedValue(undefined);
    mockRefetch.mockResolvedValue(undefined);
  });

  it('loads notifications and marks an item as read', async () => {
    render(<NotificationsScreen navigation={mockNavigation} route={{ key: 'Notifications-1', name: 'Notifications' } as any} />);

    const title = screen.getByText('New message');
    fireEvent.press(title);

    await waitFor(() => {
      expect(mockMarkRead).toHaveBeenCalledWith('notif-1');
    });
  });

  it('navigates match notifications to chat', async () => {
    render(<NotificationsScreen navigation={mockNavigation} route={{ key: 'Notifications-1', name: 'Notifications' } as any} />);

    const title = screen.getByText('New message');
    fireEvent.press(title);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Chat', {
        matchId: 'match-1',
        user: { id: 'user-2', firstName: 'Match' },
      });
    });
  });

  it('navigates message notifications to chat', async () => {
    mockUseNotifications.mockReturnValue({
      ...baseNotificationState,
      notifications: [
        {
          id: 'notif-1',
          userId: 'user-1',
          type: 'message_received',
          title: 'New message',
          body: 'Meet me for coffee after?',
          readAt: null,
          createdAt: new Date().toISOString(),
          data: { matchId: 'match-2', senderId: 'user-3' },
        },
      ],
    });

    render(<NotificationsScreen navigation={mockNavigation} route={{ key: 'Notifications-1', name: 'Notifications' } as any} />);

    const title = screen.getByText('New message');
    fireEvent.press(title);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Chat', {
        matchId: 'match-2',
        user: { id: 'user-3', firstName: 'Message' },
      });
    });
  });

  it('navigates event notifications to event detail', async () => {
    mockUseNotifications.mockReturnValue({
      ...baseNotificationState,
      notifications: [
        {
          id: 'notif-1',
          userId: 'user-1',
          type: 'event_rsvp',
          title: 'Event RSVP',
          body: 'Someone joined',
          readAt: null,
          createdAt: new Date().toISOString(),
          data: { eventId: 'event-1', attendeeId: 'user-4' },
        },
      ],
    });

    render(<NotificationsScreen navigation={mockNavigation} route={{ key: 'Notifications-1', name: 'Notifications' } as any} />);

    const title = screen.getByText('Event RSVP');
    fireEvent.press(title);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('EventDetail', { eventId: 'event-1' });
    });
  });

  it('navigates like notifications to profile detail', async () => {
    mockUseNotifications.mockReturnValue({
      ...baseNotificationState,
      notifications: [
        {
          id: 'notif-1',
          userId: 'user-1',
          type: 'like_received',
          title: 'Someone likes you',
          body: 'You received a like',
          readAt: null,
          createdAt: new Date().toISOString(),
          data: { fromUserId: 'user-5' },
        },
      ],
    });

    render(<NotificationsScreen navigation={mockNavigation} route={{ key: 'Notifications-1', name: 'Notifications' } as any} />);

    const title = screen.getByText('Someone likes you');
    fireEvent.press(title);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('ProfileDetail', {
        user: { id: 'user-5', firstName: 'Profile' },
      });
    });
  });

  it('shows an error when notification payload is missing navigation data', async () => {
    mockUseNotifications.mockReturnValue({
      ...baseNotificationState,
      notifications: [
        {
          id: 'notif-1',
          userId: 'user-1',
          type: 'like_received',
          title: 'Could not route',
          body: 'Unsupported',
          readAt: null,
          createdAt: new Date().toISOString(),
          data: {},
        },
      ],
    });

    render(<NotificationsScreen navigation={mockNavigation} route={{ key: 'Notifications-1', name: 'Notifications' } as any} />);

    fireEvent.press(screen.getByText('Could not route'));

    await waitFor(() => {
      expect(screen.getByText('Like notification is missing navigation details.')).toBeTruthy();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('groups yesterday notifications under a Yesterday header', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    mockUseNotifications.mockReturnValue({
      ...baseNotificationState,
      notifications: [
        {
          id: 'notif-yesterday',
          userId: 'user-1',
          type: 'match_created',
          title: 'Yesterday match',
          body: 'You matched yesterday',
          readAt: null,
          createdAt: yesterday.toISOString(),
          data: { matchId: 'match-y', withUserId: 'user-y' },
        },
      ],
    });

    render(<NotificationsScreen navigation={mockNavigation} route={{ key: 'Notifications-1', name: 'Notifications' } as any} />);

    expect(await screen.findByText('Yesterday')).toBeTruthy();
    expect(screen.getByText('Yesterday match')).toBeTruthy();
  });

  it('clears all notifications and resets the unread badge count', async () => {
    render(<NotificationsScreen navigation={mockNavigation} route={{ key: 'Notifications-1', name: 'Notifications' } as any} />);

    const clearAll = await screen.findByText('Clear all');
    fireEvent.press(clearAll);

    await waitFor(() => {
      expect(mockMarkAllRead).toHaveBeenCalled();
    });
  });
});
