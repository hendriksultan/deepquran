import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { api, errorMessage } from '../services/api';

export type ApiPage<T> = { data: T[]; current_page: number; last_page: number; total: number };

export function useParticipantResource<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const active = useRef<AbortController | null>(null);
  const reload = useCallback(async () => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setLoading(true); setError('');
    try {
      const response = await api.get(path, { signal: controller.signal });
      if (!controller.signal.aborted) setData(response.data.data);
    } catch (e) {
      if (!controller.signal.aborted) setError(errorMessage(e));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [path]);
  useFocusEffect(useCallback(() => {
    setData(null);
    void reload();
    return () => active.current?.abort();
  }, [reload]));
  return { data, loading, error, reload };
}
