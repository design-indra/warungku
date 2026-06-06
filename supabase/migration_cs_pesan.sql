-- ============================================================
-- MIGRATION: Tabel cs_pesan (Customer Service)
-- Jalankan di Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS cs_pesan (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nama        TEXT        NOT NULL,
  no_hp       TEXT,
  topik       TEXT        NOT NULL DEFAULT 'Umum',
  pesan       TEXT        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'baru'
                          CHECK (status IN ('baru', 'diproses', 'selesai')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk query per user (riwayat pesan)
CREATE INDEX IF NOT EXISTS idx_cs_pesan_user_id
  ON cs_pesan(user_id, created_at DESC);

-- ── RLS ────────────────────────────────────────────────────
ALTER TABLE cs_pesan ENABLE ROW LEVEL SECURITY;

-- User hanya bisa lihat & insert pesan milik sendiri
CREATE POLICY "user kelola pesan cs sendiri" ON cs_pesan
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
