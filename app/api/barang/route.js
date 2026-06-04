import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// GET /api/barang
export async function GET(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const search      = searchParams.get('search') || ''
    const kategori    = searchParams.get('kategori') || ''
    const stokFilter  = searchParams.get('stok') || ''
    const page        = Number(searchParams.get('page')) || 1
    const limit       = Number(searchParams.get('limit')) || 25
    const offset      = (page - 1) * limit

    let query = supabase
      .from('barang')
      .select('*, kategori(id, nama)', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search)   query = query.ilike('nama', `%${search}%`)
    if (kategori) query = query.eq('kategori_id', kategori)
    if (stokFilter === 'rendah')  query = query.lte('stok', 10).gt('stok', 0)
    if (stokFilter === 'habis')   query = query.eq('stok', 0)

    const { data, error, count } = await query
    if (error) throw error
    return NextResponse.json({ data, total: count, page, limit })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/barang
export async function POST(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { data: profile } = await supabase.from('user_profiles').select('tenant_id').eq('id', user.id).single()

    // Auto-generate kode jika tidak diisi
    let kode = body.kode_barang?.trim() || null
    if (!kode) {
      const { data: kodeData } = await supabase.rpc('generate_kode_barang', { p_tenant_id: profile.tenant_id })
      kode = kodeData
    }

    // Cari atau buat kategori berdasarkan nama
    let kategori_id = body.kategori_id || null
    if (!kategori_id && body.kategori) {
      const { data: kat } = await supabase
        .from('kategori')
        .select('id')
        .eq('tenant_id', profile.tenant_id)
        .ilike('nama', body.kategori)
        .maybeSingle()

      if (kat) {
        kategori_id = kat.id
      } else {
        const { data: newKat } = await supabase
          .from('kategori')
          .insert({ tenant_id: profile.tenant_id, nama: body.kategori })
          .select('id')
          .single()
        kategori_id = newKat?.id || null
      }
    }

    const { data, error } = await supabase.from('barang').insert({
      tenant_id:    profile.tenant_id,
      kode_barang:  kode,
      nama:         body.nama,
      satuan:       body.satuan || 'pcs',
      harga_beli:   Number(body.harga_beli) || 0,
      harga_jual:   Number(body.harga_jual) || 0,
      stok:         Number(body.stok) || 0,
      stok_minimum: Number(body.stok_minimum) || 5,
      kategori_id,
      emoji:        body.emoji || '📦',
      foto_url:     body.foto_url || null,
      barcode:      body.barcode || null,
    }).select('*, kategori(id, nama)').single()

    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
