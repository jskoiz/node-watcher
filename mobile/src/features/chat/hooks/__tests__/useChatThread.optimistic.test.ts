import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ChatMessage } from '../../../../api/types';
import { createQueryTestHarness } from '../../../../lib/testing/queryTestHarness';
import { queryKeys } from '../../../../lib/query/queryKeys';
import { useChatThread } from '../useChatThread';

const mockGetMessages = jest.fn();
const mockSendMessage = jest.fn();

jest.mock('../../../../services/api', () => ({
  matchesApi: {
    getMessages: (...args: unknown[]) => mockGetMessages(...args),
    sendMessage: (...args: unknown[]) => mockSendMessage(...args),
  },
}));

const mockConnectMatchMessageStream = jest.fn().mockResolvedValue(() => {});

jest.mock('../../../../services/matchRealtime', () => ({
  connectMatchMessageStream: (...args: unknown[]) => mockConnectMatchMessageStream(...args),
}));

const mockSocket = {
  connected: true,
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
};

const mockConnectSocket = jest.fn();
const mockGetSocket = jest.fn();

jest.mock('../../../../lib/socket', () => ({
  connectSocket: (...args: unknown[]) => mockConnectSocket(...args),
  getSocket: () => mockGetSocket(),
  disconnectSocket: jest.fn(),
}));

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe('useChatThread optimistic updates', () => {
  const matchId = 'match-1';
  const messageKey = queryKeys.matches.messages(matchId);

  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectSocket.mockResolvedValue(mockSocket);
    mockGetSocket.mockReturnValue(mockSocket);
    mockSocket.connected = true;
  });

  it('inserts and reconciles an optimistic message without refetching the thread', async () => {
    const initialMessages: ChatMessage[] = [
      {
        id: 'msg-old',
        text: 'previous',
        sender: 'them',
        timestamp: '2026-03-17T00:00:00Z',
      },
    ];
    const serverMessage: ChatMessage = {
      id: 'msg-1',
      text: 'hello',
      sender: 'me',
      timestamp: '2026-03-17T00:01:00Z',
    };
    const sendDeferred = createDeferred<{ data: ChatMessage }>();

    mockGetMessages.mockResolvedValue({ data: initialMessages });
    mockSendMessage.mockReturnValueOnce(sendDeferred.promise);

    const { queryClient, wrapper } = createQueryTestHarness();
    queryClient.setQueryData(messageKey, initialMessages);

    const { result, unmount } = renderHook(() => useChatThread(matchId), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(mockConnectSocket).toHaveBeenCalled());

    const sendPromise = result.current.sendMessage('hello');

    await waitFor(() => {
      const messages = queryClient.getQueryData<ChatMessage[]>(messageKey);
      expect(messages?.[0].text).toBe('hello');
      expect(messages?.[0].sender).toBe('me');
      expect(messages?.[0].id).toMatch(/^temp-/);
    });

    await act(async () => {
      sendDeferred.resolve({ data: serverMessage });
      await sendPromise;
    });

    expect(queryClient.getQueryData<ChatMessage[]>(messageKey)).toEqual([
      serverMessage,
      ...initialMessages,
    ]);
    expect(mockGetMessages).toHaveBeenCalledTimes(1);

    unmount();
  });

  it('rolls back the optimistic message when sending fails', async () => {
    const initialMessages: ChatMessage[] = [
      {
        id: 'msg-old',
        text: 'previous',
        sender: 'them',
        timestamp: '2026-03-17T00:00:00Z',
      },
    ];
    const sendDeferred = createDeferred<{ data: ChatMessage }>();

    mockGetMessages.mockResolvedValue({ data: initialMessages });
    mockSendMessage.mockReturnValueOnce(sendDeferred.promise);

    const { queryClient, wrapper } = createQueryTestHarness();
    queryClient.setQueryData(messageKey, initialMessages);

    const { result, unmount } = renderHook(() => useChatThread(matchId), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(mockConnectSocket).toHaveBeenCalled());

    const sendPromise = result.current.sendMessage('hello');

    await waitFor(() => {
      const messages = queryClient.getQueryData<ChatMessage[]>(messageKey);
      expect(messages?.[0].text).toBe('hello');
      expect(messages?.[0].id).toMatch(/^temp-/);
    });

    await act(async () => {
      sendDeferred.reject(new Error('Send failed'));
      await expect(sendPromise).rejects.toThrow('Send failed');
    });

    await waitFor(() => {
      expect(queryClient.getQueryData<ChatMessage[]>(messageKey)).toEqual(initialMessages);
    });

    unmount();
  });

  it('does not duplicate the server message if the optimistic temp entry disappears first', async () => {
    const initialMessages: ChatMessage[] = [
      {
        id: 'msg-old',
        text: 'previous',
        sender: 'them',
        timestamp: '2026-03-17T00:00:00Z',
      },
    ];
    const serverMessage: ChatMessage = {
      id: 'msg-1',
      text: 'hello',
      sender: 'me',
      timestamp: '2026-03-17T00:01:00Z',
    };
    const sendDeferred = createDeferred<{ data: ChatMessage }>();

    mockGetMessages.mockResolvedValue({ data: initialMessages });
    mockSendMessage.mockReturnValueOnce(sendDeferred.promise);

    const { queryClient, wrapper } = createQueryTestHarness();
    queryClient.setQueryData(messageKey, initialMessages);

    const { result, unmount } = renderHook(() => useChatThread(matchId), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(mockConnectSocket).toHaveBeenCalled());

    const sendPromise = result.current.sendMessage('hello');

    await waitFor(() => {
      const messages = queryClient.getQueryData<ChatMessage[]>(messageKey);
      expect(messages?.[0].id).toMatch(/^temp-/);
    });

    queryClient.setQueryData<ChatMessage[]>(messageKey, initialMessages);

    await act(async () => {
      sendDeferred.resolve({ data: serverMessage });
      await sendPromise;
    });

    expect(queryClient.getQueryData<ChatMessage[]>(messageKey)).toEqual([
      serverMessage,
      ...initialMessages,
    ]);

    unmount();
  });
});
