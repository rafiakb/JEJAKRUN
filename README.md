# JEJAKRUN — Web GPS Running Tracker

Aplikasi web responsif / PWA yang bisa dibuka langsung melalui Chrome Android, dipasang di layar utama, dan digunakan tanpa database/server backend.

## Fitur
- GPS `navigator.geolocation.watchPosition()` berakurasi tinggi.
- Jarak dari koordinat GPS dengan Haversine; mengabaikan titik dengan akurasi >55 m, pergerakan sangat kecil, dan lonjakan >8,5 m/detik.
- Durasi lari aktif, pace rata-rata, kecepatan rata-rata.
- Jeda / lanjutkan / selesai dan pemulihan sesi jeda setelah reload.
- Peta rute OpenStreetMap (Leaflet), titik lokasi, auto-follow.
- Riwayat aktivitas dan detail peta, hapus, ekspor GPX, berbagi ringkasan.
- Grafik 7 hari, target mingguan, ekspor seluruh riwayat ke JSON.
- UI responsif untuk HP/desktop, PWA + service worker untuk antarmuka offline.

## PENTING: Persyaratan GPS
1. **Harus dibuka melalui HTTPS** (misalnya setelah hosting di Vercel/Netlify/GitHub Pages). `http://localhost` juga diizinkan untuk pengujian pada laptop; `http://192.168.1.x` biasanya **tidak**.
2. Aktifkan GPS perangkat, izinkan lokasi presisi di browser dan beri izin saat diminta.
3. **Pelacakan browser tidak dijamin berlanjut ketika layar terkunci, aplikasi ditutup, atau Android menghemat baterai.** Untuk lari serius gunakan aplikasi Android native. Aplikasi mencoba Screen Wake Lock pada browser kompatibel untuk menjaga layar hidup.
4. Akurasi dipengaruhi GPS, sinyal, gedung, pohon, dan Android. Jangan gunakan untuk situasi keselamatan/medis.
5. OpenStreetMap memerlukan koneksi internet untuk **memuat peta**. Statistik aktivitas dan riwayat tersimpan lokal.
6. Data hanya ada di browser/perangkat tempat dipakai (`localStorage`). Tidak ada akun maupun sinkronisasi cloud. Jangan hapus data situs tanpa ekspor data terlebih dulu.

## Hosting mudah (direkomendasikan Netlify Drop)
- **Dari HP kamu bisa langsung unggah file `JejakRun_Web_Siap_Hosting.zip` tanpa ekstrak.**
- Buka https://app.netlify.com/drop di Chrome Android.
- Tekan **choose a file** / **pilih file**, lalu pilih ZIP yang baru diunduh. Netlify Drop mendukung ZIP dan memberi link publik HTTPS (mungkin perlu login jika ingin mengelola atau memperbarui website).
- Buka URL tersebut dari Chrome Android; izinkan GPS saat menjalankan lari.
- Chrome Android: menu **⋮ → Tambahkan ke layar utama / Install app**.

## Alternatif: Vercel
- Upload folder proyek ini ke GitHub (root berisi `index.html`), lalu Import Repository di Vercel sebagai situs statis. Framework preset: Other; output directory: kosong/default.
- URL produksi Vercel menggunakan HTTPS.

## Jalankan lokal
Dengan Python: `cd JejakRun_Web && python -m http.server 8000`, lalu buka `http://localhost:8000` pada browser laptop (GPS localhost mungkin berasal dari PC, bukan HP).

## Batasan
- Tidak termasuk file APK.
- Tidak menggunakan MySQL/XAMPP; website statis lebih praktis dan biaya hosting rendah.
- Data kegiatan bersifat lokal, tanpa akun dan tanpa sync lintas perangkat.
- PWA offline hanya untuk tampilan dasar setelah pernah dibuka; peta perlu internet.

© 2026 JejakRun. Desain dan kode prototipe.
