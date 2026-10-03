# Modul belajar peserta

## Tahap pertama

- Beranda: enam menu ringkas; jadwal dan infaq tetap tersedia.
- Navigasi bawah: Beranda, Kelas, Al-Qur’an, Belajar, Profil.
- Al-Qur’an: daftar surah, pencarian, teks Arab, terjemahan Indonesia, dan penanda satu ayat terakhir per peserta di perangkat.
- Data Al-Qur’an melalui https://equran.id/api/v2/surat dan /surat/{nomor}; dokumentasi https://equran.id/apidev/v2. Tidak menggunakan instance Axios backend, sehingga token peserta tidak dikirim ke penyedia bacaan.
- Belajar Mandiri: lima latihan awal dengan kuis, untuk Iqro, tahsin, dan kosakata Arab. Ini materi tambahan orisinal, bukan salinan buku Iqro. Pilihan materi tidak menunjukkan level resmi peserta.
- Progres latihan tersimpan per ID peserta di SecureStore (native) atau localStorage (web). Belum disinkronkan ke backend. Bacaan Al-Qur’an memerlukan internet; materi mandiri dibundel bersama aplikasi.

## Tahap backend berikutnya

Untuk level resmi, materi dinamis, dan pemantauan pengajar diperlukan struktur tabel program, pendaftaran kelas, level/evaluasi peserta, serta endpoint materi dan progres. Jangan menyimpulkan level dari nama program saja. Materi perlu ditinjau pengajar sebelum digunakan sebagai kurikulum resmi.

Login, URL API Laravel, timeout 60 detik, dan penyimpanan token tetap menggunakan konfigurasi yang sudah ada.

## Validasi

```sh
npx tsc --noEmit
node scripts/verify-learning.cjs
npx expo export --platform web
```

Uji di emulator: buka keenam menu; cari dan buka surah; tandai ayat, kembali ke daftar, lanjutkan bacaan; jawab kuis; tutup/buka aplikasi untuk memeriksa penyimpanan; ganti akun untuk memeriksa pemisahan progres.
