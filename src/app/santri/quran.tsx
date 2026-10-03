import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ui } from '../../components/santri/ModuleScreen';
import ParticipantIcon from '../../components/santri/ParticipantIcon';
import { useQuran } from '../../hooks/use-quran';
import { saveServerBookmark, syncReadingBookmark } from '../../services/learning-sync';
import { useArabicFont } from '../../hooks/use-arabic-font';
import { useAuth } from '../../context/AuthContext';
import { readPreference, writePreference } from '../../services/learning-storage';
import type { Surah, SurahDetail, ReadingBookmark } from '../../services/quran';

export default function Quran() {
  const arabic = useArabicFont();
  const revision = useRef(0);
  const params = useLocalSearchParams<{ surah?: string; verse?: string }>();
  const number = Number(params.surah);
  const selected = Number.isInteger(number) && number >= 1 && number <= 114 ? number : null;
  const { data, loading, error, reload } = useQuran<Surah[] | SurahDetail>(selected ? `/${selected}` : '');
  const router = useRouter(); const insets = useSafeAreaInsets(); const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [bookmark, setBookmark] = useState<ReadingBookmark | null>(null);
  const [notice, setNotice] = useState('');
  const [translation, setTranslation] = useState(true);
  const [saving, setSaving] = useState(false);
  useFocusEffect(useCallback(() => {
    let alive = true; const request = ++revision.current; const controller = new AbortController(); setNotice(''); setBookmark(null);
    if (user) void readPreference<ReadingBookmark>(user.id, 'reading').then(value => {
      if (alive && value && Number.isInteger(value.surah) && value.surah >= 1 && value.surah <= 114 && Number.isInteger(value.verse) && value.verse >= 1 && value.verse <= 286 && typeof value.name === 'string') setBookmark(value);
    }).catch(() => { if (alive) setNotice('Penanda bacaan belum dapat dibaca.'); });
    if (user) void syncReadingBookmark(user.id, controller.signal).then(value => {
      if (alive && request === revision.current) setBookmark(value);
    }).catch(() => { if (alive && request === revision.current && !controller.signal.aborted) setNotice('Penanda perangkat tersedia. Sinkronisasi server belum berhasil.'); });
    return () => { alive = false; controller.abort(); };
  }, [user?.id, selected]));
  const detail = data && !Array.isArray(data) ? data : null;
  const query = search.trim().toLocaleLowerCase();
  const surahs = Array.isArray(data) ? data.filter(s => `${s.nomor} ${s.namaLatin} ${s.arti}`.toLocaleLowerCase().includes(query)) : [];
  async function save(verse: number) {
    if (!detail || !user || saving) return;
    revision.current++; setSaving(true);
    const value = { surah: detail.nomor, name: detail.namaLatin, verse };
    try {
      await writePreference(user.id, 'reading', value); setBookmark(value);
      try { await saveServerBookmark(user.id, value); setNotice(`Tersimpan di server: ${detail.namaLatin}, ayat ${verse}.`); }
      catch { setNotice('Penanda tersimpan di perangkat. Sinkronisasi server belum berhasil; buka kembali menu untuk mencoba lagi.'); }
    }
    catch { setNotice('Penanda belum berhasil disimpan. Coba kembali.'); }
    finally { setSaving(false); }
  }
  const requestedVerse = Number(params.verse);
  const targetIndex = detail && Number.isInteger(requestedVerse) && requestedVerse > 0 && requestedVerse <= detail.ayat.length ? requestedVerse - 1 : 0;
  return <View style={{ flex: 1, backgroundColor: '#f6f8f7' }}><StatusBar style="dark" />
    <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 16, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><TouchableOpacity accessibilityRole="button" accessibilityLabel={selected ? 'Daftar surah' : 'Beranda'} onPress={() => selected ? router.replace('/santri/quran') : router.replace('/santri/dashboard')} style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8efea' }}><ParticipantIcon name="back" /></TouchableOpacity><View style={{ flex: 1 }}><Text style={ui.title}>{detail?.namaLatin ?? 'Al-Qur’an'}</Text><Text style={[ui.text, { fontSize: 12 }]}>{detail ? `${detail.arti} · ${detail.jumlahAyat} ayat` : 'Baca, renungkan, dan lanjutkan bacaan'}</Text></View></View>
      {!selected ? <TextInput accessibilityLabel="Cari surah" placeholder="Cari nama, arti, atau nomor surah" placeholderTextColor="#8a9690" value={search} onChangeText={setSearch} style={{ minHeight: 48, borderRadius: 14, paddingHorizontal: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e3ebe5', color: '#213d31' }} /> : <TouchableOpacity accessibilityRole="button" onPress={() => setTranslation(!translation)}><Text style={ui.label}>{translation ? 'Sembunyikan terjemahan' : 'Tampilkan terjemahan'}</Text></TouchableOpacity>}
      {arabic.error ? <Text style={ui.text}>Font bacaan belum dimuat; menggunakan font perangkat.</Text> : null}
      {notice ? <Text accessibilityLiveRegion="polite" style={ui.label}>{notice}</Text> : null}
    </View>
    {loading || arabic.loading ? <ActivityIndicator color="#17654f" /> : error ? <View style={[ui.card, { margin: 20 }]}><Text accessibilityRole="alert" style={ui.text}>{error}</Text><TouchableOpacity accessibilityRole="button" onPress={() => void reload()} style={ui.button}><Text style={ui.buttonText}>Coba kembali</Text></TouchableOpacity></View> : detail ?
      <FlatList key={`${selected}-${targetIndex}`} data={detail.ayat.slice(targetIndex)} keyExtractor={v => String(v.nomorAyat)} contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 28 }} ListHeaderComponent={<View style={{ gap: 10, marginBottom: 12 }}><Text style={[ui.text, { fontSize: 12 }]}>Tandai ayat untuk melanjutkan bacaan. Penanda disinkronkan ke akun Anda. Sumber: EQuran.id.</Text>{targetIndex > 0 ? <TouchableOpacity accessibilityRole="button" onPress={() => router.replace({ pathname: '/santri/quran', params: { surah: selected! } })}><Text style={ui.label}>Bacaan dari ayat {targetIndex + 1} · Tampilkan dari ayat 1</Text></TouchableOpacity> : null}</View>} renderItem={({ item }) => <View style={[ui.card, bookmark?.surah === selected && bookmark.verse === item.nomorAyat && { borderColor: '#17654f' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={ui.label}>Ayat {item.nomorAyat}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Tandai ayat ${item.nomorAyat}`} disabled={saving} onPress={() => void save(item.nomorAyat)} style={{ padding: 10 }}><Text style={ui.label}>{bookmark?.surah === selected && bookmark.verse === item.nomorAyat ? 'Ditandai' : 'Tandai'}</Text></TouchableOpacity></View>
        <Text accessibilityLanguage="ar" selectable style={{ fontFamily: arabic.fontFamily, fontSize: 32, lineHeight: 72, includeFontPadding: true, color: '#173d2d', textAlign: 'right', writingDirection: 'rtl' }}>{item.teksArab}</Text>
        {translation ? <Text selectable style={ui.text}>{item.teksIndonesia}</Text> : null}
      </View>} /> :
      <FlatList data={surahs} keyExtractor={s => String(s.nomor)} contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 28 }} ListHeaderComponent={bookmark ? <TouchableOpacity accessibilityRole="button" style={[ui.card, { backgroundColor: '#edf5ef', marginBottom: 16 }]} onPress={() => router.push({ pathname: '/santri/quran', params: { surah: bookmark.surah, verse: bookmark.verse } })}><Text style={ui.label}>Lanjutkan bacaan</Text><Text style={ui.title}>{surahs.find(s => s.nomor === bookmark.surah)?.namaLatin || bookmark.name} · ayat {bookmark.verse}</Text></TouchableOpacity> : null} ListEmptyComponent={<Text style={ui.text}>Surah tidak ditemukan.</Text>} renderItem={({ item }) => <TouchableOpacity accessibilityRole="button" onPress={() => router.push({ pathname: '/santri/quran', params: { surah: item.nomor } })} style={[ui.card, { flexDirection: 'row', alignItems: 'center', gap: 14 }]}><View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#edf5ef', justifyContent: 'center', alignItems: 'center' }}><Text style={ui.label}>{item.nomor}</Text></View><View style={{ flex: 1 }}><Text style={[ui.title, { fontSize: 16 }]}>{item.namaLatin}</Text><Text style={[ui.text, { fontSize: 12 }]}>{item.arti} · {item.jumlahAyat} ayat</Text></View><Text accessibilityLanguage="ar" style={{ fontFamily: arabic.fontFamily, fontSize: 25, lineHeight: 50, color: '#17654f', textAlign: 'right' }}>{item.nama}</Text></TouchableOpacity>} />}
  </View>;
}
