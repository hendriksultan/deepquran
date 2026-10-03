import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function JadwalAsatidz() {
  // State untuk mengontrol Accordion (buka/tutup)
  const [isExpanded, setIsExpanded] = useState(true);

  // Data statis (dummy) berdasarkan struktur database untuk keperluan slicing
  const teacherName = "Ustadzah Gita";
  const schedules = [
    {
      id: 1,
      title: "Tahsin Surat Al-Mulk",
      date: "Senin, 06 Jul 2026",
      time: "16:00 - 17:00 WIB",
      method: "online",
      location: "Via Virtual Meeting",
      status: "upcoming", // upcoming, live, completed
      participants: 1
    },
    {
      id: 2,
      title: "Setoran Hafalan Juz 30",
      date: "Selasa, 07 Jul 2026",
      time: "16:00 - 17:00 WIB",
      method: "offline",
      location: "Jl. Cikaroya, Gunungjaya",
      status: "completed",
      participants: 1
    }
  ];

  // Fungsi helper untuk menentukan warna status
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'live': return { label: '🔴 Sedang Berlangsung', bg: '#fef2f2', text: '#dc2626' };
      case 'completed': return { label: 'Selesai', bg: '#f3f4f6', text: '#6b7280' };
      default: return { label: 'Akan Datang', bg: '#eff6ff', text: '#2563eb' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Bagian Jadwal */}
      <View style={styles.headerSection}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.iconTitle}>🗓️</Text>
          <Text style={styles.sectionTitle}>Jadwal Kelas Saya</Text>
        </View>
        <View style={styles.badgesRow}>
          <Text style={styles.badgeActive}>1 Aktif</Text>
          <Text style={styles.badgeCompleted}>1 Selesai</Text>
        </View>
      </View>

      {/* Accordion Group Berdasarkan Guru */}
      <View style={styles.accordionWrapper}>
        {/* Tombol Accordion Header */}
        <TouchableOpacity
          style={[styles.accordionHeader, isExpanded && styles.accordionHeaderOpen]}
          activeOpacity={0.7}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <View style={styles.teacherInfoRow}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>{teacherName.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.teacherName}>Kelas Bersama {teacherName}</Text>
              <Text style={styles.totalScheduleText}>Total {schedules.length} Jadwal Bulan Ini</Text>
            </View>
          </View>
          <View style={styles.chevronBox}>
            <Text style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }], color: '#6b7280' }}>▼</Text>
          </View>
        </TouchableOpacity>

        {/* Isi Accordion (Daftar Kartu Jadwal) */}
        {isExpanded && (
          <View style={styles.accordionBody}>
            {schedules.map((item) => {
              const statusConfig = getStatusConfig(item.status);
              const isOnline = item.method === 'online';

              return (
                <View key={item.id} style={styles.scheduleCard}>
                  {/* Status & Judul */}
                  <View style={styles.cardTopRow}>
                    <Text style={[styles.statusBadge, { backgroundColor: statusConfig.bg, color: statusConfig.text }]}>
                      {statusConfig.label}
                    </Text>
                    <View style={styles.participantBadge}>
                      <Text style={styles.participantText}>👥 {item.participants} Peserta</Text>
                    </View>
                  </View>

                  <Text style={styles.scheduleTitle} numberOfLines={2}>{item.title}</Text>

                  {/* Info Tanggal & Waktu */}
                  <View style={styles.dateTimeBox}>
                    <Text style={styles.dateTimeText}>📅 {item.date}</Text>
                    <Text style={styles.dateTimeText}>⏰ {item.time}</Text>
                  </View>

                  {/* Metode & Lokasi */}
                  <View style={styles.methodRow}>
                    <Text style={styles.methodBadge}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
                    <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
                  </View>

                  {/* Tombol Aksi */}
                  {isOnline ? (
                    <TouchableOpacity
                      style={[styles.actionBtn, item.status === 'completed' ? styles.btnGreen : styles.btnBlue]}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.actionBtnText}>
                        {item.status === 'completed' ? 'Masuk Kembali' : 'Mulai Belajar'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.btnDisabled}>
                      <Text style={styles.btnDisabledText}>Belajar Tatap Muka</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 25 },
  headerSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconTitle: { fontSize: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  badgesRow: { flexDirection: 'row', gap: 5 },
  badgeActive: { backgroundColor: '#d1fae5', color: '#047857', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeCompleted: { backgroundColor: '#f3f4f6', color: '#4b5563', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },

  accordionWrapper: { backgroundColor: '#fff', borderRadius: 16, borderColor: '#e5e7eb', borderWidth: 1, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#f9fafb' },
  accordionHeaderOpen: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  teacherInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: '#4b5563' },
  teacherName: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  totalScheduleText: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  chevronBox: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1, justifyContent: 'center', alignItems: 'center' },

  accordionBody: { padding: 15, backgroundColor: '#ffffff' },
  scheduleCard: { borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 12, padding: 15, marginBottom: 15, backgroundColor: '#ffffff' },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  statusBadge: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  participantBadge: { backgroundColor: '#e0e7ff', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  participantText: { fontSize: 9, fontWeight: 'bold', color: '#4f46e5' },
  scheduleTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 },

  dateTimeBox: { backgroundColor: '#f9fafb', padding: 10, borderRadius: 8, borderColor: '#f3f4f6', borderWidth: 1, marginBottom: 12 },
  dateTimeText: { fontSize: 12, color: '#4b5563', fontWeight: '500', marginVertical: 2 },

  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15, paddingBottom: 12, borderBottomColor: '#f3f4f6', borderBottomWidth: 1 },
  methodBadge: { backgroundColor: '#f3f4f6', color: '#4b5563', fontSize: 9, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, overflow: 'hidden' },
  locationText: { fontSize: 11, color: '#6b7280', flex: 1 },

  actionBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnBlue: { backgroundColor: '#2563eb' },
  btnGreen: { backgroundColor: '#059669' },
  actionBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },

  btnDisabled: { backgroundColor: '#f3f4f6', paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderColor: '#e5e7eb', borderWidth: 1 },
  btnDisabledText: { color: '#9ca3af', fontSize: 12, fontWeight: 'bold' }
});