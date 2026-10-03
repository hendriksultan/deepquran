import { useState } from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { ModuleScreen, EmptyState, Pagination, ui, formatLabel } from '../../components/santri/ModuleScreen';
import { useParticipantResource, type ApiPage } from '../../hooks/use-participant-resource';
import { api } from '../../services/api';
import type { LearningMaterial } from '../../services/learning-sync';

export default function TeacherMaterials() {
  const [page, setPage] = useState(1); const [busy, setBusy] = useState<number | null>(null); const [actionError, setActionError] = useState('');
  const { data, loading, error, reload } = useParticipantResource<ApiPage<LearningMaterial>>(`/learning/materials?page=${page}`);
  async function open(item: LearningMaterial) {
    const url = item.video_url || item.file_url;
    if (!url || !/^https?:\/\//i.test(url)) { setActionError('Tautan materi belum tersedia.'); return; }
    try { await Linking.openURL(url); setActionError(''); } catch { setActionError('Tautan materi belum dapat dibuka.'); }
  }
  async function complete(id: number) {
    setBusy(id); setActionError('');
    try { await api.post(`/learning/materials/${id}/complete`); await reload(); }
    catch { setActionError('Status materi belum berhasil disimpan. Coba kembali.'); }
    finally { setBusy(null); }
  }
  return <ModuleScreen title="Materi Pengajar" subtitle="Materi yang dibagikan untuk kelas Anda. Status dipelajari tersimpan bersama aplikasi web." loading={loading} error={error} reload={reload}>
    {actionError ? <Text accessibilityRole="alert" style={{ color: '#a32920' }}>{actionError}</Text> : null}
    {!data?.data.length ? <EmptyState text="Belum ada materi yang dibagikan untuk Anda." /> : data.data.map(item => <View style={ui.card} key={item.id}>
      <Text style={ui.label}>{formatLabel(item.type)} · {item.teacher_name || 'Deep Quran Academy'}</Text><Text style={ui.title}>{item.title}</Text>
      {item.description ? <Text style={ui.text}>{item.description}</Text> : null}
      {item.group_name ? <Text style={ui.text}>Kelompok: {item.group_name}</Text> : null}
      <TouchableOpacity accessibilityRole="button" onPress={() => void open(item)} style={ui.button}><Text style={ui.buttonText}>Buka materi</Text></TouchableOpacity>
      {item.completed ? <Text style={ui.label}>Sudah dipelajari · Tersimpan di server</Text> : <TouchableOpacity accessibilityRole="button" disabled={busy !== null} onPress={() => void complete(item.id)} style={[ui.button, { backgroundColor: '#e8efea' }]}><Text style={ui.label}>{busy === item.id ? 'Menyimpan…' : 'Tandai telah dipelajari'}</Text></TouchableOpacity>}
    </View>)}
    {data ? <Pagination current={data.current_page} last={data.last_page} loading={loading} change={setPage} /> : null}
  </ModuleScreen>;
}
