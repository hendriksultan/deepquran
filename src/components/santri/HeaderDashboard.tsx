import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function HeaderDashboard() {
  const [tanggalMasehi, setTanggalMasehi] = useState('');

  useEffect(() => {
    // Format tanggal sederhana untuk simulasi
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    setTanggalMasehi(date.toLocaleDateString('id-ID', options));
  }, []);

  // Data statis (dummy) untuk slicing
  const namaSantri = "Zubair Abdullah";
  const dailyQuote = "Barangsiapa menempuh suatu jalan untuk menuntut ilmu, maka Allah akan mudahkan baginya jalan menuju surga.";
  const quoteSource = "HR. Muslim";

  return (
    <View style={styles.headerContainer}>
      {/* Background Image (Gunakan warna solid hijau gelap sementara gambar belum ada) */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#064e3b' }]} />

      {/* Widget Tanggal */}
      <View style={styles.dateWidget}>
        <Text style={styles.masehiText}>📅 {tanggalMasehi}</Text>
        <Text style={styles.hijriahText}>14 Muharram 1448 H</Text>
      </View>

      {/* Konten Utama Header */}
      <View style={styles.contentContainer}>
        <Text style={styles.welcomeText}>Ahlan Wa Sahlan,</Text>
        <Text style={styles.nameText}>{namaSantri}</Text>

        {/* Quote Hadits */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>"{dailyQuote}"</Text>
          <View style={styles.quoteSourceContainer}>
            <View style={styles.line} />
            <Text style={styles.sourceText}>{quoteSource}</Text>
            <View style={styles.line} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  dateWidget: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  masehiText: { color: '#f3f4f6', fontSize: 12, fontWeight: '600' },
  hijriahText: { color: '#34d399', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  welcomeText: { color: '#6ee7b7', fontSize: 16, fontWeight: '500', marginBottom: 5 },
  nameText: { color: '#ffffff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  quoteContainer: { alignItems: 'center', marginTop: 10, paddingHorizontal: 10 },
  quoteText: { color: '#ffffff', fontSize: 14, fontStyle: 'italic', textAlign: 'center', lineHeight: 22 },
  quoteSourceContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15, gap: 10 },
  line: { height: 1, width: 30, backgroundColor: '#34d399' },
  sourceText: { color: '#34d399', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
});