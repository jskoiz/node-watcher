import { BadRequestException } from '@nestjs/common';
import { normalizeCreateEventInput } from './events.create';

describe('events.create', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  it('normalizes trimmed values and nullable fields', () => {
    const result = normalizeCreateEventInput(
      {
        title: '  Sunrise Run  ',
        description: '  Meet by the beach  ',
        location: '  Waikiki  ',
        startsAt: '2026-01-02T08:00:00.000Z',
      },
      now,
    );

    expect(result).toEqual({
      title: 'Sunrise Run',
      description: 'Meet by the beach',
      location: 'Waikiki',
      category: null,
      startsAt: new Date('2026-01-02T08:00:00.000Z'),
      endsAt: null,
    });
  });

  it('rejects past or invalid dates', () => {
    expect(() =>
      normalizeCreateEventInput(
        {
          title: 'Run',
          location: 'Park',
          startsAt: 'not-a-date',
        },
        now,
      ),
    ).toThrow(BadRequestException);

    expect(() =>
      normalizeCreateEventInput(
        {
          title: 'Run',
          location: 'Park',
          startsAt: '2025-12-31T23:00:00.000Z',
        },
        now,
      ),
    ).toThrow('Start time must be in the future');
  });
});
