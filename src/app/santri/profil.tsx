import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../services/api';
import { ModuleScreen, ui } from '../../components/santri/ModuleScreen';
import { useParticipantResource } from '../../hooks/use-participant-resource';
type Profile = { name: string; email: string; phone: string | null; address: string | null; is_verified: boolean | number };
export default function ProfilPeserta() {
  const { logout } = useAuth(); const [leaving, setLeaving] = useState(false); const [logoutError, setLogoutError] = useState('');
  const { data, loading, error, reload } = useParticipantResource<Profile>('/me');
  async function leave() {
    if (leaving) return;
    setLeaving(true); setLogoutError('');
    try { await logout(); } catch (e) { setLogoutError(errorMessage(e)); } finally { setLeaving(false); }
  }
  return <ModuleScreen title="Profil" subtitle="Informasi akun peserta yang terdaftar di Deep Quran Academy." {...{ loading, reload }} error={logoutError || error}>
    {data ? <><View style={ui.card}><Text style={ui.title}>{data.name}</Text><Text style={ui.label}>{data.is_verified ? 'Akun terverifikasi' : 'Menunggu verifikasi'}</Text>
      {[['Email', data.email], ['Nomor HP', data.phone], ['Alamat', data.address]].map(([label, value]) => <View key={label} style={{ gap: 4, paddingVertical: 10, borderTopWidth: 1, borderColor: '#edf1ee' }}><Text style={ui.text}>{label}</Text><Text selectable style={{ color: '#172d26', fontSize: 15, lineHeight: 22 }}>{value || 'Belum diisi'}</Text></View>)}
    </View><TouchableOpacity accessibilityRole="button" disabled={leaving} onPress={() => void leave()} style={[ui.button, { backgroundColor: '#fff0ef', opacity: leaving ? 0.5 : 1 }]}><Text style={{ color: '#a32920', fontWeight: '700' }}>{leaving ? 'Sedang keluar…' : 'Keluar akun'}</Text></TouchableOpacity></> : null}
  </ModuleScreen>;
}
