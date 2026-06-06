import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// GET /api/transaksi?limit=20&from=2024-05-01&to=2024-05-31
export async function GET(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit')) || 50
    const from  = searchParams.get('from')
    const to    = searchParams.get('to')

    let query = supabase
      .from('transaksi')
      .select('*, detail_transaksi(*), pelanggan(nama)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (from) query = query.gte('created_at', from)
    if (to)   query = query.lte('created_at', to + 'T23:59:59')

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/transaksi  → simpan transaksi baru
export async function POST(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { data: profile } = await supabase.from('user_profiles').select('tenant_id, cabang_id').eq('id', user.id).single()

    // Validasi: fitur hutang hanya untuk plan basic & pro
    if (body.metode_bayar === 'hutang') {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('plan, plan_expired_at')
        .eq('id', profile.tenant_id)
        .single()

      const now = new Date()
      const isPaidActive =
        tenant?.plan !== 'free' &&
        tenant?.plan_expired_at !== null &&
        new Date(tenant?.plan_expired_at) > now

      if (!isPaidActive) {
        return NextResponse.json(
          { error: 'Fitur hutang hanya tersedia untuk paket Basic dan Pro. Silakan upgrade akun Anda.' },
          { status: 403 }
        )
      }
    }

    // 1. Insert transaksi
    const { data: trx, error: trxErr } = await supabase.from('transaksi').insert({
      tenant_id:    profile.tenant_id,
      cabang_id:    profile.cabang_id,
      kasir_id:     user.id,
      pelanggan_id: body.pelanggan_id || null,
      nomor_transaksi: '', // trigger auto-generate
      total:        body.total,
      diskon:       body.diskon || 0,
      total_bayar:  body.total_bayar || body.total,
      metode_bayar: body.metode_bayar || 'tunai',
      status:       body.metode_bayar === 'hutang' ? 'hutang' : 'lunas',
      catatan:      body.catatan || null,
    }).select().single()
    if (trxErr) throw trxErr

    // 2. Insert detail (trigger akan kurangi stok)
    const details = body.items.map(item => ({
      transaksi_id: trx.id,
      barang_id:    item.id,
      nama_barang:  item.nama,
      harga_jual:   item.harga,
      harga_beli:   item.harga_beli || 0,
      qty:          item.qty,
      subtotal:     item.harga * item.qty,
    }))
    const { error: detErr } = await supabase.from('detail_transaksi').insert(details)
    if (detErr) throw detErr

    // 3. Jika hutang → catat ke tabel hutang
    if (body.metode_bayar === 'hutang' && body.pelanggan_id) {
      await supabase.from('hutang').insert({
        tenant_id:    profile.tenant_id,
        pelanggan_id: body.pelanggan_id,
        transaksi_id: trx.id,
        jumlah:       body.total,
        sisa:         body.total,
        catatan:      body.catatan || null,
        status:       'belum_lunas',
      })
    }

    return NextResponse.json({ data: trx }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
