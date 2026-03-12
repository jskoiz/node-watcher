export interface CreateEventInput {
  title: string;
  description?: string;
  location: string;
  category?: string;
  startsAt: string;
  endsAt?: string;
}
