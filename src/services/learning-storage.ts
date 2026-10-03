import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Small, device-local preferences; each participant has a separate key.
export async function readPreference<T>(userId: number, name: string): Promise<T | null> {
  const key = `deepquran.${userId}.${name}`;
  const value = Platform.OS === 'web'
    ? (typeof window === 'undefined' ? null : window.localStorage.getItem(key))
    : await SecureStore.getItemAsync(key);
  if (!value) return null;
  try { return JSON.parse(value) as T; } catch { return null; }
}
export async function writePreference(userId: number, name: string, value: unknown) {
  const key = `deepquran.${userId}.${name}`;
  const serialized = JSON.stringify(value);
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, serialized);
  } else await SecureStore.setItemAsync(key, serialized);
}
