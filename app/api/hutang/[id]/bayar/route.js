import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// POST /api/hutang/:id/bayar
export async function POST(request, { params }) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { jumlah, catatan } = await request.json()

    // 1. Ambil hutang
    const { data: hutang } = await supabase.from('hutang').select('*').eq('id', params.id).single()
    const sisa_baru = Math.max(0, hutang.sisa - Number(jumlah))

    // 2. Insert pembayaran
    await supabase.from('pembayaran_hutang').insert({ hutang_id: params.id, jumlah: Number(jumlah), catatan })

    // 3. Update sisa & status hutang
    await supabase.from('hutang').update({
      sisa:   sisa_baru,
      status: sisa_baru === 0 ? 'lunas' : 'belum_lunas',
    }).eq('id', params.id)

    return NextResponse.json({ success: true, sisa: sisa_baru })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
