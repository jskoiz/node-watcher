import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SessionIntent = 'dating' | 'workout' | 'both';

interface IntentState {
  sessionIntent: SessionIntent;
  hydrated: boolean;
  setIntent: (intent: SessionIntent) => Promise<void>;
  loadIntent: () => Promise<void>;
}

const INTENT_KEY = 'brdg_session_intent';

export const useIntentStore = create<IntentState>((set) => ({
  sessionIntent: 'both',
  hydrated: false,

  setIntent: async (intent: SessionIntent) => {
    set({ sessionIntent: intent });
    try {
      await AsyncStorage.setItem(INTENT_KEY, intent);
    } catch {
      // silently fail
    }
  },

  loadIntent: async () => {
    try {
      const stored = await AsyncStorage.getItem(INTENT_KEY);
      if (stored === 'dating' || stored === 'workout' || stored === 'both') {
        set({ sessionIntent: stored, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },
}));
