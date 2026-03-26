import { act, renderHook, waitFor } from '@testing-library/react-native';
import { createQueryTestHarness } from '../../../../lib/testing/queryTestHarness';
import { queryKeys } from '../../../../lib/query/queryKeys';
import { useDiscoveryFeed } from '../useDiscoveryFeed';

const mockFeed = jest.fn();
const mockLike = jest.fn();
const mockPass = jest.fn();
const mockUndo = jest.fn();

jest.mock('../../../../services/api', () => ({
  discoveryApi: {
    feed: (...args: unknown[]) => mockFeed(...args),
    like: (...args: unknown[]) => mockLike(...args),
    pass: (...args: unknown[]) => mockPass(...args),
    undo: (...args: unknown[]) => mockUndo(...args),
  },
}));

describe('useDiscoveryFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns feed data on success', async () => {
    const users = [
      { id: 'u1', firstName: 'Alice' },
      { id: 'u2', firstName: 'Bob' },
    ];
    mockFeed.mockResolvedValue({ data: users });

    const { wrapper } = createQueryTestHarness();
    const { result } = renderHook(() => useDiscoveryFeed(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.feed).toEqual(users);
  });

  it('returns empty feed on API error', async () => {
    mockFeed.mockRejectedValue(new Error('Network error'));

    const { wrapper } = createQueryTestHarness();
    const { result } = renderHook(() => useDiscoveryFeed(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.feed).toEqual([]);
    expect(result.current.error).toBeTruthy();
  });

  it('starts in loading state', () => {
    mockFeed.mockReturnValue(new Promise(() => {}));

    const { wrapper } = createQueryTestHarness();
    const { result } = renderHook(() => useDiscoveryFeed(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.feed).toEqual([]);
  });

  it('passes filters to the API', async () => {
    mockFeed.mockResolvedValue({ data: [] });
    const filters = { distanceKm: 10, goals: ['strength'] };

    const { wrapper } = createQueryTestHarness();
    const { result } = renderHook(() => useDiscoveryFeed(filters), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFeed).toHaveBeenCalledWith(filters);
  });

  it('optimistically removes a swiped profile from every cached discovery variant', async () => {
    const users = [
      { id: 'u1', firstName: 'Alice' },
      { id: 'u2', firstName: 'Bob' },
    ];
    mockFeed.mockResolvedValue({ data: users });
    mockPass.mockResolvedValue({ data: { status: 'passed' } });

    const { queryClient, wrapper } = createQueryTestHarness();
    jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined as never);
    const defaultKey = queryKeys.discovery.feed();
    const filteredKey = queryKeys.discovery.feed({ distanceKm: 10 });

    queryClient.setQueryData(defaultKey, users);
    queryClient.setQueryData(filteredKey, users);

    const { result } = renderHook(() => useDiscoveryFeed({ distanceKm: 10 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(async () => {
      await result.current.passUser('u1');
    });

    expect(queryClient.getQueryData(defaultKey)).toEqual([{ id: 'u2', firstName: 'Bob' }]);
    expect(queryClient.getQueryData(filteredKey)).toEqual([{ id: 'u2', firstName: 'Bob' }]);
  });

  it('restores every cached discovery variant when a swipe mutation fails', async () => {
    const users = [
      { id: 'u1', firstName: 'Alice' },
      { id: 'u2', firstName: 'Bob' },
    ];
    mockFeed.mockResolvedValue({ data: users });
    mockLike.mockRejectedValue(new Error('Like failed'));

    const { queryClient, wrapper } = createQueryTestHarness();
    jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined as never);
    const defaultKey = queryKeys.discovery.feed();
    const filteredKey = queryKeys.discovery.feed({ distanceKm: 10 });

    queryClient.setQueryData(defaultKey, users);
    queryClient.setQueryData(filteredKey, users);

    const { result } = renderHook(() => useDiscoveryFeed({ distanceKm: 10 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(async () => {
      await expect(result.current.likeUser('u1')).rejects.toThrow('Like failed');
    });

    expect(queryClient.getQueryData(defaultKey)).toEqual(users);
    expect(queryClient.getQueryData(filteredKey)).toEqual(users);
  });

  it('invalidates discovery and match caches when undoing a swipe', async () => {
    mockFeed.mockResolvedValue({ data: [] });
    mockUndo.mockResolvedValue({ data: { restoredUserId: 'u1' } });

    const { queryClient, wrapper } = createQueryTestHarness();
    const invalidateSpy = jest
      .spyOn(queryClient, 'invalidateQueries')
      .mockResolvedValue(undefined as never);

    const { result } = renderHook(() => useDiscoveryFeed({ distanceKm: 10 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(async () => {
      await result.current.undoSwipe();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.discovery.feeds(),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.matches.list(),
    });
  });
});
