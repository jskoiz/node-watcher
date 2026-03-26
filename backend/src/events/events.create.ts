import { BadRequestException } from '@nestjs/common';
import type { EventCategory } from '@prisma/client';
import type { CreateEventDto } from './create-event.dto';

export interface NormalizedCreateEventInput {
  title: string;
  description: string | null;
  location: string;
  category: EventCategory | null;
  startsAt: Date;
  endsAt: Date | null;
}

export function normalizeCreateEventInput(
  payload: CreateEventDto,
  now = new Date(),
): NormalizedCreateEventInput {
  const title = payload.title?.trim();
  const location = payload.location?.trim();
  const description = payload.description?.trim();
  const category = payload.category ?? null;
  const startsAt = new Date(payload.startsAt);
  const endsAt = payload.endsAt ? new Date(payload.endsAt) : null;

  if (!title) {
    throw new BadRequestException('Title is required');
  }

  if (!location) {
    throw new BadRequestException('Location is required');
  }

  if (Number.isNaN(startsAt.getTime())) {
    throw new BadRequestException('A valid start time is required');
  }

  if (startsAt <= now) {
    throw new BadRequestException('Start time must be in the future');
  }

  if (endsAt && Number.isNaN(endsAt.getTime())) {
    throw new BadRequestException('End time must be a valid date');
  }

  if (endsAt && endsAt <= startsAt) {
    throw new BadRequestException('End time must be after the start time');
  }

  return {
    title,
    description: description || null,
    location,
    category: category || null,
    startsAt,
    endsAt,
  };
}
