import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const webStorage = isWeb ? globalThis.localStorage : undefined;

function safeLocalStorageGet(key: string) {
  return webStorage?.getItem(key) ?? null;
}

function safeLocalStorageSet(key: string, value: string) {
  webStorage?.setItem(key, value);
}

function safeLocalStorageRemove(key: string) {
  webStorage?.removeItem(key);
}

export const storage = {
  getItemAsync: (key: string) =>
    isWeb
      ? Promise.resolve(safeLocalStorageGet(key))
      : SecureStore.getItemAsync(key),

  setItemAsync: (key: string, value: string) =>
    isWeb
      ? Promise.resolve(safeLocalStorageSet(key, value))
      : SecureStore.setItemAsync(key, value),

  deleteItemAsync: (key: string) =>
    isWeb
      ? Promise.resolve(safeLocalStorageRemove(key))
      : SecureStore.deleteItemAsync(key),
};
