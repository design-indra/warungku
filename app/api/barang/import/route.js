import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function POST(request) {
  try {
    const supabase = createServerSupabase()

    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized', detail: authErr?.message }, { status: 401 })
    }

    const { data: profile, error: profileErr } = await supabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile?.tenant_id) {
      return NextResponse.json({ error: 'Tenant tidak ditemukan', detail: profileErr?.message }, { status: 400 })
    }

    const { items } = await request.json()
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Data kosong' }, { status: 400 })
    }

    // Ambil semua kategori milik tenant ini
    const { data: kategoriList } = await supabase
      .from('kategori')
      .select('id, nama')
      .eq('tenant_id', profile.tenant_id)

    // Buat map nama -> id (uppercase untuk matching)
    const kategoriMap = {}
    if (kategoriList) {
      kategoriList.forEach(k => {
        kategoriMap[k.nama.toUpperCase().trim()] = k.id
      })
    }

    const rows = items
      .map(item => {
        const namaKategori = String(item.kategori || '').toUpperCase().trim()
        const kategori_id = kategoriMap[namaKategori] || null

        return {
          tenant_id:    profile.tenant_id,
          nama:         String(item.nama || '').trim(),
          satuan:       String(item.satuan || 'pcs').trim(),
          harga_beli:   Math.round(Number(item.harga_beli) || 0),
          harga_jual:   Math.round(Number(item.harga_jual) || 0),
          stok:         Math.round(Number(item.stok) || 0),
          stok_minimum: Math.round(Number(item.stok_minimum) || 5),
          kategori_id,
          emoji:        '📦',
          is_active:    true,
        }
      })
      .filter(r => r.nama)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data valid' }, { status: 400 })
    }

    // Upsert — jika nama + tenant_id sama, UPDATE (tidak duplikat)
    const { data, error: insertErr } = await supabase
      .from('barang')
      .upsert(rows, { onConflict: 'tenant_id,nama' })
      .select('id')

    if (insertErr) {
      return NextResponse.json({ error: 'Gagal insert', detail: insertErr.message, code: insertErr.code }, { status: 500 })
    }

    return NextResponse.json({ inserted: data?.length || rows.length })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
