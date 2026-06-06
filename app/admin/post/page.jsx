'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Pencil, Trash2, Eye, EyeOff, BookOpen,
  Bell, Star, Megaphone, Wrench, Save, X, ArrowLeft,
  CheckCircle, AlertCircle, LogOut
} from 'lucide-react'

const KATEGORI = ['Panduan', 'Update', 'Tips', 'Promo']

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

const EMPTY_FORM = { judul: '', ringkasan: '', konten: '', kategori: 'Panduan', penting: false, is_active: true }

export default function AdminPostsPage() {
  const router = useRouter()
  const [posts, setPosts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [authError, setAuthError] = useState(false)
  const [modal, setModal]       = useState(null) // null | { mode: 'add'|'edit', data }
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState(null) // { type: 'ok'|'err', msg }
  const [deleting, setDeleting] = useState(null)

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/posts')
      if (res.status === 401) { setAuthError(true); return }
      const json = await res.json()
      setPosts(json.data || [])
    } catch {
      showToast('err', 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPosts() }, [])

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setModal({ mode: 'add' })
  }

  const openEdit = (post) => {
    setForm({
      judul:     post.judul,
      ringkasan: post.ringkasan,
      konten:    post.konten || '',
      kategori:  post.kategori,
      penting:   post.penting,
      is_active: post.is_active,
    })
    setModal({ mode: 'edit', id: post.id })
  }

  const handleSave = async () => {
    if (!form.judul.trim() || !form.ringkasan.trim()) {
      showToast('err', 'Judul dan ringkasan wajib diisi')
      return
    }
    setSaving(true)
    try {
      const isEdit = modal.mode === 'edit'
      const url    = isEdit ? `/api/admin/posts/${modal.id}` : '/api/admin/posts'
      const res    = await fetch(url, {
        method:  isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      showToast('ok', isEdit ? 'Post berhasil diupdate' : 'Post berhasil dibuat')
      setModal(null)
      fetchPosts()
    } catch (e) {
      showToast('err', e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus post ini? Tindakan tidak bisa dibatalkan.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      showToast('ok', 'Post dihapus')
      fetchPosts()
    } catch (e) {
      showToast('err', e.message)
    } finally {
      setDeleting(null)
    }
  }

  const toggleActive = async (post) => {
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...post, is_active: !post.is_active }),
      })
      if (!res.ok) throw new Error()
      fetchPosts()
    } catch {
      showToast('err', 'Gagal mengubah status')
    }
  }

  const fmtTgl = (iso) => new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  // ── Auth Error ───────────────────────────────────────────
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-sm text-gray-500 mb-6">
            Halaman ini hanya bisa diakses oleh developer WarungKu.
          </p>
          <button onClick={() => router.push('/dashboard')}
            className="w-full bg-blue-700 text-white font-bold py-3 rounded-xl text-sm">
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold
          ${toast.type === 'ok' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'ok'
            ? <CheckCircle className="w-4 h-4" />
            : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">Admin — Kelola Posts</h1>
              <p className="text-xs text-gray-400">Info & Panduan WarungKu</p>
            </div>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" /> Buat Post
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total Post',   value: posts.length,                              color: 'text-gray-900' },
            { label: 'Tayang',       value: posts.filter(p => p.is_active).length,     color: 'text-emerald-600' },
            { label: 'Draft',        value: posts.filter(p => !p.is_active).length,    color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* List Posts */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-8 h-8 text-orange-400" />
            </div>
            <p className="text-gray-500 font-medium">Belum ada post</p>
            <p className="text-xs text-gray-400 mt-1">Klik "Buat Post" untuk memulai</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => {
              const Icon = KATEGORI_ICON[post.kategori] || BookOpen
              return (
                <div key={post.id}
                  className={`bg-white rounded-xl p-4 shadow-sm border transition-all
                    ${post.is_active ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                      ${KATEGORI_COLOR[post.kategori]?.replace('text-', 'text-').replace('bg-', 'bg-') || 'bg-gray-100 text-gray-500'}`}
                      style={{ background: undefined }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${KATEGORI_COLOR[post.kategori]}`}>
                          {post.kategori}
                        </span>
                        {post.penting && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                            ⭐ Penting
                          </span>
                        )}
                        {!post.is_active && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            Draft
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 ml-auto">{fmtTgl(post.created_at)}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 leading-snug">{post.judul}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.ringkasan}</p>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button onClick={() => openEdit(post)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => toggleActive(post)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors
                        ${post.is_active
                          ? 'text-amber-600 hover:bg-amber-50'
                          : 'text-emerald-600 hover:bg-emerald-50'}`}>
                      {post.is_active
                        ? <><EyeOff className="w-3.5 h-3.5" /> Jadikan Draft</>
                        : <><Eye className="w-3.5 h-3.5" /> Tayangkan</>}
                    </button>
                    <button onClick={() => handleDelete(post.id)} disabled={deleting === post.id}
                      className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors ml-auto disabled:opacity-50">
                      <Trash2 className="w-3.5 h-3.5" />
                      {deleting === post.id ? 'Menghapus...' : 'Hapus'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Buat/Edit Post */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-bold text-gray-900">
                {modal.mode === 'add' ? '✏️ Buat Post Baru' : '✏️ Edit Post'}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

              {/* Judul */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Judul *</label>
                <input type="text" placeholder="Judul artikel..." value={form.judul}
                  onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>

              {/* Kategori */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Kategori</label>
                <div className="flex gap-2 flex-wrap">
                  {KATEGORI.map(k => (
                    <button key={k} onClick={() => setForm(f => ({ ...f, kategori: k }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                        ${form.kategori === k
                          ? KATEGORI_COLOR[k] + ' ring-2 ring-offset-1 ring-current'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ringkasan */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Ringkasan *</label>
                <textarea rows={3} placeholder="Deskripsi singkat yang tampil di list..."
                  value={form.ringkasan}
                  onChange={e => setForm(f => ({ ...f, ringkasan: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
              </div>

              {/* Konten */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Konten Lengkap <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <textarea rows={6} placeholder="Isi artikel lengkap..."
                  value={form.konten}
                  onChange={e => setForm(f => ({ ...f, konten: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
              </div>

              {/* Toggle */}
              <div className="flex gap-3">
                <button onClick={() => setForm(f => ({ ...f, penting: !f.penting }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border-2 transition-colors
                    ${form.penting
                      ? 'border-orange-400 bg-orange-50 text-orange-600'
                      : 'border-gray-200 bg-white text-gray-500'}`}>
                  ⭐ {form.penting ? 'Ditandai Penting' : 'Tandai Penting'}
                </button>
                <button onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border-2 transition-colors
                    ${form.is_active
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                      : 'border-gray-200 bg-white text-gray-500'}`}>
                  {form.is_active
                    ? <><Eye className="w-3.5 h-3.5" /> Tayang</>
                    : <><EyeOff className="w-3.5 h-3.5" /> Draft</>}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button onClick={() => setModal(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
                {saving
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                  : <><Save className="w-4 h-4" /> Simpan</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
