import { IntensityLevel } from '@prisma/client';
import { calculateAge } from '../common/age.util';
import {
  DISCOVERY_DISTANCE_SCORE_TIERS,
  DISCOVERY_FEED_RESULT_LIMIT,
  DISCOVERY_SCORE_WEIGHTS,
  EARTH_RADIUS_KM,
} from './discovery.constants';
import { normalizeDiscoveryDistanceKm } from './discovery-feed.query';
import type { DiscoveryFilters } from './discovery.service';

export interface DiscoveryFeedProfile {
  city: string | null;
  bio: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface DiscoveryFeedFitnessProfile {
  primaryGoal: string | null;
  secondaryGoal: string | null;
  intensityLevel: IntensityLevel;
  prefersMorning: boolean | null;
  prefersEvening: boolean | null;
  favoriteActivities: string | null;
}

export interface DiscoveryFeedCandidate {
  id: string;
  firstName: string;
  birthdate: Date;
  profile: DiscoveryFeedProfile | null;
  fitnessProfile: DiscoveryFeedFitnessProfile | null;
  photos: Array<{
    id: string;
    storageKey: string;
    isPrimary: boolean;
    sortOrder: number;
  }>;
}

export interface DiscoveryFeedRequester {
  profile: {
    latitude: number | null;
    longitude: number | null;
  } | null;
  fitnessProfile: {
    intensityLevel: IntensityLevel | null;
    primaryGoal: string | null;
    secondaryGoal: string | null;
  } | null;
}

export interface RankedDiscoveryFeedCandidate {
  id: string;
  firstName: string;
  birthdate: Date;
  profile: {
    city?: string | null;
    bio?: string | null;
  };
  fitnessProfile: DiscoveryFeedFitnessProfile | null;
  photos: DiscoveryFeedCandidate['photos'];
  age: number;
  distanceKm: number | null;
  recommendationScore: number;
}

export function rankDiscoveryFeedCandidates(
  requester: DiscoveryFeedRequester | null,
  candidates: DiscoveryFeedCandidate[],
  filters: DiscoveryFilters = {},
) {
  const maxDistanceKm = normalizeDiscoveryDistanceKm(filters.distanceKm);
  const requesterHasCoordinates =
    requester?.profile?.latitude !== null &&
    requester?.profile?.latitude !== undefined &&
    requester?.profile?.longitude !== null &&
    requester?.profile?.longitude !== undefined;
  const requesterForScore = requester
    ? {
        fitnessProfile: requester.fitnessProfile
          ? {
              intensityLevel: requester.fitnessProfile.intensityLevel,
              primaryGoal: requester.fitnessProfile.primaryGoal,
              secondaryGoal: requester.fitnessProfile.secondaryGoal,
            }
          : null,
      }
    : null;

  return candidates
    .map((candidate) => {
      const age = calculateAge(candidate.birthdate) ?? 0;
      const distanceKm = calculateDistanceKm(
        requester?.profile?.latitude,
        requester?.profile?.longitude,
        candidate.profile?.latitude,
        candidate.profile?.longitude,
      );

      if (filters.minAge && age < filters.minAge) return null;
      if (filters.maxAge && age > filters.maxAge) return null;
      if (
        maxDistanceKm !== null &&
        requesterHasCoordinates &&
        (distanceKm === null || distanceKm > maxDistanceKm)
      ) {
        return null;
      }

      const score = computeRecommendationScore(
        requesterForScore,
        candidate,
        age,
        distanceKm,
      );
      return shapeDiscoveryFeedCandidate(candidate, age, distanceKm, score);
    })
    .filter((candidate): candidate is RankedDiscoveryFeedCandidate => !!candidate)
    .sort(
      (a, b) => (b?.recommendationScore || 0) - (a?.recommendationScore || 0),
    )
    .slice(0, DISCOVERY_FEED_RESULT_LIMIT);
}

export function computeRecommendationScore(
  requester: {
    fitnessProfile?: {
      intensityLevel?: IntensityLevel | null;
      primaryGoal?: string | null;
      secondaryGoal?: string | null;
    } | null;
  } | null,
  candidate: DiscoveryFeedCandidate,
  age: number,
  distanceKm: number | null,
): number {
  let score = 0;

  const candidateGoals = [
    candidate.fitnessProfile?.primaryGoal,
    candidate.fitnessProfile?.secondaryGoal,
  ]
    .filter(Boolean)
    .map((goal) => String(goal).toLowerCase());
  const requesterGoals = [
    requester?.fitnessProfile?.primaryGoal,
    requester?.fitnessProfile?.secondaryGoal,
  ]
    .filter(Boolean)
    .map((goal) => String(goal).toLowerCase());

  const sharedGoals = candidateGoals.filter((goal) =>
    requesterGoals.includes(goal),
  ).length;
  score += sharedGoals * DISCOVERY_SCORE_WEIGHTS.sharedGoal;

  if (
    requester?.fitnessProfile?.intensityLevel &&
    candidate.fitnessProfile?.intensityLevel &&
    requester.fitnessProfile.intensityLevel ===
      candidate.fitnessProfile.intensityLevel
  ) {
    score += DISCOVERY_SCORE_WEIGHTS.matchingIntensity;
  }

  if (distanceKm !== null) {
    const distanceTier = DISCOVERY_DISTANCE_SCORE_TIERS.find(
      ({ maxDistanceKm }) => distanceKm <= maxDistanceKm,
    );
    if (distanceTier) {
      score += distanceTier.score;
    }
  } else {
    score += DISCOVERY_SCORE_WEIGHTS.unknownDistance;
  }

  const ageDelta = Math.abs(age - DISCOVERY_SCORE_WEIGHTS.ageCenter);
  score += Math.max(0, DISCOVERY_SCORE_WEIGHTS.maxAgeBonus - ageDelta);

  if (candidate.fitnessProfile?.prefersMorning) {
    score += DISCOVERY_SCORE_WEIGHTS.availability;
  }
  if (candidate.fitnessProfile?.prefersEvening) {
    score += DISCOVERY_SCORE_WEIGHTS.availability;
  }

  if (candidate.photos?.length) score += DISCOVERY_SCORE_WEIGHTS.photo;
  if (candidate.profile?.bio) score += DISCOVERY_SCORE_WEIGHTS.bio;

  return score;
}

export function calculateDistanceKm(
  fromLat?: number | null,
  fromLon?: number | null,
  toLat?: number | null,
  toLon?: number | null,
): number | null {
  if (fromLat == null || fromLon == null || toLat == null || toLon == null)
    return null;

  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(toLat - fromLat);
  const dLon = toRad(toLon - fromLon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(fromLat)) *
      Math.cos(toRad(toLat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function shapeDiscoveryFeedCandidate(
  candidate: DiscoveryFeedCandidate,
  age: number,
  distanceKm: number | null,
  recommendationScore: number,
): RankedDiscoveryFeedCandidate {
  const { profile, ...candidateWithoutProfile } = candidate;

  return {
    ...candidateWithoutProfile,
    profile: profile
      ? {
          city: profile.city,
          bio: profile.bio,
        }
      : {},
    age,
    distanceKm,
    recommendationScore,
  };
}
