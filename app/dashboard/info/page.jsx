'use client'

import { useState, useEffect } from 'react'
import { Info, BookOpen, Bell, Star, Megaphone, ArrowRight, RefreshCw } from 'lucide-react'

const KATEGORI_COLOR = {
  Panduan: 'bg-blue-100 text-blue-700',
  Update:  'bg-emerald-100 text-emerald-700',
  Tips:    'bg-amber-100 text-amber-700',
  Promo:   'bg-rose-100 text-rose-700',
}

const KATEGORI_ICON = {
  Panduan: BookOpen,
  Update:  Bell,
  Tips:    Star,
  Promo:   Megaphone,
}

const KATEGORI_BG = {
  Panduan: 'bg-blue-50 text-blue-600',
  Update:  'bg-emerald-50 text-emerald-600',
  Tips:    'bg-amber-50 text-amber-600',
  Promo:   'bg-rose-50 text-rose-600',
}

export default function InfoPage() {
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null) // post yang dibuka detail

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/posts')
      const json = await res.json()
      setPosts(json.data || [])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPosts() }, [])

  const penting = posts.filter(p => p.penting)
  const lainnya = posts.filter(p => !p.penting)

  const fmtTgl = (iso) => new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  // ── Detail View ──────────────────────────────────────────
  if (selected) {
    const Icon = KATEGORI_ICON[selected.kategori] || BookOpen
    return (
      <div className="p-4 max-w-2xl mx-auto pb-24">
        <button onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-sm text-orange-500 font-semibold mb-4 hover:gap-2.5 transition-all">
          ← Kembali
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${KATEGORI_COLOR[selected.kategori]}`}>
              {selected.kategori}
            </span>
            {selected.penting && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                ⭐ Penting
              </span>
            )}
            <span className="text-[10px] text-gray-400 ml-auto">{fmtTgl(selected.created_at)}</span>
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-2 leading-snug">{selected.judul}</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{selected.ringkasan}</p>
          {selected.konten ? (
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line border-t border-gray-100 pt-4">
              {selected.konten}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-4">
              Konten lengkap belum tersedia.
            </p>
          )}
        </div>
      </div>
    )
  }

  // ── List View ────────────────────────────────────────────
  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">Info & Panduan</h1>
          <p className="text-xs text-gray-400">Update terbaru, tips, dan panduan penggunaan</p>
        </div>
        <button onClick={fetchPosts} disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40">
          <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-2.5 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Kosong */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-7 h-7 text-orange-300" />
          </div>
          <p className="text-gray-500 font-medium text-sm">Belum ada artikel</p>
          <p className="text-xs text-gray-400 mt-1">Konten akan segera hadir</p>
        </div>
      )}

      {/* Artikel Penting */}
      {!loading && penting.length > 0 && (
        <div className="mb-5">
          <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-orange-500" />
            Penting & Terbaru
          </p>
          <div className="space-y-3">
            {penting.map(post => {
              const Icon = KATEGORI_ICON[post.kategori] || BookOpen
              return (
                <div key={post.id}
                  className="bg-white border-l-4 border-orange-400 rounded-xl p-4 shadow-sm flex gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${KATEGORI_BG[post.kategori]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${KATEGORI_COLOR[post.kategori]}`}>
                        {post.kategori}
                      </span>
                      <span className="text-[10px] text-gray-400">{fmtTgl(post.created_at)}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 leading-snug">{post.judul}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{post.ringkasan}</p>
                    <button onClick={() => setSelected(post)}
                      className="mt-2 text-xs text-orange-500 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
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
      {!loading && lainnya.length > 0 && (
        <div>
          <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-gray-500" />
            Artikel Lainnya
          </p>
          <div className="space-y-3">
            {lainnya.map(post => {
              const Icon = KATEGORI_ICON[post.kategori] || BookOpen
              return (
                <div key={post.id}
                  className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex gap-3 hover:shadow-md transition-shadow">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${KATEGORI_BG[post.kategori]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${KATEGORI_COLOR[post.kategori]}`}>
                        {post.kategori}
                      </span>
                      <span className="text-[10px] text-gray-400">{fmtTgl(post.created_at)}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 leading-snug">{post.judul}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{post.ringkasan}</p>
                    <button onClick={() => setSelected(post)}
                      className="mt-2 text-xs text-orange-500 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
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
