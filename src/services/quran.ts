export type Surah = { nomor: number; nama: string; namaLatin: string; jumlahAyat: number; tempatTurun: string; arti: string };
export type Verse = { nomorAyat: number; teksArab: string; teksLatin: string; teksIndonesia: string };
export type SurahDetail = Surah & { ayat: Verse[] };
export type ReadingBookmark = { surah: number; name: string; verse: number };

// Separate public request: never attach the participant's Laravel bearer token.
export async function fetchQuran<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`https://equran.id/api/v2/surat${path}`, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Bacaan belum dapat dimuat. Silakan coba kembali.');
  const body = await response.json();
  if (body.code !== 200 || !body.data) throw new Error('Respons penyedia bacaan tidak valid.');
  const validSurah = (s: Surah) => s && Number.isInteger(s.nomor) && s.nomor >= 1 && s.nomor <= 114 && typeof s.nama === 'string' && typeof s.namaLatin === 'string' && typeof s.arti === 'string' && Number.isInteger(s.jumlahAyat) && s.jumlahAyat > 0;
  const valid = path === ''
    ? Array.isArray(body.data) && body.data.length > 0 && body.data.every(validSurah)
    : validSurah(body.data) && body.data.nomor === Number(path.slice(1)) && Array.isArray(body.data.ayat) && body.data.ayat.length === body.data.jumlahAyat && body.data.ayat.every((v: Verse, index: number) => v.nomorAyat === index + 1 && typeof v.teksArab === 'string' && typeof v.teksIndonesia === 'string');
  if (!valid) throw new Error('Data bacaan belum lengkap. Silakan coba kembali.');
  return body.data as T;
}
