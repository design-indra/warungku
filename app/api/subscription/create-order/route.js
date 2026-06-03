import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

const PLANS = {
  basic: { label: 'Basic',  amount: 49000,  duration_days: 30  },
  pro:   { label: 'Pro',    amount: 99000,  duration_days: 30  },
}

// POST /api/subscription/create-order
// Body: { plan: 'basic' | 'pro' }
export async function POST(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const plan = body?.plan

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: 'Plan tidak valid. Pilih: basic atau pro' }, { status: 400 })
    }

    const { data: profile, error: profileErr } = await supabase
      .from('user_profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Profil user tidak ditemukan' }, { status: 404 })
    }

    if (profile.role !== 'owner') {
      return NextResponse.json({ error: 'Hanya owner yang bisa upgrade paket' }, { status: 403 })
    }

    const planConfig  = PLANS[plan]
    const orderId     = `WARUNGKU-${profile.tenant_id.slice(0, 8).toUpperCase()}-${Date.now()}`

    // Buat order ke Cashi.id
    const cashiRes = await fetch('https://cashi.id/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CASHI_API_KEY,
      },
      body: JSON.stringify({
        amount:   planConfig.amount,
        order_id: orderId,
      }),
    })

    if (!cashiRes.ok) {
      const errText = await cashiRes.text()
      console.error('Cashi API error:', errText)
      return NextResponse.json({ error: 'Gagal membuat order pembayaran' }, { status: 502 })
    }

    const cashiData = await cashiRes.json()

    if (!cashiData.success) {
      return NextResponse.json({ error: cashiData.message || 'Order gagal dibuat' }, { status: 502 })
    }

    // Hitung expired_at
    const expiredAt = new Date()
    expiredAt.setDate(expiredAt.getDate() + planConfig.duration_days)

    // Simpan ke tabel subscriptions
    const { data: sub, error: subErr } = await supabase
      .from('subscriptions')
      .insert({
        tenant_id:      profile.tenant_id,
        plan:           plan,
        payment_status: 'pending',
        amount:         planConfig.amount,
        payment_ref:    cashiData.orderId,
        expired_at:     expiredAt.toISOString(),
      })
      .select()
      .single()

    if (subErr) throw subErr

    return NextResponse.json({
      success:    true,
      order_id:   cashiData.orderId,
      amount:     cashiData.amount,
      qr_url:     cashiData.qrUrl,
      expires_at: cashiData.expires_at,
      plan:       planConfig.label,
      subscription_id: sub.id,
    }, { status: 201 })

  } catch (e) {
    console.error('create-order error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
