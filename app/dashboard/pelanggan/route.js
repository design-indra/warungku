import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data, error } = await supabase.from('pelanggan').select('*').order('nama')
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { data: profile } = await supabase.from('user_profiles').select('tenant_id').eq('id', user.id).single()
    const { data, error } = await supabase.from('pelanggan').insert({
      tenant_id: profile.tenant_id, nama: body.nama, no_hp: body.no_hp || null, alamat: body.alamat || null,
    }).select().single()
    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
