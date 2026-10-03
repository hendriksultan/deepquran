import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { ModuleScreen, EmptyState, Pagination, formatLabel, ui } from '../../components/santri/ModuleScreen';
import { useParticipantResource, type ApiPage } from '../../hooks/use-participant-resource';
type Booking = { id: number; program_type: string; student_name: string; group_name: string | null; method: string; status: string; guru: { name: string | null } };
const statuses: Record<string, string> = { active: 'Aktif', approved: 'Disetujui', pending: 'Menunggu persetujuan', completed: 'Selesai', cancelled: 'Dibatalkan', rejected: 'Ditolak' };
export default function KelasSaya() {
  const [page, setPage] = useState(1); const router = useRouter();
  const { data, loading, error, reload } = useParticipantResource<ApiPage<Booking>>(`/bookings?page=${page}`);
  return <ModuleScreen title="Kelas Saya" subtitle="Program yang Anda ikuti beserta informasi pengajar." {...{ loading, error, reload }}>
    {data?.data.length === 0 ? <EmptyState text="Belum ada kelas yang terdaftar pada akun Anda." /> : null}
    {data?.data.map(item => <View key={item.id} style={ui.card}><Text style={ui.label}>{statuses[item.status] || formatLabel(item.status)}</Text><Text style={ui.title}>{formatLabel(item.program_type)}</Text><Text style={ui.text}>{item.group_name || 'Kelas peserta'} · {formatLabel(item.method)}</Text><Text style={ui.text}>Peserta: {item.student_name || 'Belum tersedia'}</Text><Text style={ui.text}>Pengajar: {item.guru?.name || 'Belum ditentukan'}</Text><TouchableOpacity accessibilityRole="button" style={ui.button} onPress={() => router.push({ pathname: '/santri/jadwal', params: { booking_id: String(item.id) } })}><Text style={ui.buttonText}>Lihat jadwal kelas</Text></TouchableOpacity></View>)}
    {data ? <Pagination current={data.current_page} last={data.last_page} loading={loading} change={setPage} /> : null}
  </ModuleScreen>;
}
