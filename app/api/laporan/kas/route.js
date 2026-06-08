import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// GET /api/laporan/kas?from=...&to=...
// Laporan kas berbasis transaksi penjualan.
// Jika tabel "kas" (pengeluaran manual) ada, datanya juga diambil.
export async function GET(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('user_profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile?.tenant_id) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })
    const tenantId = profile.tenant_id

    const { data: tenant } = await supabase
      .from('tenants').select('plan, plan_expired_at').eq('id', tenantId).single()
    const isPaidActive =
      tenant?.plan !== 'free' &&
      tenant?.plan_expired_at !== null &&
      new Date(tenant?.plan_expired_at) > new Date()

    const { searchParams } = new URL(request.url)
    const today = new Date().toISOString().split('T')[0]
    let from = isPaidActive ? (searchParams.get('from') || new Date(Date.now() - 29 * 86400000).toISOString().split('T')[0]) : today
    let to   = isPaidActive ? (searchParams.get('to')   || today) : today

    const fromTs = from + 'T00:00:00'
    const toTs   = to   + 'T23:59:59'

    // ── Penjualan (pemasukan) ──────────────────────────────────
    const { data: trxData, error: trxErr } = await supabase
      .from('transaksi')
      .select('id, created_at, total, metode_bayar, nomor_transaksi')
      .eq('tenant_id', tenantId)
      .neq('status', 'batal')
      .gte('created_at', fromTs)
      .lte('created_at', toTs)
      .order('created_at', { ascending: false })
    if (trxErr) throw trxErr

    // ── Coba ambil tabel kas (pengeluaran) jika ada ────────────
    let kasData = []
    try {
      const { data: kas } = await supabase
        .from('kas')
        .select('id, created_at, keterangan, jumlah, jenis, kategori')
        .eq('tenant_id', tenantId)
        .gte('created_at', fromTs)
        .lte('created_at', toTs)
        .order('created_at', { ascending: false })
      kasData = kas || []
    } catch {
      // Tabel kas belum ada, skip
    }

    // ── Gabungkan jadi riwayat kas ─────────────────────────────
    const riwayat = []

    // Pemasukan dari penjualan
    for (const t of (trxData || [])) {
      // Transaksi hutang tidak masuk kas tunai
      const isHutang = t.metode_bayar === 'hutang'
      riwayat.push({
        id:         t.id,
        tanggal:    t.created_at,
        keterangan: `Penjualan ${t.nomor_transaksi || ''}`.trim(),
        jenis:      isHutang ? 'hutang' : 'masuk',
        jumlah:     t.total,
        kategori:   'Penjualan',
      })
    }

    // Pengeluaran dari tabel kas
    for (const k of kasData) {
      riwayat.push({
        id:         k.id,
        tanggal:    k.created_at,
        keterangan: k.keterangan || '-',
        jenis:      k.jenis || 'keluar',
        jumlah:     k.jumlah,
        kategori:   k.kategori || 'Lainnya',
      })
    }

    // Sort descending by tanggal
    riwayat.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))

    // ── Summary ───────────────────────────────────────────────
    const totalMasuk  = riwayat.filter(r => r.jenis === 'masuk').reduce((s, r) => s + r.jumlah, 0)
    const totalKeluar = riwayat.filter(r => r.jenis === 'keluar').reduce((s, r) => s + r.jumlah, 0)
    const totalHutang = riwayat.filter(r => r.jenis === 'hutang').reduce((s, r) => s + r.jumlah, 0)
    const saldoAkhir  = totalMasuk - totalKeluar

    // ── Per hari (untuk grafik) ────────────────────────────────
    const perHariMap = {}
    for (const r of riwayat) {
      const tgl = r.tanggal.split('T')[0]
      if (!perHariMap[tgl]) perHariMap[tgl] = { masuk: 0, keluar: 0, hutang: 0 }
      if (r.jenis === 'masuk')  perHariMap[tgl].masuk  += r.jumlah
      if (r.jenis === 'keluar') perHariMap[tgl].keluar += r.jumlah
      if (r.jenis === 'hutang') perHariMap[tgl].hutang += r.jumlah
    }
    const perHari = Object.entries(perHariMap)
      .map(([tgl, v]) => ({ tgl, ...v, net: v.masuk - v.keluar }))
      .sort((a, b) => a.tgl.localeCompare(b.tgl))

    return NextResponse.json({
      data: {
        riwayat,
        per_hari:      perHari,
        total_masuk:   totalMasuk,
        total_keluar:  totalKeluar,
        total_hutang:  totalHutang,
        saldo_akhir:   saldoAkhir,
        periode:       { from, to },
        is_paid:       isPaidActive,
      }
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
