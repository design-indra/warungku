import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`

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

    // Validasi ukuran 10MB semua plan
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file maksimal 10MB' }, { status: 400 })
    }

    // Validasi tipe
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Format file harus JPG, PNG, WebP, atau GIF' }, { status: 400 })
    }

    // Convert ke base64
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    // Upload ke Cloudinary (unsigned preset)
    const cloudForm = new FormData()
    cloudForm.append('file', dataUri)
    cloudForm.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET)
    cloudForm.append('folder', `warungku/${profile.tenant_id}`)
    // Auto kompresi & resize via Cloudinary
    cloudForm.append('transformation', 'w_800,h_800,c_limit,q_auto:good,f_auto')

    const res = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: cloudForm,
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error?.message || 'Upload ke Cloudinary gagal')
    }

    return NextResponse.json({ url: data.secure_url }, { status: 201 })

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
