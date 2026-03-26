import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

export type QueryInvalidationScope = {
  queryKey: QueryKey;
  refetchType?: 'active' | 'all' | 'inactive' | 'none';
};

export const queryInvalidationScopes = {
  discoveryAction: [
    { queryKey: queryKeys.discovery.feeds() },
    { queryKey: queryKeys.matches.list() },
  ],
  eventWrite: [
    { queryKey: queryKeys.events.all(), refetchType: 'inactive' as const },
  ],
  profileWrite: [
    { queryKey: queryKeys.profile.all(), refetchType: 'active' as const },
    { queryKey: queryKeys.discovery.all() },
    { queryKey: queryKeys.matches.list() },
  ],
} satisfies Record<string, readonly QueryInvalidationScope[]>;

export async function invalidateQueryScopes(
  queryClient: QueryClient,
  scopes: readonly QueryInvalidationScope[],
) {
  await Promise.all(
    scopes.map(({ queryKey, refetchType }) =>
      queryClient.invalidateQueries({ queryKey, refetchType }),
    ),
  );
}
