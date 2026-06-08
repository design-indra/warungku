import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// GET /api/laporan/stok?filter=semua|kritis|habis&search=...
export async function GET(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('user_profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile?.tenant_id) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'semua'  // semua | kritis | habis
    const search = searchParams.get('search') || ''

    // Ambil semua barang aktif beserta kategori
    let query = supabase
      .from('barang')
      .select('id, kode_barang, nama, stok, stok_minimum, harga_jual, harga_beli, satuan, kategori(nama)')
      .eq('tenant_id', profile.tenant_id)
      .eq('is_active', true)
      .order('nama')

    if (search) query = query.ilike('nama', `%${search}%`)

    const { data: barang, error: barangErr } = await query
    if (barangErr) throw barangErr

    const semua = barang || []

    // Hitung status stok
    const withStatus = semua.map(b => {
      const minStok = b.stok_minimum ?? 5
      let status = 'aman'
      if (b.stok === 0)            status = 'habis'
      else if (b.stok <= minStok)  status = 'kritis'
      return { ...b, status, stok_minimum: minStok }
    })

    // Filter
    let filtered = withStatus
    if (filter === 'kritis') filtered = withStatus.filter(b => b.status === 'kritis')
    if (filter === 'habis')  filtered = withStatus.filter(b => b.status === 'habis')

    // Summary
    const totalSku     = semua.length
    const totalKritis  = withStatus.filter(b => b.status === 'kritis').length
    const totalHabis   = withStatus.filter(b => b.status === 'habis').length
    const totalAman    = withStatus.filter(b => b.status === 'aman').length
    const nilaiStok    = withStatus.reduce((s, b) => s + (b.stok * (b.harga_beli || 0)), 0)

    return NextResponse.json({
      data: filtered,
      summary: {
        total_sku:    totalSku,
        total_kritis: totalKritis,
        total_habis:  totalHabis,
        total_aman:   totalAman,
        nilai_stok:   nilaiStok,
      }
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
