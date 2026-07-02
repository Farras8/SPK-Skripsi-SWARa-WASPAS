# Sistem Pendukung Keputusan Pemilihan Supplier

Aplikasi web untuk manajemen toko sekaligus sistem pendukung keputusan (SPK) pemilihan supplier terbaik menggunakan metode **SWARA** (Subjective Weight Assessment Ratio Analysis) untuk pembobotan kriteria dan **WASPAS** (Weighted Aggregated Sum Product Assessment) untuk perankingan supplier.

## Fitur Utama

- **Manajemen Produk & Supplier** — CRUD produk, supplier, dan pemetaan supplier per produk
- **SPK Pemilihan Supplier** — Pembobotan kriteria dengan SWARA, perankingan supplier dengan WASPAS
- **Manajemen Kriteria Dinamis** — Kriteria dapat dikonfigurasi secara fleksibel (benefit/cost, product/supplier)
- **Manajemen Stok** — Pencatatan stok masuk dan penyesuaian
- **Purchase Order** — Pembuatan dan penerimaan PO dari supplier
- **Penjualan & Piutang** — Pencatatan transaksi penjualan dan hutang pelanggan
- **Laporan** — Ringkasan data operasional toko
- **Multi-role** — Role `super_admin` dan user biasa

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel 12 (PHP 8.2+) |
| Frontend | React + Inertia.js v2 |
| Styling | Tailwind CSS |
| Auth | Laravel Breeze |
| Database | MySQL |
| Build Tool | Vite |

## Persyaratan

- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL

## Instalasi

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd skrpsi-app
composer install
npm install
```

### 2. Konfigurasi environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit file `.env` sesuaikan konfigurasi database (DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD).

### 3. Migrasi database

```bash
php artisan migrate
```

### 4. Build frontend

```bash
npm run build
```

### 5. Jalankan aplikasi

```bash
php artisan serve
```

Atau jalankan semua service sekaligus (server + queue + logs + vite):

```bash
composer dev
```

Akses aplikasi di `http://127.0.0.1:8000`

## Setup Cepat (Satu Perintah)

```bash
composer setup
```

Perintah ini otomatis menjalankan: `composer install` → copy `.env` → generate key → migrate → `npm install` → `npm run build`

## Struktur Modul SPK

```
app/
├── Http/Controllers/
│   ├── CriteriaController.php        # CRUD kriteria + kalkulasi SWARA
│   ├── RecommendationController.php  # Halaman rekomendasi supplier
│   └── ...
├── Services/
│   └── WaspasService.php             # Kalkulasi WASPAS (λ = 0.5)
└── Models/
    ├── Criteria.php                  # Model kriteria (bobot SWARA)
    ├── CriteriaValue.php             # Nilai kriteria per supplier/produk
    ├── Supplier.php
    ├── Product.php
    └── ProductSupplier.php           # Relasi produk-supplier
```

## Alur SPK

1. **Input Kriteria** — Tambah kriteria dengan tipe (cost/benefit) dan kategori (product/supplier)
2. **Bobot SWARA** — Input nilai perbandingan antar kriteria, sistem hitung bobot otomatis
3. **Input Nilai Kriteria** — Isi nilai kriteria untuk setiap supplier per produk
4. **Rekomendasi** — Pilih produk, sistem ranking supplier menggunakan WASPAS

## Endpoint Utama

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/criteria` | Daftar kriteria |
| POST | `/criteria` | Tambah kriteria |
| POST | `/criteria/save-weights` | Simpan bobot SWARA |
| GET | `/suppliers` | Daftar supplier beserta nilai kriteria |
| POST | `/suppliers` | Tambah supplier |
| GET | `/products/{id}/manage-suppliers` | Kelola supplier per produk |
| POST | `/products/{id}/save-suppliers` | Simpan data supplier produk |
| GET | `/recommendations` | Halaman rekomendasi supplier (WASPAS) |

## Menjalankan Test

```bash
composer test
```
