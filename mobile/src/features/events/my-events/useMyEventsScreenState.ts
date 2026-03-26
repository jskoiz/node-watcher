import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { normalizeApiError } from '../../../api/errors';
import { useMyEvents } from '../hooks/useMyEvents';
import {
  MY_EVENTS_EMPTY_STATES,
  type MyEventsTabKey,
  normalizeMyEvents,
  partitionMyEvents,
} from './myEvents.helpers';

const FOCUS_REFETCH_INTERVAL_MS = 30_000;

export function useMyEventsScreenState({
  currentUserId,
}: {
  currentUserId?: string;
}) {
  const [activeTab, setActiveTab] = useState<MyEventsTabKey>('Joined');
  const {
    error,
    events: rawEvents,
    isLoading,
    isRefetching,
    refetch,
  } = useMyEvents();
  const events = useMemo(() => normalizeMyEvents(rawEvents), [rawEvents]);
  const errorMessage = error ? normalizeApiError(error).message : null;
  const lastFetchedAtRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastFetchedAtRef.current > FOCUS_REFETCH_INTERVAL_MS) {
        lastFetchedAtRef.current = now;
        void refetch();
      }
    }, [refetch]),
  );

  const { createdEvents, joinedEvents } = useMemo(
    () => partitionMyEvents(events, currentUserId),
    [events, currentUserId],
  );
  const displayedEvents = activeTab === 'Joined' ? joinedEvents : createdEvents;
  const tabCounts = useMemo(
    () =>
      ({
        Joined: joinedEvents.length,
        Created: createdEvents.length,
      }) as const,
    [joinedEvents.length, createdEvents.length],
  );
  const emptyState = MY_EVENTS_EMPTY_STATES[activeTab];

  return {
    activeTab,
    displayedEvents,
    emptyState,
    errorMessage,
    isLoading,
    isRefetching,
    setActiveTab,
    tabCounts,
    refetch,
  };
}
