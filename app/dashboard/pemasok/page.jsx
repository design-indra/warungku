'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, Plus, Truck, Phone, MapPin,
  Building2, Package, Edit2, Trash2, X, ChevronDown, ChevronUp
} from 'lucide-react'

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-gray-100 z-10">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

function PemasokCard({ p, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const initials = (p.nama || 'P')[0].toUpperCase()

  return (
    <div className="border-b border-gray-50 last:border-b-0">
      <div
        className="flex items-start gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 text-orange-600 font-bold text-sm">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900">{p.nama}</p>
          {p.perusahaan && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3" /> {p.perusahaan}
            </p>
          )}
          {p.no_hp && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" /> {p.no_hp}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onEdit(p) }}
            className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100"
          >
            <Edit2 className="w-3 h-3 text-blue-600" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(p.id) }}
            className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100"
          >
            <Trash2 className="w-3 h-3 text-red-500" />
          </button>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-gray-300 ml-1" />
            : <ChevronDown className="w-4 h-4 text-gray-300 ml-1" />
          }
        </div>
      </div>

      {/* Detail expanded */}
      {expanded && (
        <div className="mx-4 mb-3 bg-gray-50 rounded-xl p-3 space-y-2">
          {p.produk_info && (
            <div className="flex items-start gap-2">
              <Package className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Produk</p>
                <p className="text-xs text-gray-700">{p.produk_info}</p>
              </div>
            </div>
          )}
          {p.alamat && (
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Alamat</p>
                <p className="text-xs text-gray-700">{p.alamat}</p>
              </div>
            </div>
          )}
          {p.catatan && (
            <div className="flex items-start gap-2">
              <span className="text-gray-400 text-xs mt-0.5">📝</span>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Catatan</p>
                <p className="text-xs text-gray-700">{p.catatan}</p>
              </div>
            </div>
          )}
          {/* Contoh format display seperti yang diminta */}
          {(p.perusahaan || p.no_hp) && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 font-semibold mb-1">KONTAK SUPPLIER</p>
              {p.produk_info && <p className="text-xs text-gray-600">Produk: {p.produk_info}</p>}
              {p.perusahaan && <p className="text-xs text-blue-700 font-semibold">{p.perusahaan}</p>}
              {p.no_hp && <p className="text-xs text-gray-600">No: {p.no_hp}</p>}
              {p.alamat && <p className="text-xs text-gray-500">Alamat: {p.alamat}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const EMPTY_FORM = { nama: '', perusahaan: '', no_hp: '', alamat: '', produk_info: '', catatan: '' }

export default function PemasokPage() {
  const router = useRouter()
  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg]         = useState('')
  const [modal, setModal]     = useState(null) // null | { mode, data? }
  const [form, setForm]       = useState(EMPTY_FORM)
  const [saving, setSaving]   = useState(false)
  const [search, setSearch]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pemasok')
      const json = await res.json()
      setList(json.data || [])
    } catch { setList([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setForm(EMPTY_FORM); setMsg(''); setModal({ mode: 'add' }) }
  const openEdit = (p) => {
    setForm({
      nama: p.nama || '', perusahaan: p.perusahaan || '',
      no_hp: p.no_hp || '', alamat: p.alamat || '',
      produk_info: p.produk_info || '', catatan: p.catatan || '',
    })
    setMsg(''); setModal({ mode: 'edit', data: p })
  }

  const handleSave = async () => {
    if (!form.nama.trim()) { setMsg('❌ Nama pemasok wajib diisi'); return }
    setSaving(true); setMsg('')
    try {
      const url = modal.mode === 'add' ? '/api/pemasok' : `/api/pemasok/${modal.data.id}`
      const method = modal.mode === 'add' ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan')
      setModal(null); load()
    } catch (e) { setMsg('❌ ' + e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus pemasok ini?')) return
    try {
      const res = await fetch(`/api/pemasok/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus')
      load()
    } catch (e) { alert(e.message) }
  }

  const filtered = list.filter(p =>
    p.nama?.toLowerCase().includes(search.toLowerCase()) ||
    p.perusahaan?.toLowerCase().includes(search.toLowerCase()) ||
    p.produk_info?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">Pemasok / Supplier</h1>
            <p className="text-[10px] text-gray-400">{list.length} pemasok terdaftar</p>
          </div>
        </div>
        <button onClick={openAdd} className="btn-primary text-xs py-1.5 px-3">
          <Plus className="w-3.5 h-3.5" /> Tambah
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2 bg-white border-b border-gray-50 flex-shrink-0">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama, perusahaan, produk..."
          className="input-field text-sm py-2"
        />
      </div>

      <div className="flex-1 overflow-y-auto page-content">
        {loading ? (
          <div className="flex justify-center py-12"><div className="spinner" /></div>
        ) : (
          <>
            {msg && (
              <p className={`text-xs font-medium px-3 py-2 rounded-lg mb-3 ${msg.startsWith('✅') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{msg}</p>
            )}
            <div className="card overflow-hidden">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-gray-400">
                  <Truck className="w-10 h-10 mb-3 text-gray-200" />
                  <p className="text-sm">{search ? 'Tidak ditemukan' : 'Belum ada pemasok'}</p>
                  {!search && <p className="text-xs mt-1">Ketuk + untuk menambah pemasok baru</p>}
                </div>
              ) : (
                filtered.map(p => (
                  <PemasokCard
                    key={p.id} p={p}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>

            {/* Info box */}
            <div className="bg-orange-50 rounded-xl p-4 mt-4 border border-orange-100">
              <p className="text-xs font-bold text-orange-700 mb-1">💡 Contoh tampilan supplier</p>
              <p className="text-xs text-orange-600">Produk: Mie Sedap</p>
              <p className="text-xs text-orange-600 font-semibold">PT. Sayap Mas Utama</p>
              <p className="text-xs text-orange-600">No: 62-838-xxxx-xxxx</p>
              <p className="text-xs text-orange-600">Alamat: Jl. Merdeka No. xx, Jakarta</p>
            </div>
          </>
        )}
      </div>

      {/* Modal tambah / edit */}
      {modal && (
        <Modal
          title={modal.mode === 'add' ? 'Tambah Pemasok' : 'Edit Pemasok'}
          onClose={() => { setModal(null); setMsg('') }}
        >
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Nama Pemasok / Sales *</label>
              <input value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))}
                placeholder="cth: Pak Budi, Bu Sari" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Perusahaan / Distributor</label>
              <input value={form.perusahaan} onChange={e => setForm(p => ({ ...p, perusahaan: e.target.value }))}
                placeholder="cth: PT. Sayap Mas Utama" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Produk yang Disuplai</label>
              <input value={form.produk_info} onChange={e => setForm(p => ({ ...p, produk_info: e.target.value }))}
                placeholder="cth: Mie Sedap, Indomie, Sarimi" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">No. HP / Telepon</label>
              <input value={form.no_hp} onChange={e => setForm(p => ({ ...p, no_hp: e.target.value }))}
                placeholder="cth: 0838-xxxx-xxxx" className="input-field" type="tel" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Alamat</label>
              <textarea value={form.alamat} onChange={e => setForm(p => ({ ...p, alamat: e.target.value }))}
                rows={2} className="input-field resize-none" placeholder="Alamat pemasok" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Catatan</label>
              <input value={form.catatan} onChange={e => setForm(p => ({ ...p, catatan: e.target.value }))}
                placeholder="cth: Kirim tiap Senin pagi" className="input-field" />
            </div>
            {msg && <p className="text-xs text-red-500">{msg}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setModal(null); setMsg('') }} className="btn-secondary flex-1 justify-center">Batal</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
