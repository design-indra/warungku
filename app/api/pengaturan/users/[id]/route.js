import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function getProfile(supabase, userId) {
  const { data } = await supabase
    .from('user_profiles')
    .select('tenant_id, role')
    .eq('id', userId)
    .single()
  return data
}

// PUT /api/pengaturan/users/[id] — ubah role / cabang
export async function PUT(request, { params }) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await getProfile(supabase, user.id)
    if (!profile || profile.role !== 'owner')
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })

    // Tidak boleh edit diri sendiri lewat sini
    if (params.id === user.id)
      return NextResponse.json({ error: 'Gunakan fitur profil untuk mengubah data diri sendiri' }, { status: 400 })

    const { nama_lengkap, role, cabang_id } = await request.json()
    if (!['kasir', 'admin'].includes(role))
      return NextResponse.json({ error: 'Role harus kasir atau admin' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ nama_lengkap, role, cabang_id: cabang_id || null })
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/pengaturan/users/[id] — nonaktifkan user (soft delete)
export async function DELETE(request, { params }) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await getProfile(supabase, user.id)
    if (!profile || profile.role !== 'owner')
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })

    if (params.id === user.id)
      return NextResponse.json({ error: 'Tidak bisa menghapus akun diri sendiri' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ is_active: false })
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
