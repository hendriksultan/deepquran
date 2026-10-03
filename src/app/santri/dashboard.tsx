import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import type { Dashboard } from '../../services/api';
import { useParticipantResource } from '../../hooks/use-participant-resource';
import ParticipantIcon from '../../components/santri/ParticipantIcon';
const menus = [
  { title: 'Kelas Saya', icon: 'classes', description: 'Program & pengajar', route: '/santri/kelas', bg: '#edf5ef', ink: '#27684b' },
  { title: 'Jadwal', icon: 'calendar', description: 'Pertemuan & kehadiran', route: '/santri/jadwal', bg: '#edf2fa', ink: '#496b9a' },
  { title: 'Infaq', icon: 'wallet', description: 'Tagihan & riwayat', route: '/santri/infaq', bg: '#faf4e7', ink: '#9b7840' },
  { title: 'Profil', icon: 'profile', description: 'Informasi akun', route: '/santri/profil', bg: '#f2edf7', ink: '#816393' },
] as const;
export default function DashboardPeserta() {
  const { user } = useAuth(); const router = useRouter(); const insets = useSafeAreaInsets();
  const { data, loading, error, reload } = useParticipantResource<Dashboard>('/dashboard');
  const initials = user?.name?.trim().split(/\s+/).slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase() || 'P';
  const next = data?.jadwal_terdekat?.[0];
  const nextDate = next ? new Date(next.start) : null;
  const subtitle = nextDate && !Number.isNaN(nextDate.getTime())
    ? nextDate.toLocaleString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'Atur langkah belajar Anda berikutnya';
  return <View style={s.page}><StatusBar style="dark" />
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor="#17654f" />} contentContainerStyle={[s.content, { paddingTop: insets.top + 16 }]}>
      <View style={s.appBar}>
        <View style={s.brand}><View style={s.logo}><ParticipantIcon name="book" size={23} color="#fff" /></View><View><Text style={s.brandName}>Deep Quran</Text><Text style={s.brandCaption}>ACADEMY</Text></View></View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Buka profil" activeOpacity={0.7} onPress={() => router.push('/santri/profil')} style={s.avatar}><Text style={s.avatarText}>{initials}</Text></TouchableOpacity>
      </View>
      <View style={s.hero}>
        <View style={s.circleOne} /><View style={s.circleTwo} />
        <Text style={s.greeting}>Assalamu’alaikum,</Text><Text style={s.name}>{user?.name}</Text><Text style={s.welcome}>Selamat datang di ruang belajar Anda.</Text>
        <View style={s.stats}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Lihat kelas aktif" onPress={() => router.push('/santri/kelas')} style={s.stat}><Text style={s.statValue}>{data?.kelas_aktif ?? '—'}</Text><Text style={s.statLabel}>Kelas aktif</Text></TouchableOpacity>
          <View style={s.statDivider} />
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Lihat kehadiran" onPress={() => router.push('/santri/jadwal')} style={s.stat}><Text style={s.statValue}>{data?.total_hadir ?? '—'}</Text><Text style={s.statLabel}>Pertemuan dihadiri</Text></TouchableOpacity>
        </View>
      </View>
      {loading && !data ? <ActivityIndicator color="#17654f" /> : null}
      {error ? <TouchableOpacity accessibilityRole="button" disabled={loading} onPress={() => void reload()} style={s.error}><Text accessibilityRole="alert" style={s.errorText}>{error}</Text><Text style={[s.errorText, { fontWeight: '700', marginTop: 6 }]}>Muat ulang ringkasan</Text></TouchableOpacity> : null}
      <View style={s.section}><Text style={s.sectionTitle}>Aktivitas Anda</Text><Text style={s.sectionNote}>Semua kebutuhan belajar dalam satu tempat.</Text></View>
      <View style={s.grid}>{menus.map(menu => <TouchableOpacity accessibilityRole="button" accessibilityLabel={menu.title} key={menu.title} onPress={() => router.push(menu.route)} activeOpacity={0.7} style={s.menu}>
        <View style={s.menuTop}><View style={[s.menuIcon, { backgroundColor: menu.bg }]}><ParticipantIcon name={menu.icon} color={menu.ink} size={27} /></View><ParticipantIcon name="arrow" size={17} color="#a3ada7" /></View>
        <Text style={s.menuTitle}>{menu.title}</Text><Text style={s.menuDescription}>{menu.description}</Text>
      </TouchableOpacity>)}</View>
      <TouchableOpacity accessibilityRole="button" activeOpacity={0.7} onPress={() => router.push('/santri/jadwal')} style={s.scheduleShortcut}>
        <View style={s.shortcutIcon}><ParticipantIcon name="calendar" size={22} color="#537461" /></View><View style={{ flex: 1, gap: 4 }}><Text style={s.shortcutTitle}>{next ? 'Pertemuan berikutnya' : 'Jadwal belajar Anda'}</Text><Text style={s.shortcutDescription}>{subtitle}</Text></View><ParticipantIcon name="arrow" size={18} color="#537461" />
      </TouchableOpacity>
    </ScrollView>
  </View>;
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f6f8f7' },
  content: { paddingHorizontal: 22, paddingBottom: 24, width: '100%', maxWidth: 720, alignSelf: 'center', gap: 18 },
  appBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#17654f', alignItems: 'center', justifyContent: 'center' },
  brandName: { color: '#213d31', fontSize: 18, fontWeight: '700', letterSpacing: -0.4 },
  brandCaption: { color: '#7d8b82', fontSize: 9, letterSpacing: 2.5, fontWeight: '600', marginTop: 2 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#e8efea', borderWidth: 1, borderColor: '#dce6de', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700', color: '#34634a' },
  hero: { backgroundColor: '#15543f', borderRadius: 24, padding: 23, overflow: 'hidden' },
  circleOne: { pointerEvents: 'none', position: 'absolute', width: 175, height: 175, borderRadius: 90, backgroundColor: '#ffffff04', borderWidth: 1, borderColor: '#ffffff09', right: -53, top: -85 },
  circleTwo: { pointerEvents: 'none', position: 'absolute', width: 230, height: 230, borderRadius: 120, borderWidth: 1, borderColor: '#ffffff07', right: -80, top: -103 },
  greeting: { color: '#b8d8c8', fontSize: 12, lineHeight: 18 },
  name: { color: '#fff', fontSize: 23, fontWeight: '700', lineHeight: 29, letterSpacing: -0.5, marginTop: 5 },
  welcome: { color: '#b8d8c8', fontSize: 12, lineHeight: 19, marginTop: 8 },
  stats: { flexDirection: 'row', alignItems: 'stretch', marginTop: 21, paddingTop: 17, borderTopWidth: 1, borderTopColor: '#ffffff22' },
  stat: { flex: 1, gap: 5, minHeight: 46 },
  statValue: { color: '#fff', fontSize: 21, fontWeight: '700' },
  statLabel: { color: '#b8d8c8', fontSize: 11, lineHeight: 17 },
  statDivider: { width: 1, backgroundColor: '#ffffff22', marginRight: 20 },
  section: { gap: 5, marginTop: 5 },
  sectionTitle: { color: '#213d31', fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  sectionNote: { color: '#8a9690', fontSize: 12, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  menu: { width: '48.3%', backgroundColor: '#fff', borderRadius: 18, padding: 17, minHeight: 137, borderWidth: 1, borderColor: '#e8eeea' },
  menuTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  menuIcon: { width: 43, height: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  menuTitle: { fontSize: 15, fontWeight: '700', color: '#213d31', letterSpacing: -0.2 },
  menuDescription: { fontSize: 11, color: '#8a9690', lineHeight: 17, marginTop: 5 },
  scheduleShortcut: { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 12, backgroundColor: '#edf3ef', borderRadius: 16, borderWidth: 1, borderColor: '#e3ece5' },
  shortcutIcon: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  shortcutTitle: { fontSize: 12, fontWeight: '700', color: '#365946' },
  shortcutDescription: { fontSize: 11, color: '#7c9383', lineHeight: 16 },
  error: { padding: 16, borderRadius: 14, backgroundColor: '#fff0ef' },
  errorText: { color: '#a32920', fontSize: 12, lineHeight: 19 },
});
