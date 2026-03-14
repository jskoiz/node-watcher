import { EventsService } from './events.service';
import { NotFoundException } from '@nestjs/common';

describe('EventsService', () => {
  const prisma = {
    event: {
      findUnique: jest.fn(),
    },
    eventRsvp: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
  };
  const notifications = {
    create: jest.fn(),
  };

  let service: EventsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EventsService(prisma as never, notifications as never);
  });

  it('does not send duplicate notifications when the RSVP already exists', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'event-1',
      title: 'Sunrise Run',
      description: null,
      location: 'Beach Park',
      imageUrl: null,
      category: 'run',
      startsAt: new Date('2026-03-15T08:00:00.000Z'),
      endsAt: null,
      host: { id: 'host-1', firstName: 'Host' },
      _count: { rsvps: 2 },
    });
    prisma.eventRsvp.findUnique.mockResolvedValue({
      id: 'existing-rsvp',
      eventId: 'event-1',
      userId: 'guest-1',
    });
    prisma.eventRsvp.count.mockResolvedValue(2);

    await expect(service.rsvp('event-1', 'guest-1')).resolves.toEqual({
      status: 'joined',
      attendeesCount: 2,
    });

    expect(prisma.eventRsvp.upsert).not.toHaveBeenCalled();
    expect(notifications.create).not.toHaveBeenCalled();
  });

  it('creates RSVP notifications for a first-time RSVP', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'event-1',
      title: 'Sunrise Run',
      description: null,
      location: 'Beach Park',
      imageUrl: null,
      category: 'run',
      startsAt: new Date('2026-03-15T08:00:00.000Z'),
      endsAt: null,
      host: { id: 'host-1', firstName: 'Host' },
      _count: { rsvps: 1 },
    });
    prisma.eventRsvp.findUnique.mockResolvedValue(null);
    prisma.eventRsvp.upsert.mockResolvedValue({
      id: 'new-rsvp',
      eventId: 'event-1',
      userId: 'guest-1',
    });
    prisma.eventRsvp.count.mockResolvedValue(2);

    await expect(service.rsvp('event-1', 'guest-1')).resolves.toEqual({
      status: 'joined',
      attendeesCount: 2,
    });

    expect(prisma.eventRsvp.upsert).toHaveBeenCalledWith({
      where: {
        eventId_userId: {
          eventId: 'event-1',
          userId: 'guest-1',
        },
      },
      create: {
        eventId: 'event-1',
        userId: 'guest-1',
      },
      update: {},
    });
    expect(notifications.create).toHaveBeenCalledTimes(2);
    expect(notifications.create).toHaveBeenNthCalledWith(1, 'host-1', {
      type: 'event_rsvp',
      title: 'New RSVP',
      body: 'Someone joined Sunrise Run',
      data: { eventId: 'event-1', attendeeId: 'guest-1' },
    });
    expect(notifications.create).toHaveBeenNthCalledWith(2, 'guest-1', {
      type: 'event_reminder',
      title: 'Event joined',
      body: 'You are in for Sunrise Run',
      data: { eventId: 'event-1' },
    });
  });

  it('throws when the event does not exist', async () => {
    prisma.event.findUnique.mockResolvedValue(null);

    await expect(service.rsvp('missing-event', 'guest-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
