import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useQuery } from '@tanstack/react-query';
import { createQueryTestHarness } from '../../../../lib/testing/queryTestHarness';
import { queryKeys } from '../../../../lib/query/queryKeys';
import { useCreateEvent } from '../useCreateEvent';

const mockCreate = jest.fn();

jest.mock('../../../../services/api', () => ({
  eventsApi: {
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

describe('useCreateEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prepends the new event into the list and mine caches', async () => {
    const createdEvent = {
      id: 'e3',
      title: 'Climb',
      location: 'Wall',
      startsAt: '2026-03-27T18:00:00.000Z',
      host: { id: 'host-1', firstName: 'Casey' },
      attendeesCount: 0,
      joined: true,
    };
    mockCreate.mockResolvedValue({ data: createdEvent });

    const { queryClient, wrapper } = createQueryTestHarness();
    const invalidateSpy = jest
      .spyOn(queryClient, 'invalidateQueries')
      .mockResolvedValue(undefined as never);

    const existingEvent = {
      id: 'e1',
      title: 'Trail Run',
      location: 'Park',
      startsAt: '2026-03-25T18:00:00.000Z',
      host: { id: 'host-1', firstName: 'Casey' },
      attendeesCount: 4,
      joined: false,
    };
    queryClient.setQueryData(queryKeys.events.list(), [existingEvent]);
    queryClient.setQueryData(queryKeys.events.mine(), [existingEvent]);
    const listObserver = renderHook(
      () =>
        useQuery({
          queryKey: queryKeys.events.list(),
          queryFn: async () => {
            throw new Error('events.list should not refetch in this test');
          },
          enabled: false,
        }),
      { wrapper },
    );
    const mineObserver = renderHook(
      () =>
        useQuery({
          queryKey: queryKeys.events.mine(),
          queryFn: async () => {
            throw new Error('events.mine should not refetch in this test');
          },
          enabled: false,
        }),
      { wrapper },
    );

    const { result } = renderHook(() => useCreateEvent(), { wrapper });

    const createPromise = result.current.createEvent({
      title: 'Climb',
      location: 'Wall',
      startsAt: '2026-03-27T18:00:00.000Z',
    });
    await act(async () => {
      await createPromise;
    });

    await waitFor(() =>
      expect(listObserver.result.current.data).toEqual([createdEvent, existingEvent]),
    );
    await waitFor(() =>
      expect(mineObserver.result.current.data).toEqual([createdEvent, existingEvent]),
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.events.all(),
      refetchType: 'inactive',
    });
  });
});
