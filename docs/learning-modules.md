# Modul belajar peserta

## Tahap pertama

- Beranda: enam menu ringkas; jadwal dan infaq tetap tersedia.
- Navigasi bawah: Beranda, Kelas, Al-Qur’an, Belajar, Profil.
- Al-Qur’an: daftar surah, pencarian, teks Arab, terjemahan Indonesia, dan penanda bacaan terakhir yang disinkronkan per akun.
- Data Al-Qur’an melalui https://equran.id/api/v2/surat dan /surat/{nomor}; dokumentasi https://equran.id/apidev/v2. Tidak menggunakan instance Axios backend, sehingga token peserta tidak dikirim ke penyedia bacaan.
- Belajar Mandiri: lima latihan awal dengan kuis, untuk Iqro, tahsin, dan kosakata Arab. Ini materi tambahan orisinal, bukan salinan buku Iqro. Pilihan materi tidak menunjukkan level resmi peserta.
- Progres latihan tersimpan per ID peserta di SecureStore (native) atau localStorage (web), lalu digabungkan dengan progres akun di Laravel. Kegagalan sinkronisasi mempertahankan progres lokal dan menampilkan pesan untuk mencoba kembali. Bacaan Al-Qur’an memerlukan internet; materi mandiri dibundel bersama aplikasi.

## Integrasi backend

Pasang paket backend terlebih dahulu, lalu perbarui mobile. Paket menambahkan `LearningController`, konfigurasi latihan, satu migrasi `self_study_progress`, serta rute berikut di bawah autentikasi Sanctum peserta yang sudah ada:

- `GET /api/v1/learning/materials`: materi aktif dan status dipelajari, paginasi 20.
- `POST /api/v1/learning/materials/{id}/complete`: tandai materi yang dapat diakses sebagai dipelajari.
- `GET` / `POST /api/v1/learning/progress`: daftar latihan selesai; POST menerima `lesson_ids` yang dikenal dan menambahkan progres secara idempoten.
- `GET` / `POST /api/v1/quran/bookmark`: penanda terakhir; POST menerima `surat_nomor` dan `ayat_nomor`, diperiksa sesuai panjang surah.

Menu Belajar menyediakan tombol **Materi dari pengajar** untuk membuka video, dokumen, dan audio. Statusnya menggunakan tabel `study_material_user` yang sama dengan web. Filter materi memakai pasangan guru, kelompok, dan metode pada pendaftaran aktif yang sama. URL berkas mengikuti penyimpanan publik aplikasi web yang sudah ada; API ini tidak menambahkan pengamanan unduhan berkas privat.

Penanda menggunakan `quran_bookmarks`; penanda web lainnya tetap disimpan. Bila dua penanda diperbarui pada detik yang sama, ID menjadi penentu urutan terakhir. Progres latihan lokal lama dikirim ke server saat halaman mendapat fokus. Penanda yang belum terkirim dicoba kembali saat menu Al-Qur'an dibuka.

`student_level` pada skema saat ini adalah kategori program (`iqra`, `tahsin`, `tahfidz`, `sanad`, `bahasa`), bukan level rinci. Kategori hanya membantu memilih tab awal. Lima latihan bawaan tidak mengubah nilai atau level resmi peserta. Level rinci, kurikulum tambahan, dan laporan pengajar masih memerlukan rancangan tersendiri.

## Pengukuran performa lokal

Paket backend menyediakan `php tools/diagnose-api.php` untuk autoload, bootstrap, koneksi database, SELECT sederhana, dan query pengguna. Middleware hanya aktif pada lingkungan `local`, menulis waktu API ke `storage/logs/api-performance.log` dan header `Server-Timing`, tanpa SQL, kredensial, atau token. `db_ms` adalah waktu query yang dilaporkan Laravel; biaya koneksi awal tidak selalu terpisah di metrik tersebut. Gunakan alat CLI untuk mengukurnya secara langsung. Pengukuran belum membuktikan penyebab lambat pada laptop pengguna.

Login, URL API Laravel, timeout 60 detik, dan penyimpanan token tetap menggunakan konfigurasi yang sudah ada.

## Validasi

```sh
npx tsc --noEmit
node scripts/verify-learning.cjs
npx expo export --platform web
```

Uji di emulator: buka keenam menu; cari dan buka surah; tandai ayat, kembali ke daftar, lanjutkan bacaan; jawab kuis; tutup/buka aplikasi untuk memeriksa penyimpanan; ganti akun untuk memeriksa pemisahan progres.

## Penyempurnaan font dan progres

- Font Amiri Quran dimuat dari aset paket `@expo-google-fonts/amiri-quran`, melalui `expo-font`. Berlaku pada bacaan dan latihan Arab. Teks tetap berasal dari EQuran.id.
- Progres dan pilihan program dimuat kembali saat halaman Belajar mendapat fokus. Program terakhir dipertahankan, sehingga progres program lain tidak tampak sebagai hilang.
- Setelah simpan, aplikasi membaca kembali nilai dari penyimpanan sebelum menyatakan berhasil. Kegagalan baca tidak boleh menyebabkan progres lama tertimpa.
- Ringkasan dan batang progres terlihat di daftar dan halaman latihan. Kembali ke daftar menampilkan indikator latihan selesai. Penanda bacaan juga dibaca ulang saat menu Al-Qur’an mendapat fokus.
- Pembaruan ini membutuhkan `npm install` setelah `git pull` untuk memasang paket font baru.

## Pengujian backend

Paket menyertakan pengujian akses materi, isolasi progres, penyimpanan berulang, dan validasi penanda. Jalankan dari folder Laravel setelah `php artisan config:clear`:

```sh
php vendor/bin/phpunit --configuration tests/phpunit-mobile.xml
```

Pengujian menggunakan SQLite di memori; memerlukan dependensi Composer pengembangan dan PDO SQLite. Pengujian runtime Laravel belum dijalankan di lingkungan pengerjaan ini karena PHP tidak tersedia. Sintaks file PHP diperiksa dengan parser, dan TypeScript serta verifikasi penyimpanan/sinkronisasi mobile dijalankan terpisah.
