import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchQuran } from '../services/quran';
export function useQuran<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const active = useRef<AbortController | null>(null);
  const reload = useCallback(async () => {
    active.current?.abort();
    const controller = new AbortController(); active.current = controller;
    setLoading(true); setError(''); setData(null);
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const result = await fetchQuran<T>(path, controller.signal);
      if (active.current === controller && !controller.signal.aborted) setData(result);
    } catch (e) {
      if (active.current === controller) setError(controller.signal.aborted ? 'Koneksi bacaan terputus atau terlalu lama. Coba kembali.' : e instanceof Error ? e.message : 'Bacaan belum dapat dimuat.');
    } finally {
      clearTimeout(timer);
      if (active.current === controller) setLoading(false);
    }
  }, [path]);
  useEffect(() => { void reload(); return () => { const old = active.current; active.current = null; old?.abort(); }; }, [reload]);
  return { data, loading, error, reload };
}
