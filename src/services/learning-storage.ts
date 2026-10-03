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
async function writeRaw(userId: number, name: string, value: unknown) {
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

// Serialize read/modify/write so a late server response cannot erase a new completion.
const pendingWrites = new Map<string, Promise<unknown>>();
function serialize<T>(key: string, action: () => Promise<T>): Promise<T> {
  const previous = pendingWrites.get(key) ?? Promise.resolve();
  const next = previous.catch(() => {}).then(action);
  pendingWrites.set(key, next);
  void next.finally(() => { if (pendingWrites.get(key) === next) pendingWrites.delete(key); }).catch(() => {});
  return next;
}
export function writePreference(userId: number, name: string, value: unknown) {
  return serialize(`${userId}.${name}`, () => writeRaw(userId, name, value));
}
export function mergeStudyCompletion(userId: number, ids: string[]): Promise<string[]> {
  return serialize(`${userId}.study`, async () => {
    const old = await readPreference<unknown>(userId, 'study');
    const existing = Array.isArray(old) ? old.filter((x): x is string => typeof x === 'string') : [];
    const merged = Array.from(new Set([...existing, ...ids]));
    await writeRaw(userId, 'study', merged);
    return merged;
  });
}
