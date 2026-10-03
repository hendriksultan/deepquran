import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
const key = 'deepquran.token';
export async function readToken() {
  if (Platform.OS === 'web') return typeof window === 'undefined' ? null : window.sessionStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}
export async function saveToken(token: string | null) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') token ? window.sessionStorage.setItem(key, token) : window.sessionStorage.removeItem(key);
  } else if (token) await SecureStore.setItemAsync(key, token);
  else await SecureStore.deleteItemAsync(key);
}
