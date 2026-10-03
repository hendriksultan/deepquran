import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BannerInfaq() {
  // Data statis (dummy) untuk keperluan slicing UI
  const periode = "Juni 2026";
  const nominal = "150.000";

  return (
    <View style={styles.container}>
      {/* Bagian Header Banner */}
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>💰</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Infaq Operasional ({periode})</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Belum Ditunaikan</Text>
          </View>
        </View>
      </View>

      {/* Bagian Nominal & Informasi */}
      <View style={styles.contentRow}>
        {/* Kolom Kiri: Informasi Alokasi */}
        <View style={styles.infoColumn}>
          <Text style={styles.descText}>Dana infaq dikelola secara amanah untuk:</Text>
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitText}>✓ Kafalah Asatidz & Pegawai</Text>
            <Text style={styles.benefitText}>✓ Pengembangan Kurikulum</Text>
            <Text style={styles.benefitText}>✓ Pemeliharaan IT & Server</Text>
            <Text style={styles.benefitText}>✓ Program Sosial & Beasiswa</Text>
          </View>
        </View>

        {/* Kolom Kanan: Nominal & Aksi */}
        <View style={styles.actionColumn}>
          <View style={styles.nominalBox}>
            <Text style={styles.nominalLabel}>Nilai Partisipasi</Text>
            <Text style={styles.nominalValue}>Rp {nominal}</Text>
          </View>
        </View>
      </View>

      {/* Tombol Eksekusi */}
      <TouchableOpacity style={styles.uploadButton} activeOpacity={0.8}>
        <Text style={styles.uploadButtonText}>Kirim Bukti Pembayaran</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fffbeb', // Warna latar kuning pucat khas peringatan
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  iconContainer: {
    width: 45,
    height: 45,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#fde68a',
    borderWidth: 1,
    marginRight: 12
  },
  iconText: { fontSize: 20 },
  titleContainer: { flex: 1, justifyContent: 'center' },
  titleText: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  badge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  badgeText: { color: '#dc2626', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  contentRow: {
    flexDirection: 'column', // Di mobile kita buat menumpuk ke bawah
    marginBottom: 20,
  },
  infoColumn: {
    marginBottom: 15,
  },
  descText: { fontSize: 13, color: '#374151', marginBottom: 10, lineHeight: 20 },
  benefitsContainer: { gap: 6 },
  benefitText: { fontSize: 12, color: '#4b5563', fontWeight: '500' },
  actionColumn: {
    width: '100%',
  },
  nominalBox: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 15,
    borderColor: '#f3f4f6',
    borderWidth: 1
  },
  nominalLabel: { fontSize: 11, color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 },
  nominalValue: { fontSize: 24, fontWeight: '900', color: '#111827' },
  uploadButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  uploadButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 }
});