import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// PATCH /api/transaksi/[id] → update status (e.g. batal)
export async function PATCH(request, { params }) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { id } = await params

    // Validasi: hanya boleh update ke 'batal'
    if (body.status !== 'batal') {
      return NextResponse.json({ error: 'Hanya boleh mengubah status ke batal' }, { status: 400 })
    }

    // Cek transaksi milik tenant yang sama
    const { data: trx, error: fetchErr } = await supabase
      .from('transaksi')
      .select('id, status, detail_transaksi(*)')
      .eq('id', id)
      .single()
    if (fetchErr || !trx) return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 })
    if (trx.status === 'batal') return NextResponse.json({ error: 'Transaksi sudah dibatalkan' }, { status: 400 })

    // Update status
    const { error: updateErr } = await supabase
      .from('transaksi')
      .update({ status: 'batal' })
      .eq('id', id)
    if (updateErr) throw updateErr

    // Kembalikan stok barang
    for (const d of trx.detail_transaksi || []) {
      await supabase.rpc('increment_stok', { p_barang_id: d.barang_id, p_qty: d.qty })
        .catch(() => {
          // fallback jika tidak ada RPC: update manual
          supabase.from('barang').select('stok').eq('id', d.barang_id).single()
            .then(({ data }) => {
              if (data) supabase.from('barang').update({ stok: data.stok + d.qty }).eq('id', d.barang_id)
            })
        })
    }

    // Jika transaksi hutang, update status hutang juga
    await supabase.from('hutang').update({ status: 'dibatalkan' }).eq('transaksi_id', id)

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
