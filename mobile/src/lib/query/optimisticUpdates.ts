import type { QueryClient, QueryKey } from '@tanstack/react-query';

type OptimisticUpdate = {
  queryKey: QueryKey;
  updater: (current: unknown, queryKey: QueryKey) => unknown;
  exact?: boolean;
};

type QuerySnapshot = {
  queryKey: QueryKey;
  data: unknown;
};

function serializeQueryKey(queryKey: QueryKey) {
  return JSON.stringify(queryKey);
}

export async function beginOptimisticUpdate(
  queryClient: QueryClient,
  updates: readonly OptimisticUpdate[],
) {
  await Promise.all(
    updates.map(({ queryKey, exact }) =>
      queryClient.cancelQueries({ queryKey, exact }),
    ),
  );

  const snapshots = new Map<string, QuerySnapshot>();

  for (const update of updates) {
    const matches = queryClient.getQueriesData({
      queryKey: update.queryKey,
      exact: update.exact,
    });

    for (const [matchedKey, current] of matches) {
      const queryKey = matchedKey as QueryKey;
      const serializedKey = serializeQueryKey(queryKey);
      if (!snapshots.has(serializedKey)) {
        snapshots.set(serializedKey, { queryKey, data: current });
      }

      queryClient.setQueryData(queryKey, (value: unknown) =>
        update.updater(value, queryKey),
      );
    }
  }

  return {
    rollback() {
      for (const snapshot of snapshots.values()) {
        queryClient.setQueryData(snapshot.queryKey, snapshot.data);
      }
    },
  };
}
