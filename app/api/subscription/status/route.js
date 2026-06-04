import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// GET /api/subscription/status
// Membaca plan dari tenants (source of truth) + data subscription aktif
export async function GET() {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ambil tenant_id + data plan langsung dari tenants
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })
    }

    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants')
      .select('plan, plan_expired_at')
      .eq('id', profile.tenant_id)
      .single()

    if (tenantErr) throw tenantErr

    // Plan dianggap aktif jika bukan free DAN belum expired
    const now = new Date()
    const isActive =
      tenant.plan !== 'free' &&
      tenant.plan_expired_at !== null &&
      new Date(tenant.plan_expired_at) > now

    if (!isActive) {
      return NextResponse.json({
        active:     false,
        plan:       'free',
        expired_at: null,
      })
    }

    return NextResponse.json({
      active:     true,
      plan:       tenant.plan,
      expired_at: tenant.plan_expired_at,
    })

  } catch (e) {
    console.error('[subscription/status GET] error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/subscription/status
// Body: { order_id } — cek status pembayaran QRIS ke Cashi.id (untuk polling)
// Jika settled tapi webhook belum masuk, update DB secara manual (fallback)
export async function POST(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { order_id } = await request.json()
    if (!order_id) {
      return NextResponse.json({ error: 'order_id diperlukan' }, { status: 400 })
    }

    // Tanya Cashi.id langsung
    const cashiRes = await fetch(`https://cashi.id/api/check-status/${order_id}`, {
      headers: { 'x-api-key': process.env.CASHI_API_KEY },
    })

    if (!cashiRes.ok) {
      return NextResponse.json({ error: 'Gagal cek status pembayaran' }, { status: 502 })
    }

    const cashiData = await cashiRes.json()

    // Jika settled tapi webhook belum masuk → update manual sebagai fallback
    if (cashiData.status === 'SETTLED') {
      // Ambil subscription yang pending untuk order ini
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('id, tenant_id, plan, expired_at')
        .eq('payment_ref', order_id)
        .eq('payment_status', 'pending')
        .maybeSingle()

      if (sub) {
        const PLAN_DURATION = { basic: 30, pro: 365 }
        const durationDays = PLAN_DURATION[sub.plan] ?? 30
        const newExpiredAt = new Date()
        newExpiredAt.setDate(newExpiredAt.getDate() + durationDays)

        // Update subscription → trigger sync_plan_on_payment akan update tenants juga
        await supabase
          .from('subscriptions')
          .update({
            payment_status: 'paid',
            expired_at:     newExpiredAt.toISOString(),
          })
          .eq('id', sub.id)

        // Fallback eksplisit untuk tenants (double-safety)
        await supabase
          .from('tenants')
          .update({
            plan:            sub.plan,
            plan_expired_at: newExpiredAt.toISOString(),
          })
          .eq('id', sub.tenant_id)
      }
    }

    return NextResponse.json({
      status:  cashiData.status,   // 'PENDING' | 'SETTLED' | 'EXPIRED'
      settled: cashiData.status === 'SETTLED',
    })

  } catch (e) {
    console.error('[subscription/status POST] error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
