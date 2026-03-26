import { useQuery } from '@tanstack/react-query';
import type { EventSummary } from '../../../api/types';
import { eventsApi } from '../../../services/api';
import { queryKeys } from '../../../lib/query/queryKeys';

export function useMyEvents() {
  const query = useQuery({
    queryKey: queryKeys.events.mine(),
    queryFn: async () =>
      (await eventsApi.mine() as { data: EventSummary[] | null }).data || [],
    staleTime: 60_000,
  });

  return {
    ...query,
    events: query.data || [],
  };
}
