import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StatistikKelas() {
  // Data dummy untuk slicing
  const jumlahKelas = 2;
  const totalKehadiran = 12;
  const kehadiranBulanIni = 4;

  return (
    <View style={styles.container}>
      {/* Card 1: Kelas Terdaftar */}
      <View style={styles.card}>
        <View style={styles.iconBoxGreen}>
          <Text style={styles.icon}>📚</Text>
        </View>
        <View>
          <Text style={styles.label}>KELAS</Text>
          <Text style={styles.value}>{jumlahKelas}</Text>
        </View>
      </View>

      {/* Card 2: Kehadiran (Dibuat bisa diklik seperti desain asli) */}
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={styles.iconBoxBlue}>
          <Text style={styles.icon}>✅</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>KEHADIRAN</Text>
          <View style={styles.row}>
            <Text style={styles.value}>{totalKehadiran}</Text>
            <Text style={styles.badge}>TOTAL</Text>
          </View>
          <Text style={styles.subText}>
            <Text style={styles.highlight}>{kehadiranBulanIni} Hadir</Text> bulan ini
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  card: {
    flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 15,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4
  },
  iconBoxGreen: { width: 40, height: 40, backgroundColor: '#f0fdf4', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  iconBoxBlue: { width: 40, height: 40, backgroundColor: '#eff6ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 18 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#6b7280', letterSpacing: 0.5 },
  value: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { backgroundColor: '#eff6ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, color: '#2563eb', fontSize: 9, fontWeight: 'bold' },
  subText: { fontSize: 10, color: '#9ca3af', marginTop: 4 },
  highlight: { color: '#059669', fontWeight: 'bold', backgroundColor: '#f0fdf4', paddingHorizontal: 2 }
});