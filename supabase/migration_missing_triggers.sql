-- ============================================================
-- WARUNGKU — migration_missing_triggers.sql
-- Jalankan di Supabase SQL Editor
-- Fix:
--   1. get_tenant_plan (dibutuhkan migration_plan_limits.sql)
--   2. sync_plan_on_payment trigger (update tenants.plan otomatis)
--   3. enforce_kasir_limit trigger (batas kasir per plan)
--   4. Handle batal transaksi → hutang status fix
--      (dari migration_bugfix.sql sebelumnya, sekalian diupdate
--       karena hutang.status valid = 'belum_lunas'|'lunas' bukan 'batal')
-- ============================================================
-- ⚠️  Jalankan file ini SEBELUM migration_plan_limits.sql
-- ============================================================


-- ── 1. get_tenant_plan ───────────────────────────────────────
-- Helper yang dipakai enforce_cabang_limit, enforce_barang_limit,
-- enforce_kasir_limit, get_barang_quota
CREATE OR REPLACE FUNCTION public.get_tenant_plan(p_tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_plan       TEXT;
  v_expired_at TIMESTAMPTZ;
BEGIN
  SELECT plan, plan_expired_at
  INTO v_plan, v_expired_at
  FROM public.tenants
  WHERE id = p_tenant_id;

  IF v_plan IS NULL OR v_plan = 'free' THEN RETURN 'free'; END IF;
  IF v_expired_at IS NULL OR v_expired_at < NOW() THEN RETURN 'free'; END IF;
  RETURN v_plan;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';


-- ── 2. sync_plan_on_payment trigger ─────────────────────────
-- Otomatis update tenants.plan saat subscriptions.payment_status → 'paid'
CREATE OR REPLACE FUNCTION public.sync_plan_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    UPDATE public.tenants
    SET
      plan            = NEW.plan,
      plan_expired_at = NEW.expired_at
    WHERE id = NEW.tenant_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_sync_plan_on_payment ON public.subscriptions;
CREATE TRIGGER trg_sync_plan_on_payment
  AFTER UPDATE OF payment_status ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_plan_on_payment();


-- ── 3. enforce_kasir_limit trigger ──────────────────────────
-- Batas user kasir per plan: Free=1, Basic=3, Pro=unlimited
CREATE OR REPLACE FUNCTION public.enforce_kasir_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_plan  TEXT;
  v_count INTEGER;
  v_max   INTEGER;
BEGIN
  -- Hanya enforce untuk role kasir & admin (bukan owner)
  IF NEW.role = 'owner' THEN RETURN NEW; END IF;
  IF NOT NEW.is_active THEN RETURN NEW; END IF;

  v_plan := public.get_tenant_plan(NEW.tenant_id);

  SELECT COUNT(*) INTO v_count
  FROM public.user_profiles
  WHERE tenant_id = NEW.tenant_id
    AND is_active  = TRUE
    AND role      != 'owner'
    AND id        != NEW.id;  -- exclude diri sendiri (untuk UPDATE)

  v_max := CASE v_plan
    WHEN 'pro'   THEN 999999
    WHEN 'basic' THEN 3
    ELSE 1  -- free
  END;

  IF v_count >= v_max THEN
    RAISE EXCEPTION
      'Paket % hanya mengizinkan % kasir/admin. Upgrade paket untuk menambah lebih banyak.',
      v_plan, v_max
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_enforce_kasir_limit ON public.user_profiles;
CREATE TRIGGER trg_enforce_kasir_limit
  BEFORE INSERT OR UPDATE OF is_active ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_kasir_limit();


-- ── 4. handle_batal_transaksi trigger (update dari bugfix) ───
-- Update dari migration_bugfix.sql sebelumnya:
-- hutang.status saat batal transaksi → NULL (hapus hutang terkait)
-- karena hutang tabel hanya support 'belum_lunas' | 'lunas'
-- Batal transaksi = hutang belum terjadi, lebih tepat dihapus.
CREATE OR REPLACE FUNCTION public.handle_batal_transaksi()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'batal' AND OLD.status != 'batal' THEN

    -- Kembalikan stok semua item transaksi
    UPDATE public.barang b
    SET stok = stok + dt.qty
    FROM public.detail_transaksi dt
    WHERE dt.transaksi_id = NEW.id
      AND dt.barang_id    = b.id;

    -- Hapus hutang terkait (transaksi dibatalkan = hutang tidak pernah ada)
    -- Lebih aman daripada update status yang tidak valid
    DELETE FROM public.hutang
    WHERE transaksi_id = NEW.id
      AND status = 'belum_lunas';  -- jangan hapus yang sudah lunas (edge case)

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_handle_batal_transaksi ON public.transaksi;
CREATE TRIGGER trg_handle_batal_transaksi
  AFTER UPDATE OF status ON public.transaksi
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_batal_transaksi();


-- ── 5. increment_stok & generate_kode_barang ────────────────
-- Dari migration_bugfix.sql — disertakan ulang agar satu file

CREATE OR REPLACE FUNCTION public.increment_stok(p_barang_id UUID, p_qty INTEGER)
RETURNS VOID AS $$
  UPDATE public.barang SET stok = stok + p_qty WHERE id = p_barang_id;
$$ LANGUAGE SQL SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.generate_kode_barang(p_tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_count  INTEGER;
  v_kode   TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    SELECT COUNT(*) INTO v_count FROM public.barang WHERE tenant_id = p_tenant_id;
    v_kode := 'BRG-' || LPAD((v_count + 1)::TEXT, 4, '0');
    SELECT EXISTS (
      SELECT 1 FROM public.barang
      WHERE tenant_id = p_tenant_id AND kode_barang = v_kode
    ) INTO v_exists;
    EXIT WHEN NOT v_exists;
    v_count := v_count + 1;
  END LOOP;
  RETURN v_kode;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';


-- ============================================================
-- Urutan jalankan migration:
--   1. migration_missing_triggers.sql  ← file ini (dulu)
--   2. migration_plan_limits.sql       ← setelah ini
--   3. migration_pengaturan.sql
--   4. migration_cs_pesan.sql
--   5. migration_bugfix.sql            ← SKIP, sudah include di sini
--
-- Verifikasi:
-- SELECT routine_name FROM information_schema.routines
-- WHERE routine_schema = 'public'
-- ORDER BY routine_name;
-- ============================================================
