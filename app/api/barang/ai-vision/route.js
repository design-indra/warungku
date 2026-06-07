import { NextResponse } from 'next/server'

// POST /api/barang/ai-vision
// Menerima gambar base64 dari client, kirim ke Groq Vision API di server
// API key TIDAK pernah terekspos ke browser
export async function POST(request) {
  try {
    const { base64, mimeType } = await request.json()

    if (!base64 || !mimeType) {
      return NextResponse.json({ error: 'base64 dan mimeType wajib diisi' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY belum diset di .env.local' }, { status: 500 })
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                },
              },
              {
                type: 'text',
                text: `Kamu adalah asisten pencatatan produk warung/toko di Indonesia.
Lihat gambar kemasan produk ini dan ekstrak informasinya.
Balas HANYA dalam format JSON berikut tanpa komentar atau markdown apapun:
{"nama":"nama produk lengkap dengan ukuran/berat","kategori":"Makanan|Minuman|Sembako|Rokok|Kebutuhan|Lainnya","satuan":"pcs|kg|liter|pack|dus|botol|sachet"}
Contoh: {"nama":"Indomie Goreng Rendang 85g","kategori":"Makanan","satuan":"pcs"}
Jika tidak bisa membaca kemasan, balas: {"nama":"","kategori":"Lainnya","satuan":"pcs"}`,
              },
            ],
          },
        ],
      }),
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody?.error?.message || `Groq API error: ${res.status}`)
    }

    const data    = await res.json()
    const text    = data.choices?.[0]?.message?.content || ''
    const cleaned = text.replace(/```json|```/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      throw new Error('Groq mengembalikan format tidak valid')
    }

    return NextResponse.json({ data: parsed })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
