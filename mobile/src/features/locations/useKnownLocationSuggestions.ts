import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { EventSummary } from '../../api/types';
import { queryKeys } from '../../lib/query/queryKeys';
import { extractKnownLocationSuggestions } from './locationSuggestions';

export function useKnownLocationSuggestions() {
  const queryClient = useQueryClient();

  return useMemo(() => {
    const eventsList = queryClient.getQueryData<EventSummary[]>(queryKeys.events.list) ?? [];
    const mine = queryClient.getQueryData<EventSummary[]>(queryKeys.events.mine) ?? [];
    return extractKnownLocationSuggestions([...eventsList, ...mine]);
  }, [queryClient]);
}
