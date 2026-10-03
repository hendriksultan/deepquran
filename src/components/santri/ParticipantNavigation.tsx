import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ParticipantIcon from './ParticipantIcon';
const tabs = [
  { label: 'Beranda', icon: 'home', route: '/santri/dashboard' },
  { label: 'Kelas', icon: 'classes', route: '/santri/kelas' },
  { label: 'Al-Qur’an', icon: 'book', route: '/santri/quran' },
  { label: 'Belajar', icon: 'classes', route: '/santri/belajar' },
  { label: 'Profil', icon: 'profile', route: '/santri/profil' },
] as const;
export default function ParticipantNavigation() {
  const path = usePathname(); const router = useRouter(); const insets = useSafeAreaInsets();
  return <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
    <View style={styles.inner}>{tabs.map(tab => {
      const selected = path === tab.route || (tab.route === '/santri/belajar' && path === '/santri/materi');
      return <TouchableOpacity accessibilityRole="button" accessibilityLabel={tab.label} accessibilityState={{ selected }} key={tab.route} activeOpacity={0.7} onPress={() => router.replace(tab.route)} style={styles.tab}>
        <View style={[styles.icon, selected && styles.active]}><ParticipantIcon name={tab.icon} size={24} color={selected ? '#17654f' : '#8a9591'} /></View>
        <Text style={[styles.label, selected && styles.selected]}>{tab.label}</Text>
      </TouchableOpacity>;
    })}</View>
  </View>;
}
const styles = StyleSheet.create({
  bar: { backgroundColor: '#fff', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e8eeeb' },
  inner: { flexDirection: 'row', width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 10 },
  tab: { flex: 1, alignItems: 'center', gap: 4, minHeight: 54 },
  icon: { width: 48, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  active: { backgroundColor: '#e8f3ec' },
  label: { fontSize: 10, fontWeight: '500', color: '#8a9591' },
  selected: { color: '#17654f', fontWeight: '700' },
});
