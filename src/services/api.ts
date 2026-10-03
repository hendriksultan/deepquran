import axios from 'axios';

if (__DEV__) console.log('Alamat API:', process.env.EXPO_PUBLIC_API_URL);

// Axios tetap menangani JSON, token, dan interceptor. Pengiriman memakai fetch langsung.
// Log hanya metadata request: tidak mencetak email, password, token, atau isi respons.
const directFetchAdapter: import('axios').AxiosAdapter = async config => {
  const started = Date.now();
  const url = axios.getUri(config);
  const controller = new AbortController();
  let stage = 'menghubungi server';
  let timedOut = false;
  let cancelledByCaller = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cancel = () => { cancelledByCaller = true; controller.abort(); };
  config.signal?.addEventListener?.('abort', cancel);
  config.cancelToken?.subscribe(cancel);
  if (config.signal?.aborted) cancel();
  if (config.timeout && config.timeout > 0) {
    timer = setTimeout(() => { timedOut = true; controller.abort(); }, config.timeout);
  }
  const method = (config.method || 'get').toUpperCase();
  const headers = axios.AxiosHeaders.from(config.headers);
  const isForm = typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (isForm) headers.delete('Content-Type'); // fetch menetapkan boundary multipart.
  if (__DEV__) console.log('API mulai:', { method, url });
  try {
    const response = await fetch(url, {
      method,
      headers: headers.toJSON() as Record<string, string>,
      body: method === 'GET' || method === 'HEAD' ? undefined : config.data,
      signal: controller.signal,
      credentials: config.withCredentials ? 'include' : 'omit',
    });
    stage = 'membaca respons';
    if (__DEV__) console.log('API HTTP:', { method, url, status: response.status, elapsed_ms: Date.now() - started });
    const data = config.responseType === 'arraybuffer' ? await response.arrayBuffer()
      : config.responseType === 'blob' ? await response.blob() : await response.text();
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => { responseHeaders[key] = value; });
    const result: import('axios').AxiosResponse = {
      data, status: response.status, statusText: response.statusText,
      headers: responseHeaders, config,
    };
    if (!config.validateStatus || config.validateStatus(result.status)) return result;
    throw new axios.AxiosError(`HTTP ${result.status}`,
      result.status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST', config, undefined, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (__DEV__) console.log('API gagal:', {
      method, url, stage, elapsed_ms: Date.now() - started,
      timed_out: timedOut, cancelled_by_caller: cancelledByCaller,
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
      message,
    });
    if (timedOut) throw new axios.AxiosError('Batas waktu request habis.', 'ETIMEDOUT', config);
    if (cancelledByCaller) throw new axios.CanceledError('Permintaan dibatalkan.', config);
    if (axios.isAxiosError(error)) throw error;
    // Pembatalan internal Expo berbeda dengan pembatalan oleh layar/timeout aplikasi.
    const code = /cancel|abort/i.test(message) ? 'ERR_NATIVE_FETCH_CANCELLED' : 'ERR_NETWORK';
    throw new axios.AxiosError(message, code, config);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    config.signal?.removeEventListener?.('abort', cancel);
    config.cancelToken?.unsubscribe(cancel);
  }
};

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, ''),
  adapter: directFetchAdapter,
  timeout: 60000,
  headers: { Accept: 'application/json' },
});

export function setToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return 'Server belum merespons dalam 15 detik. Silakan coba kembali.';
    }
    if (error.code === 'ERR_NATIVE_FETCH_CANCELLED') return 'Koneksi dibatalkan oleh lapisan jaringan Expo. Periksa log API gagal di terminal.';
    if (axios.isCancel(error)) return 'Permintaan dibatalkan. Silakan coba kembali.';
    if (!error.response) return 'Server tidak dapat dihubungi. Periksa koneksi dan alamat API.';
    if (error.response.status === 429) return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba kembali.';
    const data = error.response.data;
    const first = data?.errors && Object.values(data.errors)[0];
    return Array.isArray(first) ? String(first[0]) : data?.message || 'Permintaan gagal. Silakan coba kembali.';
  }
  return error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba kembali.';
}
export type User = { id: number; name: string; email: string };
export type Schedule = { id: number; title: string; start: string; end: string; meeting_link: string | null };
export type Dashboard = { user: User; kelas_aktif: number; total_hadir: number; infaq_belum_lunas: string | number; jadwal_terdekat: Schedule[] };
