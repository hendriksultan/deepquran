import { useFonts } from 'expo-font';
import { AmiriQuran_400Regular } from '@expo-google-fonts/amiri-quran';

export function useArabicFont() {
  const [loaded, error] = useFonts({ AmiriQuran_400Regular });
  return {
    fontFamily: loaded ? 'AmiriQuran_400Regular' : undefined,
    loading: !loaded && !error,
    error: error ? 'Font Arab belum dapat dimuat.' : '',
  };
}
