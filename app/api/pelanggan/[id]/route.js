import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// GET /api/pelanggan/[id] — detail pelanggan + riwayat transaksi
export async function GET(request, { params }) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('pelanggan')
      .select('*, transaksi(id, nomor_transaksi, total, created_at, metode_bayar)')
      .eq('id', params.id)
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/pelanggan/[id] — hapus pelanggan
export async function DELETE(request, { params }) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Cek apakah pelanggan punya hutang aktif
    const { data: hutang } = await supabase
      .from('hutang')
      .select('id, sisa')
      .eq('pelanggan_id', params.id)
      .gt('sisa', 0)

    if (hutang && hutang.length > 0) {
      return NextResponse.json(
        { error: 'Pelanggan masih memiliki hutang aktif. Selesaikan hutang terlebih dahulu.' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('pelanggan')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
