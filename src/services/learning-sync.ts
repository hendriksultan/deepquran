import { api } from './api';
import { studyPrograms } from '../data/self-study';
import { mergeStudyCompletion, readPreference, writePreference } from './learning-storage';
import type { ReadingBookmark } from './quran';

export type LearningMaterial = { id: number; title: string; description: string; type: string; teacher_name: string | null; group_name: string | null; completed: boolean; file_url: string | null; video_url: string | null };
const known = new Set(studyPrograms.flatMap(p => p.lessons.map(l => l.id)));
function validIds(value: unknown): string[] { return Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string' && known.has(x)) : []; }
export async function syncStudyProgress(userId: number, signal?: AbortSignal) {
  const remote = (await api.get('/learning/progress', { signal })).data.data;
  const local = validIds(await readPreference(userId, 'study'));
  const server = validIds(remote?.completed);
  const merged = Array.from(new Set([...server, ...local]));
  if (local.some(id => !server.includes(id))) await api.post('/learning/progress', { lesson_ids: merged }, { signal });
  if (signal?.aborted) throw new Error('Sinkronisasi dibatalkan.');
  const saved = await mergeStudyCompletion(userId, merged);
  const validSaved = validIds(saved);
  if (validSaved.some(id => !merged.includes(id))) await api.post('/learning/progress', { lesson_ids: validSaved }, { signal });
  return { completed: validSaved, studentProgram: remote?.student_program as string | null };
}
function validBookmark(value: ReadingBookmark | null): value is ReadingBookmark {
  return !!value && Number.isInteger(value.surah) && value.surah >= 1 && value.surah <= 114 && Number.isInteger(value.verse) && value.verse >= 1 && value.verse <= 286 && typeof value.name === 'string';
}
async function uploadBookmark(userId: number, value: ReadingBookmark, signal?: AbortSignal) {
  await api.post('/quran/bookmark', { surat_nomor: value.surah, ayat_nomor: value.verse }, { signal });
  const pending = await readPreference<ReadingBookmark>(userId, 'reading-pending');
  if (pending?.surah === value.surah && pending.verse === value.verse) await writePreference(userId, 'reading-pending', null);
}
export async function saveServerBookmark(userId: number, value: ReadingBookmark) {
  await writePreference(userId, 'reading', value);
  await writePreference(userId, 'reading-pending', value);
  await uploadBookmark(userId, value);
}
export async function syncReadingBookmark(userId: number, signal?: AbortSignal): Promise<ReadingBookmark | null> {
  const server = (await api.get('/quran/bookmark', { signal })).data.data;
  const pending = await readPreference<ReadingBookmark>(userId, 'reading-pending');
  const local = await readPreference<ReadingBookmark>(userId, 'reading');
  if (validBookmark(pending)) { await uploadBookmark(userId, pending, signal); return pending; }
  if (server && Number.isInteger(server.surat_nomor) && Number.isInteger(server.ayat_nomor)) {
    const value = { surah: server.surat_nomor, verse: server.ayat_nomor, name: local?.surah === server.surat_nomor ? local!.name : `Surah ${server.surat_nomor}` };
    if (!validBookmark(value)) throw new Error('Penanda server tidak valid.');
    if (signal?.aborted) throw new Error('Sinkronisasi dibatalkan.');
    await writePreference(userId, 'reading', value); return value;
  }
  if (validBookmark(local)) { await uploadBookmark(userId, local, signal); return local; }
  return null;
}
