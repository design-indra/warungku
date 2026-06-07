'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, UserCircle, Edit2, Trash2, X } from 'lucide-react'

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
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

const ROLE_BADGE = {
  owner: 'bg-blue-100 text-blue-700',
  admin: 'bg-yellow-100 text-yellow-700',
  kasir: 'bg-green-100 text-green-700',
}

export default function RolePage() {
  const router = useRouter()
  const [users, setUsers]     = useState([])
  const [cabang, setCabang]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null)
  const [form, setForm]       = useState({ email: '', nama_lengkap: '', role: 'kasir', cabang_id: '' })
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [u, c] = await Promise.all([
        apiFetch('/api/pengaturan/users'),
        apiFetch('/api/pengaturan/cabang'),
      ])
      setUsers(u); setCabang(c)
    } catch (e) { setMsg('❌ ' + e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setForm({ email: '', nama_lengkap: '', role: 'kasir', cabang_id: '' })
    setMsg(''); setModal({ mode: 'add' })
  }
  const openEdit = (u) => {
    setForm({ nama_lengkap: u.nama_lengkap || '', role: u.role, cabang_id: u.cabang?.id || '' })
    setMsg(''); setModal({ mode: 'edit', data: u })
  }

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      if (modal.mode === 'add') {
        if (!form.email.trim()) { setMsg('❌ Email wajib diisi'); setSaving(false); return }
        await apiFetch('/api/pengaturan/users', { method: 'POST', body: JSON.stringify(form) })
      } else {
        await apiFetch(`/api/pengaturan/users/${modal.data.id}`, { method: 'PUT', body: JSON.stringify(form) })
      }
      setModal(null); load()
    } catch (e) { setMsg('❌ ' + e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Nonaktifkan user ini?')) return
    try { await apiFetch(`/api/pengaturan/users/${id}`, { method: 'DELETE' }); load() }
    catch (e) { alert(e.message) }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-base font-bold text-gray-900">Pengguna & Role</h1>
        </div>
        <button onClick={openAdd} className="btn-primary text-xs py-1.5 px-3">
          <Plus className="w-3.5 h-3.5" /> Tambah
        </button>
      </div>

      <div className="flex-1 overflow-y-auto page-content">
        {loading ? (
          <div className="flex justify-center py-12"><div className="spinner" /></div>
        ) : (
          <>
            {msg && <p className="text-xs text-red-500 px-1 mb-2">{msg}</p>}
            <div className="card overflow-hidden">
              <div className="divide-y divide-gray-50">
                {users.length === 0 && (
                  <div className="flex flex-col items-center py-12 text-gray-400">
                    <UserCircle className="w-10 h-10 mb-3 text-gray-200" />
                    <p className="text-sm">Belum ada pengguna</p>
                  </div>
                )}
                {users.map(u => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 font-bold text-blue-700 text-sm">
                      {(u.nama_lengkap || u.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{u.nama_lengkap || '—'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROLE_BADGE[u.role] || 'bg-gray-100 text-gray-600'}`}>
                          {u.role}
                        </span>
                        {u.cabang?.nama && (
                          <span className="text-xs text-gray-400">{u.cabang.nama}</span>
                        )}
                      </div>
                    </div>
                    {u.role !== 'owner' && (
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(u)} className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100">
                          <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Info role */}
            <div className="card p-4 mt-4">
              <h3 className="text-xs font-bold text-gray-700 mb-3">Keterangan Role</h3>
              <div className="space-y-2">
                {[
                  { role: 'owner', desc: 'Akses penuh ke semua fitur', color: ROLE_BADGE.owner },
                  { role: 'admin', desc: 'Kelola produk, laporan, & pengguna', color: ROLE_BADGE.admin },
                  { role: 'kasir', desc: 'Hanya bisa transaksi kasir', color: ROLE_BADGE.kasir },
                ].map(r => (
                  <div key={r.role} className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.color}`}>{r.role}</span>
                    <span className="text-xs text-gray-500">{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {modal && (
        <Modal
          title={modal.mode === 'add' ? 'Tambah Pengguna' : 'Edit Pengguna'}
          onClose={() => { setModal(null); setMsg('') }}
        >
          <div className="space-y-3">
            {modal.mode === 'add' && (
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Email</label>
                <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  type="email" placeholder="email@contoh.com" className="input-field" />
                <p className="text-xs text-gray-400 mt-1">User akan menerima undangan lewat email ini.</p>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Nama Lengkap</label>
              <input value={form.nama_lengkap} onChange={e => setForm(p => ({ ...p, nama_lengkap: e.target.value }))}
                placeholder="Nama user" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Role</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="input-field">
                <option value="kasir">Kasir</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Cabang</label>
              <select value={form.cabang_id} onChange={e => setForm(p => ({ ...p, cabang_id: e.target.value }))} className="input-field">
                <option value="">— Pilih Cabang —</option>
                {cabang.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
            </div>
            {msg && <p className="text-xs text-red-500">{msg}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setModal(null); setMsg('') }} className="btn-secondary flex-1 justify-center">Batal</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Menyimpan...' : modal.mode === 'add' ? 'Undang User' : 'Simpan'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
