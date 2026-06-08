import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// GET /api/laporan/pelanggan
// Menggabungkan data pelanggan + hutang + ringkasan transaksi per pelanggan
export async function GET(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('user_profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile?.tenant_id) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })
    const tenantId = profile.tenant_id

    // Cek plan
    const { data: tenant } = await supabase
      .from('tenants').select('plan, plan_expired_at').eq('id', tenantId).single()
    const isPaid =
      tenant?.plan !== 'free' &&
      tenant?.plan_expired_at !== null &&
      new Date(tenant?.plan_expired_at) > new Date()

    // ── Ambil semua pelanggan ─────────────────────────────────
    const { data: pelanggan, error: pelErr } = await supabase
      .from('pelanggan')
      .select('id, nama, no_hp, alamat, created_at')
      .eq('tenant_id', tenantId)
      .order('nama')
    if (pelErr) throw pelErr

    // ── Ambil hutang (hanya paid plan) ───────────────────────
    let hutangMap = {}  // pelanggan_id → { total, sisa, jumlah }
    if (isPaid) {
      try {
        const { data: hutang } = await supabase
          .from('hutang')
          .select('pelanggan_id, jumlah, sisa')
          .eq('tenant_id', tenantId)
          .gt('sisa', 0)

        for (const h of hutang || []) {
          if (!h.pelanggan_id) continue
          if (!hutangMap[h.pelanggan_id]) hutangMap[h.pelanggan_id] = { total: 0, sisa: 0, count: 0 }
          hutangMap[h.pelanggan_id].total += h.jumlah
          hutangMap[h.pelanggan_id].sisa  += h.sisa
          hutangMap[h.pelanggan_id].count++
        }
      } catch { /* hutang feature gated */ }
    }

    // ── Ambil ringkasan transaksi per pelanggan ───────────────
    let trxMap = {}  // pelanggan_id → { jumlah_trx, total_belanja, last_trx }
    {
      const { data: trx } = await supabase
        .from('transaksi')
        .select('pelanggan_id, total, created_at')
        .eq('tenant_id', tenantId)
        .neq('status', 'batal')
        .not('pelanggan_id', 'is', null)
        .order('created_at', { ascending: false })

      for (const t of trx || []) {
        if (!t.pelanggan_id) continue
        if (!trxMap[t.pelanggan_id]) trxMap[t.pelanggan_id] = { jumlah_trx: 0, total_belanja: 0, last_trx: null }
        trxMap[t.pelanggan_id].jumlah_trx++
        trxMap[t.pelanggan_id].total_belanja += t.total
        if (!trxMap[t.pelanggan_id].last_trx) trxMap[t.pelanggan_id].last_trx = t.created_at
      }
    }

    // ── Gabungkan ─────────────────────────────────────────────
    const result = (pelanggan || []).map(p => ({
      ...p,
      hutang:        hutangMap[p.id]?.sisa        || 0,
      jumlah_hutang: hutangMap[p.id]?.count       || 0,
      jumlah_trx:    trxMap[p.id]?.jumlah_trx     || 0,
      total_belanja: trxMap[p.id]?.total_belanja  || 0,
      last_trx:      trxMap[p.id]?.last_trx       || null,
    }))

    // Summary
    const totalPelanggan = result.length
    const adaHutang      = result.filter(p => p.hutang > 0).length
    const totalHutang    = result.reduce((s, p) => s + p.hutang, 0)
    const totalBelanja   = result.reduce((s, p) => s + p.total_belanja, 0)

    return NextResponse.json({
      data: result,
      summary: {
        total_pelanggan: totalPelanggan,
        ada_hutang:      adaHutang,
        total_hutang:    totalHutang,
        total_belanja:   totalBelanja,
        is_paid:         isPaid,
      }
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
