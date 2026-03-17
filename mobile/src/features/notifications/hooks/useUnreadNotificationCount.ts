import { useNotifications } from './useNotifications';

export function useUnreadNotificationCount() {
  const { unreadCount } = useNotifications();

  return { unreadCount };
}
