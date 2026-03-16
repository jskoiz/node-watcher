import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

/**
 * Only retry on network errors or 5xx server errors.
 * Never retry 4xx client errors (auth, validation, not-found).
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    // No response means network error -- retry
    if (!status) return true;
    // Only retry server errors
    return status >= 500;
  }

  return false;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: shouldRetry,
    },
    mutations: {
      retry: 0,
    },
  },
});
