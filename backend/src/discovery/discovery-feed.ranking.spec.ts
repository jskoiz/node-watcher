import { IntensityLevel } from '@prisma/client';
import {
  calculateDistanceKm,
  rankDiscoveryFeedCandidates,
} from './discovery-feed.ranking';

describe('discovery-feed.ranking', () => {
  const requester = {
    profile: {
      latitude: 21.3069,
      longitude: -157.8583,
    },
    fitnessProfile: {
      intensityLevel: IntensityLevel.INTERMEDIATE,
      primaryGoal: 'strength',
      secondaryGoal: 'mobility',
    },
  };

  const makeCandidate = (overrides: Record<string, unknown> = {}) => ({
    id: 'candidate-1',
    firstName: 'Casey',
    birthdate: new Date('1997-05-01T00:00:00.000Z'),
    profile: {
      city: 'Honolulu',
      bio: 'Runner and lifter who likes sunrise sessions.',
      latitude: 21.307,
      longitude: -157.8584,
    },
    fitnessProfile: {
      primaryGoal: 'strength',
      secondaryGoal: 'endurance',
      intensityLevel: IntensityLevel.INTERMEDIATE,
      prefersMorning: true,
      prefersEvening: false,
      favoriteActivities: null,
    },
    photos: [
      {
        id: 'photo-1',
        storageKey: 'photo-1.jpg',
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    ...overrides,
  });

  it('ranks candidates by score and strips coordinates from the response profile', () => {
    const ranked = rankDiscoveryFeedCandidates(requester, [
      makeCandidate({
        id: 'lower-score',
        birthdate: new Date('1990-01-01T00:00:00.000Z'),
        profile: {
          city: 'Honolulu',
          bio: null,
          latitude: 21.45,
          longitude: -157.95,
        },
        fitnessProfile: {
          primaryGoal: 'strength',
          secondaryGoal: 'flexibility',
          intensityLevel: IntensityLevel.BEGINNER,
          prefersMorning: false,
          prefersEvening: false,
          favoriteActivities: null,
        },
      }),
      makeCandidate({
        id: 'higher-score',
        birthdate: new Date('1997-05-01T00:00:00.000Z'),
        profile: {
          city: 'Honolulu',
          bio: 'Close by',
          latitude: 21.307,
          longitude: -157.8584,
        },
        fitnessProfile: {
          primaryGoal: 'strength',
          secondaryGoal: 'mobility',
          intensityLevel: IntensityLevel.INTERMEDIATE,
          prefersMorning: true,
          prefersEvening: false,
          favoriteActivities: null,
        },
      }),
    ]);

    expect(ranked.map((candidate) => candidate.id)).toEqual([
      'higher-score',
      'lower-score',
    ]);
    expect(ranked[0]?.recommendationScore).toBeGreaterThan(
      ranked[1]?.recommendationScore ?? 0,
    );
    expect(ranked[0]?.profile).toEqual({
      city: 'Honolulu',
      bio: 'Close by',
    });
    expect(ranked[1]?.profile).toEqual({
      city: 'Honolulu',
      bio: null,
    });
    expect(ranked[0]?.profile).not.toHaveProperty('latitude');
    expect(ranked[0]?.profile).not.toHaveProperty('longitude');
  });

  it('filters by distance only when the requester has coordinates', () => {
    const nearby = makeCandidate({
      id: 'nearby',
      profile: {
        city: 'Honolulu',
        bio: 'Close by',
        latitude: 21.307,
        longitude: -157.8584,
      },
    });
    const farAway = makeCandidate({
      id: 'far-away',
      profile: {
        city: 'Tokyo',
        bio: 'Very far away',
        latitude: 35.6764,
        longitude: 139.65,
      },
    });
    const unknownLocation = makeCandidate({
      id: 'unknown-location',
      profile: {
        city: 'Honolulu',
        bio: 'No coordinates yet',
        latitude: null,
        longitude: null,
      },
    });

    expect(
      rankDiscoveryFeedCandidates(requester, [nearby, farAway], {
        distanceKm: 10,
      }).map((candidate) => candidate.id),
    ).toEqual(['nearby']);

    expect(
      rankDiscoveryFeedCandidates(
        {
          ...requester,
          profile: {
            latitude: null,
            longitude: null,
          },
        },
        [nearby, unknownLocation],
        {
          distanceKm: 10,
        },
      ).map((candidate) => candidate.id),
    ).toEqual(expect.arrayContaining(['nearby', 'unknown-location']));
  });

  it('calculates haversine distance in kilometers', () => {
    expect(calculateDistanceKm(21.3069, -157.8583, 21.307, -157.8584)).toBeLessThan(
      0.02,
    );
    expect(calculateDistanceKm(null, -157.8583, 21.307, -157.8584)).toBeNull();
  });
});
