import { createClient } from '@supabase/supabase-js'

const PLAN_DURATION = { basic: 30, pro: 365 }

export async function POST(request) {
  // Langsung return 200 dulu — Cashi tidak akan retry
  // Proses DB dilakukan setelahnya (fire and forget pattern)
  
  let body
  try {
    body = await request.json()
  } catch {
    return new Response('OK', { status: 200 })
  }

  // Proses async — tidak blocking response
  processWebhook(body).catch(e => console.error('Webhook process error:', e))

  return new Response('OK', { status: 200 })
}

// Tambahkan GET handler agar Cashi bisa verifikasi endpoint exists
export async function GET() {
  return new Response('Webhook OK', { status: 200 })
}

async function processWebhook(body) {
  const { event, data } = body ?? {}

  if (!event || !data) return

  // Handle test dari Cashi dashboard
  if (data?.order_id?.startsWith('TEST-')) {
    console.log('✅ Test webhook received:', data.order_id)
    return
  }

  if (event !== 'PAYMENT_SETTLED') return
  if (data?.status !== 'SETTLED') return

  const cashiOrderId = data.order_id
  if (!cashiOrderId) return

  // Inisialisasi di dalam function — bukan module level
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: sub, error: findErr } = await supabaseAdmin
    .from('subscriptions')
    .select('id, tenant_id, plan, payment_status')
    .eq('payment_ref', cashiOrderId)
    .maybeSingle()

  if (findErr || !sub) {
    console.error('Subscription tidak ditemukan:', cashiOrderId)
    return
  }

  if (sub.payment_status === 'paid') {
    console.log('Sudah paid, skip:', cashiOrderId)
    return
  }

  const durationDays = PLAN_DURATION[sub.plan] || 30
  const newExpiredAt = new Date()
  newExpiredAt.setDate(newExpiredAt.getDate() + durationDays)

  const { error: subErr } = await supabaseAdmin
    .from('subscriptions')
    .update({
      payment_status: 'paid',
      expired_at: newExpiredAt.toISOString(),
    })
    .eq('id', sub.id)

  if (subErr) {
    console.error('Gagal update subscription:', subErr)
    return
  }

  await supabaseAdmin
    .from('tenants')
    .update({
      plan: sub.plan,
      plan_expired_at: newExpiredAt.toISOString(),
    })
    .eq('id', sub.tenant_id)

  console.log(`✅ Subscription aktif. Plan: ${sub.plan}, Tenant: ${sub.tenant_id}`)
}
