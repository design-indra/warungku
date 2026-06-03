# WarungKu — Panduan Setup

## Urutan Setup

### 1. Setup Supabase
1. Buat project baru di https://supabase.com
2. Buka **SQL Editor** → paste seluruh isi file `supabase/schema.sql` → klik **Run**
3. Pergi ke **Settings → API** → copy:
   - `Project URL` → isi ke `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → isi ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Konfigurasi .env.local
```bash
cp .env.local.example .env.local
# Edit .env.local dan isi dengan kredensial Supabase kamu
```

### 3. Install & Jalankan
```bash
npm install
npm run dev
```
Buka http://localhost:3000

### 4. Deploy ke Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Buat project baru
railway init

# Tambah env vars di Railway dashboard (NEXT_PUBLIC_SUPABASE_URL & KEY)

# Deploy
railway up
```

## Struktur Project
```
warungku/
├── app/
│   ├── page.jsx              ← Landing Page (publik)
│   ├── auth/
│   │   ├── login/page.jsx    ← Halaman Login
│   │   └── register/page.jsx ← Halaman Register
│   ├── dashboard/
│   │   ├── layout.jsx        ← Sidebar + nav
│   │   ├── page.jsx          ← Dashboard utama
│   │   ├── kasir/            ← POS kasir
│   │   ├── stok/             ← Manajemen stok
│   │   ├── laporan/          ← Laporan & grafik
│   │   ├── hutang/           ← Hutang pelanggan
│   │   └── pengaturan/       ← Pengaturan & user
│   └── api/
│       ├── barang/           ← CRUD barang
│       ├── transaksi/        ← Simpan & ambil transaksi
│       ├── pelanggan/        ← CRUD pelanggan
│       ├── hutang/           ← Kelola hutang
│       └── laporan/          ← Agregasi laporan
├── components/
│   └── Icon.jsx              ← Shared SVG icons
├── lib/
│   ├── supabase.js           ← Client-side Supabase
│   └── supabase-server.js    ← Server-side Supabase
├── supabase/
│   └── schema.sql            ← Schema database lengkap
└── SETUP.md                  ← Panduan ini
```

## Status Phase

| Phase | Yang Dibangun | Status |
|-------|--------------|--------|
| Phase 1 | Landing Page + Auth + Middleware | ✅ Selesai |
| Phase 2 | Dashboard + Kasir POS + API Routes | ✅ Selesai |
| Phase 3 | Stok + Laporan + Hutang + DB Schema | ✅ Selesai |
| Phase 4 | Sistem paket + Cashi.id QRIS | ⏳ Menunggu API key |
| Phase 5 | PWA icons + manifest | ✅ Selesai |
