import { STORAGE_KEYS } from '../constants/storage';
import { storage } from './storage';

export async function getToken(): Promise<string | null> {
  return storage.getItemAsync(STORAGE_KEYS.accessToken);
}

export async function setToken(token: string): Promise<void> {
  await storage.setItemAsync(STORAGE_KEYS.accessToken, token);
}

export async function deleteToken(): Promise<void> {
  await storage.deleteItemAsync(STORAGE_KEYS.accessToken);
}
