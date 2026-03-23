import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, variant?: ToastVariant, duration?: number) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

let nextId = 0;

const DEFAULT_DURATION_MS = 3000;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  show: (message, variant = 'info', duration = DEFAULT_DURATION_MS) => {
    const id = String(++nextId);
    set((state) => ({
      toasts: [...state.toasts, { id, message, variant, duration }],
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
) => useToastStore.getState().show(message, variant, duration);
