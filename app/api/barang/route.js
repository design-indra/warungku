import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// Helper: ambil plan aktif tenant
async function getTenantPlan(supabase, tenantId) {
  const { data: tenant } = await supabase
    .from('tenants')
    .select('plan, plan_expired_at')
    .eq('id', tenantId)
    .single()

  if (!tenant) return 'free'
  const isActive =
    tenant.plan !== 'free' &&
    tenant.plan_expired_at !== null &&
    new Date(tenant.plan_expired_at) > new Date()
  return isActive ? tenant.plan : 'free'
}

// Batas barang per plan
const BARANG_LIMIT = { free: 250, basic: 500, pro: 999999 }

// GET /api/barang
export async function GET(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const search     = searchParams.get('search') || ''
    const kategori   = searchParams.get('kategori') || ''
    const stokFilter = searchParams.get('stok') || ''
    const page       = Number(searchParams.get('page')) || 1
    const limit      = Number(searchParams.get('limit')) || 25
    const offset     = (page - 1) * limit

    let query = supabase
      .from('barang')
      .select('*, kategori(id, nama)', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search)   query = query.ilike('nama', `%${search}%`)
    if (kategori) query = query.eq('kategori_id', kategori)
    if (stokFilter === 'rendah') query = query.lte('stok', 10).gt('stok', 0)
    if (stokFilter === 'habis')  query = query.eq('stok', 0)

    const { data, error, count } = await query
    if (error) throw error
    return NextResponse.json({ data, total: count, page, limit })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/barang
export async function POST(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('user_profiles').select('tenant_id').eq('id', user.id).single()

    // ── Cek kuota barang ────────────────────────────────────
    const plan = await getTenantPlan(supabase, profile.tenant_id)
    const maxBarang = BARANG_LIMIT[plan] ?? 250

    if (maxBarang < 999999) {
      const { count } = await supabase
        .from('barang')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', profile.tenant_id)
        .eq('is_active', true)

      if (count >= maxBarang) {
        return NextResponse.json({
          error: `Paket ${plan.toUpperCase()} hanya mengizinkan ${maxBarang} barang. Upgrade paket untuk menambah lebih banyak.`,
          limit_reached: true,
          plan,
          max: maxBarang,
          used: count,
        }, { status: 403 })
      }
    }
    // ────────────────────────────────────────────────────────

    const body = await request.json()

    // Auto-generate kode jika tidak diisi
    let kode = body.kode_barang?.trim() || null
    if (!kode) {
      const { data: kodeData } = await supabase.rpc('generate_kode_barang', { p_tenant_id: profile.tenant_id })
      kode = kodeData
    }

    // Cari atau buat kategori berdasarkan nama
    let kategori_id = body.kategori_id || null
    if (!kategori_id && body.kategori) {
      const { data: kat } = await supabase
        .from('kategori')
        .select('id')
        .eq('tenant_id', profile.tenant_id)
        .ilike('nama', body.kategori)
        .maybeSingle()

      if (kat) {
        kategori_id = kat.id
      } else {
        const { data: newKat } = await supabase
          .from('kategori')
          .insert({ tenant_id: profile.tenant_id, nama: body.kategori })
          .select('id')
          .single()
        kategori_id = newKat?.id || null
      }
    }

    const { data, error } = await supabase.from('barang').insert({
      tenant_id:    profile.tenant_id,
      kode_barang:  kode,
      nama:         body.nama,
      satuan:       body.satuan || 'pcs',
      harga_beli:   Number(body.harga_beli) || 0,
      harga_jual:   Number(body.harga_jual) || 0,
      stok:         Number(body.stok) || 0,
      stok_minimum: Number(body.stok_minimum) || 5,
      kategori_id,
      emoji:        body.emoji || '📦',
      foto_url:     body.foto_url || null,
      barcode:      body.barcode || null,
    }).select('*, kategori(id, nama)').single()

    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
