'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Icon from '@/components/Icon'

const TABS = [
  'Profil Warung',
  'Cabang',
  'User & Role',
  'Satuan Barang',
  'Kategori Barang',
  'Pemasok',
  'Printer & Struk',
  'Ubah Password',
]

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
  const [form,       setForm]       = useState({ nama_warung: '', no_hp: '', alamat: '' })
  const [logoUrl,    setLogoUrl]    = useState('')
  const [uploading,  setUploading]  = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [msg,        setMsg]        = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    apiFetch('/api/pengaturan/profil')
      .then(d => {
        setForm({ nama_warung: d.nama_warung || '', no_hp: d.no_hp || '', alamat: d.alamat || '' })
        setLogoUrl(d.logo_url || '')
      })
      .catch(e => setMsg('❌ ' + e.message))
      .finally(() => setLoading(false))
  }, [])

  // Upload foto logo ke Supabase Storage via API baru
  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Preview lokal dulu
    const localUrl = URL.createObjectURL(file)
    setLogoUrl(localUrl)
    setUploading(true)
    setMsg('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/pengaturan/upload-logo', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Upload gagal')
      setLogoUrl(json.url) // ganti preview lokal dengan URL permanent
      setMsg('✅ Foto warung berhasil diperbarui!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg('❌ ' + err.message)
      setLogoUrl('') // reset preview jika gagal
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

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

        {/* ── Logo / Foto Warung ── */}
        <div className="flex flex-col items-center mb-6">
          {/* Zona foto — klik untuk upload */}
          <div
            className="relative cursor-pointer group"
            onClick={() => !uploading && fileRef.current?.click()}
          >
            {/* Avatar / preview */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-blue-50 flex items-center justify-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo warung" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl select-none">🏪</span>
              )}
            </div>

            {/* Overlay kamera saat hover / loading */}
            <div className={`absolute inset-0 rounded-2xl flex items-center justify-center transition-all
              ${uploading ? 'bg-black/40' : 'bg-black/0 group-hover:bg-black/40'}`}>
              {uploading ? (
                <svg className="w-7 h-7 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : (
                <svg className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              )}
            </div>

            {/* Badge kamera kecil di pojok kanan bawah */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-3 text-center">
            {uploading ? 'Mengupload foto...' : 'Ketuk foto untuk mengganti'}
          </p>
          <p className="text-[10px] text-gray-300 mt-0.5">JPG, PNG, WebP • Maks. 10MB</p>

          {/* Input file hidden */}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleLogoChange}
          />
        </div>

        {/* ── Form fields ── */}
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
        <button onClick={handleSave} disabled={saving || uploading} className="w-full btn-primary justify-center mt-4 py-3">
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
// TAB: KATEGORI BARANG
// ═══════════════════════════════════════════════════════════════
function TabKategori() {
  const DEFAULT_KATEGORI = ['Makanan', 'Minuman', 'Sembako', 'Rokok', 'Kebutuhan', 'Lainnya']
  const [kategori, setKategori] = useState(DEFAULT_KATEGORI)
  const [newKat, setNewKat]     = useState('')
  const [saving, setSaving]     = useState(false)
  const [loading, setLoading]   = useState(true)
  const [msg, setMsg]           = useState('')

  useEffect(() => {
    apiFetch('/api/pengaturan/profil')
      .then(d => setKategori(d.kategori_list?.length ? d.kategori_list : DEFAULT_KATEGORI))
      .catch(() => setKategori(DEFAULT_KATEGORI))
      .finally(() => setLoading(false))
  }, [])

  const saveKategori = async (list) => {
    setSaving(true); setMsg('')
    try {
      await apiFetch('/api/pengaturan/profil', {
        method: 'PUT',
        body: JSON.stringify({ kategori_list: list }),
      })
      setMsg('✅ Kategori disimpan!')
      setTimeout(() => setMsg(''), 2000)
    } catch (e) { setMsg('❌ ' + e.message) }
    finally { setSaving(false) }
  }

  const addKategori = async () => {
    const val = newKat.trim()
    if (!val || kategori.map(k=>k.toLowerCase()).includes(val.toLowerCase())) return
    const updated = [...kategori, val]
    setKategori(updated)
    setNewKat('')
    await saveKategori(updated)
  }

  const removeKategori = async (k) => {
    const updated = kategori.filter(x => x !== k)
    setKategori(updated)
    await saveKategori(updated)
  }

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" /></div>

  return (
    <div className="max-w-lg space-y-4">
      <div className="card p-5">
        <h3 className="font-bold text-gray-900 mb-1">Kategori Barang</h3>
        <p className="text-xs text-gray-400 mb-4">Kategori ini akan muncul saat tambah atau edit barang.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {kategori.map(k => (
            <div key={k} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
              {k}
              <button onClick={() => removeKategori(k)} disabled={saving}
                className="hover:bg-green-200 rounded-full w-4 h-4 flex items-center justify-center">
                <Icon name="x" size={10} color="#15803d" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newKat} onChange={e => setNewKat(e.target.value)}
            placeholder="Tambah kategori baru..." className="input-field flex-1"
            onKeyDown={e => e.key === 'Enter' && addKategori()} />
          <button onClick={addKategori} disabled={saving} className="btn-primary flex-shrink-0">
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
// TAB: PEMASOK
// ═══════════════════════════════════════════════════════════════
function TabPemasok() {
  const [list, setList]     = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg]       = useState('')
  const [form, setForm]     = useState({ nama: '', kontak: '', alamat: '' })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pelanggan?role=pemasok')
      const json = await res.json()
      setList(json.data || [])
    } catch { setList([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.nama.trim()) { setMsg('❌ Nama pemasok wajib diisi'); return }
    setSaving(true); setMsg('')
    try {
      const res = await fetch('/api/pelanggan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'pemasok' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan')
      setMsg('✅ Pemasok ditambahkan!')
      setForm({ nama: '', kontak: '', alamat: '' })
      setShowForm(false)
      await load()
      setTimeout(() => setMsg(''), 2500)
    } catch (e) { setMsg('❌ ' + e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" /></div>

  return (
    <div className="max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Pemasok / Supplier</h3>
          <p className="text-xs text-gray-400">Kelola daftar pemasok barang warung kamu.</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary text-xs px-3 py-2">
          <Icon name="plus" size={14} color="#fff" /> Tambah
        </button>
      </div>

      {msg && (
        <p className={`text-xs font-medium px-3 py-2 rounded-lg ${msg.startsWith('✅') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{msg}</p>
      )}

      {showForm && (
        <div className="card p-4 space-y-3">
          <h4 className="font-semibold text-sm text-gray-800">Tambah Pemasok Baru</h4>
          <input value={form.nama} onChange={e => setForm(p => ({...p, nama: e.target.value}))}
            placeholder="Nama pemasok *" className="input-field w-full" />
          <input value={form.kontak} onChange={e => setForm(p => ({...p, kontak: e.target.value}))}
            placeholder="No. HP / Kontak" className="input-field w-full" />
          <input value={form.alamat} onChange={e => setForm(p => ({...p, alamat: e.target.value}))}
            placeholder="Alamat" className="input-field w-full" />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Batal</button>
          </div>
        </div>
      )}

      <div className="card divide-y divide-gray-50">
        {list.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">Belum ada pemasok</p>
        ) : list.map(p => (
          <div key={p.id} className="flex items-start gap-3 px-4 py-3">
            <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 text-orange-600 font-bold text-sm">
              {p.nama?.[0]?.toUpperCase() || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{p.nama}</p>
              {p.kontak && <p className="text-xs text-gray-400">{p.kontak}</p>}
              {p.alamat && <p className="text-xs text-gray-400 truncate">{p.alamat}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TAB: PRINTER & STRUK
// ═══════════════════════════════════════════════════════════════
function TabPrinter() {
  return (
    <div className="max-w-lg">
      <div className="card p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="printer" size={32} color="#9ca3af" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2">Printer & Struk</h3>
        <p className="text-sm text-gray-400 mb-1">Fitur konfigurasi printer Bluetooth</p>
        <p className="text-xs text-gray-300">akan tersedia segera.</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TAB: UBAH PASSWORD
// ═══════════════════════════════════════════════════════════════
function TabUbahPassword() {
  const [form, setForm]     = useState({ password: '', konfirmasi: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState('')

  const handleSave = async () => {
    if (!form.password) { setMsg('❌ Password baru wajib diisi'); return }
    if (form.password.length < 6) { setMsg('❌ Password minimal 6 karakter'); return }
    if (form.password !== form.konfirmasi) { setMsg('❌ Konfirmasi password tidak cocok'); return }
    setLoading(true); setMsg('')
    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: form.password })
      if (error) throw new Error(error.message)
      setMsg('✅ Password berhasil diubah!')
      setForm({ password: '', konfirmasi: '' })
    } catch (e) { setMsg('❌ ' + e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="card p-5">
        <h3 className="font-bold text-gray-900 mb-1">Ubah Password</h3>
        <p className="text-xs text-gray-400 mb-4">Masukkan password baru untuk akun kamu.</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Password Baru</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({...p, password: e.target.value}))}
                placeholder="Minimal 6 karakter"
                className="input-field w-full pr-10"
              />
              <button
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <Icon name={showPass ? 'eye-off' : 'eye'} size={16} color="#9ca3af" />
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Konfirmasi Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={form.konfirmasi}
              onChange={e => setForm(p => ({...p, konfirmasi: e.target.value}))}
              placeholder="Ulangi password baru"
              className="input-field w-full"
            />
          </div>
        </div>

        {msg && (
          <p className={`mt-3 text-xs font-medium ${msg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>
        )}

        <button onClick={handleSave} disabled={loading} className="btn-primary w-full mt-4">
          {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ROOT PAGE (inner — baca searchParams)
// ═══════════════════════════════════════════════════════════════
function PengaturanInner() {
  const searchParams = useSearchParams()
  const tabFromUrl   = searchParams.get('tab')

  const [activeTab, setActiveTab] = useState(() => {
    if (tabFromUrl && TABS.includes(tabFromUrl)) return tabFromUrl
    return 'Profil Warung'
  })

  // Sync jika URL berubah (navigasi dari sidebar)
  useEffect(() => {
    if (tabFromUrl && TABS.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

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
        {activeTab === 'Profil Warung'   && <TabProfilWarung />}
        {activeTab === 'Cabang'          && <TabCabang />}
        {activeTab === 'User & Role'     && <TabUsers />}
        {activeTab === 'Satuan Barang'   && <TabSatuan />}
        {activeTab === 'Kategori Barang' && <TabKategori />}
        {activeTab === 'Pemasok'         && <TabPemasok />}
        {activeTab === 'Printer & Struk' && <TabPrinter />}
        {activeTab === 'Ubah Password'   && <TabUbahPassword />}
      </div>
    </div>
  )
}

export default function PengaturanPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="spinner" /></div>}>
      <PengaturanInner />
    </Suspense>
  )
}
