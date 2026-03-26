import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useQuery } from '@tanstack/react-query';
import { createQueryTestHarness } from '../../../../lib/testing/queryTestHarness';
import { queryKeys } from '../../../../lib/query/queryKeys';
import { useEventDetail } from '../useEventDetail';

const mockDetail = jest.fn();
const mockRsvp = jest.fn();
const mockShowToast = jest.fn();

jest.mock('../../../../services/api', () => ({
  eventsApi: {
    detail: (...args: unknown[]) => mockDetail(...args),
    rsvp: (...args: unknown[]) => mockRsvp(...args),
  },
}));

jest.mock('../../../../store/toastStore', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
}));

describe('useEventDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns event data on success', async () => {
    const event = {
      id: 'e1',
      title: 'Trail Run',
      location: 'Park',
      startsAt: '2026-03-25T18:00:00.000Z',
      host: { id: 'host-1', firstName: 'Casey' },
      attendeesCount: 4,
      joined: false,
    };
    mockDetail.mockResolvedValue({ data: event });

    const { wrapper } = createQueryTestHarness();
    const { result } = renderHook(() => useEventDetail('e1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.event).toEqual(event);
  });

  it('patches the event family on RSVP success and invalidates inactive event queries', async () => {
    const event = {
      id: 'e1',
      title: 'Trail Run',
      location: 'Park',
      startsAt: '2026-03-25T18:00:00.000Z',
      host: { id: 'host-1', firstName: 'Casey' },
      attendeesCount: 4,
      joined: false,
    };
    const otherEvent = {
      id: 'e2',
      title: 'Yoga',
      location: 'Studio',
      startsAt: '2026-03-26T18:00:00.000Z',
      host: { id: 'host-2', firstName: 'Jordan' },
      attendeesCount: 2,
      joined: false,
    };
    const updated = {
      status: 'joined' as const,
      attendeesCount: 8,
    };
    mockDetail.mockResolvedValue({ data: event });
    mockRsvp.mockResolvedValue({ data: updated });

    const { queryClient, wrapper } = createQueryTestHarness();
    const invalidateSpy = jest
      .spyOn(queryClient, 'invalidateQueries')
      .mockResolvedValue(undefined as never);

    queryClient.setQueryData(queryKeys.events.list(), [event, otherEvent]);
    queryClient.setQueryData(queryKeys.events.mine(), [event]);
    queryClient.setQueryData(queryKeys.events.detail('e1'), event);
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

    const { result } = renderHook(() => useEventDetail('e1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const joinPromise = result.current.joinEvent();
    await act(async () => {
      await joinPromise;
    });

    expect(queryClient.getQueryData(queryKeys.events.detail('e1'))).toEqual({
      ...event,
      joined: true,
      attendeesCount: updated.attendeesCount,
    });
    await waitFor(() =>
      expect(listObserver.result.current.data).toEqual([
        {
          ...event,
          joined: true,
          attendeesCount: updated.attendeesCount,
        },
        otherEvent,
      ]),
    );
    await waitFor(() =>
      expect(mineObserver.result.current.data).toEqual([
        {
          ...event,
          joined: true,
          attendeesCount: updated.attendeesCount,
        },
      ]),
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.events.all(),
      refetchType: 'inactive',
    });
    expect(mockShowToast).toHaveBeenCalledWith('RSVP confirmed!', 'success');
  });

  it('rolls back the event family if RSVP fails', async () => {
    const event = {
      id: 'e1',
      title: 'Trail Run',
      location: 'Park',
      startsAt: '2026-03-25T18:00:00.000Z',
      host: { id: 'host-1', firstName: 'Casey' },
      attendeesCount: 4,
      joined: false,
    };
    mockDetail.mockResolvedValue({ data: event });
    mockRsvp.mockRejectedValue(new Error('RSVP failed'));

    const { queryClient, wrapper } = createQueryTestHarness();
    queryClient.setQueryData(queryKeys.events.list(), [event]);
    queryClient.setQueryData(queryKeys.events.mine(), [event]);
    queryClient.setQueryData(queryKeys.events.detail('e1'), event);
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

    const { result } = renderHook(() => useEventDetail('e1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const joinPromise = result.current.joinEvent();
    await act(async () => {
      await joinPromise.catch(() => undefined);
    });

    await expect(joinPromise).rejects.toThrow('RSVP failed');

    expect(queryClient.getQueryData(queryKeys.events.detail('e1'))).toEqual(event);
    expect(listObserver.result.current.data).toEqual([event]);
    expect(mineObserver.result.current.data).toEqual([event]);
    expect(mockShowToast).not.toHaveBeenCalled();
  });
});
