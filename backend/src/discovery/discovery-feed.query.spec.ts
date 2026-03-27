import { IntensityLevel } from '@prisma/client';
import {
  buildAvailabilityFilter,
  buildBirthdateFilter,
  buildDiscoveryFeedQuery,
  buildFitnessProfileFilter,
  normalizeDiscoveryDistanceKm,
} from './discovery-feed.query';

describe('discovery-feed.query', () => {
  it('builds the feed query with the expected filters and select shape', () => {
    const query = buildDiscoveryFeedQuery({
      userId: 'me',
      blockedIds: ['blocked-1', 'blocked-2'],
      filters: {
        minAge: 25,
        maxAge: 32,
        goals: ['Strength'],
        intensity: ['INTERMEDIATE'],
        availability: ['morning', 'evening'],
      },
    });

    expect(query.take).toBe(100);
    expect(query.where).toEqual({
      id: { notIn: ['me', 'blocked-1', 'blocked-2'] },
      isDeleted: false,
      isBanned: false,
      isOnboarded: true,
      receivedLikes: { none: { fromUserId: 'me' } },
      receivedPasses: { none: { fromUserId: 'me' } },
      birthdate: expect.objectContaining({
        gte: expect.any(Date),
        lte: expect.any(Date),
      }),
      fitnessProfile: {
        is: {
          AND: [
            {
              OR: [
                {
                  primaryGoal: {
                    equals: 'strength',
                    mode: 'insensitive',
                  },
                },
                {
                  secondaryGoal: {
                    equals: 'strength',
                    mode: 'insensitive',
                  },
                },
              ],
            },
            {
              intensityLevel: {
                in: [IntensityLevel.INTERMEDIATE],
              },
            },
            {
              OR: [{ prefersMorning: true }, { prefersEvening: true }],
            },
          ],
        },
      },
    });
    expect(query.select).toEqual(
      expect.objectContaining({
        id: true,
        firstName: true,
        profile: {
          select: {
            city: true,
            bio: true,
            latitude: true,
            longitude: true,
            intentDating: true,
            intentWorkout: true,
            intentFriends: true,
          },
        },
      }),
    );
  });

  it('normalizes individual filter builders', () => {
    expect(buildBirthdateFilter({})).toBeNull();
    expect(buildAvailabilityFilter({ availability: ['morning'] })).toEqual({
      OR: [{ prefersMorning: true }],
    });
    expect(
      buildFitnessProfileFilter({
        intensity: ['intermediate', 'not-real'],
      }),
    ).toEqual({
      intensityLevel: {
        in: [IntensityLevel.INTERMEDIATE],
      },
    });
    expect(normalizeDiscoveryDistanceKm(0)).toBeNull();
    expect(normalizeDiscoveryDistanceKm(12.5)).toBe(12.5);
  });
});
