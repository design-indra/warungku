import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// GET /api/barang  → semua barang tenant ini
export async function GET(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const search    = searchParams.get('search') || ''
    const kategori  = searchParams.get('kategori') || ''
    const stokFilter = searchParams.get('stok') || ''

    let query = supabase
      .from('barang')
      .select('*, kategori(nama)')
      .eq('is_active', true)
      .order('nama')

    if (search)   query = query.ilike('nama', `%${search}%`)
    if (kategori) query = query.eq('kategori_id', kategori)
    if (stokFilter === 'rendah')  query = query.lte('stok', 10).gt('stok', 0)
    if (stokFilter === 'habis')   query = query.eq('stok', 0)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/barang  → tambah barang baru
export async function POST(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { data: profile } = await supabase.from('user_profiles').select('tenant_id').eq('id', user.id).single()

    const { data, error } = await supabase.from('barang').insert({
      tenant_id:   profile.tenant_id,
      nama:        body.nama,
      satuan:      body.satuan || 'pcs',
      harga_beli:  Number(body.harga_beli) || 0,
      harga_jual:  Number(body.harga_jual) || 0,
      stok:        Number(body.stok) || 0,
      stok_minimum: Number(body.stok_minimum) || 5,
      kategori_id: body.kategori_id || null,
      emoji:       body.emoji || '📦',
    }).select().single()

    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
