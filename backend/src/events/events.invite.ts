import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

export interface EventInvitePermissionContext {
  host: { id: string };
  joined: boolean;
}

export interface InviteMatch {
  id: string;
  userAId: string;
  userBId: string;
  isBlocked: boolean;
}

export function assertCanInviteToEvent(
  event: EventInvitePermissionContext,
  userId: string,
) {
  const isHost = event.host.id === userId;
  if (!isHost && !event.joined) {
    throw new ForbiddenException(
      "You must be the host or have RSVP'd to invite others",
    );
  }
}

export function resolveInviteeId(match: InviteMatch, userId: string) {
  if (match.userAId === userId) {
    return match.userBId;
  }

  return match.userAId;
}

export function assertInvitableMatch(
  match: InviteMatch | null,
  userId: string,
): asserts match is InviteMatch {
  if (!match) {
    throw new NotFoundException('Match not found');
  }

  if (match.userAId !== userId && match.userBId !== userId) {
    throw new ForbiddenException('You are not part of this match');
  }

  if (match.isBlocked) {
    throw new ForbiddenException('This conversation is no longer available');
  }
}

export function buildInviteMessageBody(eventId: string, message?: string) {
  const inviteBody = `[EVENT_INVITE:${eventId}]`;
  return message ? `${message}\n${inviteBody}` : inviteBody;
}
