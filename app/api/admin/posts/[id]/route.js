import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase-server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())

async function checkAdmin() {
  const supabase = createServerSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase())) return null
  return user
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

// PUT /api/admin/posts/[id] — update post
export async function PUT(request, { params }) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { judul, ringkasan, konten, kategori, penting, is_active } = body

  if (!judul?.trim() || !ringkasan?.trim()) {
    return NextResponse.json({ error: 'Judul dan ringkasan wajib diisi' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('posts')
    .update({
      judul:      judul.trim(),
      ringkasan:  ringkasan.trim(),
      konten:     konten?.trim() || null,
      kategori:   kategori || 'Panduan',
      penting:    penting ?? false,
      is_active:  is_active ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// DELETE /api/admin/posts/[id] — hapus post
export async function DELETE(request, { params }) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabaseAdmin
    .from('posts')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
