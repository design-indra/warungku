import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// GET /api/laporan?from=2024-05-01&to=2024-05-31&period=harian
export async function GET(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    let from   = searchParams.get('from') || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
    let to     = searchParams.get('to')   || new Date().toISOString().split('T')[0]

    // Ambil tenant_id + cek plan
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()
    if (!profile?.tenant_id) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })
    const tenantId = profile.tenant_id

    // Cek plan: free hanya boleh laporan hari ini
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

    // Free user: paksa from & to ke hari ini saja
    if (!isPaidActive) {
      from = today
      to   = today
    }

    // Omzet + laba per hari (filter per tenant)
    const { data: trxData } = await supabase
      .from('transaksi')
      .select('created_at, total, status')
      .eq('tenant_id', tenantId)
      .gte('created_at', from)
      .lte('created_at', to + 'T23:59:59')
      .neq('status', 'batal')

    // Barang terlaris (filter via join transaksi.tenant_id)
    const { data: detailData } = await supabase
      .from('detail_transaksi')
      .select('nama_barang, qty, harga_jual, harga_beli, transaksi!inner(created_at, status, tenant_id)')
      .eq('transaksi.tenant_id', tenantId)
      .gte('transaksi.created_at', from)
      .lte('transaksi.created_at', to + 'T23:59:59')
      .neq('transaksi.status', 'batal')

    // Hitung omzet per hari
    const omzetPerHari = {}
    trxData?.forEach(t => {
      const tgl = t.created_at.split('T')[0]
      if (!omzetPerHari[tgl]) omzetPerHari[tgl] = { omzet: 0, jumlah_trx: 0 }
      omzetPerHari[tgl].omzet += t.total
      omzetPerHari[tgl].jumlah_trx++
    })

    // Summary
    const totalOmzet = trxData?.reduce((s, t) => s + t.total, 0) || 0
    const totalTrx   = trxData?.length || 0

    // Laba dari detail
    const totalLaba  = detailData?.reduce((s, d) => s + (d.harga_jual - d.harga_beli) * d.qty, 0) || 0

    // Top barang
    const barangMap = {}
    detailData?.forEach(d => {
      if (!barangMap[d.nama_barang]) barangMap[d.nama_barang] = { nama: d.nama_barang, qty: 0 }
      barangMap[d.nama_barang].qty += d.qty
    })
    const topBarang = Object.values(barangMap).sort((a, b) => b.qty - a.qty).slice(0, 10)

    return NextResponse.json({
      data: {
        omzet_per_hari:  Object.entries(omzetPerHari).map(([tgl, v]) => ({ tgl, ...v })),
        total_omzet:     totalOmzet,
        total_transaksi: totalTrx,
        total_laba:      totalLaba,
        top_barang:      topBarang,
      }
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
