import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Durasi paket (hari)
const PLAN_DURATION = { basic: 30, pro: 365 }

export async function POST(request) {
  try {
    const body = await request.json()
    const { event, data } = body

    if (event !== 'PAYMENT_SETTLED') {
      return new Response('OK', { status: 200 })
    }

    if (data?.order_id?.startsWith('TEST-')) {
      console.log('Test webhook received:', data.order_id)
      return new Response('Test OK', { status: 200 })
    }

    if (data?.status !== 'SETTLED') {
      return new Response('OK', { status: 200 })
    }

    const cashiOrderId = data.order_id

    // Cari subscription berdasarkan payment_ref
    const { data: sub, error: findErr } = await supabaseAdmin
      .from('subscriptions')
      .select('id, tenant_id, plan, payment_status, expired_at')
      .eq('payment_ref', cashiOrderId)
      .single()

    if (findErr || !sub) {
      console.error('Subscription tidak ditemukan untuk order:', cashiOrderId)
      return new Response('OK', { status: 200 })
    }

    // Idempotent
    if (sub.payment_status === 'paid') {
      return new Response('OK', { status: 200 })
    }

    // Hitung expired_at baru berdasarkan plan
    const durationDays = PLAN_DURATION[sub.plan] || 30
    const newExpiredAt = new Date()
    newExpiredAt.setDate(newExpiredAt.getDate() + durationDays)

    // 1. Update subscription → paid + expired_at yang benar
    const { error: subErr } = await supabaseAdmin
      .from('subscriptions')
      .update({
        payment_status: 'paid',
        expired_at:     newExpiredAt.toISOString(),
      })
      .eq('id', sub.id)

    if (subErr) {
      console.error('Gagal update subscription:', subErr)
      return new Response('Error', { status: 500 })
    }

    // 2. Update kolom plan di tenants agar fitur enforce bisa langsung jalan
    const { error: tenantErr } = await supabaseAdmin
      .from('tenants')
      .update({
        plan:            sub.plan,           // 'basic' | 'pro'
        plan_expired_at: newExpiredAt.toISOString(),
      })
      .eq('id', sub.tenant_id)

    if (tenantErr) {
      console.error('Gagal update tenant plan:', tenantErr)
      // Jangan gagalkan — subscription sudah paid, tenant bisa diupdate manual
    }

    console.log(`✅ Subscription ${sub.id} aktif. Plan: ${sub.plan}, Expired: ${newExpiredAt.toISOString()}, Tenant: ${sub.tenant_id}`)
    return new Response('OK', { status: 200 })

  } catch (e) {
    console.error('Webhook error:', e)
    return new Response('OK', { status: 200 })
  }
}
