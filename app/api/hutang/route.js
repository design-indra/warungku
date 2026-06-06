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

// GET hutang beserta pelanggan + riwayat bayar
export async function GET() {
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

    const { data, error } = await supabase
      .from('hutang')
      .select('*, pelanggan(id, nama, no_hp), pembayaran_hutang(*)')
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
