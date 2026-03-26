import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { env } from '../config/env';
import { STORAGE_KEYS } from '../constants/storage';

let socket: Socket | null = null;
let connectPromise: Promise<Socket> | null = null;
let activeToken: string | null = null;

async function getToken(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

function cleanupSocket(instance: Socket | null) {
  if (!instance) {
    return;
  }

  instance.removeAllListeners();
  instance.disconnect();
}

/**
 * Returns the current socket instance, or null if not connected.
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Connect to the backend /chat WebSocket namespace.
 * Uses the provided token, or reads from secure storage if omitted.
 * Auto-reconnects with exponential backoff.
 */
export async function connectSocket(token?: string): Promise<Socket> {
  // If there's an in-flight connection, only reuse it when the requested token
  // matches (or no specific token was requested). Otherwise tear down and reconnect
  // so we don't hand back a socket authenticated with the wrong user.
  if (connectPromise) {
    if (!token || token === activeToken) {
      return connectPromise;
    }
    // Different token requested — abandon in-flight promise and reconnect below.
    connectPromise = null;
  }

  if (socket && activeToken && (token ?? activeToken) === activeToken) {
    return socket;
  }

  // Acquire the lock immediately *before* the async getToken call so that a
  // second caller arriving while we await doesn't start a parallel connection.
  const pending = (async () => {
    const connectionToken = token ?? (await getToken(STORAGE_KEYS.accessToken));
    if (!connectionToken) {
      throw new Error('No auth token available for WebSocket connection');
    }

    if (socket) {
      cleanupSocket(socket);
      socket = null;
    }

    // Derive the WS base URL from the API URL (strip trailing /api if present)
    const baseUrl = env.apiUrl.replace(/\/api\/?$/, '');

    socket = io(`${baseUrl}/chat`, {
      auth: { token: connectionToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      randomizationFactor: 0.5,
      timeout: 10000,
    });
    activeToken = connectionToken;

    return socket;
  })();

  connectPromise = pending;

  try {
    return await pending;
  } finally {
    // Only clear if we're still the active promise (another call may have replaced us).
    if (connectPromise === pending) {
      connectPromise = null;
    }
  }
}

/**
 * Disconnect the socket and clean up.
 */
export function disconnectSocket(): void {
  connectPromise = null;
  if (socket) {
    cleanupSocket(socket);
    socket = null;
  }
  activeToken = null;
}
