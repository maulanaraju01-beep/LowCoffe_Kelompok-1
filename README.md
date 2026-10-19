# Low Coffe - Aplikasi Pemesanan Kopi dan Makanan dengan Dashboard Admin

Aplikasi web monolitik pemesanan kopi dan makanan **Low Coffe** ("*premium coffee for you*"), dirancang sesuai dengan spesifikasi presentasi **LowCoffe_Kelompok-1.pptx** dan 17 prototype screen Figma.

---

## 👥 Tim Pengembang (Kelompok 5)
Mata Kuliah: **Konsep dan Pengembangan Aplikasi (Semester 5)**

| NIM | Nama Anggota | Pembagian Tugas (Sesuai Slide 9) |
|---|---|---|
| **240705049** | Annisa Sri Mentari | Setup proyek frontend & design system, onboarding, login & registrasi (FR-01) |
| **240705090** | Syahri Ramadhan | Daftar menu, pencarian & filter kategori, favorit (FR-02, FR-03) *(Owner & Manager)* |
| **240705103** | Putroe Balqis | Keranjang, profil dan akun, bottom navigation (FR-04, FR-05) |
| **240705114** | Latifah Annum HSB | Dashboard admin dan manajemen pesanan (FR-06, FR-07) |
| **240705128** | Kaisar Nahara Akbar | Laporan penjualan, manajemen produk & stok |
| **240705166** | Maulana Raju | Pengaturan toko, pengujian responsif HP dan laptop |

---

## 🏗️ Arsitektur Sistem (Sesuai Slide 7)
* **Arsitektur**: Monolitik (Monolithic Web Architecture)
* **Frontend**: HTML5, CSS3 kustom (Design tokens extracted from Figma), Vanilla JavaScript (Zero build step, 100% stabil tanpa error bundling)
* **Backend**: Node.js & Express (REST API untuk autentikasi, katalog menu, pemesanan, laporan penjualan, dan pengaturan toko)
* **Database**: 
  - Embedded JSON Database (`data/db.json`) dengan atomic persistence (langsung jalan tanpa konfigurasi tambahan)
  - Skema SQL siap impor MySQL (`database.sql`) untuk kebutuhan database relational

---

## 📱 Struktur Halaman & Fitur (Sesuai Slide 8 & Prototype)

### A. Alur Pelanggan (Customer)
1. **Onboarding Walkthrough (`/onboarding`)**:
   - Slide 1: *"pesan kopi yang kamu sukai !"* (Callouts: 1 Shot, Susu Segar, Gula Aren)
   - Slide 2: *"Di mana kamu bisa pilih biji kopi yang kamu sukai"* (Callouts: Fresh Milk, Oat Milk, Arabika Gayo)
   - Slide 3: *"Laper? kamu bisa pesan makanan juga"* (Callouts: French Fries, Spaghetti, Croissant)
2. **Autentikasi (`/login`)**:
   - Tab Masuk & Daftar
   - Form Email, Telepon, Kata Sandi (dengan toggle lihat sandi)
   - Tombol Google Account Login & Quick Demo switch
3. **Katalog Menu & Kustomisasi (`/menu`)**:
   - Filter Kategori: *Semua, Kopi, Non-Kopi, Makanan, Snack*
   - Pencarian real-time (live search)
   - Tombol simpan menu favorit ❤️
   - Modal Kustomisasi Pesanan (Suhu: Panas/Dingin, Biji Kopi: Arabika Gayo/Robusta, Susu: Fresh Milk/Oat Milk/Soy Milk, Ekstra Shot: +1 Shot, Tingkat Kemanisan, Catatan Khusus)
4. **Menu Favorit (`/favorit`)**:
   - Daftar racikan menu yang disukai pengguna
   - 1-klik tambah ke keranjang
5. **Keranjang & Checkout (`/keranjang`)**:
   - Stepper jumlah item `[- 1 +]`
   - Rincian kustomisasi item
   - Pilihan: *Makan di Tempat (Dine-in)* dengan nomor meja, atau *Bawa Pulang (Takeaway)*
   - Pilihan Pembayaran: *QRIS* / *Tunai di Kasir*
   - Rincian biaya: Subtotal + Biaya Layanan (Rp 2.000) = Total Bayar
   - Checkout langsung masuk ke antrean pesanan admin secara real-time
6. **Profil Akun (`/akun`)**:
   - Data Pelanggan: *Danesyya Qamrut* (`danesyya.q@email.com`)
   - Riwayat Pesanan Saya (*Baru, Diproses, Selesai*)
   - Modal Edit Profil

### B. Alur Espresso Admin (`/admin`)
7. **Dashboard Overview (`/admin`)**:
   - Ringkasan KPI: *Pesanan Hari Ini (24)*, *Total Pendapatan (Rp 1.548.000)*, *Pelanggan Aktif (12)*
   - Daftar pesanan masuk terbaru
   - Grafik mini ringkasan penjualan mingguan
8. **Manajemen Pesanan (`/admin/orders`)**:
   - Filter status: *Semua, Baru, Diproses, Selesai, Dibatalkan*
   - Aksi kasir/barista: *Terima & Proses*, *Tandai Selesai*, *Batalkan*
9. **Katalog Produk & Stok (`/admin/menu`)**:
   - Tambah menu baru
   - Edit nama, kategori, harga, dan deskripsi
   - Toggle switch status ketersediaan stok (*Tersedia / Habis*)
   - Hapus menu
10. **Laporan Penjualan (`/admin/reports`)**:
    - Filter rentang waktu penjualan
    - Total Penjualan (*Rp 12.450.000*), Rata-rata Order (*Rp 48.500*)
    - Grafik Performa Trend Penjualan interaktif (Chart.js / Canvas)
    - Ranking Menu Terlaris (*Top Selling*)
    - Tombol Cetak / Print Laporan
11. **Pengaturan Kedai & Tim (`/admin/settings`)**:
    - Profil Owner: *Syahri Ramadhan* (NIM: 240705090)
    - Toggle Status Toko Buka/Tutup
    - Jam Operasional & Alamat Kedai
    - Pengaturan Notifikasi Suara
    - Daftar lengkap NIM & Nama anggota Kelompok 5
    - Reset data awal presentasi

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Prasyarat
- Node.js (versi 16 atau lebih baru)

### 2. Instalasi & Menjalankan Server
Buka terminal / PowerShell di folder proyek ini:
```bash
# Instal dependensi (jika belum)
npm install

# Jalankan server
npm start
```

### 3. Akses Melalui Browser
Buka browser dan akses:
* **Aplikasi Utama**: [http://localhost:3000](http://localhost:3000)
* **Katalog Pelanggan**: [http://localhost:3000/menu](http://localhost:3000/menu)
* **Espresso Admin**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🎮 Fitur Khusus Pengujian & Presentasi Dosen
Di bagian atas web, terdapat bilah kontrol global (*Global Topbar*):
1. **Lompat Halaman**: Dropdown instan untuk langsung melompat ke salah satu dari 11 halaman/fitur tanpa harus klik satu per satu.
2. **Ganti Peran (Role Switcher)**: 1-klik berganti antara mode **Pelanggan** (*Danesyya Qamrut*) dan **Admin** (*Syahri Ramadhan*).
3. **Mode HP vs Mode Web**: 
   - Klik tombol **Mode HP** untuk melihat aplikasi dalam bingkai **iPhone Frame mockup** persis seperti screenshot prototype Figma.
   - Klik tombol **Mode Web** untuk melihat tampilan lebar responsif untuk layar laptop.
4. **Info Kelompok 5**: Menampilkan modal pop-up lengkap pembagian tugas seluruh anggota kelompok.
