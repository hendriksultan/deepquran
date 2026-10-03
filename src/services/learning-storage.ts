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
    if (typeof window === 'undefined') throw new Error('Penyimpanan perangkat belum tersedia.');
    window.localStorage.setItem(key, serialized);
  } else await SecureStore.setItemAsync(key, serialized);
  // Confirm durable storage before the UI reports completion.
  const saved = await readPreference<unknown>(userId, name);
  if (JSON.stringify(saved) !== serialized) throw new Error('Hasil penyimpanan belum dapat diverifikasi.');
}
