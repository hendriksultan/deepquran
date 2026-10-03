export type Lesson = { id: string; title: string; level: string; explanation: string; examples: { arabic: string; meaning: string }[]; question: string; options: string[]; answer: number; feedback: string };
export type StudyProgram = { id: string; title: string; description: string; lessons: Lesson[] };
// Original supplementary exercises, not a reproduction of the Iqro textbook.
export const studyPrograms: StudyProgram[] = [
  { id: 'iqro', title: 'Iqro', description: 'Latihan dasar mengenal huruf dan harakat.', lessons: [
    { id: 'iqro-huruf', title: 'Mengenal huruf', level: 'Dasar 1', explanation: 'Kenali bentuk huruf berikut. Dengarkan contoh pelafalannya dari pengajar agar makhraj tepat.', examples: [{ arabic: 'ا', meaning: 'Alif' }, { arabic: 'ب', meaning: 'Ba' }, { arabic: 'ت', meaning: 'Ta' }], question: 'Manakah huruf ba?', options: ['ت', 'ب', 'ا'], answer: 1, feedback: 'Huruf ba (ب) memiliki satu titik di bawah.' },
    { id: 'iqro-fathah', title: 'Mengenal fathah', level: 'Dasar 2', explanation: 'Fathah adalah tanda di atas huruf yang menghasilkan bunyi pendek a. Latihan ini melengkapi pembelajaran bersama pengajar.', examples: [{ arabic: 'بَ', meaning: 'Ba' }, { arabic: 'تَ', meaning: 'Ta' }, { arabic: 'جَ', meaning: 'Ja' }], question: 'Bagaimana membaca تَ?', options: ['Ti', 'Tu', 'Ta'], answer: 2, feedback: 'Huruf ta dengan fathah dibaca ta, dengan bunyi a pendek.' },
  ] },
  { id: 'tahsin', title: 'Tahsin', description: 'Pengenalan tanda baca dan kaidah dasar.', lessons: [
    { id: 'tahsin-harakat', title: 'Tiga harakat pendek', level: 'Dasar', explanation: 'Fathah menghasilkan a, kasrah menghasilkan i, dan dammah menghasilkan u. Praktik pelafalan tetap perlu diperiksa pengajar.', examples: [{ arabic: 'بَ', meaning: 'Ba — fathah' }, { arabic: 'بِ', meaning: 'Bi — kasrah' }, { arabic: 'بُ', meaning: 'Bu — dammah' }], question: 'Harakat yang menghasilkan bunyi i adalah …', options: ['Kasrah', 'Fathah', 'Dammah'], answer: 0, feedback: 'Kasrah berada di bawah huruf dan menghasilkan bunyi i pendek.' },
  ] },
  { id: 'arab', title: 'Bahasa Arab', description: 'Kosakata sehari-hari untuk pemula.', lessons: [
    { id: 'arab-benda', title: 'Benda di sekitar', level: 'Pemula 1', explanation: 'Pelajari kosakata berikut, lalu coba sebutkan benda yang ada di sekitar Anda.', examples: [{ arabic: 'كِتَابٌ', meaning: 'Buku' }, { arabic: 'قَلَمٌ', meaning: 'Pena' }, { arabic: 'بَيْتٌ', meaning: 'Rumah' }], question: 'Apa arti قَلَمٌ?', options: ['Rumah', 'Buku', 'Pena'], answer: 2, feedback: 'قَلَمٌ (qalamun) berarti pena.' },
    { id: 'arab-keluarga', title: 'Anggota keluarga', level: 'Pemula 2', explanation: 'Kenali kosakata anggota keluarga berikut.', examples: [{ arabic: 'أَبٌ', meaning: 'Ayah' }, { arabic: 'أُمٌّ', meaning: 'Ibu' }, { arabic: 'أَخٌ', meaning: 'Saudara laki-laki' }], question: 'Manakah kata yang berarti ibu?', options: ['أُمٌّ', 'أَخٌ', 'أَبٌ'], answer: 0, feedback: 'أُمٌّ (ummun) berarti ibu.' },
  ] },
];
