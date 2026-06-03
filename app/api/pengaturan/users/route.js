import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

// Admin client — untuk invite user baru via auth.admin
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

// GET /api/pengaturan/users
export async function GET() {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await getProfile(supabase, user.id)
    if (!profile) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, nama_lengkap, role, is_active, created_at, cabang:cabang_id(nama)')
      .eq('tenant_id', profile.tenant_id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/pengaturan/users — invite user baru ke tenant ini
// Body: { email, nama_lengkap, role, cabang_id }
export async function POST(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await getProfile(supabase, user.id)
    if (!profile) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })
    if (profile.role !== 'owner') return NextResponse.json({ error: 'Hanya owner yang bisa menambah user' }, { status: 403 })

    const { email, nama_lengkap, role, cabang_id } = await request.json()
    if (!email?.trim()) return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })
    if (!['kasir', 'admin'].includes(role)) return NextResponse.json({ error: 'Role harus kasir atau admin' }, { status: 400 })

    // Invite user via Supabase Auth
    const { data: inviteData, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email.trim(), {
      data: { full_name: nama_lengkap, nama_warung: '' },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    })

    if (inviteErr) {
      // Jika user sudah ada, coba cari user_id-nya langsung
      if (!inviteErr.message?.includes('already been registered')) throw inviteErr
    }

    // Cari user ID berdasarkan email
    const { data: { users: existingUsers } } = await supabaseAdmin.auth.admin.listUsers()
    const targetUser = existingUsers.find(u => u.email === email.trim())
    if (!targetUser) return NextResponse.json({ error: 'Gagal menemukan user' }, { status: 500 })

    // Cek apakah sudah terdaftar di tenant ini
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', targetUser.id)
      .eq('tenant_id', profile.tenant_id)
      .maybeSingle()

    if (existing) return NextResponse.json({ error: 'User sudah terdaftar di warung ini' }, { status: 409 })

    // Upsert user_profile — jika user baru dari invite, profile dibuat di sini
    const { data: newProfile, error: profileErr } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id:           targetUser.id,
        tenant_id:    profile.tenant_id,
        cabang_id:    cabang_id || null,
        nama_lengkap: nama_lengkap?.trim() || email,
        role:         role,
        is_active:    true,
      }, { onConflict: 'id' })
      .select()
      .single()

    if (profileErr) throw profileErr

    return NextResponse.json({ success: true, data: newProfile }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
