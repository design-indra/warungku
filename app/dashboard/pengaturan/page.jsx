'use client'

import { useState } from 'react'
import Icon from '@/components/Icon'

const TABS = ['User & Role', 'Cabang', 'Profil Warung', 'Satuan Barang']

const INITIAL_USERS = [
  { id: 1, nama: 'Admin',   username: 'admin',  role: 'owner', cabang: 'Pusat' },
  { id: 2, nama: 'Kasir 1', username: 'kasir1', role: 'kasir', cabang: 'Cabang A' },
  { id: 3, nama: 'Kasir 2', username: 'kasir2', role: 'kasir', cabang: 'Cabang B' },
]
const INITIAL_CABANG = [
  { id: 1, nama: 'Pusat',    alamat: 'Jl. Merdeka No. 123, Jakarta' },
  { id: 2, nama: 'Cabang A', alamat: 'Jl. Mawar No. 10, Bandung' },
  { id: 3, nama: 'Cabang B', alamat: 'Jl. Melati No. 5, Surabaya' },
]
const INITIAL_SATUAN = ['pcs', 'kg', 'liter', 'pack', 'dus']

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState('User & Role')
  const [users, setUsers]   = useState(INITIAL_USERS)
  const [cabang, setCabang] = useState(INITIAL_CABANG)
  const [satuan, setSatuan] = useState(INITIAL_SATUAN)
  const [profil, setProfil] = useState({
    namaWarung: 'WarungKu',
    noTelp: '0812-3456-7890',
    alamat: 'Jl. Merdeka No. 123, Jakarta',
  })
  const [newSatuan, setNewSatuan] = useState('')

  const deleteUser   = (id) => setUsers(prev => prev.filter(u => u.id !== id))
  const deleteCabang = (id) => setCabang(prev => prev.filter(c => c.id !== id))
  const addSatuan = () => {
    if (newSatuan.trim() && !satuan.includes(newSatuan.trim())) {
      setSatuan(prev => [...prev, newSatuan.trim()])
      setNewSatuan('')
    }
  }

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

        {/* ── Tab: User & Role ── */}
        {activeTab === 'User & Role' && (
          <>
            {/* Users table */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Daftar User</h3>
                <button className="btn-primary text-xs py-1.5 px-3">
                  <Icon name="plus" size={13} color="#fff" /> Tambah User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>{['Nama', 'Username', 'Role', 'Cabang', 'Aksi'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="table-cell font-medium">{u.nama}</td>
                        <td className="table-cell text-gray-500">{u.username}</td>
                        <td className="table-cell">
                          <span className={`badge ${u.role === 'owner' ? 'badge-blue' : 'badge-green'}`}>{u.role}</span>
                        </td>
                        <td className="table-cell text-gray-500 text-xs">{u.cabang}</td>
                        <td className="table-cell">
                          <div className="flex gap-1.5">
                            <button className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100">
                              <Icon name="edit" size={13} color="#2563eb" />
                            </button>
                            <button onClick={() => deleteUser(u.id)}
                              className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100">
                              <Icon name="trash" size={13} color="#dc2626" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cabang table */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Cabang</h3>
                <button className="btn-primary text-xs py-1.5 px-3">
                  <Icon name="plus" size={13} color="#fff" /> Tambah Cabang
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>{['Nama Cabang', 'Alamat', 'Aksi'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {cabang.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="table-cell font-medium">{c.nama}</td>
                        <td className="table-cell text-gray-500 text-xs">{c.alamat}</td>
                        <td className="table-cell">
                          <div className="flex gap-1.5">
                            <button className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100">
                              <Icon name="edit" size={13} color="#2563eb" />
                            </button>
                            <button onClick={() => deleteCabang(c.id)}
                              className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100">
                              <Icon name="trash" size={13} color="#dc2626" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── Tab: Cabang (detail view) ── */}
        {activeTab === 'Cabang' && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Kelola Cabang</h3>
              <button className="btn-primary text-xs py-1.5 px-3">
                <Icon name="plus" size={13} color="#fff" /> Tambah Cabang
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {cabang.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name="store" size={16} color="#2563eb" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{c.nama}</p>
                    <p className="text-xs text-gray-400">{c.alamat}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Icon name="edit" size={13} color="#2563eb" />
                    </button>
                    <button onClick={() => deleteCabang(c.id)} className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                      <Icon name="trash" size={13} color="#dc2626" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: Profil Warung ── */}
        {activeTab === 'Profil Warung' && (
          <div className="max-w-lg space-y-4">
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-4">Profil Warung</h3>

              {/* Logo */}
              <div className="text-center mb-5">
                <div className="text-5xl mb-3">🏪</div>
                <button className="btn-secondary text-xs">Ubah Logo</button>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Nama Warung', key: 'namaWarung', placeholder: 'WarungKu' },
                  { label: 'No. Telepon', key: 'noTelp',     placeholder: '0812-xxx-xxxx' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                    <input value={profil[f.key]} onChange={e => setProfil({ ...profil, [f.key]: e.target.value })}
                      placeholder={f.placeholder} className="input-field" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Alamat</label>
                  <textarea value={profil.alamat} onChange={e => setProfil({ ...profil, alamat: e.target.value })}
                    rows={2} className="input-field resize-none" />
                </div>
              </div>

              <button className="w-full btn-primary justify-center mt-4 py-3">
                <Icon name="save" size={16} color="#fff" /> Simpan Perubahan
              </button>
            </div>
          </div>
        )}

        {/* ── Tab: Satuan Barang ── */}
        {activeTab === 'Satuan Barang' && (
          <div className="max-w-lg space-y-4">
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-4">Satuan Barang</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {satuan.map(s => (
                  <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                    {s}
                    <button onClick={() => setSatuan(prev => prev.filter(x => x !== s))}
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
                <button onClick={addSatuan} className="btn-primary flex-shrink-0">
                  <Icon name="plus" size={15} color="#fff" /> Tambah
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
