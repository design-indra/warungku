import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

const BARANG_LIMIT = { free: 250, basic: 500, pro: 999999 }

async function getTenantPlan(supabase, tenantId) {
  const { data: tenant } = await supabase
    .from('tenants').select('plan, plan_expired_at').eq('id', tenantId).single()
  if (!tenant) return 'free'
  const isActive =
    tenant.plan !== 'free' &&
    tenant.plan_expired_at !== null &&
    new Date(tenant.plan_expired_at) > new Date()
  return isActive ? tenant.plan : 'free'
}

export async function POST(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileErr } = await supabase
      .from('user_profiles').select('tenant_id').eq('id', user.id).single()
    if (profileErr || !profile?.tenant_id) {
      return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 400 })
    }

    const { items } = await request.json()
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Data kosong' }, { status: 400 })
    }

    // ── Cek kuota sebelum import ────────────────────────────
    const plan = await getTenantPlan(supabase, profile.tenant_id)
    const maxBarang = BARANG_LIMIT[plan] ?? 250

    if (maxBarang < 999999) {
      const { count: currentCount } = await supabase
        .from('barang')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', profile.tenant_id)
        .eq('is_active', true)

      const sisa = maxBarang - (currentCount || 0)

      if (sisa <= 0) {
        return NextResponse.json({
          error: `Paket ${plan.toUpperCase()} sudah mencapai batas ${maxBarang} barang. Upgrade paket untuk import lebih banyak.`,
          limit_reached: true,
          plan,
          max: maxBarang,
          used: currentCount,
          sisa: 0,
        }, { status: 403 })
      }

      if (items.length > sisa) {
        return NextResponse.json({
          error: `Hanya bisa import ${sisa} barang lagi (sisa kuota paket ${plan.toUpperCase()}). Kamu mencoba import ${items.length} barang.`,
          limit_reached: true,
          plan,
          max: maxBarang,
          used: currentCount,
          sisa,
        }, { status: 403 })
      }
    }
    // ────────────────────────────────────────────────────────

    // Ambil semua kategori milik tenant
    const { data: kategoriList } = await supabase
      .from('kategori').select('id, nama').eq('tenant_id', profile.tenant_id)

    const kategoriMap = {}
    if (kategoriList) {
      kategoriList.forEach(k => {
        kategoriMap[k.nama.toUpperCase().trim()] = k.id
      })
    }

    const rows = items
      .map(item => {
        const namaKategori = String(item.kategori || '').toUpperCase().trim()
        const kategori_id  = kategoriMap[namaKategori] || null
        return {
          tenant_id:    profile.tenant_id,
          nama:         String(item.nama || '').trim(),
          satuan:       String(item.satuan || 'pcs').trim(),
          harga_beli:   Math.round(Number(item.harga_beli) || 0),
          harga_jual:   Math.round(Number(item.harga_jual) || 0),
          stok:         Math.round(Number(item.stok) || 0),
          stok_minimum: Math.round(Number(item.stok_minimum) || 5),
          kategori_id,
          emoji:        String(item.emoji || '📦').trim() || '📦',
          is_active:    true,
        }
      })
      .filter(r => r.nama)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data valid' }, { status: 400 })
    }

    const { data, error: insertErr } = await supabase
      .from('barang')
      .upsert(rows, { onConflict: 'tenant_id,nama' })
      .select('id')

    if (insertErr) {
      return NextResponse.json({
        error: 'Gagal insert',
        detail: insertErr.message,
        code: insertErr.code,
      }, { status: 500 })
    }

    return NextResponse.json({ inserted: data?.length || rows.length })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
