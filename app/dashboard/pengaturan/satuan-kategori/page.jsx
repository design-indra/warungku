'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, X, Tag, PackageOpen } from 'lucide-react'

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Terjadi kesalahan')
  return json
}

const DEFAULT_SATUAN   = ['pcs', 'kg', 'liter', 'pack', 'dus']
const DEFAULT_KATEGORI = ['Makanan', 'Minuman', 'Sembako', 'Rokok', 'Kebutuhan', 'Lainnya']

export default function SatuanKategoriPage() {
  const router = useRouter()

  // Satuan state
  const [satuan, setSatuan]       = useState([])
  const [newSatuan, setNewSatuan] = useState('')
  const [savingSatuan, setSavingSatuan] = useState(false)
  const [msgSatuan, setMsgSatuan]       = useState('')

  // Kategori state
  const [kategori, setKategori]   = useState([])
  const [newKat, setNewKat]       = useState('')
  const [savingKat, setSavingKat] = useState(false)
  const [msgKat, setMsgKat]       = useState('')

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/pengaturan/profil')
      .then(d => {
        setSatuan(d.satuan_list?.length ? d.satuan_list : DEFAULT_SATUAN)
        setKategori(d.kategori_list?.length ? d.kategori_list : DEFAULT_KATEGORI)
      })
      .catch(() => {
        setSatuan(DEFAULT_SATUAN)
        setKategori(DEFAULT_KATEGORI)
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Satuan actions ──
  const saveSatuan = async (list) => {
    setSavingSatuan(true); setMsgSatuan('')
    try {
      await apiFetch('/api/pengaturan/profil', { method: 'PUT', body: JSON.stringify({ satuan_list: list }) })
      setMsgSatuan('✅ Satuan disimpan!')
      setTimeout(() => setMsgSatuan(''), 2000)
    } catch (e) { setMsgSatuan('❌ ' + e.message) }
    finally { setSavingSatuan(false) }
  }

  const addSatuan = async () => {
    const val = newSatuan.trim().toLowerCase()
    if (!val || satuan.includes(val)) return
    const updated = [...satuan, val]
    setSatuan(updated); setNewSatuan('')
    await saveSatuan(updated)
  }

  const removeSatuan = async (s) => {
    const updated = satuan.filter(x => x !== s)
    setSatuan(updated)
    await saveSatuan(updated)
  }

  // ── Kategori actions ──
  const saveKategori = async (list) => {
    setSavingKat(true); setMsgKat('')
    try {
      await apiFetch('/api/pengaturan/profil', { method: 'PUT', body: JSON.stringify({ kategori_list: list }) })
      setMsgKat('✅ Kategori disimpan!')
      setTimeout(() => setMsgKat(''), 2000)
    } catch (e) { setMsgKat('❌ ' + e.message) }
    finally { setSavingKat(false) }
  }

  const addKategori = async () => {
    const val = newKat.trim()
    if (!val || kategori.map(k => k.toLowerCase()).includes(val.toLowerCase())) return
    const updated = [...kategori, val]
    setKategori(updated); setNewKat('')
    await saveKategori(updated)
  }

  const removeKategori = async (k) => {
    const updated = kategori.filter(x => x !== k)
    setKategori(updated)
    await saveKategori(updated)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Satuan & Kategori</h1>
      </div>

      <div className="flex-1 overflow-y-auto page-content space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><div className="spinner" /></div>
        ) : (
          <>
            {/* ── SATUAN BARANG ── */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <PackageOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Satuan Barang</h3>
                  <p className="text-xs text-gray-400">Muncul saat tambah / edit barang</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 mb-4">
                {satuan.map(s => (
                  <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                    {s}
                    <button onClick={() => removeSatuan(s)} disabled={savingSatuan}
                      className="hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input value={newSatuan} onChange={e => setNewSatuan(e.target.value)}
                  placeholder="Tambah satuan baru..." className="input-field flex-1"
                  onKeyDown={e => e.key === 'Enter' && addSatuan()} />
                <button onClick={addSatuan} disabled={savingSatuan} className="btn-primary flex-shrink-0">
                  <Plus className="w-4 h-4" /> Tambah
                </button>
              </div>
              {msgSatuan && (
                <p className={`mt-2 text-xs font-medium ${msgSatuan.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{msgSatuan}</p>
              )}
            </div>

            {/* ── KATEGORI BARANG ── */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Kategori Barang</h3>
                  <p className="text-xs text-gray-400">Muncul saat tambah / edit barang</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 mb-4">
                {kategori.map(k => (
                  <div key={k} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
                    {k}
                    <button onClick={() => removeKategori(k)} disabled={savingKat}
                      className="hover:bg-green-200 rounded-full w-4 h-4 flex items-center justify-center">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input value={newKat} onChange={e => setNewKat(e.target.value)}
                  placeholder="Tambah kategori baru..." className="input-field flex-1"
                  onKeyDown={e => e.key === 'Enter' && addKategori()} />
                <button onClick={addKategori} disabled={savingKat} className="btn-primary flex-shrink-0">
                  <Plus className="w-4 h-4" /> Tambah
                </button>
              </div>
              {msgKat && (
                <p className={`mt-2 text-xs font-medium ${msgKat.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{msgKat}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
