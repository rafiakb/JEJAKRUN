# JejakRun — GPS Running Tracker

**JejakRun** adalah aplikasi web pelacak lari yang responsif dan bisa dipasang ke layar utama HP sebagai **Progressive Web App (PWA)**. Aplikasi ini membantu mencatat jarak, durasi, pace, rute perjalanan, dan perkembangan lari menggunakan GPS perangkat.

**Website:** https://jejakrun-website.vercel.app  
**Source code:** https://github.com/rafiakb/JEJAKRUN  
**Pembaruan dokumentasi:** 28 Oktober 2026

## Fitur utama

- **GPS tracking:** Menghitung jarak dari lokasi perangkat melalui Geolocation API, dengan penyaringan titik berakurasi rendah dan lonjakan posisi.
- **Statistik langsung:** Jarak (km), durasi lari aktif, pace rata-rata (menit/km), dan kecepatan rata-rata.
- **Kontrol sesi:** Mulai, jeda, lanjutkan, serta selesaikan lari. Sesi yang tersimpan sementara dapat dipulihkan dalam keadaan dijeda setelah halaman dimuat ulang.
- **Peta rute:** Visualisasi jalur menggunakan Leaflet dan OpenStreetMap.
- **Riwayat aktivitas:** Lihat aktivitas sebelumnya beserta ringkasan dan peta, hapus aktivitas, serta ekspor rute ke **GPX**.
- **Progres mingguan:** Grafik jarak 7 hari terakhir dan target kilometer mingguan yang bisa diubah.
- **Ekspor data:** Cadangkan seluruh riwayat sebagai file **JSON** dan bagikan ringkasan aktivitas.
- **PWA responsif:** Tampilan nyaman di Android dan desktop, dengan kemampuan memasang ikon aplikasi ke layar utama pada browser yang mendukung.

## Teknologi

| Teknologi | Penggunaan |
| --- | --- |
| HTML, CSS, JavaScript | Antarmuka dan logika aplikasi |
| Geolocation API | Pengambilan koordinat GPS |
| Leaflet + OpenStreetMap | Peta dan visualisasi rute |
| localStorage | Penyimpanan riwayat di browser |
| Web App Manifest + Service Worker | Dukungan instalasi PWA dan aset antarmuka dasar |
| GitHub | Repository dan pengelolaan kode |
| Vercel | Hosting HTTPS |

## Cara menggunakan di HP

1. Buka **https://jejakrun-website.vercel.app** di Chrome Android.
2. Aktifkan lokasi/GPS dan izinkan akses lokasi untuk situs tersebut.
3. Pilih **Mulai Lari**, kemudian berjalan atau berlari di area terbuka.
4. Gunakan **Jeda** atau **Lanjutkan** jika diperlukan, lalu pilih **Selesai** untuk menyimpan aktivitas.
5. Buka menu **Riwayat** dan **Statistik** untuk melihat hasilnya.
6. Jika tersedia, pilih menu Chrome **⋮ → Tambahkan ke layar utama / Instal aplikasi**.

**Saran:** Untuk pelacakan GPS selama lari, usahakan layar tetap menyala. Browser dapat menghentikan pembaruan lokasi ketika layar terkunci atau aplikasi berada di latar belakang.

## Menjalankan proyek secara lokal

1. Clone repository menggunakan `git clone https://github.com/rafiakb/JEJAKRUN.git` atau unduh source code.
2. Buka folder `JEJAKRUN` di VS Code.
3. Jalankan server lokal, misalnya melalui terminal:

   `python -m http.server 8000`

4. Buka `http://localhost:8000` di browser laptop.

Akses GPS pada website memerlukan **HTTPS** atau **localhost** yang dianggap aman oleh browser. Membuka file `index.html` langsung atau memakai alamat HTTP biasa di HP tidak disarankan untuk pengujian GPS.

## Deploy ke Vercel

Repository **`rafiakb/JEJAKRUN` sudah dihubungkan** dengan proyek Vercel **`jejakrun-website`** pada 28 Oktober 2026.

Alur pembaruan kode:

1. Edit file melalui VS Code.
2. Simpan perubahan, lalu lakukan **Commit**.
3. Lakukan **Push / Sync Changes** ke branch `main` di GitHub.
4. Periksa halaman **Deployments** proyek Vercel dan pastikan build terbaru berstatus **Ready**.

Integrasi GitHub–Vercel sudah terhubung, tetapi **pengujian auto-deploy dari commit terbaru masih perlu dipastikan**. Perubahan README tidak mengubah fitur aplikasi.

## Struktur proyek

```text
JEJAKRUN/
├── index.html
├── styles.css
├── app.js
├── manifest.webmanifest
├── sw.js
├── icons/
│   ├── icon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── netlify.toml
└── README.md
```

## Batasan versi saat ini

- **Belum ada login akun atau database online.** Riwayat disimpan menggunakan `localStorage` pada browser/perangkat masing-masing dan **belum tersinkronisasi** antara HP dan laptop.
- Menghapus data situs, menggunakan mode privat, atau berpindah browser dapat menyebabkan riwayat tidak tersedia. Ekspor JSON secara berkala untuk cadangan.
- Pelacakan GPS ketika layar terkunci atau browser berada di latar belakang **tidak dijamin** pada versi web.
- Akurasi GPS bergantung pada perangkat, kondisi sinyal, dan lingkungan sekitar.
- Peta OpenStreetMap memerlukan internet untuk memuat ubin peta; sebagian antarmuka PWA dapat tersedia setelah pernah dibuka.
- Ini adalah proyek prototipe, bukan aplikasi navigasi atau perangkat keselamatan.

## Rencana pengembangan

- [ ] Login dan registrasi pengguna.
- [ ] Sinkronisasi riwayat lari dengan database online (misalnya Supabase).
- [ ] Pengujian GPS langsung pada beberapa HP Android.
- [ ] Peningkatan ketahanan pelacakan saat layar terkunci melalui aplikasi Android native bila diperlukan.

---

© 2026 JejakRun. Proyek prototipe GPS running tracker.
