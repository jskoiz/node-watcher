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
  function createDeferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return { promise, resolve, reject };
  }

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

  it('optimistically removes a user from every cached discovery feed variant', async () => {
    const primaryFilters = { distanceKm: 10 };
    const siblingFilters = { distanceKm: 20 };
    const primaryFeed = [
      { id: 'u1', firstName: 'Alice' },
      { id: 'u2', firstName: 'Bob' },
    ];
    const siblingFeed = [
      { id: 'u1', firstName: 'Alice' },
      { id: 'u3', firstName: 'Cara' },
    ];
    mockFeed.mockImplementation((filters?: Record<string, unknown>) => ({
      data: filters?.distanceKm === 20 ? siblingFeed : primaryFeed,
    }));
    mockPass.mockResolvedValue({ data: { status: 'passed' } });

    const { wrapper } = createQueryTestHarness();
    const primary = renderHook(() => useDiscoveryFeed(primaryFilters), { wrapper });
    const sibling = renderHook(() => useDiscoveryFeed(siblingFilters), { wrapper });

    await waitFor(() => expect(primary.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(sibling.result.current.isSuccess).toBe(true));

    const passPromise = primary.result.current.passUser('u1');

    await waitFor(() => {
      expect(primary.result.current.feed).toEqual([{ id: 'u2', firstName: 'Bob' }]);
      expect(sibling.result.current.feed).toEqual([{ id: 'u3', firstName: 'Cara' }]);
    });

    await act(async () => {
      await passPromise;
    });

    expect(primary.result.current.feed).toEqual([{ id: 'u2', firstName: 'Bob' }]);
    expect(sibling.result.current.feed).toEqual([{ id: 'u3', firstName: 'Cara' }]);
  });

  it('restores all cached discovery feed variants on error', async () => {
    const primaryFilters = { distanceKm: 10 };
    const siblingFilters = { distanceKm: 20 };
    const primaryFeed = [
      { id: 'u1', firstName: 'Alice' },
      { id: 'u2', firstName: 'Bob' },
    ];
    const siblingFeed = [
      { id: 'u1', firstName: 'Alice' },
      { id: 'u3', firstName: 'Cara' },
    ];
    mockFeed.mockImplementation((filters?: Record<string, unknown>) => ({
      data: filters?.distanceKm === 20 ? siblingFeed : primaryFeed,
    }));
    const deferred = createDeferred<{ data: { status: string } }>();
    mockPass.mockImplementation(() => deferred.promise);

    const { wrapper } = createQueryTestHarness();
    const primary = renderHook(() => useDiscoveryFeed(primaryFilters), { wrapper });
    const sibling = renderHook(() => useDiscoveryFeed(siblingFilters), { wrapper });

    await waitFor(() => expect(primary.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(sibling.result.current.isSuccess).toBe(true));

    const passPromise = primary.result.current.passUser('u1');

    await waitFor(() => {
      expect(primary.result.current.feed).toEqual([{ id: 'u2', firstName: 'Bob' }]);
      expect(sibling.result.current.feed).toEqual([{ id: 'u3', firstName: 'Cara' }]);
    });

    deferred.reject(new Error('Network error'));
    await expect(passPromise).rejects.toThrow('Network error');

    await waitFor(() => {
      expect(primary.result.current.feed).toEqual(primaryFeed);
      expect(sibling.result.current.feed).toEqual(siblingFeed);
    });
  });

  it('invalidates the matches list when a like creates a match', async () => {
    mockFeed.mockResolvedValue({ data: [] });
    mockLike.mockResolvedValue({ data: { status: 'match', match: { id: 'match-1' } } });

    const { queryClient, wrapper } = createQueryTestHarness();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDiscoveryFeed({ distanceKm: 10 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(async () => {
      await result.current.likeUser('u1');
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.matches.list(),
      refetchType: undefined,
    });
  });

  it('invalidates discovery and match caches when undoing a swipe', async () => {
    mockFeed.mockResolvedValue({ data: [] });
    mockUndo.mockResolvedValue({ data: { restoredUserId: 'u1' } });

    const { queryClient, wrapper } = createQueryTestHarness();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDiscoveryFeed({ distanceKm: 10 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(async () => {
      await result.current.undoSwipe();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.discovery.feeds(),
      refetchType: undefined,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.matches.list(),
      refetchType: undefined,
    });
  });
});
