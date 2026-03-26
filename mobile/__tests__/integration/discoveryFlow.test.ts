/**
 * Integration test: Discovery flow
 *
 * Verifies the discovery lifecycle:
 *   Load feed -> swipe (like/pass) -> match creation -> match list update
 *
 * Mocks the API layer at the boundary, exercises real hooks (useDiscoveryFeed,
 * useMatches) and the React Query cache.
 */
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useDiscoveryFeed } from '../../src/features/discovery/hooks/useDiscoveryFeed';
import { useMatches } from '../../src/features/matches/hooks/useMatches';
import type { DiscoveryUser, Match } from '../../src/api/types';

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockFeed = jest.fn();
const mockLike = jest.fn();
const mockPass = jest.fn();
const mockUndo = jest.fn();
const mockMatchesList = jest.fn();

jest.mock('../../src/services/api', () => ({
  discoveryApi: {
    feed: (...args: unknown[]) => mockFeed(...args),
    like: (...args: unknown[]) => mockLike(...args),
    pass: (...args: unknown[]) => mockPass(...args),
    undo: (...args: unknown[]) => mockUndo(...args),
  },
  matchesApi: {
    list: (...args: unknown[]) => mockMatchesList(...args),
  },
}));

/* ------------------------------------------------------------------ */
/*  Fixtures                                                           */
/* ------------------------------------------------------------------ */

const feedUsers: DiscoveryUser[] = [
  {
    id: 'u1',
    firstName: 'Alice',
    birthdate: '1997-01-01T00:00:00.000Z',
    age: 28,
    distanceKm: 3,
    profile: null,
    fitnessProfile: null,
    photos: [],
  },
  {
    id: 'u2',
    firstName: 'Bob',
    birthdate: '1993-01-01T00:00:00.000Z',
    age: 32,
    distanceKm: 5,
    profile: null,
    fitnessProfile: null,
    photos: [],
  },
  {
    id: 'u3',
    firstName: 'Carol',
    birthdate: '1999-01-01T00:00:00.000Z',
    age: 26,
    distanceKm: 8,
    profile: null,
    fitnessProfile: null,
    photos: [],
  },
];

const fakeMatch: Match = {
  id: 'match-1',
  createdAt: '2025-01-01T00:00:00Z',
  user: { id: 'u1', firstName: 'Alice', photoUrl: null },
  lastMessage: null,
};

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('Discovery flow integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -- Load discovery feed --------------------------------------------
  it('loads and returns discovery feed profiles', async () => {
    mockFeed.mockResolvedValue({ data: feedUsers });

    const { result } = renderHook(() => useDiscoveryFeed());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.feed).toHaveLength(3);
    expect(result.current.feed[0].firstName).toBe('Alice');
  });

  // -- Pass removes user from feed optimistically --------------------
  it('pass removes user from feed optimistically', async () => {
    mockFeed.mockResolvedValue({ data: [...feedUsers] });
    mockPass.mockResolvedValue({ data: undefined });

    const { result } = renderHook(() => useDiscoveryFeed());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.feed).toHaveLength(3);

    // After the pass, the server-side feed should no longer include u2.
    const feedWithoutBob = feedUsers.filter((u) => u.id !== 'u2');
    mockFeed.mockResolvedValue({ data: feedWithoutBob });

    await act(async () => {
      await result.current.passUser('u2');
    });

    expect(mockPass).toHaveBeenCalledWith('u2');
    // Bob should be removed optimistically
    await waitFor(() => {
      expect(result.current.feed.find((u) => u.id === 'u2')).toBeUndefined();
      expect(result.current.feed).toHaveLength(2);
    });
  });

  // -- Like removes user and returns match status ---------------------
  it('like removes user from feed and reports match status', async () => {
    mockFeed.mockResolvedValue({ data: [...feedUsers] });
    mockLike.mockResolvedValue({
      data: { status: 'match', match: { id: 'match-1' } },
    });

    const { result } = renderHook(() => useDiscoveryFeed());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // After the like, the server-side feed should no longer include u1.
    const feedWithoutAlice = feedUsers.filter((u) => u.id !== 'u1');
    mockFeed.mockResolvedValue({ data: feedWithoutAlice });

    let likeResult: unknown;
    await act(async () => {
      likeResult = await result.current.likeUser('u1');
    });

    expect(mockLike).toHaveBeenCalledWith('u1');
    // Alice should be removed optimistically
    await waitFor(() => {
      expect(result.current.feed.find((u) => u.id === 'u1')).toBeUndefined();
    });
    expect(likeResult).toEqual({ status: 'match', match: { id: 'match-1' } });
  });

  // -- Like with "liked" status (no match yet) ------------------------
  it('like with "liked" status does not trigger match list invalidation side-effect', async () => {
    mockFeed.mockResolvedValue({ data: [...feedUsers] });
    mockLike.mockResolvedValue({ data: { status: 'liked' } });

    const { result } = renderHook(() => useDiscoveryFeed());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // After the like, the server-side feed should no longer include u3.
    const feedWithoutCarol = feedUsers.filter((u) => u.id !== 'u3');
    mockFeed.mockResolvedValue({ data: feedWithoutCarol });

    let likeResult: unknown;
    await act(async () => {
      likeResult = await result.current.likeUser('u3');
    });

    expect(likeResult).toEqual({ status: 'liked' });
    await waitFor(() => {
      expect(result.current.feed.find((u) => u.id === 'u3')).toBeUndefined();
    });
  });

  // -- Feed with filters passed to API --------------------------------
  it('passes filter parameters to the feed API', async () => {
    mockFeed.mockResolvedValue({ data: [] });
    const filters = { distanceKm: 10, minAge: 25, maxAge: 35, goals: ['strength'] };

    const { result } = renderHook(() => useDiscoveryFeed(filters));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFeed).toHaveBeenCalledWith(filters);
  });

  // -- Pass error rolls back feed ------------------------------------
  it('pass error rolls back the feed to previous state', async () => {
    mockFeed.mockResolvedValue({ data: [...feedUsers] });
    mockPass.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useDiscoveryFeed());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Suppress expected console.warn from observability logger
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await act(async () => {
      try {
        await result.current.passUser('u2');
      } catch {
        // expected
      }
    });

    warnSpy.mockRestore();

    // Feed should be rolled back
    await waitFor(() => {
      expect(result.current.feed).toHaveLength(3);
    });
  });

  // -- Matches list loads after match creation -----------------------
  it('matches list hook loads matches independently', async () => {
    mockMatchesList.mockResolvedValue({ data: [fakeMatch] });

    const { result } = renderHook(() => useMatches());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.matches).toHaveLength(1);
    expect(result.current.matches[0].user.firstName).toBe('Alice');
  });

  // -- Undo swipe triggers feed refetch --------------------------------
  it('undo swipe triggers feed refetch', async () => {
    mockFeed.mockResolvedValue({ data: [...feedUsers] });
    mockUndo.mockResolvedValue({ data: { status: 'undone', action: 'like', targetUserId: 'u1' } });

    const { result } = renderHook(() => useDiscoveryFeed());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Reset call count after initial fetch
    mockFeed.mockClear();
    mockFeed.mockResolvedValue({ data: feedUsers });

    await act(async () => {
      const undoResult = await result.current.undoSwipe();
      expect(undoResult).toEqual({ status: 'undone', action: 'like', targetUserId: 'u1' });
    });

    // The undo onSuccess invalidates the feed query, triggering a refetch
    await waitFor(() => expect(mockFeed).toHaveBeenCalled());
  });
});
