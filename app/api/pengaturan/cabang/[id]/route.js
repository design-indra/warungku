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

// PUT /api/pengaturan/cabang/[id]
export async function PUT(request, { params }) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await getProfile(supabase, user.id)
    if (!profile || profile.role !== 'owner')
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })

    const { nama, alamat } = await request.json()
    if (!nama?.trim()) return NextResponse.json({ error: 'Nama cabang wajib diisi' }, { status: 400 })

    const { data, error } = await supabase
      .from('cabang')
      .update({ nama: nama.trim(), alamat: alamat?.trim() || '' })
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id) // pastikan hanya milik tenant ini
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/pengaturan/cabang/[id] — soft delete (is_active = false)
export async function DELETE(request, { params }) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await getProfile(supabase, user.id)
    if (!profile || profile.role !== 'owner')
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })

    // Cek minimal harus ada 1 cabang aktif
    const { count } = await supabase
      .from('cabang')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', profile.tenant_id)
      .eq('is_active', true)

    if (count <= 1)
      return NextResponse.json({ error: 'Minimal harus ada 1 cabang aktif' }, { status: 400 })

    const { error } = await supabase
      .from('cabang')
      .update({ is_active: false })
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
