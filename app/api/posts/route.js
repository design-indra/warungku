import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// GET /api/posts — ambil semua post aktif (untuk halaman Info user)
// Tidak perlu login, RLS sudah handle read-only untuk is_active=true
export async function GET() {
  try {
    const supabase = createServerSupabase()
    const { data, error } = await supabase
      .from('posts')
      .select('id, judul, ringkasan, kategori, penting, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data: data || [] })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
