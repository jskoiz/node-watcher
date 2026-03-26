import { useCallback } from 'react';
import { Alert } from 'react-native';
import type { EventDetail } from '../../../api/types';
import { normalizeApiError } from '../../../api/errors';
import { hapticSuccess } from '../../../lib/interaction/feedback';
import { useEventDetail } from './useEventDetail';

export type EventDetailScreenState = {
  errorMessage: string | null;
  event: EventDetail | null;
  isJoining: boolean;
  isLoading: boolean;
  onBack: () => void;
  onJoin: () => Promise<void>;
  onRefresh: () => void;
};

export function useEventDetailScreenController({
  eventId,
  onBack,
}: {
  eventId: string;
  onBack: () => void;
}) {
  const { error, event, isJoining, isLoading, joinEvent, refetch } =
    useEventDetail(eventId);
  const errorMessage = error ? normalizeApiError(error).message : null;

  const handleJoin = useCallback(async () => {
    if (!event || isJoining || event.joined) return;

    try {
      await joinEvent();
      void hapticSuccess();
    } catch (err) {
      const normalized = normalizeApiError(err);
      Alert.alert(
        'Could not join event',
        normalized.isNetworkError
          ? 'A network error occurred. Please check your connection and try again.'
          : normalized.message,
      );
    }
  }, [event, isJoining, joinEvent]);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    errorMessage,
    event: event ?? null,
    isJoining,
    isLoading,
    onBack,
    onJoin: handleJoin,
    onRefresh: handleRefresh,
  } satisfies EventDetailScreenState;
}
