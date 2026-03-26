import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { normalizeApiError } from '../../../api/errors';
import { useNotifications } from './useNotifications';

export function useNotificationsScreenState() {
  const [actionError, setActionError] = useState<string | null>(null);
  const notificationsState = useNotifications();
  const {
    error,
    markAllRead,
    markRead,
    refetch,
  } = notificationsState;

  const errorMessage = useMemo(
    () => actionError ?? (error ? normalizeApiError(error).message : null),
    [actionError, error],
  );

  useFocusEffect(
    useCallback(() => {
      setActionError(null);
      void refetch();
    }, [refetch]),
  );

  const handleMarkRead = useCallback(
    async (id: string) => {
      try {
        setActionError(null);
        await markRead(id);
      } catch (err) {
        setActionError(normalizeApiError(err).message);
      }
    },
    [markRead],
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      setActionError(null);
      await markAllRead();
    } catch (err) {
      setActionError(normalizeApiError(err).message);
    }
  }, [markAllRead]);

  return {
    ...notificationsState,
    actionError,
    errorMessage,
    handleMarkAllRead,
    handleMarkRead,
    setActionError,
  };
}
