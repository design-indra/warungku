import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// GET /api/laporan?from=2024-05-01&to=2024-05-31
export async function GET(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    let from = searchParams.get('from') || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
    let to   = searchParams.get('to')   || new Date().toISOString().split('T')[0]

    // Ambil tenant_id
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()
    if (!profile?.tenant_id) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })
    const tenantId = profile.tenant_id

    // Cek plan
    const { data: tenant } = await supabase
      .from('tenants')
      .select('plan, plan_expired_at')
      .eq('id', tenantId)
      .single()

    const now = new Date()
    const isPaidActive =
      tenant?.plan !== 'free' &&
      tenant?.plan_expired_at !== null &&
      new Date(tenant?.plan_expired_at) > now

    const today = new Date().toISOString().split('T')[0]
    if (!isPaidActive) { from = today; to = today }

    // ── Transaksi periode ini ──────────────────────────────
    const { data: trxData } = await supabase
      .from('transaksi')
      .select('created_at, total, status, metode_bayar')
      .eq('tenant_id', tenantId)
      .gte('created_at', from)
      .lte('created_at', to + 'T23:59:59')
      .neq('status', 'batal')

    // ── Detail transaksi (barang terlaris + kategori) ──────
    const { data: detailData } = await supabase
      .from('detail_transaksi')
      .select('nama_barang, qty, harga_jual, harga_beli, barang_id, transaksi!inner(created_at, status, tenant_id)')
      .eq('transaksi.tenant_id', tenantId)
      .gte('transaksi.created_at', from)
      .lte('transaksi.created_at', to + 'T23:59:59')
      .neq('transaksi.status', 'batal')

    // ── Ambil kategori barang untuk penjualan per kategori ─
    let perKategori = []
    if (detailData?.length > 0) {
      const barangIds = [...new Set(detailData.map(d => d.barang_id).filter(Boolean))]
      if (barangIds.length > 0) {
        const { data: barangData } = await supabase
          .from('barang')
          .select('id, kategori(nama)')
          .in('id', barangIds)

        const barangKatMap = {}
        barangData?.forEach(b => { barangKatMap[b.id] = b.kategori?.nama || 'Lainnya' })

        const katMap = {}
        detailData.forEach(d => {
          const kat = barangKatMap[d.barang_id] || 'Lainnya'
          if (!katMap[kat]) katMap[kat] = { nama: kat, omzet: 0, qty: 0 }
          katMap[kat].omzet += d.harga_jual * d.qty
          katMap[kat].qty   += d.qty
        })
        const totalOmzetKat = Object.values(katMap).reduce((s, k) => s + k.omzet, 0) || 1
        perKategori = Object.values(katMap)
          .sort((a, b) => b.omzet - a.omzet)
          .map(k => ({ ...k, persen: Math.round((k.omzet / totalOmzetKat) * 100) }))
      }
    }

    // ── Omzet per hari ────────────────────────────────────
    const omzetPerHari = {}
    trxData?.forEach(t => {
      const tgl = t.created_at.split('T')[0]
      if (!omzetPerHari[tgl]) omzetPerHari[tgl] = { omzet: 0, jumlah_trx: 0 }
      omzetPerHari[tgl].omzet     += t.total
      omzetPerHari[tgl].jumlah_trx++
    })

    // ── Metode pembayaran ─────────────────────────────────
    const metodeMap = {}
    trxData?.forEach(t => {
      const m = t.metode_bayar || 'tunai'
      if (!metodeMap[m]) metodeMap[m] = { metode: m, jumlah: 0, omzet: 0 }
      metodeMap[m].jumlah++
      metodeMap[m].omzet += t.total
    })
    const totalTrxMetode = trxData?.length || 1
    const perMetode = Object.values(metodeMap)
      .sort((a, b) => b.jumlah - a.jumlah)
      .map(m => ({ ...m, persen: Math.round((m.jumlah / totalTrxMetode) * 100) }))

    // ── Summary ───────────────────────────────────────────
    const totalOmzet = trxData?.reduce((s, t) => s + t.total, 0) || 0
    const totalTrx   = trxData?.length || 0
    const totalLaba  = detailData?.reduce((s, d) => s + (d.harga_jual - d.harga_beli) * d.qty, 0) || 0
    const totalQty   = detailData?.reduce((s, d) => s + d.qty, 0) || 0
    const rataRata   = totalTrx > 0 ? Math.round(totalOmzet / totalTrx) : 0

    // ── Top barang ────────────────────────────────────────
    const barangMap = {}
    detailData?.forEach(d => {
      if (!barangMap[d.nama_barang]) barangMap[d.nama_barang] = { nama: d.nama_barang, qty: 0, omzet: 0 }
      barangMap[d.nama_barang].qty   += d.qty
      barangMap[d.nama_barang].omzet += d.harga_jual * d.qty
    })
    const topBarang = Object.values(barangMap).sort((a, b) => b.qty - a.qty).slice(0, 10)

    return NextResponse.json({
      data: {
        omzet_per_hari:  Object.entries(omzetPerHari)
          .map(([tgl, v]) => ({ tgl, ...v }))
          .sort((a, b) => a.tgl.localeCompare(b.tgl)),
        total_omzet:     totalOmzet,
        total_transaksi: totalTrx,
        total_laba:      totalLaba,
        total_qty:       totalQty,
        rata_rata:       rataRata,
        top_barang:      topBarang,
        per_kategori:    perKategori,
        per_metode:      perMetode,
      }
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
