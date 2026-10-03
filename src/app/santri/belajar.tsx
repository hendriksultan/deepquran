import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ModuleScreen, ui } from '../../components/santri/ModuleScreen';
import ParticipantIcon from '../../components/santri/ParticipantIcon';
import { studyPrograms, type Lesson } from '../../data/self-study';
import { useAuth } from '../../context/AuthContext';
import { readPreference, writePreference } from '../../services/learning-storage';

export default function SelfStudy() {
  const { user } = useAuth();
  const [program, setProgram] = useState(studyPrograms[0].id);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let alive = true; setReady(false);
    if (user) void readPreference<unknown>(user.id, 'study').then(value => {
      if (alive) setCompleted(Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string' && studyPrograms.some(p => p.lessons.some(l => l.id === x))) : []);
    }).catch(() => { if (alive) setError('Progres tersimpan belum dapat dibaca.'); }).finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, [user?.id]);
  const current = studyPrograms.find(p => p.id === program)!;
  async function finish() {
    if (!user || !lesson || choice !== lesson.answer || saving) return;
    setSaving(true); setError('');
    const next = Array.from(new Set([...completed, lesson.id]));
    try { await writePreference(user.id, 'study', next); setCompleted(next); }
    catch { setError('Progres belum berhasil disimpan. Coba kembali.'); }
    finally { setSaving(false); }
  }
  return <ModuleScreen title="Belajar Mandiri" subtitle="Latihan pendamping kelas. Pilih program dan materi sesuai arahan pengajar." loading={!ready} error="" reload={async () => {}} refreshable={false}>
    {error ? <Text accessibilityRole="alert" style={{ color: '#a32920' }}>{error}</Text> : null}
    {lesson ? <>
      <TouchableOpacity accessibilityRole="button" onPress={() => { setLesson(null); setChoice(null); }}><Text style={ui.label}>‹ Daftar materi</Text></TouchableOpacity>
      <View style={ui.card}><Text style={ui.label}>{current.title} · {lesson.level}</Text><Text style={ui.title}>{lesson.title}</Text><Text style={ui.text}>{lesson.explanation}</Text></View>
      {lesson.examples.map(example => <View style={[ui.card, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]} key={example.arabic}><Text style={[ui.text, { flex: 1 }]}>{example.meaning}</Text><Text accessibilityLanguage="ar" style={{ fontSize: 36, lineHeight: 60, color: '#173d2d', textAlign: 'right', writingDirection: 'rtl' }}>{example.arabic}</Text></View>)}
      <View style={ui.card}><Text style={ui.title}>Coba ingat kembali</Text><Text style={ui.text}>{lesson.question}</Text>
        {lesson.options.map((option, index) => <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: choice === index }} key={option} onPress={() => setChoice(index)} style={{ padding: 16, minHeight: 52, borderRadius: 12, borderWidth: 1, borderColor: choice === index ? '#17654f' : '#e3ebe5', backgroundColor: choice === index ? '#edf5ef' : '#fff' }}><Text style={{ fontSize: 18, color: '#213d31', textAlign: 'center' }}>{option}</Text></TouchableOpacity>)}
        {choice !== null ? <Text accessibilityLiveRegion="polite" style={ui.text}>{choice === lesson.answer ? `Benar. ${lesson.feedback}` : 'Belum tepat. Perhatikan contoh, lalu coba lagi.'}</Text> : null}
        {choice === lesson.answer ? <TouchableOpacity accessibilityRole="button" disabled={saving || completed.includes(lesson.id)} onPress={() => void finish()} style={[ui.button, completed.includes(lesson.id) && { backgroundColor: '#6b8574' }]}><Text style={ui.buttonText}>{completed.includes(lesson.id) ? 'Latihan selesai' : saving ? 'Menyimpan…' : 'Simpan latihan selesai'}</Text></TouchableOpacity> : null}
      </View>
    </> : <>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{studyPrograms.map(p => <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: p.id === program }} onPress={() => setProgram(p.id)} key={p.id} style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: p.id === program ? '#17654f' : '#e8efea' }}><Text style={{ color: p.id === program ? '#fff' : '#365946', fontWeight: '700' }}>{p.title}</Text></TouchableOpacity>)}</View>
      <View style={[ui.card, { backgroundColor: '#edf5ef' }]}><Text style={ui.title}>{current.title}</Text><Text style={ui.text}>{current.description}</Text><Text style={ui.label}>{current.lessons.filter(l => completed.includes(l.id)).length} dari {current.lessons.length} latihan selesai</Text></View>
      {current.lessons.map((item, index) => <TouchableOpacity accessibilityRole="button" key={item.id} onPress={() => { setLesson(item); setChoice(null); }} style={[ui.card, { flexDirection: 'row', alignItems: 'center', gap: 14 }]}><View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#edf5ef', justifyContent: 'center', alignItems: 'center' }}>{completed.includes(item.id) ? <ParticipantIcon name="check" /> : <Text style={ui.label}>{index + 1}</Text>}</View><View style={{ flex: 1, gap: 4 }}><Text style={ui.title}>{item.title}</Text><Text style={ui.text}>{item.level} · {completed.includes(item.id) ? 'Selesai' : 'Mulai latihan'}</Text></View><ParticipantIcon name="arrow" size={18} /></TouchableOpacity>)}
      <Text style={[ui.text, { fontSize: 12 }]}>Materi awal ini merupakan latihan tambahan, bukan salinan buku Iqro atau penetapan level peserta. Progres disimpan di perangkat ini dan belum disinkronkan ke pengajar.</Text>
    </>}
  </ModuleScreen>;
}
