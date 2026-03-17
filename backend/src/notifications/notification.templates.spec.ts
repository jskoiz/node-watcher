import {
  buildEventReminderNotification,
  buildEventRsvpNotification,
  buildLikeReceivedNotification,
  buildMatchCreatedNotification,
} from './notification.templates';

describe('notification templates', () => {
  it('builds like notifications with fromUserId payload', () => {
    expect(buildLikeReceivedNotification('user-1')).toEqual({
      type: 'like_received',
      title: 'New like',
      body: 'Someone liked your profile.',
      data: { fromUserId: 'user-1' },
    });
  });

  it('builds match notifications with match and counterpart ids', () => {
    expect(buildMatchCreatedNotification('match-1', 'user-2')).toEqual({
      type: 'match_created',
      title: "It's a match!",
      body: 'You can start chatting now.',
      data: { matchId: 'match-1', withUserId: 'user-2' },
    });
  });

  it('builds event RSVP notifications with event and attendee ids', () => {
    expect(buildEventRsvpNotification('event-1', 'user-3', 'Sunrise Run')).toEqual({
      type: 'event_rsvp',
      title: 'New RSVP',
      body: 'Someone joined Sunrise Run',
      data: { eventId: 'event-1', attendeeId: 'user-3' },
    });
  });

  it('builds event reminder notifications with event id', () => {
    expect(buildEventReminderNotification('event-1', 'Sunrise Run')).toEqual({
      type: 'event_reminder',
      title: 'Event joined',
      body: 'You are in for Sunrise Run',
      data: { eventId: 'event-1' },
    });
  });
});
