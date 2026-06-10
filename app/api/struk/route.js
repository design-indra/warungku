import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// POST /api/struk — simpan HTML struk sementara, return token UUID
export async function POST(request) {
  try {
    const { html } = await request.json()
    if (!html) return NextResponse.json({ error: 'html wajib diisi' }, { status: 400 })

    // Gunakan service role key agar bisa insert tanpa auth cookie
    // (request datang dari Capacitor WebView yang mungkin tidak kirim cookie)
    const supabase = createServerSupabase()

    // Cleanup struk yang sudah expired dulu
    await supabase.from('struk_temp').delete().lt('expired_at', new Date().toISOString())

    const { data, error } = await supabase
      .from('struk_temp')
      .insert({ html })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ token: data.id })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// GET /api/struk?token=UUID — tampilkan HTML struk langsung di browser
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    if (!token) return new Response('Token tidak ditemukan', { status: 400 })

    const supabase = createServerSupabase()

    const { data, error } = await supabase
      .from('struk_temp')
      .select('html, expired_at')
      .eq('id', token)
      .single()

    if (error || !data) return new Response('Struk tidak ditemukan atau sudah expired', { status: 404 })

    if (new Date(data.expired_at) < new Date()) {
      return new Response('Struk sudah expired. Silakan cetak ulang dari aplikasi.', { status: 410 })
    }

    // Return langsung sebagai HTML — browser akan render dan tampilkan tombol print
    return new Response(data.html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    return new Response('Terjadi kesalahan: ' + e.message, { status: 500 })
  }
}
