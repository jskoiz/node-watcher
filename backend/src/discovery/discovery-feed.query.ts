import { IntensityLevel } from '@prisma/client';
import { DISCOVERY_FEED_QUERY_LIMIT } from './discovery.constants';
import type { DiscoveryFilters } from './discovery.service';

export interface BuildDiscoveryFeedQueryOptions {
  userId: string;
  blockedIds: string[];
  filters: DiscoveryFilters;
}

export function buildDiscoveryFeedQuery({
  userId,
  blockedIds,
  filters,
}: BuildDiscoveryFeedQueryOptions) {
  const birthdateFilter = buildBirthdateFilter(filters);
  const fitnessProfileFilter = buildFitnessProfileFilter(filters);

  return {
    where: {
      id: { notIn: [userId, ...blockedIds] },
      isDeleted: false,
      isBanned: false,
      isOnboarded: true,
      receivedLikes: { none: { fromUserId: userId } },
      receivedPasses: { none: { fromUserId: userId } },
      ...(birthdateFilter ? { birthdate: birthdateFilter } : {}),
      ...(fitnessProfileFilter
        ? {
            fitnessProfile: {
              is: fitnessProfileFilter,
            },
          }
        : {}),
    },
    select: buildDiscoveryFeedSelect(),
    take: DISCOVERY_FEED_QUERY_LIMIT,
  };
}

export function buildDiscoveryFeedSelect() {
  return {
    id: true,
    firstName: true,
    birthdate: true,
    fitnessProfile: {
      select: {
        primaryGoal: true,
        secondaryGoal: true,
        intensityLevel: true,
        prefersMorning: true,
        prefersEvening: true,
        favoriteActivities: true,
      },
    },
    profile: {
      select: {
        city: true,
        bio: true,
        latitude: true,
        longitude: true,
      },
    },
    photos: {
      where: { isHidden: false },
      orderBy: { sortOrder: 'asc' as const },
      select: {
        id: true,
        storageKey: true,
        isPrimary: true,
        sortOrder: true,
      },
    },
  };
}

export function buildBirthdateFilter(filters: DiscoveryFilters) {
  const birthdateFilter: {
    gte?: Date;
    lte?: Date;
  } = {};

  if (filters.maxAge) {
    birthdateFilter.gte = getBirthdateBoundary(filters.maxAge + 1);
  }

  if (filters.minAge) {
    birthdateFilter.lte = getBirthdateBoundary(filters.minAge);
  }

  return Object.keys(birthdateFilter).length ? birthdateFilter : null;
}

export function buildFitnessProfileFilter(filters: DiscoveryFilters) {
  const normalizedGoals = filters.goals?.length
    ? filters.goals.map((goal) => goal.toLowerCase())
    : [];
  const normalizedIntensity = filters.intensity?.length
    ? filters.intensity.map((level) => level.toLowerCase())
    : [];
  const availabilityFilter = buildAvailabilityFilter(filters);

  const andFilters: Array<Record<string, unknown>> = [];

  if (normalizedGoals.length) {
    andFilters.push({
      OR: normalizedGoals.flatMap((goal) => [
        {
          primaryGoal: {
            equals: goal,
            mode: 'insensitive' as const,
          },
        },
        {
          secondaryGoal: {
            equals: goal,
            mode: 'insensitive' as const,
          },
        },
      ]),
    });
  }

  if (normalizedIntensity.length) {
    const intensityEnums = normalizedIntensity
      .map((i) => i.toUpperCase())
      .filter((i): i is IntensityLevel =>
        Object.values(IntensityLevel).includes(i as IntensityLevel),
      );
    if (intensityEnums.length) {
      andFilters.push({
        intensityLevel: {
          in: intensityEnums,
        },
      });
    }
  }

  if (availabilityFilter) {
    andFilters.push(availabilityFilter);
  }

  if (!andFilters.length) return null;
  if (andFilters.length === 1) return andFilters[0];

  return { AND: andFilters };
}

export function buildAvailabilityFilter(filters: DiscoveryFilters) {
  const wantMorning = !!filters.availability?.includes('morning');
  const wantEvening = !!filters.availability?.includes('evening');

  if (!wantMorning && !wantEvening) return null;

  return {
    OR: [
      ...(wantMorning ? [{ prefersMorning: true }] : []),
      ...(wantEvening ? [{ prefersEvening: true }] : []),
    ],
  };
}

export function getBirthdateBoundary(age: number) {
  const boundary = new Date();
  boundary.setFullYear(boundary.getFullYear() - age);
  return boundary;
}

export function normalizeDiscoveryDistanceKm(distanceKm?: number) {
  if (
    typeof distanceKm !== 'number' ||
    !Number.isFinite(distanceKm) ||
    distanceKm <= 0
  ) {
    return null;
  }

  return distanceKm;
}
