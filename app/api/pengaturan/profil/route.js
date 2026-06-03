import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

async function getTenantId(supabase, userId) {
  const { data } = await supabase
    .from('user_profiles')
    .select('tenant_id, role')
    .eq('id', userId)
    .single()
  return data
}

// GET /api/pengaturan/profil
export async function GET() {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await getTenantId(supabase, user.id)
    if (!profile) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })

    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('nama_warung, no_hp, alamat, logo_url, plan, plan_expired_at, satuan_list')
      .eq('id', profile.tenant_id)
      .single()

    if (error) throw error
    return NextResponse.json({ ...tenant, tenant_id: profile.tenant_id })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PUT /api/pengaturan/profil
// Body: { nama_warung, no_hp, alamat, satuan_list }
export async function PUT(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await getTenantId(supabase, user.id)
    if (!profile) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })
    if (profile.role !== 'owner') return NextResponse.json({ error: 'Hanya owner yang bisa mengubah profil warung' }, { status: 403 })

    const body = await request.json()
    const allowed = ['nama_warung', 'no_hp', 'alamat', 'satuan_list']
    const updates = {}
    allowed.forEach(k => { if (body[k] !== undefined) updates[k] = body[k] })

    if (Object.keys(updates).length === 0)
      return NextResponse.json({ error: 'Tidak ada data yang diubah' }, { status: 400 })

    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', profile.tenant_id)
      .select('nama_warung, no_hp, alamat, satuan_list')
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
