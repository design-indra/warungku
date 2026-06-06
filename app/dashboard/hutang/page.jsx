'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Icon from '@/components/Icon'

const rp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

export default function HutangPage() {
  const [hutangList, setHutangList] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState(null)
  const [showBayarModal, setShowBayarModal] = useState(false)
  const [bayarForm, setBayarForm]   = useState({ jumlah: '', catatan: '' })
  const [saving, setSaving]         = useState(false)
  const [activeHutangId, setActiveHutangId] = useState(null)
  const [plan, setPlan]             = useState(null) // null = loading

  // Cek plan user
  useEffect(() => {
    fetch('/api/subscription/status')
      .then(r => r.json())
      .then(j => setPlan(j.plan || 'free'))
      .catch(() => setPlan('free'))
  }, [])

  const fetchHutang = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/hutang')
      const json = await res.json()
      // Group by pelanggan
      const grouped = {}
      ;(json.data || []).forEach(h => {
        const pid = h.pelanggan?.id || h.pelanggan_id
        if (!grouped[pid]) {
          grouped[pid] = {
            id: pid, nama: h.pelanggan?.nama || '—', hp: h.pelanggan?.no_hp || '—',
            inisial: (h.pelanggan?.nama || 'X')[0].toUpperCase(),
            hutangList: [],
          }
        }
        grouped[pid].hutangList.push(h)
      })
      setHutangList(Object.values(grouped))
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (plan && plan !== 'free') fetchHutang()
    else if (plan === 'free') setLoading(false)
  }, [fetchHutang, plan])

  const filtered = useMemo(() =>
    hutangList.filter(p => p.nama.toLowerCase().includes(search.toLowerCase())),
    [search, hutangList]
  )

  const totalSisa = (p) => p.hutangList.reduce((s, h) => s + h.sisa, 0)

  const handleBayar = async () => {
    if (!bayarForm.jumlah || !activeHutangId) return
    setSaving(true)
    try {
      await fetch(`/api/hutang/${activeHutangId}/bayar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bayarForm),
      })
      setShowBayarModal(false)
      setBayarForm({ jumlah: '', catatan: '' })
      fetchHutang()
    } catch {}
    finally { setSaving(false) }
  }

  const COLORS = ['bg-blue-600','bg-green-600','bg-purple-600','bg-amber-500','bg-rose-600','bg-teal-600']

  return (
    <div className="page-content space-y-4">

      {/* Upgrade wall untuk free user */}
      {plan === 'free' && (
        <div className="card p-6 text-center space-y-3">
          <div className="text-4xl">🔒</div>
          <p className="font-bold text-gray-900">Fitur Khusus Basic & Pro</p>
          <p className="text-sm text-gray-500">Manajemen hutang pelanggan hanya tersedia untuk paket Basic dan Pro.</p>
          <a href="/dashboard/berlangganan"
            className="inline-block mt-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-xl transition-colors">
            Upgrade Sekarang
          </a>
        </div>
      )}

      {/* Konten hutang — hanya tampil jika bukan free */}
      {plan !== 'free' && plan !== null && (
      <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2"><Icon name="search" size={16} color="#9ca3af" /></span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pelanggan..." className="input-field pl-9" />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Total Pelanggan',  value: hutangList.length,                                              icon:'users',   bg:'#eff6ff', color:'#2563eb' },
          { label:'Masih Berhutang',  value: hutangList.filter(p => totalSisa(p) > 0).length,               icon:'warning', bg:'#fef2f2', color:'#dc2626' },
          { label:'Sudah Lunas',      value: hutangList.filter(p => totalSisa(p) <= 0 && p.hutangList.length > 0).length, icon:'check', bg:'#f0fdf4', color:'#16a34a' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: s.bg }}>
              <Icon name={s.icon} size={16} color={s.color} />
            </div>
            <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
          <Icon name="refresh" size={18} color="#9ca3af" /> Memuat data hutang...
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Daftar Pelanggan</h3>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">Belum ada data hutang pelanggan</div>
          )}
          {filtered.map((p, idx) => {
            const sisa   = totalSisa(p)
            const isOpen = selected?.id === p.id
            return (
              <div key={p.id}>
                <button onClick={() => setSelected(isOpen ? null : p)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50
                    ${isOpen ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <div className={`w-10 h-10 rounded-full ${COLORS[idx % COLORS.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {p.inisial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{p.nama}</p>
                    <p className="text-xs text-gray-400">{p.hp}</p>
                    <p className={`text-xs font-semibold ${sisa > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Sisa: {rp(sisa)} {sisa === 0 && '✓ Lunas'}
                    </p>
                  </div>
                  <Icon name="back" size={15} color="#9ca3af" />
                </button>

                {isOpen && (
                  <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                    {/* Ringkasan */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label:'Total Hutang', value: rp(p.hutangList.reduce((s,h) => s+h.jumlah, 0)) },
                        { label:'Total Bayar',  value: rp(p.hutangList.reduce((s,h) => s+h.jumlah-h.sisa, 0)) },
                        { label:'Sisa Hutang',  value: rp(sisa), red: true },
                      ].map(s => (
                        <div key={s.label} className="bg-white rounded-lg p-2.5 shadow-sm">
                          <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                          <p className={`font-extrabold text-sm ${s.red ? 'text-red-600' : 'text-gray-900'}`}>{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Daftar hutang + bayar */}
                    <div className="space-y-2">
                      {p.hutangList.map(h => (
                        <div key={h.id} className="bg-white rounded-xl p-3 border border-gray-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">{new Date(h.created_at).toLocaleDateString('id-ID')}</span>
                            <span className={`badge ${h.status === 'lunas' ? 'badge-green' : 'badge-red'}`}>
                              {h.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{rp(h.jumlah)}</p>
                              <p className="text-xs text-gray-400">Sisa: {rp(h.sisa)}</p>
                            </div>
                            {h.sisa > 0 && (
                              <button
                                onClick={() => { setActiveHutangId(h.id); setBayarForm({ jumlah: h.sisa, catatan: '' }); setShowBayarModal(true) }}
                                className="btn-success text-xs py-1.5 px-3">
                                <Icon name="plus" size={13} color="#fff" /> Bayar
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Bayar */}
      {showBayarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Catat Pembayaran</h3>
              <button onClick={() => setShowBayarModal(false)}><Icon name="x" size={18} color="#6b7280" /></button>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Jumlah Bayar (Rp)</label>
                <input type="number" value={bayarForm.jumlah} onChange={e => setBayarForm({ ...bayarForm, jumlah: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Catatan</label>
                <input type="text" value={bayarForm.catatan} onChange={e => setBayarForm({ ...bayarForm, catatan: e.target.value })} className="input-field" placeholder="opsional" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowBayarModal(false)} className="flex-1 btn-secondary justify-center">Batal</button>
              <button onClick={handleBayar} disabled={saving} className="flex-1 btn-primary justify-center">
                {saving ? 'Menyimpan...' : <><Icon name="check" size={15} color="#fff" /> Simpan</>}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      )} {/* end plan !== 'free' */}
    </div>
  )
}
