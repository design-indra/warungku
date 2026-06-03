import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Gunakan service role untuk webhook (tidak ada user session)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// POST /api/subscription/webhook
// Dipanggil oleh Cashi.id saat pembayaran berhasil
export async function POST(request) {
  try {
    const body = await request.json()
    const { event, data } = body

    // Hanya proses event PAYMENT_SETTLED
    if (event !== 'PAYMENT_SETTLED') {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Handle test webhook dari Cashi dashboard
    if (data?.order_id?.startsWith('TEST-')) {
      console.log('Test webhook received:', data.order_id)
      return new Response('Test OK', { status: 200 })
    }

    // Pastikan status settled
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
      // Tetap return 200 agar Cashi tidak retry terus
      return new Response('OK', { status: 200 })
    }

    // Jika sudah paid, skip (idempotent)
    if (sub.payment_status === 'paid') {
      return new Response('OK', { status: 200 })
    }

    // Update status subscription jadi paid
    const { error: updateErr } = await supabaseAdmin
      .from('subscriptions')
      .update({ payment_status: 'paid' })
      .eq('id', sub.id)

    if (updateErr) {
      console.error('Gagal update subscription:', updateErr)
      return new Response('Error', { status: 500 })
    }

    console.log(`Subscription ${sub.id} berhasil diaktifkan. Plan: ${sub.plan}, Tenant: ${sub.tenant_id}`)

    return new Response('OK', { status: 200 })

  } catch (e) {
    console.error('Webhook error:', e)
    // Jangan return 500 agar Cashi tidak spam retry
    return new Response('OK', { status: 200 })
  }
}
