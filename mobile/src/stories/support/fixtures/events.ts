import type { EventDetail, EventSummary } from '../../../api/types';

export function makeEventSummary(
  overrides: Partial<EventSummary> = {},
): EventSummary {
  return {
    id: overrides.id ?? 'event-1',
    title: overrides.title ?? 'Makapuu sunrise hike',
    description:
      overrides.description ??
      'Early pace, scenic payoff, and coffee after if the group wants to keep hanging.',
    location: overrides.location ?? 'Makapuu Lighthouse Trail',
    imageUrl:
      overrides.imageUrl ??
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    category: overrides.category ?? 'Hiking',
    startsAt: overrides.startsAt ?? '2026-03-20T16:00:00.000Z',
    endsAt: overrides.endsAt ?? '2026-03-20T18:00:00.000Z',
    host: overrides.host ?? { id: 'host-1', firstName: 'Nia' },
    attendeesCount: overrides.attendeesCount ?? 6,
    joined: overrides.joined ?? false,
  };
}

export function makeEventDetail(
  overrides: Partial<EventDetail> = {},
): EventDetail {
  return makeEventSummary(overrides);
}
