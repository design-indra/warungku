import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

const BUCKET = 'barang-foto' // bucket existing di Supabase Storage

// POST /api/pengaturan/upload-logo
// Body: FormData dengan field "file"
export async function POST(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Ambil tenant_id user
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()
    if (!profile) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })

    // Validasi ukuran (maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 })
    }

    // Validasi tipe
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Format file harus JPG, PNG, atau WebP' }, { status: 400 })
    }

    // Nama file unik per tenant
    const ext  = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const path = `${profile.tenant_id}/logo.${ext}`

    // Convert ke ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer      = new Uint8Array(arrayBuffer)

    // Upload ke Supabase Storage — upsert agar replace file lama
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadErr) throw new Error(uploadErr.message)

    // Ambil public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
    const publicUrl = urlData.publicUrl + `?t=${Date.now()}` // cache bust

    // Simpan logo_url ke tabel tenants
    const { error: updateErr } = await supabase
      .from('tenants')
      .update({ logo_url: publicUrl })
      .eq('id', profile.tenant_id)

    if (updateErr) throw new Error(updateErr.message)

    return NextResponse.json({ url: publicUrl }, { status: 200 })

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
