import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  assertCanInviteToEvent,
  assertInvitableMatch,
  buildInviteMessageBody,
  resolveInviteeId,
} from './events.invite';

describe('events.invite', () => {
  it('enforces event invite permissions for hosts and attendees', () => {
    expect(() =>
      assertCanInviteToEvent(
        {
          host: { id: 'host-1' },
          joined: false,
        },
        'user-2',
      ),
    ).toThrow(ForbiddenException);

    expect(() =>
      assertCanInviteToEvent(
        {
          host: { id: 'host-1' },
          joined: true,
        },
        'user-2',
      ),
    ).not.toThrow();
  });

  it('validates invite matches and resolves the invitee id', () => {
    expect(() => assertInvitableMatch(null, 'user-1')).toThrow(
      NotFoundException,
    );

    expect(() =>
      assertInvitableMatch(
        {
          id: 'match-1',
          userAId: 'user-2',
          userBId: 'user-3',
          isBlocked: false,
        },
        'user-1',
      ),
    ).toThrow(ForbiddenException);

    const match = {
      id: 'match-1',
      userAId: 'user-1',
      userBId: 'user-2',
      isBlocked: false,
    };

    expect(() => assertInvitableMatch(match, 'user-1')).not.toThrow();
    expect(resolveInviteeId(match, 'user-1')).toBe('user-2');
    expect(buildInviteMessageBody('event-1', 'Join us')).toBe(
      'Join us\n[EVENT_INVITE:event-1]',
    );
  });
});
