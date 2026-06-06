import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

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

// POST /api/hutang/:id/bayar
export async function POST(request, { params }) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('user_profiles').select('tenant_id').eq('id', user.id).single()

    // ── Cek plan: hutang hanya Basic & Pro ──────────────────
    const plan = await getTenantPlan(supabase, profile.tenant_id)
    if (plan === 'free') {
      return NextResponse.json({
        error: 'Fitur Manajemen Hutang hanya tersedia untuk paket Basic dan Pro.',
        upgrade_required: true,
        plan_required: 'basic',
      }, { status: 403 })
    }
    // ────────────────────────────────────────────────────────

    const { jumlah, catatan } = await request.json()

    // 1. Ambil hutang
    const { data: hutang } = await supabase
      .from('hutang').select('*').eq('id', params.id).single()
    const sisa_baru = Math.max(0, hutang.sisa - Number(jumlah))

    // 2. Insert pembayaran
    await supabase.from('pembayaran_hutang').insert({
      hutang_id: params.id,
      jumlah:    Number(jumlah),
      catatan,
    })

    // 3. Update sisa & status hutang
    await supabase.from('hutang').update({
      sisa:   sisa_baru,
      status: sisa_baru === 0 ? 'lunas' : 'belum_lunas',
    }).eq('id', params.id)

    return NextResponse.json({ success: true, sisa: sisa_baru })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
