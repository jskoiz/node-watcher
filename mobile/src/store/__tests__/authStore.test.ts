import type { User } from '../../api/types';
import { deleteToken, getToken, setToken } from '../../api/tokenStorage';
import { queryKeys } from '../../lib/query/queryKeys';
import { authApi } from '../../services/api';
import { useAuthStore } from '../authStore';

jest.mock('@sentry/react-native', () => ({
  setUser: jest.fn(),
}));

jest.mock('../../api/tokenStorage', () => ({
  getToken: jest.fn(),
  setToken: jest.fn(),
  deleteToken: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockQueryClientClear = jest.fn();
const mockQueryClientSetQueryData = jest.fn();
jest.mock('../../lib/query/queryClient', () => ({
  queryClient: {
    clear: (...args: unknown[]) => mockQueryClientClear(...args),
    setQueryData: (...args: unknown[]) => mockQueryClientSetQueryData(...args),
  },
}));

const mockDeregisterPushToken = jest.fn().mockResolvedValue(undefined);
jest.mock('../../services/pushRegistration', () => ({
  deregisterPushToken: (...args: unknown[]) => mockDeregisterPushToken(...args),
}));

jest.mock('../../services/api', () => ({
  authApi: {
    login: jest.fn(),
    signup: jest.fn(),
    me: jest.fn(),
    deleteAccount: jest.fn(),
  },
}));

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;
const mockSetToken = setToken as jest.MockedFunction<typeof setToken>;
const mockDeleteToken = deleteToken as jest.MockedFunction<typeof deleteToken>;
const mockAuthApi = authApi as jest.Mocked<typeof authApi>;

function createUser(
  overrides: Partial<User> & {
    profile?: Partial<NonNullable<User['profile']>>;
  } = {},
): User {
  const base: User = {
    id: 'u1',
    email: 'alice@example.com',
    firstName: 'Alice',
    isOnboarded: true,
    profile: {
      intentDating: false,
      intentWorkout: true,
      intentFriends: false,
    },
  };

  return {
    ...base,
    ...overrides,
    profile: {
      ...base.profile,
      ...(overrides.profile ?? {}),
    },
  };
}

describe('authStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ token: null, user: null, isLoading: false });
  });

  describe('deleteAccount', () => {
    it('clears token from secure storage, clears the query cache, and clears the session on success', async () => {
      mockAuthApi.deleteAccount.mockResolvedValueOnce({ data: undefined } as never);
      mockDeleteToken.mockResolvedValueOnce(undefined);

      useAuthStore.setState({ token: 'tok', user: createUser(), isLoading: false });

      await useAuthStore.getState().deleteAccount();

      expect(mockQueryClientClear).toHaveBeenCalled();
      expect(mockDeleteToken).toHaveBeenCalled();
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('throws normalized error and does not clear session when API call fails', async () => {
      const apiError = Object.assign(new Error('Forbidden'), {
        response: { status: 403, data: {} },
      });
      mockAuthApi.deleteAccount.mockRejectedValueOnce(apiError);

      useAuthStore.setState({ token: 'tok', user: createUser(), isLoading: false });

      await expect(useAuthStore.getState().deleteAccount()).rejects.toMatchObject({
        isNetworkError: false,
        isUnauthorized: false,
      });

      expect(useAuthStore.getState().token).toBe('tok');
      expect(useAuthStore.getState().user).toEqual(createUser());
      expect(mockDeleteToken).not.toHaveBeenCalled();
      expect(mockQueryClientClear).not.toHaveBeenCalled();
    });

    it('still clears in-memory session even when secure storage deletion throws', async () => {
      mockAuthApi.deleteAccount.mockResolvedValueOnce({ data: undefined } as never);
      mockDeleteToken.mockRejectedValueOnce(new Error('Storage unavailable'));

      useAuthStore.setState({ token: 'tok', user: createUser(), isLoading: false });

      await expect(useAuthStore.getState().deleteAccount()).rejects.toThrow(
        'Storage unavailable',
      );

      expect(mockQueryClientClear).toHaveBeenCalled();
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('does not wait for push-token deregistration before clearing the session', async () => {
      mockAuthApi.deleteAccount.mockResolvedValueOnce({ data: undefined } as never);
      mockDeleteToken.mockResolvedValueOnce(undefined);

      let resolveDeregister: (() => void) | undefined;
      const deregisterPromise = new Promise<void>((resolve) => {
        resolveDeregister = resolve;
      });
      mockDeregisterPushToken.mockReturnValueOnce(deregisterPromise);

      useAuthStore.setState({ token: 'tok', user: createUser(), isLoading: false });

      const deleteAccountPromise = useAuthStore.getState().deleteAccount();
      await Promise.resolve();
      await Promise.resolve();

      expect(mockQueryClientClear).toHaveBeenCalled();
      expect(mockDeleteToken).toHaveBeenCalled();
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();

      resolveDeregister?.();
      await deleteAccountPromise;
    });
  });

  describe('logout', () => {
    it('removes token from secure storage, clears the query cache, and clears the session', async () => {
      mockDeleteToken.mockResolvedValueOnce(undefined);

      useAuthStore.setState({ token: 'tok', user: createUser(), isLoading: false });

      await useAuthStore.getState().logout();

      expect(mockQueryClientClear).toHaveBeenCalled();
      expect(mockDeleteToken).toHaveBeenCalled();
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('deregisters push token before clearing session', async () => {
      mockDeleteToken.mockResolvedValueOnce(undefined);

      useAuthStore.setState({ token: 'tok', user: createUser(), isLoading: false });

      await useAuthStore.getState().logout();

      expect(mockDeregisterPushToken).toHaveBeenCalled();
    });

    it('does not wait for push-token deregistration before clearing session', async () => {
      mockDeleteToken.mockResolvedValueOnce(undefined);

      let resolveDeregister: (() => void) | undefined;
      const deregisterPromise = new Promise<void>((resolve) => {
        resolveDeregister = resolve;
      });
      mockDeregisterPushToken.mockReturnValueOnce(deregisterPromise);

      useAuthStore.setState({ token: 'tok', user: createUser(), isLoading: false });

      const logoutPromise = useAuthStore.getState().logout();
      await Promise.resolve();
      await Promise.resolve();

      expect(mockQueryClientClear).toHaveBeenCalled();
      expect(mockDeleteToken).toHaveBeenCalled();
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();

      resolveDeregister?.();
      await logoutPromise;
    });
  });

  describe('session sync', () => {
    it('seeds the profile cache and stores only the session slice when setSession is used', () => {
      const user = createUser({
        profile: {
          intentDating: true,
          intentWorkout: false,
          intentFriends: true,
        },
      });

      useAuthStore.getState().setSession('new-token', user);

      expect(mockQueryClientSetQueryData).toHaveBeenCalledWith(
        queryKeys.profile.current(),
        user,
      );
      expect(useAuthStore.getState().token).toBe('new-token');
      expect(useAuthStore.getState().user).toEqual({
        id: 'u1',
        email: 'alice@example.com',
        firstName: 'Alice',
        isOnboarded: true,
        profile: {
          intentDating: true,
          intentWorkout: false,
          intentFriends: true,
        },
      });
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('login', () => {
    it('persists token, seeds the profile cache, and updates the store on success', async () => {
      const user = createUser();
      mockAuthApi.login.mockResolvedValueOnce({
        data: { access_token: 'new-token', user },
      } as never);
      mockSetToken.mockResolvedValueOnce(undefined);

      await useAuthStore.getState().login({ email: 'a@b.com', password: 'pass' });

      expect(mockSetToken).toHaveBeenCalledWith('new-token');
      expect(mockQueryClientSetQueryData).toHaveBeenCalledWith(
        queryKeys.profile.current(),
        user,
      );
      expect(useAuthStore.getState().token).toBe('new-token');
      expect(useAuthStore.getState().user).toEqual({
        id: 'u1',
        email: 'alice@example.com',
        firstName: 'Alice',
        isOnboarded: true,
        profile: {
          intentDating: false,
          intentWorkout: true,
          intentFriends: false,
        },
      });
    });

    it('throws normalized error on API failure', async () => {
      const apiError = Object.assign(new Error('Unauthorized'), {
        response: { status: 401, data: { message: 'Invalid credentials' } },
        isAxiosError: true,
      });
      mockAuthApi.login.mockRejectedValueOnce(apiError);

      await expect(
        useAuthStore.getState().login({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toMatchObject({ isUnauthorized: true, message: 'Invalid credentials' });
    });
  });

  describe('loadToken', () => {
    it('sets isLoading false and clears state when no token is stored', async () => {
      mockGetToken.mockResolvedValueOnce(null);

      await useAuthStore.getState().loadToken();

      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
      expect(mockQueryClientSetQueryData).not.toHaveBeenCalled();
    });

    it('restores token, seeds the profile cache, and stores the session slice when stored token is valid', async () => {
      const user = createUser();
      mockGetToken.mockResolvedValueOnce('stored-token');
      mockAuthApi.me.mockResolvedValueOnce({ data: user } as never);

      await useAuthStore.getState().loadToken();

      expect(mockQueryClientSetQueryData).toHaveBeenCalledWith(
        queryKeys.profile.current(),
        user,
      );
      expect(useAuthStore.getState().token).toBe('stored-token');
      expect(useAuthStore.getState().user).toEqual({
        id: 'u1',
        email: 'alice@example.com',
        firstName: 'Alice',
        isOnboarded: true,
        profile: {
          intentDating: false,
          intentWorkout: true,
          intentFriends: false,
        },
      });
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('clears token and user when server returns 401', async () => {
      const axiosError = Object.assign(new Error('Unauthorized'), {
        response: { status: 401, data: { message: 'Token expired' } },
        isAxiosError: true,
      });
      mockGetToken.mockResolvedValueOnce('expired-token');
      mockAuthApi.me.mockRejectedValueOnce(axiosError);

      await useAuthStore.getState().loadToken();

      expect(mockDeleteToken).toHaveBeenCalled();
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('clears token and user when server returns 403', async () => {
      const axiosError = Object.assign(new Error('Forbidden'), {
        response: { status: 403, data: {} },
        isAxiosError: true,
      });
      mockGetToken.mockResolvedValueOnce('revoked-token');
      mockAuthApi.me.mockRejectedValueOnce(axiosError);

      await useAuthStore.getState().loadToken();

      expect(mockDeleteToken).toHaveBeenCalled();
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('keeps token on network error so the app can retry later', async () => {
      const networkError = Object.assign(new Error('Network Error'), {
        isAxiosError: true,
      });
      mockGetToken.mockResolvedValueOnce('valid-token');
      mockAuthApi.me.mockRejectedValueOnce(networkError);

      await useAuthStore.getState().loadToken();

      expect(mockDeleteToken).not.toHaveBeenCalled();
      expect(useAuthStore.getState().token).toBe('valid-token');
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('keeps token on timeout error', async () => {
      const timeoutError = Object.assign(new Error('timeout of 10000ms exceeded'), {
        isAxiosError: true,
        code: 'ECONNABORTED',
      });
      mockGetToken.mockResolvedValueOnce('valid-token');
      mockAuthApi.me.mockRejectedValueOnce(timeoutError);

      await useAuthStore.getState().loadToken();

      expect(mockDeleteToken).not.toHaveBeenCalled();
      expect(useAuthStore.getState().token).toBe('valid-token');
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('keeps token on 500 server error', async () => {
      const serverError = Object.assign(new Error('Internal Server Error'), {
        response: { status: 500, data: {} },
        isAxiosError: true,
      });
      mockGetToken.mockResolvedValueOnce('valid-token');
      mockAuthApi.me.mockRejectedValueOnce(serverError);

      await useAuthStore.getState().loadToken();

      expect(mockDeleteToken).not.toHaveBeenCalled();
      expect(useAuthStore.getState().token).toBe('valid-token');
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
