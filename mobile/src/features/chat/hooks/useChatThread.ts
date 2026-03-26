import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ChatMessage } from '../../../api/types';
import { matchesApi } from '../../../services/api';
import { connectMatchMessageStream } from '../../../services/matchRealtime';
import { beginOptimisticUpdate } from '../../../lib/query/optimisticUpdates';
import { queryKeys } from '../../../lib/query/queryKeys';
import { connectSocket, disconnectSocket, getSocket } from '../../../lib/socket';

type ConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';

const TYPING_DEBOUNCE_MS = 2000;
const REALTIME_MESSAGE_ID_WINDOW = 200;

function dedupeChatMessages(messages: ChatMessage[]) {
  const seenIds = new Set<string>();

  return messages.filter((message) => {
    if (seenIds.has(message.id)) {
      return false;
    }

    seenIds.add(message.id);
    return true;
  });
}

function reconcileSentMessage(
  current: ChatMessage[],
  message: ChatMessage,
  tempId?: string,
) {
  const next = current.filter(
    (item) => item.id !== tempId && item.id !== message.id,
  );
  const optimisticIndex = tempId
    ? current.findIndex((item) => item.id === tempId)
    : -1;

  if (optimisticIndex >= 0) {
    next.splice(optimisticIndex, 0, message);
    return dedupeChatMessages(next);
  }

  return dedupeChatMessages([message, ...next]);
}

function reconcileMessageList(
  current: ChatMessage[] | undefined,
  serverMessage: ChatMessage,
  tempId?: string,
) {
  const messages = current ?? [];

  let next = messages;

  if (tempId && messages.some((message) => message.id === tempId)) {
    next = messages.map((message) =>
      message.id === tempId ? serverMessage : message,
    );
  } else if (!messages.some((message) => message.id === serverMessage.id)) {
    next = [serverMessage, ...messages];
  }

  const seen = new Set<string>();
  return next.filter((message) => {
    if (seen.has(message.id)) {
      return false;
    }

    seen.add(message.id);
    return true;
  });
}

export function useChatThread(matchId: string) {
  const queryClient = useQueryClient();
  const messageKey = queryKeys.matches.messages(matchId);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeMatchRef = useRef<string | null>(null);
  const joinedMatchRef = useRef<string | null>(null);
  const joinPendingRef = useRef(false);
  const seenRealtimeMessageIdsRef = useRef<string[]>([]);
  const socketHandlersRef = useRef<{
    connect?: () => void;
    disconnect?: () => void;
    reconnect?: () => void;
    joined?: (data: { matchId: string }) => void;
    messageNew?: (data: { matchId: string; message: ChatMessage }) => void;
    typingStart?: (data: { matchId: string; userId: string }) => void;
    typingStop?: (data: { matchId: string; userId: string }) => void;
    connectError?: () => void;
  }>({});
  const isTypingEmittedRef = useRef(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [isTyping, setIsTyping] = useState(false);

  const query = useQuery({
    enabled: Boolean(matchId),
    queryKey: messageKey,
    queryFn: async () =>
      (await matchesApi.getMessages(matchId) as { data: ChatMessage[] | null }).data || [],
    staleTime: 0,
  });

  const refetchRef = useRef(query.refetch);
  refetchRef.current = query.refetch;

  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const clearTypingSession = useCallback(
    (emitStop: boolean) => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }

      if (emitStop && isTypingEmittedRef.current) {
        const socket = getSocket();
        if (socket?.connected) {
          socket.emit('typing:stop', { matchId });
        }
      }

      isTypingEmittedRef.current = false;
    },
    [matchId],
  );

  // Emit typing:start / typing:stop with debounce
  // Guard: only emit if socket has joined the match room
  const emitTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket?.connected || !matchId) return;
    if (joinedMatchRef.current !== matchId) return;

    if (!isTypingEmittedRef.current) {
      socket.emit('typing:start', { matchId });
      isTypingEmittedRef.current = true;
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      const currentSocket = getSocket();
      if (currentSocket?.connected) {
        currentSocket.emit('typing:stop', { matchId });
      }
      isTypingEmittedRef.current = false;
    }, TYPING_DEBOUNCE_MS);
  }, [matchId]);

  const stopTypingEmit = useCallback(() => {
    clearTypingSession(true);
  }, [clearTypingSession]);

  useEffect(() => {
    if (!matchId) return undefined;

    let cancelled = false;
    let fallbackStarted = false;
    let sseDisconnect: (() => void) | null = null;

    if (activeMatchRef.current !== matchId) {
      activeMatchRef.current = matchId;
      joinedMatchRef.current = null;
      joinPendingRef.current = false;
      seenRealtimeMessageIdsRef.current = [];
    }

    const stopPolling = () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };

    const startPolling = () => {
      if (!pollTimerRef.current) {
        pollTimerRef.current = setInterval(() => {
          void refetchRef.current();
        }, 5000);
      }
    };

    const clearTypingStateWithoutEmit = () => {
      clearTypingSession(false);
      setIsTyping(false);
    };

    const cleanupSocketListeners = (socket: ReturnType<typeof getSocket>) => {
      if (!socket) return;

      const handlers = socketHandlersRef.current;
      if (handlers.connect) socket.off('connect', handlers.connect);
      if (handlers.disconnect) socket.off('disconnect', handlers.disconnect);
      if (handlers.reconnect) socket.off('reconnect', handlers.reconnect);
      if (handlers.joined) socket.off('joined:match', handlers.joined);
      if (handlers.messageNew) socket.off('message:new', handlers.messageNew);
      if (handlers.typingStart) socket.off('typing:start', handlers.typingStart);
      if (handlers.typingStop) socket.off('typing:stop', handlers.typingStop);
      if (handlers.connectError) socket.off('connect_error', handlers.connectError);
    };

    const rememberRealtimeMessage = (messageId?: string) => {
      if (!messageId) return true;

      const seenIds = seenRealtimeMessageIdsRef.current;
      if (seenIds.includes(messageId)) {
        return false;
      }

      seenIds.push(messageId);
      if (seenIds.length > REALTIME_MESSAGE_ID_WINDOW) {
        seenIds.splice(0, seenIds.length - REALTIME_MESSAGE_ID_WINDOW);
      }

      return true;
    };

    const handleIncomingMessage = (data: { type?: 'message'; matchId: string; message: ChatMessage }) => {
      if (data.matchId !== matchId) return;
      if (!rememberRealtimeMessage(data.message.id)) return;

      setIsTyping(false);
      void refetchRef.current();
    };

    const requestJoin = (socket: { emit: (event: string, payload: { matchId: string }) => void }) => {
      if (joinedMatchRef.current === matchId || joinPendingRef.current) return;
      joinPendingRef.current = true;
      socket.emit('join:match', { matchId });
    };

    const handleJoinedMatch = (data: { matchId: string }) => {
      if (data.matchId !== matchId) return;

      joinedMatchRef.current = data.matchId;
      joinPendingRef.current = false;
      setConnectionStatus('connected');
      stopPolling();
      void refetchRef.current();
    };

    const fallbackToSSE = async () => {
      if (cancelled || fallbackStarted) return;
      fallbackStarted = true;
      setConnectionStatus('disconnected');

      try {
        const disconnect = await connectMatchMessageStream(matchId, {
          onStatus: (status) => {
            if (cancelled) return;
            if (status === 'connected') {
              setConnectionStatus('connected');
              stopPolling();
            } else if (status === 'connecting') {
              setConnectionStatus('connecting');
            } else {
              setConnectionStatus('disconnected');
              startPolling();
            }
          },
          onMessage: handleIncomingMessage,
          onError: () => {
            if (cancelled) return;
            setConnectionStatus('disconnected');
            startPolling();
          },
        });

        if (cancelled) {
          disconnect();
          return;
        }

        sseDisconnect = disconnect;
      } catch {
        if (!cancelled) {
          setConnectionStatus('disconnected');
          startPolling();
        }
      }
    };

    const setupWebSocket = async () => {
      try {
        setConnectionStatus('connecting');
        const socket = await connectSocket();
        if (cancelled) {
          socket.disconnect();
          return;
        }

        const handleConnect = () => {
          if (cancelled) return;
          setConnectionStatus('connected');
          requestJoin(socket);
        };

        const handleDisconnect = () => {
          if (cancelled) return;
          joinedMatchRef.current = null;
          joinPendingRef.current = false;
          setConnectionStatus('reconnecting');
          startPolling();
          clearTypingStateWithoutEmit();
        };

        const handleReconnect = () => {
          if (cancelled) return;
          setConnectionStatus('reconnecting');
          startPolling();
          requestJoin(socket);
        };

        const handleTypingStart = (data: { matchId: string; userId: string }) => {
          if (data.matchId !== matchId) return;
          setIsTyping(true);
        };

        const handleTypingStop = (data: { matchId: string; userId: string }) => {
          if (data.matchId !== matchId) return;
          setIsTyping(false);
        };

        const handleConnectError = () => {
          if (cancelled) return;
          joinedMatchRef.current = null;
          joinPendingRef.current = false;
          clearTypingStateWithoutEmit();
          cleanupSocketListeners(socket);
          disconnectSocket();
          void fallbackToSSE();
        };

        socketHandlersRef.current = {
          connect: handleConnect,
          disconnect: handleDisconnect,
          reconnect: handleReconnect,
          joined: handleJoinedMatch,
          messageNew: handleIncomingMessage,
          typingStart: handleTypingStart,
          typingStop: handleTypingStop,
          connectError: handleConnectError,
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('reconnect', handleReconnect);
        socket.on('joined:match', handleJoinedMatch);
        socket.on('message:new', handleIncomingMessage);
        socket.on('typing:start', handleTypingStart);
        socket.on('typing:stop', handleTypingStop);
        socket.on('connect_error', handleConnectError);

        if (socket.connected) {
          setConnectionStatus('connected');
          requestJoin(socket);
        }
      } catch {
        if (!cancelled) {
          void fallbackToSSE();
        }
      }
    };

    startPolling();
    void setupWebSocket();

    return () => {
      cancelled = true;
      stopPolling();
      stopTypingEmit();
      joinedMatchRef.current = null;
      joinPendingRef.current = false;
      activeMatchRef.current = null;

      const socket = getSocket();
      if (socket) {
        socket.emit('leave:match', { matchId });
        cleanupSocketListeners(socket);
        disconnectSocket();
      }

      socketHandlersRef.current = {};
      sseDisconnect?.();
    };
  }, [matchId, stopTypingEmit, clearTypingSession]);

  const sendMessage = useMutation({
    mutationFn: async (text: string) => {
      stopTypingEmit();
      return (await matchesApi.sendMessage(matchId, text) as { data: ChatMessage }).data;
    },
    onMutate: async (text) => {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const tempMessage: ChatMessage = {
        id: tempId,
        text,
        sender: 'me',
        timestamp: new Date().toISOString(),
      };

      const optimistic = await beginOptimisticUpdate(queryClient, [
        {
          queryKey: messageKey,
          exact: true,
          updater: (current) => [
            tempMessage,
            ...(Array.isArray(current) ? (current as ChatMessage[]) : []),
          ],
        },
      ]);

      return { rollback: optimistic.rollback, tempId };
    },
    onError: (_error, _text, context) => {
      context?.rollback?.();
    },
    onSuccess: (message, _text, context) => {
      queryClient.setQueryData<ChatMessage[]>(messageKey, (current) =>
        reconcileMessageList(current, message, context?.tempId),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: messageKey,
        refetchType: 'inactive',
      });
    },
  });

  return useMemo(
    () => ({
      messages: query.data || [],
      loading: query.isLoading,
      refreshing: query.isRefetching && !query.isLoading,
      error: query.error,
      connectionStatus,
      isTyping,
      refresh,
      sendMessage: sendMessage.mutateAsync,
      sending: sendMessage.isPending,
      emitTyping,
    }),
    [
      connectionStatus,
      isTyping,
      query.data,
      query.error,
      query.isLoading,
      query.isRefetching,
      refresh,
      sendMessage.isPending,
      sendMessage.mutateAsync,
      emitTyping,
    ],
  );
}
