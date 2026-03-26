import type { EventSummary } from '../../../api/types';
import type { MainTabParamList } from '../../../core/navigation/types';

export type MyEventsTabKey = 'Joined' | 'Created';

export const MY_EVENTS_TABS: MyEventsTabKey[] = ['Joined', 'Created'];

export const MY_EVENTS_EMPTY_STATES: Record<
  MyEventsTabKey,
  {
    body: string;
    cta: string;
    icon: 'calendar' | 'plus-circle';
    route: keyof MainTabParamList;
    title: string;
  }
> = {
  Joined: {
    icon: 'calendar',
    title: 'No events joined yet',
    body: 'Find something that excites you and jump in.',
    cta: 'Explore Events',
    route: 'Explore',
  },
  Created: {
    icon: 'plus-circle',
    title: "You haven't hosted anything yet",
    body: 'Start an activity and invite people to move with you.',
    cta: 'Create Activity',
    route: 'Create',
  },
};

export function formatEventDate(startsAt: string) {
  const parsed = new Date(startsAt);
  if (Number.isNaN(parsed.getTime())) {
    return 'Date TBD';
  }

  try {
    return parsed.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (err) {
    console.warn('[MyEvents] formatDate failed for input:', startsAt, err);
    return 'Date TBD';
  }
}

export function normalizeMyEvents(data: unknown): EventSummary[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(
    (item): item is EventSummary =>
      !!item &&
      typeof item === 'object' &&
      typeof (item as EventSummary).id === 'string' &&
      typeof (item as EventSummary).title === 'string',
  );
}

export function partitionMyEvents(
  events: EventSummary[],
  currentUserId?: string,
) {
  const createdEvents = currentUserId
    ? events.filter((event) => event.host?.id === currentUserId)
    : [];
  const joinedEvents = currentUserId
    ? events.filter((event) => event.joined && event.host?.id !== currentUserId)
    : events.filter((event) => event.joined);

  return {
    createdEvents,
    joinedEvents,
  };
}
