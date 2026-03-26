import type { QueryClient, QueryKey } from '@tanstack/react-query';
import type {
  DiscoveryUser,
  EventDetail,
  EventSummary,
  User,
  UserPhoto,
} from '../../api/types';
import { queryKeys } from './queryKeys';

type QueryUpdater<T> = (current: T | undefined, queryKey: QueryKey) => T | undefined;

function updateQueries<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updater: QueryUpdater<T>,
  options?: { exact?: boolean },
) {
  const matches = queryClient.getQueriesData<T>({
    queryKey,
    exact: options?.exact,
  });

  for (const [matchedKey] of matches) {
    queryClient.setQueryData<T>(matchedKey, (current) =>
      updater(current, matchedKey as QueryKey),
    );
  }
}

function updateEventCollection(
  current: EventSummary[] | undefined,
  eventId: string,
  updater: (event: EventSummary) => EventSummary,
) {
  if (!current) {
    return current;
  }

  return current.map((event) => (event.id === eventId ? updater(event) : event));
}

export function patchProfile(
  queryClient: QueryClient,
  updater: (current: User | undefined) => User | undefined,
) {
  queryClient.setQueryData<User>(queryKeys.profile.current(), updater);
}

export function removeDiscoveryUserFromFeeds(
  queryClient: QueryClient,
  userId: string,
) {
  updateQueries<DiscoveryUser[]>(
    queryClient,
    queryKeys.discovery.feeds(),
    (current) => current?.filter((item) => item.id !== userId) ?? current,
  );
}

export function patchEventCaches(
  queryClient: QueryClient,
  eventId: string,
  updater: (event: EventSummary) => EventSummary,
) {
  updateQueries<EventSummary[]>(
    queryClient,
    queryKeys.events.list(),
    (current) => updateEventCollection(current, eventId, updater),
    { exact: true },
  );
  updateQueries<EventSummary[]>(
    queryClient,
    queryKeys.events.mine(),
    (current) => updateEventCollection(current, eventId, updater),
    { exact: true },
  );
  queryClient.setQueryData<EventDetail>(queryKeys.events.detail(eventId), (current) =>
    current ? (updater(current) as EventDetail) : current,
  );
}

export function markEventJoined(
  queryClient: QueryClient,
  eventId: string,
  attendeesCount?: number,
) {
  patchEventCaches(queryClient, eventId, (event) => {
    if (event.joined && attendeesCount === undefined) {
      return event;
    }

    return {
      ...event,
      joined: true,
      attendeesCount:
        attendeesCount !== undefined
          ? attendeesCount
          : event.attendeesCount + 1,
    };
  });
}

export function prependCreatedEvent(
  queryClient: QueryClient,
  createdEvent: EventSummary,
) {
  const prepend = (current: EventSummary[] | undefined) => {
    const withoutExisting = current?.filter((event) => event.id !== createdEvent.id) ?? [];
    return [createdEvent, ...withoutExisting];
  };

  queryClient.setQueryData<EventSummary[]>(queryKeys.events.list(), prepend);
  queryClient.setQueryData<EventSummary[]>(queryKeys.events.mine(), prepend);
}

export function applyPhotoUpdate(
  photos: UserPhoto[] | undefined,
  photoId: string,
  payload: { isPrimary?: boolean; sortOrder?: number },
) {
  if (!photos) {
    return photos;
  }

  return photos
    .map((photo) => {
      if (photo.id === photoId) {
        return {
          ...photo,
          ...payload,
        };
      }

      if (payload.isPrimary && photo.isPrimary) {
        return {
          ...photo,
          isPrimary: false,
        };
      }

      return photo;
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);
}
