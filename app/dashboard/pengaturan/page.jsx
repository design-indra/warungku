'use client'

import { useState, useEffect, useRef } from 'react'
import Icon from '@/components/Icon'

const TABS = ['User & Role', 'Cabang', 'Profil Warung', 'Satuan Barang', 'Paket']

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

  // ── Subscription / Paket state ──
  const [subStatus, setSubStatus]     = useState(null)   // { active, plan, expired_at }
  const [subLoading, setSubLoading]   = useState(false)
  const [orderData, setOrderData]     = useState(null)   // { qr_url, order_id, amount, expires_at }
  const [paying, setPaying]           = useState(false)
  const [pollMsg, setPollMsg]         = useState('')
  const pollRef = useRef(null)

  const deleteUser   = (id) => setUsers(prev => prev.filter(u => u.id !== id))
  const deleteCabang = (id) => setCabang(prev => prev.filter(c => c.id !== id))
  const addSatuan = () => {
    if (newSatuan.trim() && !satuan.includes(newSatuan.trim())) {
      setSatuan(prev => [...prev, newSatuan.trim()])
      setNewSatuan('')
    }
  }

  // ── Subscription helpers ──
  const fetchSubStatus = async () => {
    setSubLoading(true)
    try {
      const res = await fetch('/api/subscription/status')
      const json = await res.json()
      setSubStatus(json)
    } catch { setSubStatus({ active: false }) }
    finally { setSubLoading(false) }
  }

  useEffect(() => {
    if (activeTab === 'Paket') fetchSubStatus()
  }, [activeTab])

  const handleBuPaket = async (plan) => {
    setPaying(true)
    setOrderData(null)
    setPollMsg('')
    try {
      const res = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const json = await res.json()
      if (!json.success) { alert(json.error || 'Gagal membuat order'); return }
      setOrderData(json)
      startPolling(json.order_id)
    } catch { alert('Gagal terhubung ke server') }
    finally { setPaying(false) }
  }

  const startPolling = (orderId) => {
    setPollMsg('Menunggu pembayaran...')
    let attempt = 0
    const MAX = 60 // max 5 menit (5s interval)
    pollRef.current = setInterval(async () => {
      attempt++
      try {
        const res = await fetch('/api/subscription/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderId }),
        })
        const json = await res.json()
        if (json.settled) {
          clearInterval(pollRef.current)
          setPollMsg('✅ Pembayaran berhasil! Paket aktif.')
          setOrderData(null)
          fetchSubStatus()
        } else if (json.status === 'EXPIRED' || attempt >= MAX) {
          clearInterval(pollRef.current)
          setPollMsg('⏱ QR Code kadaluarsa. Silakan buat order baru.')
          setOrderData(null)
        }
      } catch { /* silent */ }
    }, 5000)
  }

  useEffect(() => () => clearInterval(pollRef.current), [])

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

        {/* ── Tab: Paket ── */}
        {activeTab === 'Paket' && (
          <div className="max-w-lg space-y-4">

            {/* Status Aktif */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Status Paket</h3>
              {subLoading ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                  <Icon name="refresh" size={15} color="#9ca3af" /> Memuat...
                </div>
              ) : subStatus?.active ? (
                <div className="flex items-center gap-3 bg-green-50 rounded-xl p-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-xl">✅</div>
                  <div>
                    <p className="font-bold text-green-800 capitalize">Paket {subStatus.plan} Aktif</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Berlaku hingga: {new Date(subStatus.expired_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 text-xl">🆓</div>
                  <div>
                    <p className="font-bold text-gray-700">Paket Free</p>
                    <p className="text-xs text-gray-500 mt-0.5">Upgrade untuk fitur lengkap</p>
                  </div>
                </div>
              )}
              {pollMsg && (
                <p className={`mt-3 text-sm font-semibold text-center ${pollMsg.startsWith('✅') ? 'text-green-600' : 'text-amber-600'}`}>
                  {pollMsg}
                </p>
              )}
            </div>

            {/* QR Code (saat menunggu pembayaran) */}
            {orderData && (
              <div className="card p-5 text-center">
                <p className="font-bold text-gray-900 mb-1">Scan QRIS untuk Bayar</p>
                <p className="text-xs text-gray-500 mb-4">
                  Paket {orderData.plan} — Rp {Number(orderData.amount).toLocaleString('id-ID')}
                </p>
                <div className="flex justify-center mb-4">
                  <img
                    src={orderData.qr_url}
                    alt="QRIS QR Code"
                    className="w-52 h-52 border border-gray-200 rounded-xl"
                  />
                </div>
                <p className="text-xs text-gray-400 mb-1">
                  Kode: <span className="font-mono font-semibold text-gray-600">{orderData.order_id}</span>
                </p>
                <p className="text-xs text-amber-600 font-medium">
                  QR berlaku hingga: {orderData.expires_at ? new Date(orderData.expires_at).toLocaleTimeString('id-ID') : '—'}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 animate-pulse">
                  <Icon name="refresh" size={13} color="#9ca3af" />
                  Mendeteksi pembayaran otomatis...
                </div>
                <button
                  onClick={() => { clearInterval(pollRef.current); setOrderData(null); setPollMsg('') }}
                  className="mt-3 text-xs text-red-400 hover:text-red-600 underline"
                >
                  Batalkan
                </button>
              </div>
            )}

            {/* Pilihan Paket */}
            {!orderData && (
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-sm px-1">Pilih Paket</h3>

                {/* Basic */}
                <div className="card p-5 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-base">Basic</p>
                      <p className="text-2xl font-extrabold text-blue-700 mt-0.5">
                        Rp 49.000 <span className="text-sm font-normal text-gray-400">/ bulan</span>
                      </p>
                    </div>
                    <span className="text-3xl">📦</span>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {['1 Cabang', 'Max 3 Kasir', 'Laporan bulanan', 'Manajemen stok'].map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-green-500 font-bold">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleBuPaket('basic')}
                    disabled={paying || subStatus?.active}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors
                      ${paying || subStatus?.active
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-700 hover:bg-blue-800 text-white'}`}
                  >
                    {paying ? 'Memproses...' : subStatus?.active ? 'Sudah Aktif' : 'Pilih Basic'}
                  </button>
                </div>

                {/* Pro */}
                <div className="card p-5 border-2 border-blue-600 relative">
                  <div className="absolute -top-3 left-4">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Populer</span>
                  </div>
                  <div className="flex items-start justify-between mb-3 mt-1">
                    <div>
                      <p className="font-bold text-gray-900 text-base">Pro</p>
                      <p className="text-2xl font-extrabold text-blue-700 mt-0.5">
                        Rp 99.000 <span className="text-sm font-normal text-gray-400">/ bulan</span>
                      </p>
                    </div>
                    <span className="text-3xl">🚀</span>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {['Cabang tidak terbatas', 'Kasir tidak terbatas', 'Laporan & analitik lengkap', 'Manajemen stok & hutang', 'Prioritas support'].map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-green-500 font-bold">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleBuPaket('pro')}
                    disabled={paying || subStatus?.active}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors
                      ${paying || subStatus?.active
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-700 hover:bg-blue-800 text-white'}`}
                  >
                    {paying ? 'Memproses...' : subStatus?.active ? 'Sudah Aktif' : 'Pilih Pro'}
                  </button>
                </div>

                <p className="text-xs text-center text-gray-400 pb-2">
                  Pembayaran via QRIS · Diproses oleh Cashi.id
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
