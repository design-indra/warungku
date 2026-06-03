'use client'

import { useState, useEffect, useCallback } from 'react'
import Icon from '@/components/Icon'

const TABS = ['Profil Warung', 'Cabang', 'User & Role', 'Satuan Barang']

// ─── Helper fetch ────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Terjadi kesalahan')
  return json
}

// ─── Modal kecil ─────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <Icon name="x" size={18} color="#9ca3af" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TAB: PROFIL WARUNG
// ═══════════════════════════════════════════════════════════════
function TabProfilWarung() {
  const [form,    setForm]    = useState({ nama_warung: '', no_hp: '', alamat: '' })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')

  useEffect(() => {
    apiFetch('/api/pengaturan/profil')
      .then(d => setForm({ nama_warung: d.nama_warung || '', no_hp: d.no_hp || '', alamat: d.alamat || '' }))
      .catch(e => setMsg('❌ ' + e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!form.nama_warung.trim()) { setMsg('❌ Nama warung wajib diisi'); return }
    setSaving(true); setMsg('')
    try {
      await apiFetch('/api/pengaturan/profil', { method: 'PUT', body: JSON.stringify(form) })
      setMsg('✅ Profil berhasil disimpan!')
    } catch (e) { setMsg('❌ ' + e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" /></div>

  return (
    <div className="max-w-lg space-y-4">
      <div className="card p-5">
        <h3 className="font-bold text-gray-900 mb-4">Profil Warung</h3>
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">🏪</div>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Nama Warung', key: 'nama_warung', placeholder: 'Nama warung Anda' },
            { label: 'No. Telepon', key: 'no_hp',       placeholder: '0812-xxx-xxxx' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
              <input
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="input-field"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Alamat</label>
            <textarea
              value={form.alamat}
              onChange={e => setForm(p => ({ ...p, alamat: e.target.value }))}
              rows={2} className="input-field resize-none"
            />
          </div>
        </div>
        {msg && (
          <p className={`mt-3 text-xs font-medium ${msg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>
        )}
        <button onClick={handleSave} disabled={saving} className="w-full btn-primary justify-center mt-4 py-3">
          <Icon name="save" size={16} color="#fff" />
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TAB: CABANG
// ═══════════════════════════════════════════════════════════════
function TabCabang() {
  const [cabang,  setCabang]  = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null) // null | { mode: 'add'|'edit', data?: {} }
  const [form,    setForm]    = useState({ nama: '', alamat: '' })
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try { setCabang(await apiFetch('/api/pengaturan/cabang')) }
    catch (e) { setMsg('❌ ' + e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd  = () => { setForm({ nama: '', alamat: '' }); setModal({ mode: 'add' }) }
  const openEdit = (c) => { setForm({ nama: c.nama, alamat: c.alamat || '' }); setModal({ mode: 'edit', data: c }) }

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
    try {
      await apiFetch(`/api/pengaturan/cabang/${id}`, { method: 'DELETE' })
      load()
    } catch (e) { alert(e.message) }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" /></div>

  return (
    <>
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Kelola Cabang</h3>
          <button onClick={openAdd} className="btn-primary text-xs py-1.5 px-3">
            <Icon name="plus" size={13} color="#fff" /> Tambah Cabang
          </button>
        </div>
        {msg && <p className="px-4 py-2 text-xs text-red-500">{msg}</p>}
        <div className="divide-y divide-gray-50">
          {cabang.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-gray-400">Belum ada cabang</p>
          )}
          {cabang.map(c => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon name="store" size={16} color="#2563eb" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{c.nama}</p>
                <p className="text-xs text-gray-400">{c.alamat || '—'}</p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(c)} className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon name="edit" size={13} color="#2563eb" />
                </button>
                <button onClick={() => handleDelete(c.id)} className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                  <Icon name="trash" size={13} color="#dc2626" />
                </button>
              </div>
            </div>
          ))}
        </div>
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
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// TAB: USER & ROLE
// ═══════════════════════════════════════════════════════════════
function TabUsers() {
  const [users,   setUsers]   = useState([])
  const [cabang,  setCabang]  = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null) // null | { mode: 'add'|'edit', data? }
  const [form,    setForm]    = useState({ email: '', nama_lengkap: '', role: 'kasir', cabang_id: '' })
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')

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

  const openAdd  = () => { setForm({ email: '', nama_lengkap: '', role: 'kasir', cabang_id: '' }); setModal({ mode: 'add' }) }
  const openEdit = (u) => {
    setForm({ nama_lengkap: u.nama_lengkap || '', role: u.role, cabang_id: u.cabang?.id || '' })
    setModal({ mode: 'edit', data: u })
  }

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      if (modal.mode === 'add') {
        if (!form.email.trim()) { setMsg('❌ Email wajib diisi'); return }
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
    try {
      await apiFetch(`/api/pengaturan/users/${id}`, { method: 'DELETE' })
      load()
    } catch (e) { alert(e.message) }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" /></div>

  return (
    <>
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Daftar User</h3>
          <button onClick={openAdd} className="btn-primary text-xs py-1.5 px-3">
            <Icon name="plus" size={13} color="#fff" /> Tambah User
          </button>
        </div>
        {msg && <p className="px-4 py-2 text-xs text-red-500">{msg}</p>}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>{['Nama', 'Role', 'Cabang', 'Aksi'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={4} className="table-cell text-center text-gray-400">Belum ada user</td></tr>
              )}
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{u.nama_lengkap || '—'}</td>
                  <td className="table-cell">
                    <span className={`badge ${u.role === 'owner' ? 'badge-blue' : u.role === 'admin' ? 'badge-yellow' : 'badge-green'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="table-cell text-gray-500 text-xs">{u.cabang?.nama || '—'}</td>
                  <td className="table-cell">
                    {u.role !== 'owner' && (
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(u)} className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100">
                          <Icon name="edit" size={13} color="#2563eb" />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100">
                          <Icon name="trash" size={13} color="#dc2626" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal
          title={modal.mode === 'add' ? 'Tambah User' : 'Edit User'}
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
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// TAB: SATUAN BARANG
// Disimpan di tenants.satuan_list (TEXT[] / JSONB)
// ═══════════════════════════════════════════════════════════════
const DEFAULT_SATUAN = ['pcs', 'kg', 'liter', 'pack', 'dus']

function TabSatuan() {
  const [satuan,    setSatuan]    = useState([])
  const [newSatuan, setNewSatuan] = useState('')
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [msg,       setMsg]       = useState('')

  useEffect(() => {
    apiFetch('/api/pengaturan/profil')
      .then(d => setSatuan(d.satuan_list?.length ? d.satuan_list : DEFAULT_SATUAN))
      .catch(() => setSatuan(DEFAULT_SATUAN))
      .finally(() => setLoading(false))
  }, [])

  const saveSatuan = async (list) => {
    setSaving(true); setMsg('')
    try {
      await apiFetch('/api/pengaturan/profil', {
        method: 'PUT',
        body: JSON.stringify({ satuan_list: list }),
      })
      setMsg('✅ Satuan disimpan!')
      setTimeout(() => setMsg(''), 2000)
    } catch (e) { setMsg('❌ ' + e.message) }
    finally { setSaving(false) }
  }

  const addSatuan = async () => {
    const val = newSatuan.trim().toLowerCase()
    if (!val || satuan.includes(val)) return
    const updated = [...satuan, val]
    setSatuan(updated)
    setNewSatuan('')
    await saveSatuan(updated)
  }

  const removeSatuan = async (s) => {
    const updated = satuan.filter(x => x !== s)
    setSatuan(updated)
    await saveSatuan(updated)
  }

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" /></div>

  return (
    <div className="max-w-lg space-y-4">
      <div className="card p-5">
        <h3 className="font-bold text-gray-900 mb-1">Satuan Barang</h3>
        <p className="text-xs text-gray-400 mb-4">Satuan ini akan muncul saat tambah atau edit barang.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {satuan.map(s => (
            <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
              {s}
              <button onClick={() => removeSatuan(s)} disabled={saving}
                className="hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center">
                <Icon name="x" size={10} color="#1d4ed8" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newSatuan} onChange={e => setNewSatuan(e.target.value)}
            placeholder="Tambah satuan baru..." className="input-field flex-1"
            onKeyDown={e => e.key === 'Enter' && addSatuan()} />
          <button onClick={addSatuan} disabled={saving} className="btn-primary flex-shrink-0">
            <Icon name="plus" size={15} color="#fff" /> Tambah
          </button>
        </div>
        {msg && (
          <p className={`mt-2 text-xs font-medium ${msg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ROOT PAGE
// ═══════════════════════════════════════════════════════════════
export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState('Profil Warung')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 flex overflow-x-auto flex-shrink-0">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-none px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2
              ${activeTab === t
                ? 'text-blue-700 border-blue-700'
                : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto page-content space-y-4">
        {activeTab === 'Profil Warung' && <TabProfilWarung />}
        {activeTab === 'Cabang'        && <TabCabang />}
        {activeTab === 'User & Role'   && <TabUsers />}
        {activeTab === 'Satuan Barang' && <TabSatuan />}
      </div>
    </div>
  )
}
