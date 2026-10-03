import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { ModuleScreen, EmptyState, Pagination, formatDate, formatLabel, ui } from '../../components/santri/ModuleScreen';
import { useParticipantResource, type ApiPage } from '../../hooks/use-participant-resource';
type Schedule = { id: number; title: string; start: string; end: string; status: string; student_presence: string | null; teaching_note: string | null; meeting_link: string | null };
const statuses: Record<string, string> = { pending: 'Terjadwal', completed: 'Selesai', cancelled: 'Dibatalkan' };
const presence: Record<string, string> = { present: 'Hadir', absent: 'Tidak hadir', sick: 'Sakit', permission: 'Izin', excused: 'Izin', pending: 'Belum dicatat' };
export default function JadwalKelas() {
  const [page, setPage] = useState(1); const [meetingError, setMeetingError] = useState(''); const { booking_id } = useLocalSearchParams<{ booking_id?: string }>();
  const filter = typeof booking_id === 'string' && /^\d+$/.test(booking_id) ? `&booking_id=${booking_id}` : '';
  const { data, loading, error, reload } = useParticipantResource<ApiPage<Schedule>>(`/schedules?page=${page}${filter}`);
  async function openMeeting(url: string) {
    setMeetingError('');
    if (!/^https?:\/\//i.test(url)) { setMeetingError('Tautan pertemuan tidak valid. Hubungi pengajar.'); return; }
    try { await Linking.openURL(url); } catch { setMeetingError('Tautan pertemuan tidak dapat dibuka. Silakan coba kembali.'); }
  }
  return <ModuleScreen title="Jadwal Kelas" subtitle={filter ? 'Jadwal dan catatan pertemuan untuk kelas yang dipilih.' : 'Jadwal dan riwayat pertemuan Anda, diurutkan dari tanggal terbaru.'} loading={loading} error={meetingError || error} reload={async () => { setMeetingError(''); await reload(); }}>
    {data?.data.length === 0 ? <EmptyState text="Belum ada jadwal kelas yang tersedia." /> : null}
    {data?.data.map(item => <View key={item.id} style={ui.card}><Text style={ui.label}>{statuses[item.status] || formatLabel(item.status)}</Text><Text style={ui.title}>{item.title}</Text><Text style={ui.text}>Mulai: {formatDate(item.start)}</Text><Text style={ui.text}>Selesai: {formatDate(item.end)}</Text><Text style={ui.text}>Kehadiran: {item.student_presence ? presence[item.student_presence] || formatLabel(item.student_presence) : 'Belum dicatat'}</Text>{item.teaching_note ? <Text style={ui.text}>Catatan pengajar: {item.teaching_note}</Text> : null}
      {item.meeting_link && item.status === 'pending' ? <TouchableOpacity accessibilityRole="button" style={ui.button} onPress={() => void openMeeting(item.meeting_link!)}><Text style={ui.buttonText}>Buka tautan pertemuan</Text></TouchableOpacity> : null}
    </View>)}
    {data ? <Pagination current={data.current_page} last={data.last_page} loading={loading} change={setPage} /> : null}
  </ModuleScreen>;
}
