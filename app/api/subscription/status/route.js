import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// GET /api/subscription/status
export async function GET() {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })
    }

    // Ambil subscription aktif (paid & belum expired)
    const now = new Date().toISOString()
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, plan, payment_status, expired_at, created_at')
      .eq('tenant_id', profile.tenant_id)
      .eq('payment_status', 'paid')
      .gte('expired_at', now)
      .order('expired_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Jika tidak ada subscription aktif
    if (!sub) {
      return NextResponse.json({
        active:    false,
        plan:      null,
        expired_at: null,
      })
    }

    return NextResponse.json({
      active:     true,
      plan:       sub.plan,
      expired_at: sub.expired_at,
      created_at: sub.created_at,
    })

  } catch (e) {
    console.error('subscription/status error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// GET /api/subscription/status?order_id=xxx — cek status order tertentu (polling QR)
// Query param: order_id (payment_ref dari Cashi)
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

    // Cek status di Cashi.id langsung
    const cashiRes = await fetch(`https://cashi.id/api/check-status/${order_id}`, {
      headers: { 'x-api-key': process.env.CASHI_API_KEY },
    })

    if (!cashiRes.ok) {
      return NextResponse.json({ error: 'Gagal cek status' }, { status: 502 })
    }

    const cashiData = await cashiRes.json()

    // Jika settled tapi webhook belum masuk, update manual
    if (cashiData.status === 'SETTLED') {
      await supabase
        .from('subscriptions')
        .update({ payment_status: 'paid' })
        .eq('payment_ref', order_id)
        .eq('payment_status', 'pending')
    }

    return NextResponse.json({
      status:   cashiData.status,  // PENDING | SETTLED | EXPIRED
      settled:  cashiData.status === 'SETTLED',
    })

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
