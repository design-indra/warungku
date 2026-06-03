-- ============================================================
-- WARUNGKU — Migration: Pengaturan + Plan Enforcement + Security Fix
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- ─── 1. Tambah kolom satuan_list di tenants ─────────────────
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS satuan_list TEXT[] DEFAULT ARRAY['pcs','kg','liter','pack','dus'];

-- ─── 2. Pastikan kolom plan_expired_at ada ──────────────────
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS plan_expired_at TIMESTAMPTZ;

-- ─── 3. Fix function get_my_tenant_id (search_path + public prefix) ──
CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

-- ─── 4. Fix function update_updated_at ──────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = '';

-- ─── 5. Fix function kurangi_stok ───────────────────────────
CREATE OR REPLACE FUNCTION kurangi_stok()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.barang SET stok = stok - NEW.qty WHERE id = NEW.barang_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- ─── 6. Fix function generate_nomor_transaksi ───────────────
CREATE OR REPLACE FUNCTION generate_nomor_transaksi()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.nomor_transaksi IS NULL OR NEW.nomor_transaksi = '' THEN
    NEW.nomor_transaksi := 'TRX-' ||
      TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
      LPAD((
        SELECT COUNT(*) + 1 FROM public.transaksi
        WHERE tenant_id = NEW.tenant_id
          AND DATE(created_at) = CURRENT_DATE
      )::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- ─── 7. Fix function handle_new_user ────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id   UUID;
  v_cabang_id   UUID;
  v_nama_warung TEXT;
BEGIN
  v_nama_warung := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'nama_warung'), ''),
    'Warung Saya'
  );

  INSERT INTO public.tenants (owner_id, nama_warung, no_hp, plan)
  VALUES (
    NEW.id,
    v_nama_warung,
    COALESCE(NEW.raw_user_meta_data->>'no_hp', ''),
    'free'
  )
  RETURNING id INTO v_tenant_id;

  INSERT INTO public.cabang (tenant_id, nama, alamat)
  VALUES (v_tenant_id, 'Pusat', '-')
  RETURNING id INTO v_cabang_id;

  INSERT INTO public.user_profiles (id, tenant_id, cabang_id, nama_lengkap, role)
  VALUES (
    NEW.id,
    v_tenant_id,
    v_cabang_id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), NEW.email),
    'owner'
  );

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user error untuk user %: % %', NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ─── 8. Fix RLS tenants ─────────────────────────────────────
DROP POLICY IF EXISTS "owner baca tenant sendiri" ON tenants;
DROP POLICY IF EXISTS "owner update tenant sendiri" ON tenants;
DROP POLICY IF EXISTS "owner delete tenant sendiri" ON tenants;
DROP POLICY IF EXISTS "service role insert tenant" ON tenants;

CREATE POLICY "owner baca tenant sendiri" ON tenants
  FOR SELECT USING (owner_id = (SELECT auth.uid()));
CREATE POLICY "owner update tenant sendiri" ON tenants
  FOR UPDATE USING (owner_id = (SELECT auth.uid()));
CREATE POLICY "owner delete tenant sendiri" ON tenants
  FOR DELETE USING (owner_id = (SELECT auth.uid()));
CREATE POLICY "service role insert tenant" ON tenants
  FOR INSERT WITH CHECK (true);

-- ─── 9. Fix RLS cabang ──────────────────────────────────────
DROP POLICY IF EXISTS "user lihat cabang" ON cabang;
DROP POLICY IF EXISTS "owner kelola cabang" ON cabang;
DROP POLICY IF EXISTS "service insert cabang" ON cabang;

CREATE POLICY "user lihat cabang" ON cabang
  FOR SELECT USING (tenant_id = get_my_tenant_id());
CREATE POLICY "owner kelola cabang" ON cabang
  FOR ALL USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid()))
  );
CREATE POLICY "service insert cabang" ON cabang
  FOR INSERT WITH CHECK (true);

-- ─── 10. Fix RLS user_profiles ──────────────────────────────
DROP POLICY IF EXISTS "user lihat profil sendiri" ON user_profiles;
DROP POLICY IF EXISTS "user update profil sendiri" ON user_profiles;
DROP POLICY IF EXISTS "service insert user_profiles" ON user_profiles;

CREATE POLICY "user lihat profil sendiri" ON user_profiles
  FOR SELECT USING (id = (SELECT auth.uid()) OR tenant_id = get_my_tenant_id());
CREATE POLICY "user update profil sendiri" ON user_profiles
  FOR UPDATE USING (id = (SELECT auth.uid()));
CREATE POLICY "service insert user_profiles" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- ─── 11. Hapus view berbahaya ────────────────────────────────
DROP VIEW IF EXISTS public.v_tenant_users;

-- ─── 12. Function cek plan aktif ────────────────────────────
CREATE OR REPLACE FUNCTION is_plan_active(p_tenant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT
    plan != 'free'
    AND plan_expired_at IS NOT NULL
    AND plan_expired_at > NOW()
  FROM public.tenants
  WHERE id = p_tenant_id
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION get_tenant_plan(p_tenant_id UUID)
RETURNS TEXT AS $$
  SELECT
    CASE
      WHEN plan = 'free' THEN 'free'
      WHEN plan_expired_at IS NULL OR plan_expired_at <= NOW() THEN 'free'
      ELSE plan
    END
  FROM public.tenants
  WHERE id = p_tenant_id
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';
