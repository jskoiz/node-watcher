import client from '../../api/client';
import type {
  CreateEventPayload,
  EventDetail,
  EventInviteListItem,
  EventInviteResponse,
  EventRsvpResponse,
  EventSummary,
} from '../../api/types';
import { withErrorLogging } from './shared';

export const eventsApi = {
  list: async () =>
    withErrorLogging('events', 'list', () =>
      client.get<EventSummary[]>('/events'),
    ),
  create: async (payload: CreateEventPayload) =>
    withErrorLogging('events', 'create', () =>
      client.post<EventSummary>('/events', payload),
      {
        context: {
          category: payload.category,
          titleLength: payload.title.trim().length,
          hasDescription: Boolean(payload.description?.trim()),
          hasEndsAt: Boolean(payload.endsAt),
        },
      },
    ),
  detail: async (id: string) =>
    withErrorLogging('events', 'detail', () =>
      client.get<EventDetail>(`/events/${id}`),
      { context: { eventId: id } },
    ),
  rsvp: async (id: string) =>
    withErrorLogging('events', 'rsvp', () =>
      client.post<EventRsvpResponse>(`/events/${id}/rsvp`),
      { context: { eventId: id } },
    ),
  mine: async () =>
    withErrorLogging('events', 'mine', () =>
      client.get<EventSummary[]>('/events/me'),
    ),
  invite: async (eventId: string, matchId: string, message?: string) =>
    withErrorLogging('events', 'invite', () =>
      client.post<EventInviteResponse>(`/events/${eventId}/invite`, {
        matchId,
        ...(message ? { message } : {}),
      }),
      {
        context: {
          eventId,
          matchId,
          hasMessage: Boolean(message?.trim()),
        },
      },
    ),
  getInvites: async (eventId: string) =>
    withErrorLogging('events', 'getInvites', () =>
      client.get<EventInviteListItem[]>(`/events/${eventId}/invites`),
      { context: { eventId } },
    ),
};
