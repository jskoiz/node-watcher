import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  dedupeKey?: string;
  dedupeWindowMs?: number;
}

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  dedupeKey?: string;
}

interface ToastState {
  toasts: Toast[];
  show: (
    message: string,
    variant?: ToastVariant,
    duration?: number,
    options?: ToastOptions,
  ) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

let nextId = 0;

const DEFAULT_DURATION_MS = 3000;
const DEFAULT_DEDUPE_WINDOW_MS = 4000;
const recentToastTimes = new Map<string, number>();

export function resetToastStateForTests(): void {
  recentToastTimes.clear();
  nextId = 0;
  useToastStore.setState({ toasts: [] });
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  show: (
    message,
    variant = 'info',
    duration = DEFAULT_DURATION_MS,
    options,
  ) => {
    const dedupeKey = options?.dedupeKey;
    const dedupeWindowMs =
      options?.dedupeWindowMs ?? DEFAULT_DEDUPE_WINDOW_MS;
    const now = Date.now();

    if (dedupeKey) {
      const lastShownAt = recentToastTimes.get(dedupeKey);
      if (
        typeof lastShownAt === 'number' &&
        now - lastShownAt < dedupeWindowMs
      ) {
        return;
      }

      recentToastTimes.set(dedupeKey, now);
    }

    const id = String(++nextId);
    set((state) => ({
      toasts: [...state.toasts, { id, message, variant, duration, dedupeKey }],
    }));
  },

  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  dismissAll: () => {
    set({ toasts: [] });
  },
}));

/** Convenience helpers that can be called from non-component code (e.g. interceptors). */
export const showToast = (
  message: string,
  variant?: ToastVariant,
  duration?: number,
  options?: ToastOptions,
) => useToastStore.getState().show(message, variant, duration, options);
