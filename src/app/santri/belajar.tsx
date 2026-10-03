import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { syncStudyProgress } from '../../services/learning-sync';
import { useArabicFont } from '../../hooks/use-arabic-font';
import { Text, TouchableOpacity, View } from 'react-native';
import { ModuleScreen, ui } from '../../components/santri/ModuleScreen';
import ParticipantIcon from '../../components/santri/ParticipantIcon';
import { studyPrograms, type Lesson } from '../../data/self-study';
import { useAuth } from '../../context/AuthContext';
import { mergeStudyCompletion, readPreference, writePreference } from '../../services/learning-storage';

export default function SelfStudy() {
  const { user } = useAuth();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [serverSaved, setServerSaved] = useState(false);
  const syncController = useRef<AbortController | null>(null);
  const arabic = useArabicFont();
  const generation = useRef(0);
  const [program, setProgram] = useState(studyPrograms[0].id);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const loadProgress = useCallback(async () => {
    const request = ++generation.current;
    syncController.current?.abort();
    const controller = new AbortController(); syncController.current = controller;
    setServerSaved(false);
    setReady(false); setStorageReady(false); setError('');
    if (!user) return;
    try {
      const [value, savedProgram] = await Promise.all([
        readPreference<unknown>(user.id, 'study'),
        readPreference<string>(user.id, 'study-program'),
      ]);
      if (request !== generation.current) return;
      setCompleted(Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string' && studyPrograms.some(p => p.lessons.some(l => l.id === x))) : []);
      if (studyPrograms.some(p => p.id === savedProgram)) setProgram(savedProgram!);
      setStorageReady(true); setReady(true); setSyncing(true);
      try {
        const result = await syncStudyProgress(user.id, controller.signal);
        if (request !== generation.current) return;
        setCompleted(result.completed); setServerSaved(true);
        if (!savedProgram) {
          const suggested: Record<string, string> = { iqra: 'iqro', bahasa: 'arab', tahsin: 'tahsin' };
          if (result.studentProgram && suggested[result.studentProgram]) setProgram(suggested[result.studentProgram]);
        }
      } catch { if (request === generation.current && !controller.signal.aborted) setError('Progres perangkat tetap tersedia. Sinkronisasi server belum berhasil; coba muat ulang.'); }
      finally { if (request === generation.current) setSyncing(false); }
    } catch { if (request === generation.current) { setError('Progres tersimpan belum dapat dibaca. Muat ulang sebelum melanjutkan.'); setReady(true); } }
  }, [user?.id]);
  useFocusEffect(useCallback(() => {
    setLesson(null); setChoice(null);
    void loadProgress();
    return () => { generation.current++; syncController.current?.abort(); };
  }, [loadProgress]));
  async function chooseProgram(id: string) {
    setProgram(id);
    if (user) try { await writePreference(user.id, 'study-program', id); }
    catch { setError('Pilihan program belum berhasil disimpan.'); }
  }
  const current = studyPrograms.find(p => p.id === program)!;
  async function finish() {
    if (!user || !lesson || choice !== lesson.answer || saving || !storageReady) return;
    setSaving(true); setError('');
    try {
      const saved = await mergeStudyCompletion(user.id, [lesson.id]); setCompleted(saved); setServerSaved(false);
      try {
        const result = await syncStudyProgress(user.id, syncController.current?.signal);
        setCompleted(result.completed); setServerSaved(true);
      } catch { setError('Latihan tersimpan di perangkat. Sinkronisasi server belum berhasil; muat ulang untuk mencoba kembali.'); }
    }
    catch { setError('Progres belum berhasil disimpan. Coba kembali.'); }
    finally { setSaving(false); }
  }
  return <ModuleScreen title="Belajar Mandiri" subtitle="Latihan pendamping kelas. Pilih program dan materi sesuai arahan pengajar." loading={!ready || arabic.loading} error="" reload={loadProgress} refreshable={false}>
    {error ? <View style={ui.card}><Text accessibilityRole="alert" style={{ color: '#a32920' }}>{error}</Text><TouchableOpacity accessibilityRole="button" onPress={() => void loadProgress()}><Text style={ui.label}>Muat ulang progres</Text></TouchableOpacity></View> : null}
    <TouchableOpacity accessibilityRole="button" style={ui.card} onPress={() => router.push('/santri/materi')}><Text style={ui.title}>Materi dari pengajar</Text><Text style={ui.text}>Video, dokumen, dan audio untuk kelas Anda ›</Text></TouchableOpacity>
    <Text style={ui.label}>{syncing ? 'Menyinkronkan progres…' : serverSaved ? 'Progres tersinkron ke server' : 'Progres tersimpan di perangkat'}</Text>
    {arabic.error ? <Text style={ui.text}>Font Arab belum dimuat; menggunakan font perangkat.</Text> : null}
    <View style={[ui.card, { backgroundColor: '#edf5ef' }]}><Text style={ui.label}>Progres {current.title}</Text><Text accessibilityLiveRegion="polite" style={ui.title}>{storageReady ? `${current.lessons.filter(l => completed.includes(l.id)).length} dari ${current.lessons.length} latihan selesai` : 'Progres belum dapat dimuat'}</Text><View style={{ height: 6, borderRadius: 3, backgroundColor: '#dbe7df', overflow: 'hidden' }}><View style={{ height: 6, backgroundColor: '#17654f', width: `${current.lessons.filter(l => completed.includes(l.id)).length / current.lessons.length * 100}%` }} /></View></View>
    {lesson ? <>
      <TouchableOpacity accessibilityRole="button" onPress={() => { setLesson(null); setChoice(null); }}><Text style={ui.label}>‹ Daftar materi</Text></TouchableOpacity>
      <View style={ui.card}><Text style={ui.label}>{current.title} · {lesson.level}</Text><Text style={ui.title}>{lesson.title}</Text><Text style={ui.text}>{lesson.explanation}</Text></View>
      {lesson.examples.map(example => <View style={[ui.card, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]} key={example.arabic}><Text style={[ui.text, { flex: 1 }]}>{example.meaning}</Text><Text accessibilityLanguage="ar" style={{ fontFamily: arabic.fontFamily, fontSize: 36, lineHeight: 72, includeFontPadding: true, color: '#173d2d', textAlign: 'right', writingDirection: 'rtl' }}>{example.arabic}</Text></View>)}
      <View style={ui.card}><Text style={ui.title}>Coba ingat kembali</Text><Text style={ui.text}>{lesson.question}</Text>
        {lesson.options.map((option, index) => <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: choice === index }} key={option} onPress={() => setChoice(index)} style={{ padding: 16, minHeight: 52, borderRadius: 12, borderWidth: 1, borderColor: choice === index ? '#17654f' : '#e3ebe5', backgroundColor: choice === index ? '#edf5ef' : '#fff' }}><Text style={{ fontFamily: /[\u0600-\u06ff]/.test(option) ? arabic.fontFamily : undefined, fontSize: /[\u0600-\u06ff]/.test(option) ? 28 : 18, lineHeight: /[\u0600-\u06ff]/.test(option) ? 48 : 26, color: '#213d31', textAlign: 'center' }}>{option}</Text></TouchableOpacity>)}
        {choice !== null ? <Text accessibilityLiveRegion="polite" style={ui.text}>{choice === lesson.answer ? `Benar. ${lesson.feedback}` : 'Belum tepat. Perhatikan contoh, lalu coba lagi.'}</Text> : null}
        {choice === lesson.answer ? <TouchableOpacity accessibilityRole="button" disabled={saving || !storageReady || completed.includes(lesson.id)} onPress={() => void finish()} style={[ui.button, completed.includes(lesson.id) && { backgroundColor: '#6b8574' }]}><Text style={ui.buttonText}>{completed.includes(lesson.id) ? 'Tersimpan · Latihan selesai' : saving ? 'Menyimpan…' : 'Simpan latihan selesai'}</Text></TouchableOpacity> : null}
        {completed.includes(lesson.id) ? <><Text accessibilityLiveRegion="polite" style={ui.label}>{serverSaved ? 'Progres tersimpan di server.' : 'Progres tersimpan di perangkat ini.'}</Text><TouchableOpacity accessibilityRole="button" onPress={() => { setLesson(null); setChoice(null); }} style={ui.button}><Text style={ui.buttonText}>Kembali ke daftar materi</Text></TouchableOpacity></> : null}
      </View>
    </> : <>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{studyPrograms.map(p => <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: p.id === program }} onPress={() => void chooseProgram(p.id)} key={p.id} style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: p.id === program ? '#17654f' : '#e8efea' }}><Text style={{ color: p.id === program ? '#fff' : '#365946', fontWeight: '700' }}>{p.title}</Text></TouchableOpacity>)}</View>
      <View style={[ui.card, { backgroundColor: '#edf5ef' }]}><Text style={ui.title}>{current.title}</Text><Text style={ui.text}>{current.description}</Text></View>
      {current.lessons.map((item, index) => <TouchableOpacity accessibilityRole="button" key={item.id} onPress={() => { setLesson(item); setChoice(null); }} style={[ui.card, { flexDirection: 'row', alignItems: 'center', gap: 14 }]}><View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#edf5ef', justifyContent: 'center', alignItems: 'center' }}>{completed.includes(item.id) ? <ParticipantIcon name="check" /> : <Text style={ui.label}>{index + 1}</Text>}</View><View style={{ flex: 1, gap: 4 }}><Text style={ui.title}>{item.title}</Text><Text style={ui.text}>{item.level} · {completed.includes(item.id) ? 'Selesai' : 'Mulai latihan'}</Text></View><ParticipantIcon name="arrow" size={18} /></TouchableOpacity>)}
      <Text style={[ui.text, { fontSize: 12 }]}>Materi awal ini merupakan latihan tambahan, bukan salinan buku Iqro atau penetapan level peserta. Progres latihan disinkronkan ke server saat koneksi tersedia; latihan tambahan ini tidak mengubah level resmi peserta.</Text>
    </>}
  </ModuleScreen>;
}
