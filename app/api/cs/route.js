import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// POST /api/cs — kirim pesan CS
export async function POST(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { nama, no_hp, topik, pesan } = body

    if (!nama || !pesan) {
      return NextResponse.json({ error: 'Nama dan pesan wajib diisi' }, { status: 400 })
    }

    // 1. Simpan ke Supabase tabel cs_pesan
    const { data: saved, error: dbErr } = await supabase
      .from('cs_pesan')
      .insert({
        user_id: user.id,
        nama,
        no_hp:   no_hp || null,
        topik:   topik || 'Umum',
        pesan,
        status:  'baru',
      })
      .select()
      .single()

    if (dbErr) throw dbErr

    // 2. Kirim notif WA ke admin via Fonnte
    const adminWa    = process.env.ADMIN_WA || '6283803888990'
    const fonnte     = process.env.FONNTE_TOKEN

    if (fonnte) {
      const tgl = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      const msgWa = `🎧 *Pesan CS Masuk - WarungKu*\n\n` +
        `👤 *Nama:* ${nama}\n` +
        `📱 *No HP:* ${no_hp || '-'}\n` +
        `📌 *Topik:* ${topik || 'Umum'}\n` +
        `🕐 *Waktu:* ${tgl}\n\n` +
        `💬 *Pesan:*\n${pesan}`

      await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': fonnte,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target:  adminWa,
          message: msgWa,
          typing:  false,
          delay:   1,
        }),
      })
    }

    return NextResponse.json({ success: true, id: saved.id }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// GET /api/cs — ambil riwayat pesan CS user ini
export async function GET(request) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('cs_pesan')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
