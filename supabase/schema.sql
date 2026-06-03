-- ============================================================
-- WARUNGKU - Supabase Schema
-- Jalankan file ini di Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TENANTS (satu per owner/warung) ────────────────────────
CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_warung   TEXT NOT NULL,
  no_hp         TEXT,
  alamat        TEXT,
  logo_url      TEXT,
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro')),
  plan_expired_at TIMESTAMPTZ,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CABANG ─────────────────────────────────────────────────
CREATE TABLE cabang (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nama        TEXT NOT NULL,
  alamat      TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── USERS / KASIR ──────────────────────────────────────────
CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
  cabang_id   UUID REFERENCES cabang(id),
  nama_lengkap TEXT,
  role        TEXT NOT NULL DEFAULT 'kasir' CHECK (role IN ('owner', 'kasir', 'admin')),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── KATEGORI BARANG ────────────────────────────────────────
CREATE TABLE kategori (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nama      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BARANG ─────────────────────────────────────────────────
CREATE TABLE barang (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  kategori_id   UUID REFERENCES kategori(id),
  nama          TEXT NOT NULL,
  satuan        TEXT NOT NULL DEFAULT 'pcs',
  harga_beli    INTEGER NOT NULL DEFAULT 0,
  harga_jual    INTEGER NOT NULL DEFAULT 0,
  stok          INTEGER NOT NULL DEFAULT 0,
  stok_minimum  INTEGER NOT NULL DEFAULT 5,
  barcode       TEXT,
  emoji         TEXT DEFAULT '📦',
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PELANGGAN ──────────────────────────────────────────────
CREATE TABLE pelanggan (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nama        TEXT NOT NULL,
  no_hp       TEXT,
  alamat      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TRANSAKSI ──────────────────────────────────────────────
CREATE TABLE transaksi (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cabang_id       UUID REFERENCES cabang(id),
  kasir_id        UUID REFERENCES auth.users(id),
  pelanggan_id    UUID REFERENCES pelanggan(id),
  nomor_transaksi TEXT NOT NULL,
  total           INTEGER NOT NULL DEFAULT 0,
  diskon          INTEGER NOT NULL DEFAULT 0,
  total_bayar     INTEGER NOT NULL DEFAULT 0,
  metode_bayar    TEXT NOT NULL DEFAULT 'tunai' CHECK (metode_bayar IN ('tunai', 'qris', 'hutang', 'transfer')),
  status          TEXT NOT NULL DEFAULT 'lunas' CHECK (status IN ('lunas', 'hutang', 'batal')),
  catatan         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DETAIL TRANSAKSI ───────────────────────────────────────
CREATE TABLE detail_transaksi (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaksi_id    UUID NOT NULL REFERENCES transaksi(id) ON DELETE CASCADE,
  barang_id       UUID NOT NULL REFERENCES barang(id),
  nama_barang     TEXT NOT NULL, -- snapshot nama saat transaksi
  harga_jual      INTEGER NOT NULL,
  harga_beli      INTEGER NOT NULL,
  qty             INTEGER NOT NULL,
  subtotal        INTEGER NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── HUTANG ─────────────────────────────────────────────────
CREATE TABLE hutang (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  pelanggan_id    UUID NOT NULL REFERENCES pelanggan(id),
  transaksi_id    UUID REFERENCES transaksi(id),
  jumlah          INTEGER NOT NULL,
  sisa            INTEGER NOT NULL,
  catatan         TEXT,
  status          TEXT NOT NULL DEFAULT 'belum_lunas' CHECK (status IN ('belum_lunas', 'lunas')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PEMBAYARAN HUTANG ──────────────────────────────────────
CREATE TABLE pembayaran_hutang (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hutang_id   UUID NOT NULL REFERENCES hutang(id) ON DELETE CASCADE,
  jumlah      INTEGER NOT NULL,
  catatan     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SUBSCRIPTIONS (untuk SaaS) ─────────────────────────────
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan            TEXT NOT NULL CHECK (plan IN ('basic', 'pro')),
  payment_status  TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'expired')),
  invoice_url     TEXT,
  amount          INTEGER NOT NULL,
  expired_at      TIMESTAMPTZ,
  payment_ref     TEXT, -- referensi dari Cashi.id
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE tenants             ENABLE ROW LEVEL SECURITY;
ALTER TABLE cabang              ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE kategori            ENABLE ROW LEVEL SECURITY;
ALTER TABLE barang              ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelanggan           ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi           ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_transaksi    ENABLE ROW LEVEL SECURITY;
ALTER TABLE hutang              ENABLE ROW LEVEL SECURITY;
ALTER TABLE pembayaran_hutang   ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions       ENABLE ROW LEVEL SECURITY;

-- Helper: ambil tenant_id milik user yang sedang login
CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ── Tenants ──
CREATE POLICY "owner dapat kelola tenant" ON tenants
  USING (owner_id = auth.uid());

-- ── Cabang ──
CREATE POLICY "user melihat cabang tenant sendiri" ON cabang
  USING (tenant_id = get_my_tenant_id());

CREATE POLICY "owner kelola cabang" ON cabang
  FOR ALL USING (
    tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
  );

-- ── User Profiles ──
CREATE POLICY "user lihat profil sendiri" ON user_profiles
  USING (id = auth.uid() OR tenant_id = get_my_tenant_id());

-- ── Kategori, Barang, Pelanggan ──
CREATE POLICY "user lihat barang tenant" ON kategori    USING (tenant_id = get_my_tenant_id());
CREATE POLICY "user kelola barang"       ON barang      USING (tenant_id = get_my_tenant_id());
CREATE POLICY "user kelola pelanggan"    ON pelanggan   USING (tenant_id = get_my_tenant_id());

-- ── Transaksi & Detail ──
CREATE POLICY "user lihat transaksi tenant"        ON transaksi          USING (tenant_id = get_my_tenant_id());
CREATE POLICY "user lihat detail transaksi tenant" ON detail_transaksi   USING (
  transaksi_id IN (SELECT id FROM transaksi WHERE tenant_id = get_my_tenant_id())
);

-- ── Hutang & Pembayaran ──
CREATE POLICY "user kelola hutang tenant"          ON hutang             USING (tenant_id = get_my_tenant_id());
CREATE POLICY "user lihat pembayaran hutang"       ON pembayaran_hutang  USING (
  hutang_id IN (SELECT id FROM hutang WHERE tenant_id = get_my_tenant_id())
);

-- ── Subscriptions ──
CREATE POLICY "owner lihat subscription" ON subscriptions
  USING (tenant_id = get_my_tenant_id());

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_barang_updated_at BEFORE UPDATE ON barang
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_hutang_updated_at BEFORE UPDATE ON hutang
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-kurangi stok setelah detail_transaksi insert
CREATE OR REPLACE FUNCTION kurangi_stok()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE barang SET stok = stok - NEW.qty WHERE id = NEW.barang_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kurangi_stok AFTER INSERT ON detail_transaksi
  FOR EACH ROW EXECUTE FUNCTION kurangi_stok();

-- Auto-generate nomor transaksi
CREATE OR REPLACE FUNCTION generate_nomor_transaksi()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.nomor_transaksi IS NULL OR NEW.nomor_transaksi = '' THEN
    NEW.nomor_transaksi := 'TRX-' ||
      TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
      LPAD((
        SELECT COUNT(*) + 1 FROM transaksi
        WHERE tenant_id = NEW.tenant_id
          AND DATE(created_at) = CURRENT_DATE
      )::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_nomor_transaksi BEFORE INSERT ON transaksi
  FOR EACH ROW EXECUTE FUNCTION generate_nomor_transaksi();

-- Auto-create tenant + cabang + profile saat user register
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
  v_cabang_id UUID;
  v_nama_warung TEXT;
BEGIN
  v_nama_warung := COALESCE(NEW.raw_user_meta_data->>'nama_warung', 'Warung Saya');

  INSERT INTO tenants (owner_id, nama_warung, no_hp, plan)
  VALUES (NEW.id, v_nama_warung, NEW.raw_user_meta_data->>'no_hp', 'free')
  RETURNING id INTO v_tenant_id;

  INSERT INTO cabang (tenant_id, nama, alamat)
  VALUES (v_tenant_id, 'Pusat', '-')
  RETURNING id INTO v_cabang_id;

  INSERT INTO user_profiles (id, tenant_id, cabang_id, nama_lengkap, role)
  VALUES (
    NEW.id, v_tenant_id, v_cabang_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'owner'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_new_user AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- INDEXES (performa query)
-- ============================================================
CREATE INDEX idx_barang_tenant       ON barang(tenant_id);
CREATE INDEX idx_transaksi_tenant    ON transaksi(tenant_id);
CREATE INDEX idx_transaksi_created   ON transaksi(tenant_id, created_at DESC);
CREATE INDEX idx_detail_transaksi    ON detail_transaksi(transaksi_id);
CREATE INDEX idx_hutang_tenant       ON hutang(tenant_id);
CREATE INDEX idx_hutang_pelanggan    ON hutang(pelanggan_id);
CREATE INDEX idx_pelanggan_tenant    ON pelanggan(tenant_id);
