-- ============================================================
-- WARUNGKU — FINAL FIX (aman dijalankan berulang kali)
-- Jalankan file INI SAJA di Supabase SQL Editor
-- Sudah include semua yang dibutuhkan dari schema + migration
-- ============================================================

-- ─── STEP 1: Pastikan fungsi helper ada ──────────────────────
-- get_my_tenant_id() — mungkin gagal dibuat di schema.sql
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ─── STEP 2: Pastikan kolom satuan_list ada di tenants ───────
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS satuan_list TEXT[] DEFAULT ARRAY['pcs','kg','liter','pack','dus'];

-- ─── STEP 3: Fungsi get_tenant_plan ─────────────────────────
CREATE OR REPLACE FUNCTION public.get_tenant_plan(p_tenant_id UUID)
RETURNS TEXT AS $$
  SELECT
    CASE
      WHEN plan = 'free'                                       THEN 'free'
      WHEN plan_expired_at IS NULL OR plan_expired_at <= NOW() THEN 'free'
      ELSE plan
    END
  FROM public.tenants
  WHERE id = p_tenant_id
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ─── STEP 4: Fungsi get_my_plan ─────────────────────────────
CREATE OR REPLACE FUNCTION public.get_my_plan()
RETURNS TEXT AS $$
  SELECT public.get_tenant_plan(public.get_my_tenant_id())
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ─── STEP 5: Fungsi is_plan_active ──────────────────────────
CREATE OR REPLACE FUNCTION public.is_plan_active(p_tenant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT
    plan != 'free'
    AND plan_expired_at IS NOT NULL
    AND plan_expired_at > NOW()
  FROM public.tenants
  WHERE id = p_tenant_id
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ─── STEP 6: Trigger sync plan saat payment paid ────────────
CREATE OR REPLACE FUNCTION public.sync_plan_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS DISTINCT FROM 'paid') THEN
    UPDATE public.tenants
    SET
      plan            = NEW.plan,
      plan_expired_at = NEW.expired_at,
      updated_at      = NOW()
    WHERE id = NEW.tenant_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_plan_on_payment ON public.subscriptions;
CREATE TRIGGER trg_sync_plan_on_payment
  AFTER UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_plan_on_payment();

-- ─── STEP 7: Trigger enforce batas kasir ────────────────────
-- free=1, basic=3, pro=unlimited | owner dikecualikan
CREATE OR REPLACE FUNCTION public.enforce_kasir_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_plan  TEXT;
  v_count INTEGER;
  v_max   INTEGER;
BEGIN
  IF NEW.role = 'owner' THEN RETURN NEW; END IF;

  v_plan := public.get_tenant_plan(NEW.tenant_id);

  SELECT COUNT(*) INTO v_count
  FROM public.user_profiles
  WHERE tenant_id = NEW.tenant_id
    AND role IN ('kasir', 'admin')
    AND is_active = TRUE;

  v_max := CASE v_plan
    WHEN 'pro'   THEN 9999
    WHEN 'basic' THEN 3
    ELSE 1
  END;

  IF v_count >= v_max THEN
    RAISE EXCEPTION
      'Paket % hanya mengizinkan % kasir/admin. Upgrade paket untuk menambah user.',
      v_plan, v_max
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_kasir_limit ON public.user_profiles;
CREATE TRIGGER trg_enforce_kasir_limit
  BEFORE INSERT ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_kasir_limit();

-- ─── STEP 8: Trigger enforce batas cabang ───────────────────
-- free=1, basic=1, pro=unlimited
CREATE OR REPLACE FUNCTION public.enforce_cabang_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_plan  TEXT;
  v_count INTEGER;
  v_max   INTEGER;
BEGIN
  v_plan := public.get_tenant_plan(NEW.tenant_id);

  SELECT COUNT(*) INTO v_count
  FROM public.cabang
  WHERE tenant_id = NEW.tenant_id
    AND is_active = TRUE;

  v_max := CASE v_plan WHEN 'pro' THEN 9999 ELSE 1 END;

  IF v_count >= v_max THEN
    RAISE EXCEPTION
      'Paket % hanya mengizinkan % cabang aktif. Upgrade ke Pro untuk cabang tidak terbatas.',
      v_plan, v_max
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_cabang_limit ON public.cabang;
CREATE TRIGGER trg_enforce_cabang_limit
  BEFORE INSERT ON public.cabang
  FOR EACH ROW EXECUTE FUNCTION public.enforce_cabang_limit();

-- ─── STEP 9: handle_new_user (bypass limit untuk registrasi) ─
CREATE OR REPLACE FUNCTION public.handle_new_user()
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

  -- Bypass limit cabang untuk setup awal
  ALTER TABLE public.cabang DISABLE TRIGGER trg_enforce_cabang_limit;
  INSERT INTO public.cabang (tenant_id, nama, alamat)
  VALUES (v_tenant_id, 'Pusat', '-')
  RETURNING id INTO v_cabang_id;
  ALTER TABLE public.cabang ENABLE TRIGGER trg_enforce_cabang_limit;

  -- Role owner tidak kena enforce_kasir_limit
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
  BEGIN
    ALTER TABLE public.cabang ENABLE TRIGGER trg_enforce_cabang_limit;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RAISE WARNING 'handle_new_user error untuk user %: % %', NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_new_user ON auth.users;
CREATE TRIGGER trg_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── STEP 10: RLS Tenants (DROP IF EXISTS dulu agar tidak duplikat) ──
DROP POLICY IF EXISTS "owner baca tenant sendiri"    ON public.tenants;
DROP POLICY IF EXISTS "owner update tenant sendiri"  ON public.tenants;
DROP POLICY IF EXISTS "owner delete tenant sendiri"  ON public.tenants;
DROP POLICY IF EXISTS "service role insert tenant"   ON public.tenants;
DROP POLICY IF EXISTS "owner dapat kelola tenant"    ON public.tenants;

CREATE POLICY "owner baca tenant sendiri" ON public.tenants
  FOR SELECT USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "owner update tenant sendiri" ON public.tenants
  FOR UPDATE USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "owner delete tenant sendiri" ON public.tenants
  FOR DELETE USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "service role insert tenant" ON public.tenants
  FOR INSERT WITH CHECK (true);

-- ─── STEP 11: RLS Subscriptions ─────────────────────────────
DROP POLICY IF EXISTS "owner kelola subscription"      ON public.subscriptions;
DROP POLICY IF EXISTS "owner baca subscription"        ON public.subscriptions;
DROP POLICY IF EXISTS "owner insert subscription"      ON public.subscriptions;
DROP POLICY IF EXISTS "service update subscription"    ON public.subscriptions;
DROP POLICY IF EXISTS "service role kelola subscription" ON public.subscriptions;

CREATE POLICY "owner baca subscription" ON public.subscriptions
  FOR SELECT
  USING (tenant_id = public.get_my_tenant_id());

CREATE POLICY "owner insert subscription" ON public.subscriptions
  FOR INSERT
  WITH CHECK (tenant_id = public.get_my_tenant_id());

-- Update oleh webhook (service_role key bypass RLS by default,
-- tapi tambahkan policy ini sebagai jaga-jaga)
CREATE POLICY "service update subscription" ON public.subscriptions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ─── STEP 12: Index ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON public.subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_ref    ON public.subscriptions(payment_ref);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(tenant_id, payment_status, expired_at DESC);
CREATE INDEX IF NOT EXISTS idx_tenants_owner        ON public.tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant ON public.user_profiles(tenant_id);

-- ─── STEP 13: Unique constraint barang (untuk import) ────────
ALTER TABLE public.barang
  DROP CONSTRAINT IF EXISTS barang_tenant_nama_unique;
ALTER TABLE public.barang
  ADD CONSTRAINT barang_tenant_nama_unique UNIQUE (tenant_id, nama);

-- ─── STEP 14: Fungsi reset plan expired (opsional cron) ──────
CREATE OR REPLACE FUNCTION public.reset_expired_plans()
RETURNS INTEGER AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE public.tenants
  SET plan = 'free', plan_expired_at = NULL, updated_at = NOW()
  WHERE plan != 'free'
    AND plan_expired_at IS NOT NULL
    AND plan_expired_at < NOW();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── SELESAI ─────────────────────────────────────────────────
-- Verifikasi: jalankan query ini untuk cek semua fungsi terbuat:
-- SELECT routine_name FROM information_schema.routines
-- WHERE routine_schema = 'public'
-- AND routine_name IN ('get_my_tenant_id','get_tenant_plan','get_my_plan','is_plan_active','sync_plan_on_payment','enforce_kasir_limit','enforce_cabang_limit','handle_new_user','reset_expired_plans');
