import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

async function getProfile(supabase, userId) {
  const { data } = await supabase
    .from('user_profiles')
    .select('tenant_id, role')
    .eq('id', userId)
    .single()
  return data
}

// GET /api/pengaturan/cabang
export async function GET() {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await getProfile(supabase, user.id)
    if (!profile) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })

    const { data, error } = await supabase
      .from('cabang')
      .select('id, nama, alamat, is_active, created_at')
      .eq('tenant_id', profile.tenant_id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/pengaturan/cabang
// Body: { nama, alamat }
// ⚠️  Trigger enforce_cabang_limit di DB akan blokir jika plan tidak izinkan.
export async function POST(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await getProfile(supabase, user.id)
    if (!profile) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })
    if (profile.role !== 'owner') return NextResponse.json({ error: 'Hanya owner yang bisa menambah cabang' }, { status: 403 })

    const { nama, alamat } = await request.json()
    if (!nama?.trim()) return NextResponse.json({ error: 'Nama cabang wajib diisi' }, { status: 400 })

    const { data, error } = await supabase
      .from('cabang')
      .insert({ tenant_id: profile.tenant_id, nama: nama.trim(), alamat: alamat?.trim() || '' })
      .select()
      .single()

    if (error) {
      // Tangkap error dari trigger plan limit (ERRCODE P0001)
      if (error.code === 'P0001' || error.message?.includes('Paket')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      throw error
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
