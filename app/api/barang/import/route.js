import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// POST /api/barang/import  → bulk insert barang dari file import
export async function POST(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 400 })

    const { items } = await request.json()
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Data kosong' }, { status: 400 })
    }

    const rows = items.map(item => ({
      tenant_id:    profile.tenant_id,
      nama:         String(item.nama || '').trim(),
      satuan:       String(item.satuan || 'pcs').trim(),
      harga_beli:   Number(item.harga_beli) || 0,
      harga_jual:   Number(item.harga_jual) || 0,
      stok:         Number(item.stok) || 0,
      stok_minimum: Number(item.stok_minimum) || 5,
      emoji:        '📦',
      is_active:    true,
    })).filter(r => r.nama)

    // upsert by nama agar tidak duplikat jika import ulang
    const { data, error } = await supabase
      .from('barang')
      .upsert(rows, { onConflict: 'tenant_id,nama', ignoreDuplicates: false })
      .select('id')

    if (error) throw error
    return NextResponse.json({ inserted: data?.length || rows.length })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
