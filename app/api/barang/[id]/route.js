import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function PUT(request, { params }) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { data, error } = await supabase.from('barang').update({
      nama: body.nama, satuan: body.satuan,
      harga_beli: Number(body.harga_beli), harga_jual: Number(body.harga_jual),
      stok: Number(body.stok), stok_minimum: Number(body.stok_minimum) || 5,
      emoji: body.emoji, kategori_id: body.kategori_id || null,
    }).eq('id', params.id).select().single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { error } = await supabase.from('barang').update({ is_active: false }).eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
