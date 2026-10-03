import axios from 'axios';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { api, setToken, errorMessage, type User } from '../services/api';
import { readToken, saveToken } from '../services/session';
type Auth = { user: User | null; ready: boolean; startupError: string | null; restore: () => Promise<void>; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void> };
const Context = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);
  async function clear() { setToken(null); setUser(null); await saveToken(null); }
  async function restore() {
    setReady(false); setStartupError(null);
    try {
      const token = await readToken();
      setToken(token);
      if (token) setUser((await api.get('/me')).data.data);
    } catch (error) {
      if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) await clear();
      else setStartupError(errorMessage(error));
    } finally { setReady(true); }
  }
  useEffect(() => {
    const interceptor = api.interceptors.response.use(response => response, async error => {
      if ([401, 403].includes(error.response?.status) && error.config?.url !== '/login') {
        await clear();
      }
      return Promise.reject(error);
    });
    void restore();
    return () => api.interceptors.response.eject(interceptor);
  }, []);
  async function login(email: string, password: string) {
    if (!api.defaults.baseURL) throw new Error('EXPO_PUBLIC_API_URL belum diatur.');
    const data = (await api.post('/login', { email: email.trim(), password, device_name: `DeepQuran ${Platform.OS}` })).data.data;
    if (!data?.token || !data?.user) throw new Error('Respons login tidak valid.');
    try { await saveToken(data.token); } catch (error) {
      setToken(data.token);
      try { await api.post('/logout'); } catch { /* Token akan kedaluwarsa di server. */ }
      setToken(null); throw error;
    }
    setToken(data.token); setUser(data.user); setStartupError(null);
  }
  async function logout() {
    // Jika server gagal, sesi tetap dipertahankan agar token dapat dicabut saat dicoba lagi.
    await api.post('/logout'); await clear();
  }
  return <Context.Provider value={{ user, ready, startupError, restore, login, logout }}>{children}</Context.Provider>;
}
export function useAuth() { const value = useContext(Context); if (!value) throw new Error('AuthProvider diperlukan'); return value; }
