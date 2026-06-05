'use client'

import { Info, BookOpen, Bell, Megaphone, Wrench, Star, ArrowRight } from 'lucide-react'

// ─── Data contoh artikel/info (nanti bisa diambil dari Supabase/CMS) ───
const POSTS = [
  {
    id: 1,
    kategori: 'Panduan',
    icon: BookOpen,
    warna: 'bg-blue-50 text-blue-600',
    judul: 'Cara Memulai: Setup Awal WarungKu',
    ringkasan: 'Langkah-langkah pertama untuk mengatur toko, cabang, dan akun kasir kamu sebelum mulai berjualan.',
    tgl: '1 Jun 2025',
    penting: true,
  },
  {
    id: 2,
    kategori: 'Update',
    icon: Bell,
    warna: 'bg-emerald-50 text-emerald-600',
    judul: 'Update v1.2 — Fitur Riwayat Transaksi & Pelanggan',
    ringkasan: 'WarungKu kini hadir dengan fitur data pelanggan lengkap, riwayat transaksi dengan filter canggih, dan halaman Customer Service.',
    tgl: '5 Jun 2025',
    penting: true,
  },
  {
    id: 3,
    kategori: 'Tips',
    icon: Star,
    warna: 'bg-amber-50 text-amber-600',
    judul: 'Tips Mengelola Stok Agar Tidak Pernah Kehabisan',
    ringkasan: 'Strategi sederhana untuk mengatur stok minimum, memantau barang fast-moving, dan menghindari kerugian akibat kehabisan stok.',
    tgl: '3 Jun 2025',
    penting: false,
  },
  {
    id: 4,
    kategori: 'Promo',
    icon: Megaphone,
    warna: 'bg-rose-50 text-rose-600',
    judul: 'Upgrade ke Paket Pro — Gratis 1 Bulan!',
    ringkasan: 'Dapatkan akses multi-cabang, laporan lanjutan, dan prioritas CS. Promo berlaku hingga akhir Juni 2025.',
    tgl: '1 Jun 2025',
    penting: false,
  },
  {
    id: 5,
    kategori: 'Panduan',
    icon: Wrench,
    warna: 'bg-purple-50 text-purple-600',
    judul: 'Cara Integrasi QRIS Cashi.id di WarungKu',
    ringkasan: 'Panduan lengkap menghubungkan akun Cashi.id ke WarungKu agar pelanggan bisa bayar via QRIS langsung dari kasir.',
    tgl: '28 Mei 2025',
    penting: false,
  },
]

const KATEGORI_COLOR = {
  Panduan: 'bg-blue-100 text-blue-700',
  Update:  'bg-emerald-100 text-emerald-700',
  Tips:    'bg-amber-100 text-amber-700',
  Promo:   'bg-rose-100 text-rose-700',
}

export default function InfoPage() {
  const penting = POSTS.filter(p => p.penting)
  const lainnya = POSTS.filter(p => !p.penting)

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Info & Panduan</h1>
          <p className="text-xs text-gray-400">Update terbaru, tips, dan panduan penggunaan</p>
        </div>
      </div>

      {/* Banner "Segera Hadir" — akan dihapus kalau sudah live */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 mb-5 text-white">
        <p className="font-bold text-sm">🚧 Fitur Blog Segera Aktif</p>
        <p className="text-xs text-orange-100 mt-1">
          Halaman ini akan menampilkan artikel, update fitur, dan tips terbaru langsung dari admin.
          Konten di bawah adalah contoh tampilan.
        </p>
      </div>

      {/* Artikel Penting */}
      {penting.length > 0 && (
        <div className="mb-5">
          <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-orange-500" />
            Penting & Terbaru
          </p>
          <div className="space-y-3">
            {penting.map(post => {
              const Icon = post.icon
              return (
                <div key={post.id}
                  className="bg-white border-l-4 border-orange-400 rounded-xl p-4 shadow-sm flex gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${post.warna}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${KATEGORI_COLOR[post.kategori]}`}>
                        {post.kategori}
                      </span>
                      <span className="text-[10px] text-gray-400">{post.tgl}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 leading-snug">{post.judul}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{post.ringkasan}</p>
                    <button className="mt-2 text-xs text-orange-500 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      Baca selengkapnya <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Artikel Lainnya */}
      {lainnya.length > 0 && (
        <div>
          <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-gray-500" />
            Artikel Lainnya
          </p>
          <div className="space-y-3">
            {lainnya.map(post => {
              const Icon = post.icon
              return (
                <div key={post.id}
                  className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex gap-3 hover:shadow-md transition-shadow">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${post.warna}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${KATEGORI_COLOR[post.kategori]}`}>
                        {post.kategori}
                      </span>
                      <span className="text-[10px] text-gray-400">{post.tgl}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 leading-snug">{post.judul}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{post.ringkasan}</p>
                    <button className="mt-2 text-xs text-orange-500 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      Baca selengkapnya <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
