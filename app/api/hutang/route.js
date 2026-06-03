import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// GET hutang beserta pelanggan + riwayat bayar
export async function GET() {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('hutang')
      .select('*, pelanggan(id, nama, no_hp), pembayaran_hutang(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
