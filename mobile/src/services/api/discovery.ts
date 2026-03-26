import client from '../../api/client';
import type {
  DiscoveryUser,
  LikeResponse,
  PassResponse,
  ProfileCompletenessResponse,
  UndoSwipeResponse,
} from '../../api/types';
import { withErrorLogging } from './shared';

export type DiscoveryFiltersInput = {
  distanceKm?: number;
  minAge?: number;
  maxAge?: number;
  goals?: string[];
  intensity?: string[];
  availability?: ('morning' | 'evening')[];
};

export const discoveryApi = {
  feed: async (filters?: DiscoveryFiltersInput) =>
    withErrorLogging('discovery', 'feed', () =>
      client.get<DiscoveryUser[]>('/discovery/feed', {
        params: {
          distanceKm: filters?.distanceKm,
          minAge: filters?.minAge,
          maxAge: filters?.maxAge,
          goals: filters?.goals?.join(','),
          intensity: filters?.intensity?.join(','),
          availability: filters?.availability?.join(','),
        },
      }),
      {
        context: {
          hasFilters: Boolean(filters),
          distanceKm: filters?.distanceKm,
          minAge: filters?.minAge,
          maxAge: filters?.maxAge,
          goalCount: filters?.goals?.length,
          intensityCount: filters?.intensity?.length,
          availabilityCount: filters?.availability?.length,
        },
      },
    ),
  pass: async (userId: string) =>
    withErrorLogging('discovery', 'pass', () =>
      client.post<PassResponse>(`/discovery/pass/${userId}`),
      { context: { targetUserId: userId } },
    ),
  like: async (userId: string) =>
    withErrorLogging('discovery', 'like', () =>
      client.post<LikeResponse>(`/discovery/like/${userId}`),
      { context: { targetUserId: userId } },
    ),
  undo: async () =>
    withErrorLogging('discovery', 'undo', () =>
      client.post<UndoSwipeResponse>('/discovery/undo'),
    ),
  profileCompleteness: async () =>
    withErrorLogging('discovery', 'profileCompleteness', () =>
      client.get<ProfileCompletenessResponse>('/discovery/profile-completeness'),
    ),
};
