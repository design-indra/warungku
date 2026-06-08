import { createClient } from '@supabase/supabase-js'

// Durasi per plan (hari)
const PLAN_DURATION = { basic: 30, pro: 30 }

// Selalu return 200 — Cashi tidak akan retry jika 200
export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return new Response('OK', { status: 200 })
  }

  // Fire and forget — jangan block response
  processWebhook(body).catch(e =>
    console.error('[webhook] processWebhook error:', e)
  )

  return new Response('OK', { status: 200 })
}

// Cashi verifikasi endpoint dengan GET
export async function GET() {
  return new Response('Webhook OK', { status: 200 })
}

async function processWebhook(body) {
  const { event, data } = body ?? {}

  if (!event || !data) return

  // Abaikan test webhook dari Cashi dashboard
  if (data?.order_id?.startsWith('TEST-')) {
    console.log('[webhook] Test webhook received:', data.order_id)
    return
  }

  if (event !== 'PAYMENT_SETTLED') return
  if (data?.status !== 'SETTLED') return

  const cashiOrderId = data.order_id
  if (!cashiOrderId) return

  // Buat admin client di dalam fungsi — bukan module level
  // (menghindari masalah cold start dan env var belum siap)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  )

  // ── Cari subscription berdasarkan payment_ref ──
  const { data: sub, error: findErr } = await supabaseAdmin
    .from('subscriptions')
    .select('id, tenant_id, plan, payment_status, expired_at')
    .eq('payment_ref', cashiOrderId)
    .maybeSingle()

  if (findErr || !sub) {
    console.error('[webhook] Subscription tidak ditemukan untuk order:', cashiOrderId)
    return
  }

  // Idempotent — skip jika sudah paid
  if (sub.payment_status === 'paid') {
    console.log('[webhook] Sudah paid, skip:', cashiOrderId)
    return
  }

  // ── Hitung tanggal expired baru ──
  const durationDays = PLAN_DURATION[sub.plan] ?? 30
  const newExpiredAt = new Date()
  newExpiredAt.setDate(newExpiredAt.getDate() + durationDays)

  // ── Update subscriptions.payment_status = 'paid' ──
  // Trigger sync_plan_on_payment di DB akan otomatis update tenants.plan
  const { error: subErr } = await supabaseAdmin
    .from('subscriptions')
    .update({
      payment_status: 'paid',
      expired_at:     newExpiredAt.toISOString(),
    })
    .eq('id', sub.id)

  if (subErr) {
    console.error('[webhook] Gagal update subscription:', subErr.message)
    return
  }

  // ── Update tenants.plan secara eksplisit (double-safety) ──
  // Meskipun trigger DB sudah handle ini, kita lakukan juga di sini
  // sebagai fallback jika trigger tidak jalan karena alasan apapun.
  const { error: tenantErr } = await supabaseAdmin
    .from('tenants')
    .update({
      plan:            sub.plan,
      plan_expired_at: newExpiredAt.toISOString(),
    })
    .eq('id', sub.tenant_id)

  if (tenantErr) {
    // Tidak fatal — trigger seharusnya sudah handle
    console.warn('[webhook] Fallback tenant update gagal:', tenantErr.message)
  }

  console.log(
    `[webhook] ✅ Aktif. Plan: ${sub.plan}, Tenant: ${sub.tenant_id}, Expired: ${newExpiredAt.toISOString()}`
  )
}
