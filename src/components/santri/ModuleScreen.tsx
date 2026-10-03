import type { ReactNode } from 'react';
import ParticipantIcon from './ParticipantIcon';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ui = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 20, gap: 10, borderWidth: 1, borderColor: '#e8eeea' },
  title: { fontSize: 18, fontWeight: '700', color: '#172d26' },
  text: { fontSize: 14, lineHeight: 22, color: '#64746d' },
  button: { minHeight: 46, borderRadius: 12, padding: 12, backgroundColor: '#047857', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  label: { color: '#047857', fontWeight: '700', fontSize: 13 },
});
export function ModuleScreen({ title, subtitle, loading, error, reload, children, refreshable = true }: {
  title: string; subtitle: string; loading: boolean; error: string;
  reload: () => Promise<void>; children: ReactNode; refreshable?: boolean;
}) {
  const router = useRouter(); const insets = useSafeAreaInsets();
  return <View style={{ flex: 1, backgroundColor: '#f6f8f7' }}>
    <StatusBar style="dark" />
    <View style={{ paddingTop: insets.top + 12, paddingBottom: 18, paddingHorizontal: 20, backgroundColor: '#f6f8f7', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Kembali ke beranda" onPress={() => router.canGoBack() ? router.back() : router.replace('/santri/dashboard')} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#e8efea', justifyContent: 'center', alignItems: 'center' }}>
        <ParticipantIcon name="back" size={22} color="#213d31" />
      </TouchableOpacity>
      <Text style={{ color: '#213d31', fontSize: 21, fontWeight: '700', flex: 1 }}>{title}</Text>
    </View>
    <ScrollView refreshControl={refreshable ? <RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor="#047857" /> : undefined} contentContainerStyle={{ width: '100%', maxWidth: 720, alignSelf: 'center', padding: 20, gap: 16, paddingBottom: 24 }}>
      <Text style={ui.text}>{subtitle}</Text>
      {error ? <View style={[ui.card, { backgroundColor: '#fff0ef' }]}><Text accessibilityRole="alert" style={{ color: '#a32920', lineHeight: 22 }}>{error}</Text><TouchableOpacity accessibilityRole="button" disabled={loading} onPress={() => void reload()}><Text style={ui.label}>Coba kembali</Text></TouchableOpacity></View> : null}
      {loading ? <ActivityIndicator color="#047857" /> : children}
    </ScrollView>
  </View>;
}
export function EmptyState({ text }: { text: string }) { return <View style={ui.card}><Text style={ui.text}>{text}</Text></View>; }
export function Pagination({ current, last, loading, change }: { current: number; last: number; loading: boolean; change: (page: number) => void }) {
  if (last <= 1) return null;
  return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
    <TouchableOpacity accessibilityRole="button" disabled={loading || current <= 1} onPress={() => change(current - 1)} style={[ui.button, { opacity: current <= 1 || loading ? 0.4 : 1 }]}><Text style={ui.buttonText}>Sebelumnya</Text></TouchableOpacity>
    <Text style={ui.text}>{current} / {last}</Text>
    <TouchableOpacity accessibilityRole="button" disabled={loading || current >= last} onPress={() => change(current + 1)} style={[ui.button, { opacity: current >= last || loading ? 0.4 : 1 }]}><Text style={ui.buttonText}>Berikutnya</Text></TouchableOpacity>
  </View>;
}
export const formatLabel = (value: string | null | undefined) => value ? value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Belum tersedia';
export const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Tanggal belum tersedia' : date.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
