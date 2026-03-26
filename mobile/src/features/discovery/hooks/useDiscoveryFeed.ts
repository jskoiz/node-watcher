import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { DiscoveryUser, LikeResponse, UndoSwipeResponse } from '../../../api/types';
import {
  discoveryApi,
  type DiscoveryFiltersInput,
} from '../../../services/api';
import { beginOptimisticUpdate } from '../../../lib/query/optimisticUpdates';
import {
  invalidateQueryScopes,
  queryInvalidationScopes,
} from '../../../lib/query/queryInvalidation';
import { queryKeys } from '../../../lib/query/queryKeys';

export function useDiscoveryFeed(filters?: DiscoveryFiltersInput) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.discovery.feed(filters ?? {}),
    queryFn: async () =>
      (await discoveryApi.feed(filters) as { data: DiscoveryUser[] | null }).data || [],
  });

  const removeFromFeeds = async (userId: string) =>
    beginOptimisticUpdate(queryClient, [
      {
        queryKey: queryKeys.discovery.feeds(),
        updater: (current) =>
          Array.isArray(current)
            ? current.filter((item) => (item as DiscoveryUser).id !== userId)
            : current,
      },
    ]);

  const invalidateMatches = () => {
    void invalidateQueryScopes(queryClient, [
      { queryKey: queryKeys.matches.list() },
    ]);
  };

  const pass = useMutation({
    mutationFn: async (userId: string) => discoveryApi.pass(userId),
    onMutate: removeFromFeeds,
    onError: (_error, _userId, context) => {
      context?.rollback();
    },
  });

  const like = useMutation({
    mutationFn: async (userId: string) =>
      (await discoveryApi.like(userId) as { data: LikeResponse }).data,
    onMutate: removeFromFeeds,
    onSuccess: (data) => {
      if (data.status === 'match') {
        invalidateMatches();
      }
    },
    onError: (_error, _userId, context) => {
      context?.rollback();
    },
  });

  const undo = useMutation({
    mutationFn: async () =>
      (await discoveryApi.undo() as { data: UndoSwipeResponse }).data,
    onSuccess: () => {
      void invalidateQueryScopes(queryClient, queryInvalidationScopes.discoveryAction);
    },
  });

  return {
    ...query,
    feed: query.data || [],
    likeUser: like.mutateAsync,
    passUser: pass.mutateAsync,
    undoSwipe: undo.mutateAsync,
    isActing: like.isPending || pass.isPending || undo.isPending,
  };
}
