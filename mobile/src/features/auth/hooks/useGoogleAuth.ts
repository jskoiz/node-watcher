import { useState, useCallback } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import { env } from '../../../config/env';

const NOOP_RESULT = {
  signIn: async (): Promise<string | null> => null,
  isLoading: false,
  isReady: false,
} as const;

export function useGoogleAuth() {
  if (!env.googleClientId) {
    return NOOP_RESULT;
  }

  return useGoogleAuthImpl(env.googleClientId);
}

function useGoogleAuthImpl(clientId: string) {
  const [isLoading, setIsLoading] = useState(false);

  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: clientId,
    clientId,
  });

  const signIn = useCallback(async (): Promise<string | null> => {
    if (!promptAsync) {
      return null;
    }

    setIsLoading(true);
    try {
      const result = await promptAsync();
      if (result.type === 'success' && result.params.id_token) {
        return result.params.id_token;
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [promptAsync]);

  return { signIn, isLoading, isReady: !!request };
}
