import type { QueryClient, QueryKey } from '@tanstack/react-query';
import type { DiscoveryUser } from '../../api/types';
import { queryKeys } from './queryKeys';

export type DiscoveryFeedSnapshot = Array<
  readonly [QueryKey, DiscoveryUser[] | undefined]
>;

export async function removeUserFromDiscoveryFeedFamily(
  queryClient: QueryClient,
  userId: string,
): Promise<DiscoveryFeedSnapshot> {
  await queryClient.cancelQueries({ queryKey: queryKeys.discovery.feeds() });

  const snapshots = queryClient.getQueriesData<DiscoveryUser[]>({
    queryKey: queryKeys.discovery.feeds(),
  });

  snapshots.forEach(([queryKey, currentFeed]) => {
    if (!currentFeed) {
      return;
    }

    queryClient.setQueryData<DiscoveryUser[]>(
      queryKey,
      currentFeed.filter((user) => user.id !== userId),
    );
  });

  return snapshots;
}

export function restoreDiscoveryFeedFamily(
  queryClient: QueryClient,
  snapshots: DiscoveryFeedSnapshot | undefined,
) {
  snapshots?.forEach(([queryKey, previousFeed]) => {
    queryClient.setQueryData(queryKey, previousFeed);
  });
}
