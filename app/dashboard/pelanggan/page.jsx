'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  UserRound, Search, Trash2, Phone, MapPin,
  Users, AlertCircle, RefreshCw, X, Plus, Save, Pencil
} from 'lucide-react'

export default function PelangganPage() {
  const [list, setList]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [delTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting]   = useState(false)
  const [error, setError]         = useState('')
  const [toast, setToast]         = useState('')

  // Modal tambah/edit
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null) // null = mode tambah
  const [form, setForm]           = useState({ nama: '', no_hp: '', alamat: '' })
  const [saving, setSaving]       = useState(false)
  const [formErr, setFormErr]     = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchPelanggan = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/pelanggan')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal memuat data')
      setList(json.data || [])
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPelanggan() }, [fetchPelanggan])

  const filtered = useMemo(() => {
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(p =>
      p.nama?.toLowerCase().includes(q) ||
      p.no_hp?.toLowerCase().includes(q) ||
      p.alamat?.toLowerCase().includes(q)
    )
  }, [list, search])

  const openTambah = () => {
    setEditTarget(null)
    setForm({ nama: '', no_hp: '', alamat: '' })
    setFormErr('')
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditTarget(p)
    setForm({ nama: p.nama || '', no_hp: p.no_hp || '', alamat: p.alamat || '' })
    setFormErr('')
    setShowModal(true)
  }

  const handleSimpan = async () => {
    if (!form.nama.trim()) { setFormErr('Nama wajib diisi'); return }
    setSaving(true); setFormErr('')
    try {
      const isEdit = !!editTarget
      const url    = isEdit ? `/api/pelanggan/${editTarget.id}` : '/api/pelanggan'
      const method = isEdit ? 'PUT' : 'POST'

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan')

      if (isEdit) {
        setList(prev => prev.map(p => p.id === editTarget.id ? json.data : p))
        showToast(`${json.data.nama} berhasil diperbarui`)
      } else {
        setList(prev => [...prev, json.data].sort((a, b) => a.nama.localeCompare(b.nama)))
        showToast(`${json.data.nama} berhasil ditambahkan`)
      }

      setShowModal(false)
      setEditTarget(null)
      setForm({ nama: '', no_hp: '', alamat: '' })
    } catch (e) { setFormErr(e.message) } finally { setSaving(false) }
  }

  const handleHapus = async () => {
    if (!delTarget) return
    setDeleting(true)
    try {
      const res  = await fetch(`/api/pelanggan/${delTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus')
      setList(prev => prev.filter(p => p.id !== delTarget.id))
      showToast(`${delTarget.nama} berhasil dihapus`)
      setDelTarget(null)
    } catch (e) { showToast('⚠️ ' + e.message); setDelTarget(null) } finally { setDeleting(false) }
  }

  const inisial    = (nama) => (nama || 'X')[0].toUpperCase()
  const warnaBadge = (idx) => {
    const colors = [
      'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700',
      'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700',
    ]
    return colors[idx % colors.length]
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
          <UserRound className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Data Pelanggan</h1>
          <p className="text-xs text-gray-400">
            {loading ? 'Memuat...' : `${list.length} pelanggan terdaftar`}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={fetchPelanggan}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={openTambah}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Cari nama, no HP, atau alamat..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-2.5 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">
            {search ? 'Pelanggan tidak ditemukan' : 'Belum ada pelanggan'}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {search ? 'Coba kata kunci lain' : 'Klik tombol Tambah untuk menambah pelanggan'}
          </p>
          {!search && (
            <button onClick={openTambah}
              className="mt-4 flex items-center gap-1.5 bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl mx-auto hover:bg-blue-800 transition-colors">
              <Plus className="w-4 h-4" /> Tambah Pelanggan
            </button>
          )}
        </div>
      )}

      {/* List */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((p, idx) => (
            <div key={p.id}
              className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${warnaBadge(idx)}`}>
                {inisial(p.nama)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{p.nama}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  {p.no_hp && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone className="w-3 h-3" />{p.no_hp}
                    </span>
                  )}
                  {p.alamat && (
                    <span className="flex items-center gap-1 text-xs text-gray-400 truncate max-w-[180px]">
                      <MapPin className="w-3 h-3 flex-shrink-0" />{p.alamat}
                    </span>
                  )}
                </div>
              </div>

              {/* Tombol WA */}
              {p.no_hp && (
                <a href={`https://wa.me/${p.no_hp.replace(/^0/, '62').replace(/\D/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors flex-shrink-0">
                  <Phone className="w-4 h-4 text-emerald-600" />
                </a>
              )}

              {/* Tombol Edit */}
              <button onClick={() => openEdit(p)}
                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors flex-shrink-0">
                <Pencil className="w-4 h-4 text-blue-600" />
              </button>

              {/* Tombol Hapus */}
              <button onClick={() => setDelTarget(p)}
                className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors flex-shrink-0">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
          {search && (
            <p className="text-center text-xs text-gray-400 pt-2">
              Menampilkan {filtered.length} dari {list.length} pelanggan
            </p>
          )}
        </div>
      )}

      {/* Modal Tambah / Edit Pelanggan */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  {editTarget ? <Pencil className="w-4 h-4 text-blue-700" /> : <UserRound className="w-4 h-4 text-blue-700" />}
                </div>
                <p className="font-bold text-gray-900 text-sm">
                  {editTarget ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {formErr && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl p-3 text-xs mb-3">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {formErr}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Nama *</label>
                <input type="text" placeholder="Nama pelanggan"
                  value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">No. HP <span className="text-gray-400 font-normal">(opsional)</span></label>
                <input type="tel" placeholder="08xxxxxxxxxx"
                  value={form.no_hp} onChange={e => setForm(f => ({ ...f, no_hp: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Alamat <span className="text-gray-400 font-normal">(opsional)</span></label>
                <input type="text" placeholder="Alamat pelanggan"
                  value={form.alamat} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button onClick={handleSimpan} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
                {saving
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                  : <><Save className="w-4 h-4" /> {editTarget ? 'Perbarui' : 'Simpan'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {delTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Hapus Pelanggan?</p>
                <p className="text-xs text-gray-500">Tindakan ini tidak bisa dibatalkan</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="font-semibold text-gray-800 text-sm">{delTarget.nama}</p>
              {delTarget.no_hp && <p className="text-xs text-gray-500 mt-0.5">{delTarget.no_hp}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDelTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button onClick={handleHapus} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-60">
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-full shadow-xl whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  )
}
