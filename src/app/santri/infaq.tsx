import { useState } from 'react';
import { Text, View } from 'react-native';
import { ModuleScreen, EmptyState, Pagination, formatLabel, ui } from '../../components/santri/ModuleScreen';
import { useParticipantResource, type ApiPage } from '../../hooks/use-participant-resource';
type Infaq = { id: number; periode_bulan: string; nominal: string | number; status: string; catatan_admin: string | null };
const statuses: Record<string, string> = { unpaid: 'Belum dibayar', pending: 'Menunggu verifikasi', verified: 'Lunas', paid: 'Lunas', rejected: 'Bukti ditolak' };
export default function RiwayatInfaq() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useParticipantResource<ApiPage<Infaq>>(`/infaqs?page=${page}`);
  return <ModuleScreen title="Infaq" subtitle="Tagihan dan riwayat infaq Anda. Bukti pembayaran dapat dikirim melalui aplikasi web untuk saat ini." {...{ loading, error, reload }}>
    {data?.data.length === 0 ? <EmptyState text="Belum ada tagihan atau riwayat infaq pada akun Anda." /> : null}
    {data?.data.map(item => <View key={item.id} style={ui.card}><Text style={ui.label}>{statuses[item.status] || formatLabel(item.status)}</Text><Text style={ui.title}>{item.periode_bulan}</Text><Text style={{ fontWeight: '700', fontSize: 26, color: '#172d26' }}>Rp {Number(item.nominal).toLocaleString('id-ID')}</Text>{item.catatan_admin ? <Text style={ui.text}>Catatan admin: {item.catatan_admin}</Text> : null}</View>)}
    {data ? <Pagination current={data.current_page} last={data.last_page} loading={loading} change={setPage} /> : null}
  </ModuleScreen>;
}
