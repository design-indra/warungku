import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// POST /api/barang/upload-foto
// Body: FormData dengan field "file"
export async function POST(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('user_profiles').select('tenant_id').eq('id', user.id).single()

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })

    // Validasi ukuran (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file maksimal 2MB' }, { status: 400 })
    }

    // Validasi tipe
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Format file harus JPG, PNG, atau WebP' }, { status: 400 })
    }

    const ext      = file.name.split('.').pop().toLowerCase()
    const filename = `${profile.tenant_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error: uploadErr } = await supabase.storage
      .from('barang-foto')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadErr) throw uploadErr

    const { data: { publicUrl } } = supabase.storage
      .from('barang-foto')
      .getPublicUrl(filename)

    return NextResponse.json({ url: publicUrl }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
