import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

async function getTenant(supabase, userId) {
  const { data } = await supabase
    .from('user_profiles')
    .select('tenant_id, role')
    .eq('id', userId)
    .single()
  return data
}

// PUT /api/pemasok/[id]
export async function PUT(request, { params }) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await getTenant(supabase, user.id)
    if (!profile) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })

    const body = await request.json()
    if (!body.nama?.trim()) {
      return NextResponse.json({ error: 'Nama pemasok wajib diisi' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('pemasok')
      .update({
        nama: body.nama.trim(),
        perusahaan: body.perusahaan?.trim() || null,
        no_hp: body.no_hp?.trim() || null,
        alamat: body.alamat?.trim() || null,
        produk_info: body.produk_info?.trim() || null,
        catatan: body.catatan?.trim() || null,
      })
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/pemasok/[id]
export async function DELETE(request, { params }) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await getTenant(supabase, user.id)
    if (!profile) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })

    const { error } = await supabase
      .from('pemasok')
      .delete()
      .eq('id', params.id)
      .eq('tenant_id', profile.tenant_id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
