import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// PATCH /api/transaksi/[id] → update status ke 'batal'
export async function PATCH(request, { params }) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { id } = await params

    if (body.status !== 'batal') {
      return NextResponse.json({ error: 'Hanya boleh mengubah status ke batal' }, { status: 400 })
    }

    // Ambil tenant_id user
    const { data: profile } = await supabase
      .from('user_profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile?.tenant_id) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })

    // Cek transaksi milik tenant ini
    const { data: trx, error: fetchErr } = await supabase
      .from('transaksi')
      .select('id, status, tenant_id')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (fetchErr || !trx) return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 })
    if (trx.status === 'batal') return NextResponse.json({ error: 'Transaksi sudah dibatalkan' }, { status: 400 })

    // Update status → trigger handle_batal_transaksi otomatis:
    // 1. Kembalikan stok semua item
    // 2. Hapus hutang terkait (jika belum lunas)
    const { error: updateErr } = await supabase
      .from('transaksi')
      .update({ status: 'batal' })
      .eq('id', id)

    if (updateErr) throw updateErr
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
