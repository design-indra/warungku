-- ============================================================
-- WARUNGKU — MIGRATION: PLAN LIMITS
-- Jalankan di Supabase SQL Editor
-- Isi:
--   1. Trigger enforce batas barang (Free=250, Basic=500, Pro=unlimited)
--   2. Update trigger cabang (Basic=3, bukan 1)
--   3. Fungsi get_barang_quota untuk frontend
-- ============================================================

-- ─── STEP 1: Update trigger enforce_cabang_limit ────────────
-- Basic sekarang = 3 cabang (sebelumnya 1)
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

  v_max := CASE v_plan
    WHEN 'pro'   THEN 999999
    WHEN 'basic' THEN 3
    ELSE 1   -- free
  END;

  IF v_count >= v_max THEN
    RAISE EXCEPTION
      'Paket % hanya mengizinkan % cabang. Upgrade paket untuk menambah cabang.',
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

-- ─── STEP 2: Trigger enforce batas barang ───────────────────
-- Free=250, Basic=500, Pro=unlimited
CREATE OR REPLACE FUNCTION public.enforce_barang_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_plan  TEXT;
  v_count INTEGER;
  v_max   INTEGER;
BEGIN
  v_plan := public.get_tenant_plan(NEW.tenant_id);

  SELECT COUNT(*) INTO v_count
  FROM public.barang
  WHERE tenant_id = NEW.tenant_id
    AND is_active = TRUE;

  v_max := CASE v_plan
    WHEN 'pro'   THEN 999999
    WHEN 'basic' THEN 500
    ELSE 250   -- free
  END;

  IF v_count >= v_max THEN
    RAISE EXCEPTION
      'Paket % hanya mengizinkan % barang. Upgrade paket untuk menambah lebih banyak barang.',
      v_plan, v_max
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_barang_limit ON public.barang;
CREATE TRIGGER trg_enforce_barang_limit
  BEFORE INSERT ON public.barang
  FOR EACH ROW EXECUTE FUNCTION public.enforce_barang_limit();

-- ─── STEP 3: Fungsi get_barang_quota ────────────────────────
-- Untuk frontend tampilkan sisa kuota barang
CREATE OR REPLACE FUNCTION public.get_barang_quota(p_tenant_id UUID)
RETURNS JSON AS $$
DECLARE
  v_plan  TEXT;
  v_max   INTEGER;
  v_used  INTEGER;
BEGIN
  v_plan := public.get_tenant_plan(p_tenant_id);

  v_max := CASE v_plan
    WHEN 'pro'   THEN 999999
    WHEN 'basic' THEN 500
    ELSE 250
  END;

  SELECT COUNT(*) INTO v_used
  FROM public.barang
  WHERE tenant_id = p_tenant_id
    AND is_active = TRUE;

  RETURN json_build_object(
    'plan',      v_plan,
    'used',      v_used,
    'max',       CASE WHEN v_plan = 'pro' THEN NULL ELSE v_max END,
    'remaining', CASE WHEN v_plan = 'pro' THEN NULL ELSE GREATEST(0, v_max - v_used) END,
    'unlimited', v_plan = 'pro'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─── SELESAI ─────────────────────────────────────────────────
-- Verifikasi setelah jalankan:
-- SELECT public.get_barang_quota('<tenant_id_kamu>');
-- Hasil: { "plan": "free", "used": 5, "max": 250, "remaining": 245, "unlimited": false }
