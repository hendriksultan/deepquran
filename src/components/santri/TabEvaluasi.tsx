import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TabEvaluasi() {
  // State untuk mengontrol tab mana yang sedang aktif
  const [activeTab, setActiveTab] = useState('iqra');

  // Daftar menu tab
  const tabs = [
    { id: 'iqra', label: 'Iqra', icon: '📖' },
    { id: 'tahsin', label: 'Tahsin', icon: '📿' },
    { id: 'bahasa', label: 'B. Arab', icon: '🗣️' },
    { id: 'ujian', label: 'Ujian', icon: '📝' },
    { id: 'tugas', label: 'Tugas', icon: '📂' },
  ];

  // Data statis (dummy) Riwayat Iqra berdasarkan respons API sebelumnya
  const riwayatIqra = [
    {
      id: 1,
      tanggal: '19 Mei 2026',
      pengajar: 'Ustadzah Gita',
      jilid: '1',
      halaman: '27',
      nilai: 'A',
      catatan: 'Alhamdulillah semua huruf di baca dengan benar oleh zubair, barakallahu fiik nak'
    }
  ];

  return (
    <View style={styles.container}>
      {/* 1. Tab Navigation (Bisa di-scroll horizontal jika menu banyak) */}
      <View style={styles.tabWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. Konten Utama Berdasarkan Tab Aktif */}
      <View style={styles.contentWrapper}>

        {/* === KONTEN TAB: IQRA === */}
        {activeTab === 'iqra' && (
          <View>
            <View style={styles.contentHeader}>
              <View style={styles.dotIndicator} />
              <Text style={styles.contentHeaderText}>RIWAYAT EVALUASI IQRA</Text>
            </View>

            {riwayatIqra.length > 0 ? (
              riwayatIqra.map((item) => (
                <View key={item.id} style={styles.cardEvaluasi}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.dateText}>{item.tanggal}</Text>
                    <Text style={styles.teacherText}>👤 {item.pengajar}</Text>
                  </View>

                  <View style={styles.cardBody}>
                    <View>
                      <Text style={styles.materiLabel}>Jilid & Halaman</Text>
                      <Text style={styles.materiValue}>Jilid {item.jilid} - Hal {item.halaman}</Text>
                    </View>
                    <View style={[styles.nilaiBadge, { backgroundColor: '#d1fae5' }]}>
                      <Text style={[styles.nilaiText, { color: '#047857' }]}>{item.nilai}</Text>
                    </View>
                  </View>

                  <View style={styles.noteBox}>
                    <Text style={styles.noteText}>"{item.catatan}"</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Belum ada evaluasi Iqra di bulan ini.</Text>
              </View>
            )}
          </View>
        )}

        {/* === KONTEN TAB: TAHSIN, BAHASA, UJIAN (Template Kosong) === */}
        {activeTab !== 'iqra' && (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconBox}>
              <Text style={styles.emptyIcon}>🔍</Text>
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Data</Text>
            <Text style={styles.emptyDesc}>Data evaluasi atau tugas untuk program ini belum tersedia atau diarsipkan.</Text>
          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 30 },

  // Navigation Tabs
  tabWrapper: { marginBottom: 15 },
  scrollContent: { gap: 10, paddingHorizontal: 2 },
  tabButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  tabButtonActive: { backgroundColor: '#ffffff', borderColor: '#10b981', shadowColor: '#10b981', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabIcon: { fontSize: 14 },
  tabText: { fontSize: 13, fontWeight: 'bold', color: '#6b7280' },
  tabTextActive: { color: '#10b981' },

  // Content Area
  contentWrapper: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, borderColor: '#e5e7eb', borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5 },
  contentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', marginBottom: 15 },
  dotIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  contentHeaderText: { fontSize: 11, fontWeight: 'bold', color: '#10b981', letterSpacing: 1 },

  // Card Evaluasi (Pengganti Tabel)
  cardEvaluasi: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 15, borderColor: '#f3f4f6', borderWidth: 1, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dateText: { fontSize: 13, fontWeight: 'bold', color: '#1f2937' },
  teacherText: { fontSize: 11, color: '#6b7280', fontWeight: '500' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  materiLabel: { fontSize: 10, color: '#9ca3af', marginBottom: 2, textTransform: 'uppercase', fontWeight: 'bold' },
  materiValue: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  nilaiBadge: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
  nilaiText: { fontSize: 14, fontWeight: '900' },
  noteBox: { backgroundColor: '#ffffff', padding: 10, borderRadius: 8, borderColor: '#e5e7eb', borderWidth: 1, borderLeftWidth: 3, borderLeftColor: '#10b981' },
  noteText: { fontSize: 12, fontStyle: 'italic', color: '#4b5563', lineHeight: 18 },

  // Empty States
  emptyState: { paddingVertical: 20, alignItems: 'center' },
  emptyStateText: { fontSize: 13, color: '#9ca3af', fontStyle: 'italic' },

  emptyStateContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
  emptyIconBox: { width: 60, height: 60, backgroundColor: '#f3f4f6', borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyIcon: { fontSize: 24 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 5 },
  emptyDesc: { fontSize: 12, color: '#6b7280', textAlign: 'center', paddingHorizontal: 20, lineHeight: 18 }
});