-- Tabel sementara untuk menyimpan HTML struk sebelum dibuka di browser
-- Data otomatis expired setelah 10 menit

CREATE TABLE IF NOT EXISTS struk_temp (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  html        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expired_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes')
);

-- Index untuk query by expired_at (untuk cleanup)
CREATE INDEX IF NOT EXISTS idx_struk_temp_expired ON struk_temp(expired_at);

-- RLS: public bisa read by id (tidak butuh auth karena token UUID sudah random)
ALTER TABLE struk_temp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_struk_temp" ON struk_temp
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_select_struk_temp" ON struk_temp
  FOR SELECT USING (expired_at > now());

CREATE POLICY "allow_delete_struk_temp" ON struk_temp
  FOR DELETE USING (true);
