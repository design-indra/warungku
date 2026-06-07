'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, Store, Edit2, Trash2, X } from 'lucide-react'

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Terjadi kesalahan')
  return json
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-4.5 h-4.5 text-gray-400" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

export default function CabangPage() {
  const router = useRouter()
  const [cabang, setCabang]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null)
  const [form, setForm]       = useState({ nama: '', alamat: '' })
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try { setCabang(await apiFetch('/api/pengaturan/cabang')) }
    catch (e) { setMsg('❌ ' + e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd  = () => { setForm({ nama: '', alamat: '' }); setMsg(''); setModal({ mode: 'add' }) }
  const openEdit = (c) => { setForm({ nama: c.nama, alamat: c.alamat || '' }); setMsg(''); setModal({ mode: 'edit', data: c }) }

  const handleSave = async () => {
    if (!form.nama.trim()) { setMsg('❌ Nama cabang wajib diisi'); return }
    setSaving(true); setMsg('')
    try {
      if (modal.mode === 'add') {
        await apiFetch('/api/pengaturan/cabang', { method: 'POST', body: JSON.stringify(form) })
      } else {
        await apiFetch(`/api/pengaturan/cabang/${modal.data.id}`, { method: 'PUT', body: JSON.stringify(form) })
      }
      setModal(null); load()
    } catch (e) { setMsg('❌ ' + e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus cabang ini?')) return
    try { await apiFetch(`/api/pengaturan/cabang/${id}`, { method: 'DELETE' }); load() }
    catch (e) { alert(e.message) }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-base font-bold text-gray-900">Kelola Cabang</h1>
        </div>
        <button onClick={openAdd} className="btn-primary text-xs py-1.5 px-3">
          <Plus className="w-3.5 h-3.5" /> Tambah
        </button>
      </div>

      <div className="flex-1 overflow-y-auto page-content">
        {loading ? (
          <div className="flex justify-center py-12"><div className="spinner" /></div>
        ) : (
          <div className="card overflow-hidden">
            {msg && <p className="px-4 py-2 text-xs text-red-500">{msg}</p>}
            <div className="divide-y divide-gray-50">
              {cabang.length === 0 && (
                <div className="flex flex-col items-center py-12 text-gray-400">
                  <Store className="w-10 h-10 mb-3 text-gray-200" />
                  <p className="text-sm">Belum ada cabang</p>
                  <p className="text-xs mt-1">Ketuk tombol + untuk menambah</p>
                </div>
              )}
              {cabang.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Store className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{c.nama}</p>
                    <p className="text-xs text-gray-400">{c.alamat || '—'}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100">
                      <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Tambah Cabang' : 'Edit Cabang'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Nama Cabang</label>
              <input value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))}
                placeholder="cth: Pusat, Cabang A" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Alamat</label>
              <textarea value={form.alamat} onChange={e => setForm(p => ({ ...p, alamat: e.target.value }))}
                rows={2} className="input-field resize-none" placeholder="Alamat cabang (opsional)" />
            </div>
            {msg && <p className="text-xs text-red-500">{msg}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">Batal</button>
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
