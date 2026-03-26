import type { EventCategory } from '@prisma/client';

export interface EventWithRsvps {
  rsvps?: { id: string }[];
}

export interface EventSummarySource extends EventWithRsvps {
  id: string;
  title: string;
  description: string | null;
  location: string;
  imageUrl: string | null;
  category: EventCategory | null;
  startsAt: Date;
  endsAt: Date | null;
  host: { id: string; firstName: string };
  _count: { rsvps: number };
}

export interface EventInviteSource {
  id: string;
  status: string;
  event: {
    id: string;
    title: string;
    location: string;
    startsAt: Date;
    endsAt: Date | null;
    category: EventCategory | null;
    host: { id: string; firstName: string };
    _count: { rsvps: number };
  };
}

export function buildEventSummaryInclude(userId?: string) {
  return {
    host: { select: { id: true, firstName: true } },
    _count: { select: { rsvps: true } },
    ...(userId
      ? {
          rsvps: {
            where: { userId },
            select: { id: true },
          },
        }
      : {}),
  };
}

export function mapEventSummary(event: EventSummarySource) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    imageUrl: event.imageUrl,
    category: event.category,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    host: event.host,
    attendeesCount: event._count.rsvps,
    joined: (event.rsvps?.length ?? 0) > 0,
  };
}

export function mapEventInvite(invite: EventInviteSource) {
  return {
    id: invite.id,
    status: invite.status,
    event: {
      id: invite.event.id,
      title: invite.event.title,
      location: invite.event.location,
      startsAt: invite.event.startsAt,
      endsAt: invite.event.endsAt,
      category: invite.event.category,
      host: invite.event.host,
      attendeesCount: invite.event._count.rsvps,
    },
  };
}
