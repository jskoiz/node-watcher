/**
 * Integration test: Auth flow
 *
 * Verifies the complete authentication lifecycle:
 *   Login -> token storage -> authenticated API calls -> token load/restore -> logout
 *
 * Mocks the API layer (services/api) and token storage at the boundary,
 * but exercises the real authStore, normalizeApiError, and query client.
 */
import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '../../src/store/authStore';
import type { AuthenticatedUser } from '../../src/api/types';

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockLogin = jest.fn();
const mockSignup = jest.fn();
const mockMe = jest.fn();
const mockDeleteAccount = jest.fn();
const mockDeregisterPushToken = jest.fn().mockResolvedValue(undefined);

jest.mock('../../src/services/api', () => ({
  authApi: {
    login: (...args: unknown[]) => mockLogin(...args),
    signup: (...args: unknown[]) => mockSignup(...args),
    me: (...args: unknown[]) => mockMe(...args),
    deleteAccount: (...args: unknown[]) => mockDeleteAccount(...args),
  },
}));

// In-memory token bucket keyed by a mock-prefixed variable so jest.mock hoisting allows it.
const mockTokenBucket: { value: string | null } = { value: null };

jest.mock('../../src/api/tokenStorage', () => ({
  getToken: jest.fn(async () => mockTokenBucket.value),
  setToken: jest.fn(async (t: string) => {
    mockTokenBucket.value = t;
  }),
  deleteToken: jest.fn(async () => {
    mockTokenBucket.value = null;
  }),
}));

const mockQueryClientClear = jest.fn();
const mockQueryClientSetQueryData = jest.fn();

jest.mock('../../src/lib/query/queryClient', () => ({
  queryClient: {
    clear: (...args: unknown[]) => mockQueryClientClear(...args),
    setQueryData: (...args: unknown[]) => mockQueryClientSetQueryData(...args),
  },
}));

jest.mock('../../src/services/pushRegistration', () => ({
  deregisterPushToken: (...args: unknown[]) => mockDeregisterPushToken(...args),
}));

// The global jest.setup.js Sentry mock does not include setUser, which authStore calls.
jest.mock('@sentry/react-native', () => ({
  setUser: jest.fn(),
}));

/* ------------------------------------------------------------------ */
/*  Fixtures                                                           */
/* ------------------------------------------------------------------ */

const fakeUser: AuthenticatedUser = {
  id: 'u-1',
  email: 'alice@brdg.local',
  firstName: 'Alice',
  isOnboarded: true,
};

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('Auth flow integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTokenBucket.value = null;
    // Reset Zustand store between tests
    useAuthStore.setState({ token: null, user: null, isLoading: true });
  });

  // -- Login -> store token -> expose user ----------------------------
  it('login stores token and populates user in store', async () => {
    mockLogin.mockResolvedValue({
      data: { access_token: 'jwt-abc', user: fakeUser },
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login({ email: 'alice@brdg.local', password: 'secret' });
    });

    expect(mockLogin).toHaveBeenCalledWith({ email: 'alice@brdg.local', password: 'secret' });
    expect(mockTokenBucket.value).toBe('jwt-abc');
    expect(result.current.token).toBe('jwt-abc');
    expect(result.current.user).toEqual({
      id: 'u-1',
      email: 'alice@brdg.local',
      firstName: 'Alice',
      isOnboarded: true,
    });
  });

  // -- Signup -> store token -> expose user ---------------------------
  it('signup stores token and populates user in store', async () => {
    mockSignup.mockResolvedValue({
      data: { access_token: 'jwt-signup', user: fakeUser },
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.signup({
        email: 'alice@brdg.local',
        password: 'secret',
        firstName: 'Alice',
        birthdate: '1995-01-01',
        gender: 'female',
      });
    });

    expect(mockTokenBucket.value).toBe('jwt-signup');
    expect(result.current.user?.firstName).toBe('Alice');
  });

  // -- loadToken restores session from storage ------------------------
  it('loadToken restores session when token is valid', async () => {
    mockTokenBucket.value = 'jwt-persisted';
    mockMe.mockResolvedValue({ data: fakeUser });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.loadToken();
    });

    expect(mockMe).toHaveBeenCalledWith('jwt-persisted');
    expect(result.current.token).toBe('jwt-persisted');
    expect(result.current.user).toEqual({
      id: 'u-1',
      email: 'alice@brdg.local',
      firstName: 'Alice',
      isOnboarded: true,
    });
    expect(result.current.isLoading).toBe(false);
  });

  // -- loadToken clears on 401 ----------------------------------------
  it('loadToken clears session when token is expired (401)', async () => {
    mockTokenBucket.value = 'jwt-expired';
    const axiosError = Object.assign(new Error('Unauthorized'), {
      isAxiosError: true,
      response: { status: 401, data: { message: 'Unauthorized' } },
    });
    mockMe.mockRejectedValue(axiosError);

    // Patch axios.isAxiosError to recognize our mock error
    jest.spyOn(require('axios'), 'isAxiosError').mockImplementation(
      (e: unknown) => !!(e as Record<string, unknown>)?.isAxiosError,
    );

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.loadToken();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(mockTokenBucket.value).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  // -- loadToken keeps token on network error -------------------------
  it('loadToken keeps token on transient network error', async () => {
    mockTokenBucket.value = 'jwt-keep';
    mockMe.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.loadToken();
    });

    // Token should be preserved so the app can retry later
    expect(result.current.token).toBe('jwt-keep');
    expect(result.current.user).toBeNull();
    expect(mockTokenBucket.value).toBe('jwt-keep');
  });

  // -- Logout clears everything ---------------------------------------
  it('logout clears token, user, and query cache', async () => {
    // Set up logged-in state
    mockTokenBucket.value = 'jwt-abc';
    useAuthStore.setState({ token: 'jwt-abc', user: fakeUser, isLoading: false });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(mockTokenBucket.value).toBeNull();

    expect(mockQueryClientClear).toHaveBeenCalled();
    expect(mockQueryClientSetQueryData).not.toHaveBeenCalledWith(expect.anything(), undefined);
  });

  // -- Login failure propagates error ---------------------------------
  it('login failure propagates normalized error', async () => {
    const axiosError = Object.assign(new Error('Bad credentials'), {
      isAxiosError: true,
      response: { status: 400, data: { message: 'Invalid credentials' } },
    });
    mockLogin.mockRejectedValue(axiosError);

    jest.spyOn(require('axios'), 'isAxiosError').mockImplementation(
      (e: unknown) => !!(e as Record<string, unknown>)?.isAxiosError,
    );

    const { result } = renderHook(() => useAuthStore());

    await expect(
      act(async () => {
        await result.current.login({ email: 'bad@brdg.local', password: 'wrong' });
      }),
    ).rejects.toMatchObject({ message: 'Invalid credentials' });

    expect(result.current.token).toBeNull();
    expect(mockTokenBucket.value).toBeNull();
  });

  // -- deleteAccount clears session -----------------------------------
  it('deleteAccount calls API then clears session', async () => {
    mockTokenBucket.value = 'jwt-delete';
    useAuthStore.setState({ token: 'jwt-delete', user: fakeUser, isLoading: false });
    mockDeleteAccount.mockResolvedValue({ data: null });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.deleteAccount();
    });

    expect(mockDeleteAccount).toHaveBeenCalled();
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(mockTokenBucket.value).toBeNull();
  });
});
