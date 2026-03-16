import type { EventCategory } from '@prisma/client';

export interface CreateEventInput {
  title: string;
  description?: string;
  location: string;
  category?: EventCategory;
  startsAt: string;
  endsAt?: string;
}
