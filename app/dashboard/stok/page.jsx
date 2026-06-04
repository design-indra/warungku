'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import Icon from '@/components/Icon'

const TABS = ['Semua', 'Stok Rendah', 'Hampir Habis', 'Stok Habis']
const KATEGORI_OPTIONS = ['Makanan', 'Minuman', 'Sembako', 'Rokok', 'Lainnya']
const SATUAN_OPTIONS   = ['pcs', 'kg', 'liter', 'pack', 'dus', 'slof', 'karton']
const EMPTY_FORM = { nama: '', kategori: 'Makanan', satuan: 'pcs', harga_beli: '', harga_jual: '', stok: '', stok_minimum: '5', emoji: '📦' }

const rp        = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')
const rpShort   = (n) => n >= 1000000 ? `Rp ${(n / 1000000).toFixed(2)} jt` : rp(n)
const stokColor = (s) => s <= 5 ? '#dc2626' : s <= 10 ? '#f59e0b' : '#16a34a'
const stokBg    = (s) => s <= 5 ? '#fee2e2' : s <= 10 ? '#fef3c7' : '#dcfce7'

// ─── Parse CSV ────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toUpperCase())
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/"/g, ''))
    const obj = {}
    headers.forEach((h, i) => { obj[h] = vals[i] || '' })
    return obj
  })
}

// ─── Map kolom file ke format WarungKu ───────────────────────
function mapRow(row) {
  // Coba berbagai nama kolom yang mungkin
  const nama      = row['NAMA'] || row['NAMA_BARANG'] || row['NAME'] || row['PRODUCT'] || ''
  const kategori  = row['KATEGORI'] || row['CATEGORY'] || row['KAT'] || 'Lainnya'
  const satuan    = row['SATUAN_1'] || row['SATUAN'] || row['UNIT'] || 'pcs'
  const harga_beli= parseFloat(row['HPP'] || row['HARGA_BELI'] || row['COST'] || 0) || 0
  const harga_jual= parseFloat(row['HARGA_TOKO_1'] || row['HARGA_JUAL'] || row['PRICE'] || 0) || 0
  const stok      = parseFloat(row['TOKO'] || row['STOK'] || row['STOCK'] || row['QTY'] || 0) || 0
  const stok_min  = parseFloat(row['STOK_MIN'] || row['MIN_STOK'] || 5) || 5
  return { nama: nama.trim(), kategori: kategori.trim(), satuan: satuan.trim(), harga_beli, harga_jual, stok, stok_minimum: stok_min, emoji: '📦' }
}

// ─── Parse XLSX/XLS pakai SheetJS (browser) ──────────────────
async function parseExcel(file) {
  const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs')
  const buf  = await file.arrayBuffer()
  const wb   = XLSX.read(buf, { type: 'array' })
  const ws   = wb.Sheets[wb.SheetNames[0]]
  return XLSX.utils.sheet_to_json(ws, { defval: '' })
}

export default function StokPage() {
  const [barang, setBarang]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [tab, setTab]               = useState('Semua')
  const [search, setSearch]         = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editId, setEditId]         = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [error, setError]           = useState('')

  // Import state
  const fileInputRef            = useRef(null)
  const [importFile, setImportFile]       = useState(null)
  const [importPreview, setImportPreview] = useState([])
  const [importTotal, setImportTotal]     = useState(0)
  const [importLoading, setImportLoading] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importDone, setImportDone]       = useState(false)
  const [importError, setImportError]     = useState('')

  const fetchBarang = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/barang')
      const json = await res.json()
      setBarang(json.data || [])
    } catch { setError('Gagal memuat data barang') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchBarang() }, [fetchBarang])

  const filtered = useMemo(() => {
    let list = barang
    if (tab === 'Stok Rendah')  list = list.filter(b => b.stok <= 10 && b.stok > 5)
    if (tab === 'Hampir Habis') list = list.filter(b => b.stok <= 5 && b.stok > 0)
    if (tab === 'Stok Habis')   list = list.filter(b => b.stok === 0)
    if (search) list = list.filter(b => b.nama.toLowerCase().includes(search.toLowerCase()))
    return list
  }, [tab, search, barang])

  const totalNilai = barang.reduce((s, b) => s + b.harga_jual * b.stok, 0)
  const totalStok  = barang.reduce((s, b) => s + b.stok, 0)
  const stokRendah = barang.filter(b => b.stok <= 10).length

  const openAdd  = () => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); setError('') }
  const openEdit = (b) => {
    setForm({ nama: b.nama, kategori: b.kategori?.nama || 'Lainnya', satuan: b.satuan, harga_beli: b.harga_beli, harga_jual: b.harga_jual, stok: b.stok, stok_minimum: b.stok_minimum, emoji: b.emoji })
    setEditId(b.id); setShowModal(true); setError('')
  }
  const handleDelete = async (id) => {
    if (!confirm('Hapus barang ini?')) return
    await fetch(`/api/barang/${id}`, { method: 'DELETE' })
    fetchBarang()
  }
  const handleSave = async () => {
    if (!form.nama.trim()) { setError('Nama barang wajib diisi'); return }
    setSaving(true); setError('')
    try {
      const method = editId ? 'PUT' : 'POST'
      const url    = editId ? `/api/barang/${editId}` : '/api/barang'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const json   = await res.json()
      if (!res.ok) throw new Error(json.error)
      setShowModal(false); fetchBarang()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  // ─── Import handlers ─────────────────────────────────────
  const openImport = () => {
    setImportFile(null); setImportPreview([]); setImportTotal(0)
    setImportLoading(false); setImportProgress(0); setImportDone(false); setImportError('')
    setShowImport(true)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImportFile(file); setImportError(''); setImportPreview([]); setImportTotal(0)
    setImportLoading(true)
    try {
      let rows = []
      const ext = file.name.split('.').pop().toLowerCase()
      if (ext === 'csv') {
        const text = await file.text()
        rows = parseCSV(text)
      } else if (ext === 'xls' || ext === 'xlsx') {
        rows = await parseExcel(file)
      } else {
        throw new Error('Format tidak didukung. Gunakan CSV, XLS, atau XLSX.')
      }
      const mapped = rows.map(mapRow).filter(r => r.nama)
      setImportTotal(mapped.length)
      setImportPreview(mapped.slice(0, 5))
    } catch (err) {
      setImportError(err.message || 'Gagal membaca file.')
    } finally {
      setImportLoading(false)
    }
  }

  const handleImport = async () => {
    if (!importPreview.length && importTotal === 0) return
    setImportLoading(true); setImportProgress(0); setImportError('')
    try {
      const file = fileInputRef.current.files[0]
      let rows = []
      const ext = file.name.split('.').pop().toLowerCase()
      if (ext === 'csv') {
        const text = await file.text()
        rows = parseCSV(text)
      } else {
        rows = await parseExcel(file)
      }
      const mapped = rows.map(mapRow).filter(r => r.nama)

      // Kirim batch per 50 supaya tidak timeout
      const BATCH = 50
      let done = 0
      for (let i = 0; i < mapped.length; i += BATCH) {
        const batch = mapped.slice(i, i + BATCH)
        await fetch('/api/barang/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: batch }),
        })
        done += batch.length
        setImportProgress(Math.round((done / mapped.length) * 100))
      }
      setImportDone(true)
      fetchBarang()
    } catch (err) {
      setImportError(err.message || 'Import gagal.')
    } finally {
      setImportLoading(false)
    }
  }

  return (
    <div className="page-content space-y-4">

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Barang', value: barang.length,       sub: 'Jenis',     icon: 'box',      bg: '#eff6ff', color: '#2563eb' },
          { label: 'Total Stok',   value: totalStok,           sub: 'Unit',      icon: 'refresh',  bg: '#f0fdf4', color: '#16a34a' },
          { label: 'Stok Rendah',  value: stokRendah,          sub: 'Item',      icon: 'warning',  bg: '#fff7ed', color: '#ea580c' },
          { label: 'Total Nilai',  value: rpShort(totalNilai), sub: 'Perkiraan', icon: 'trending', bg: '#faf5ff', color: '#9333ea' },
        ].map(s => (
          <div key={s.label} className="card p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
              <Icon name={s.icon} size={18} color={s.color} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <span className="absolute left-3 top-1/2 -translate-y-1/2"><Icon name="search" size={16} color="#9ca3af" /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama barang..." className="input-field pl-9" />
        </div>
        <button onClick={openAdd} className="btn-primary whitespace-nowrap">
          <Icon name="plus" size={15} color="#fff" /> Tambah Barang
        </button>
      </div>

      {/* Import + Export row */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={openImport} className="btn-secondary whitespace-nowrap gap-1.5 text-green-700 border-green-200 bg-green-50 hover:bg-green-100">
          <Icon name="upload" size={15} color="#15803d" /> Import CSV/XLS
        </button>
        <button className="btn-secondary whitespace-nowrap">
          <Icon name="download" size={15} color="#374151" /> Export
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors
              ${tab === t ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Stok rendah warning */}
      {stokRendah > 0 && (
        <div className="flex items-start gap-3 p-3 rounded-xl border border-orange-200 bg-orange-50">
          <Icon name="warning" size={16} color="#ea580c" />
          <div>
            <p className="text-sm font-semibold text-orange-700 mb-1">Peringatan Stok Menipis</p>
            <div className="flex flex-wrap gap-1.5">
              {barang.filter(b => b.stok <= 10).map(b => (
                <span key={b.id} className="text-xs bg-white px-2 py-0.5 rounded-full border border-orange-200 text-orange-600">
                  {b.nama} (Stok: {b.stok})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <Icon name="refresh" size={18} color="#9ca3af" /> Memuat data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>{['Nama Barang','Kategori','Satuan','H.Beli','H.Jual','Stok','Aksi'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{b.emoji}</span>
                        <span className="font-medium text-gray-800">{b.nama}</span>
                      </div>
                    </td>
                    <td className="table-cell text-gray-500">{b.kategori?.nama || '—'}</td>
                    <td className="table-cell text-gray-500">{b.satuan}</td>
                    <td className="table-cell text-gray-500">{b.harga_beli.toLocaleString('id-ID')}</td>
                    <td className="table-cell text-gray-500">{b.harga_jual.toLocaleString('id-ID')}</td>
                    <td className="table-cell">
                      <span className="px-2 py-0.5 rounded text-xs font-bold"
                        style={{ color: stokColor(b.stok), background: stokBg(b.stok) }}>
                        {b.stok}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(b)} className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100">
                          <Icon name="edit" size={13} color="#2563eb" />
                        </button>
                        <button onClick={() => handleDelete(b.id)} className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100">
                          <Icon name="trash" size={13} color="#dc2626" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="table-cell text-center text-gray-400 py-12">
                    Tidak ada data barang
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ MODAL TAMBAH/EDIT ═══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editId ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <Icon name="x" size={18} color="#6b7280" />
              </button>
            </div>
            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">{error}</div>}
              {[
                { label:'Nama Barang',  key:'nama',         type:'text',   ph:'cth. Indomie Goreng' },
                { label:'Harga Beli',   key:'harga_beli',   type:'number', ph:'2500' },
                { label:'Harga Jual',   key:'harga_jual',   type:'number', ph:'3000' },
                { label:'Stok Awal',    key:'stok',         type:'number', ph:'10' },
                { label:'Stok Minimum', key:'stok_minimum', type:'number', ph:'5' },
                { label:'Emoji',        key:'emoji',        type:'text',   ph:'📦' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                  <input type={f.type} placeholder={f.ph} value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="input-field" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori</label>
                <select value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })} className="input-field">
                  {KATEGORI_OPTIONS.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Satuan</label>
                <select value={form.satuan} onChange={e => setForm({ ...form, satuan: e.target.value })} className="input-field">
                  {SATUAN_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary justify-center">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary justify-center">
                {saving ? 'Menyimpan...' : <><Icon name="save" size={15} color="#fff" /> Simpan</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL IMPORT ═══ */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Import Barang dari File</h3>
              <button onClick={() => setShowImport(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <Icon name="x" size={18} color="#6b7280" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">

              {/* Info kolom yang didukung */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 space-y-1">
                <p className="font-semibold">✅ Format yang didukung: CSV, XLS, XLSX</p>
                <p>Kolom yang dibaca otomatis:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {['NAMA/NAMA_BARANG','KATEGORI','SATUAN_1/SATUAN','HPP/HARGA_BELI','HARGA_TOKO_1/HARGA_JUAL','TOKO/STOK','STOK_MIN'].map(k => (
                    <span key={k} className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-blue-800">{k}</span>
                  ))}
                </div>
              </div>

              {/* Drop zone / file picker */}
              {!importDone && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-3xl mb-2">📂</div>
                  <p className="text-sm font-semibold text-gray-700">
                    {importFile ? importFile.name : 'Pilih file CSV atau XLS/XLSX'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Klik untuk browse dari HP</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}

              {/* Error */}
              {importError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                  {importError}
                </div>
              )}

              {/* Loading baca file */}
              {importLoading && importProgress === 0 && (
                <div className="text-center text-sm text-gray-500 py-2">Membaca file...</div>
              )}

              {/* Preview */}
              {importPreview.length > 0 && !importDone && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    Preview 5 data pertama dari <span className="text-blue-700 font-bold">{importTotal.toLocaleString('id-ID')}</span> total barang:
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Nama','Kategori','Satuan','H.Beli','H.Jual','Stok'].map(h => (
                            <th key={h} className="px-2 py-2 text-left text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((r, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="px-2 py-1.5 font-medium max-w-28 truncate">{r.nama}</td>
                            <td className="px-2 py-1.5 text-gray-500">{r.kategori}</td>
                            <td className="px-2 py-1.5 text-gray-500">{r.satuan}</td>
                            <td className="px-2 py-1.5 text-gray-500">{r.harga_beli.toLocaleString('id-ID')}</td>
                            <td className="px-2 py-1.5 text-gray-500">{r.harga_jual.toLocaleString('id-ID')}</td>
                            <td className="px-2 py-1.5 text-gray-500">{r.stok}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Progress bar */}
              {importLoading && importProgress > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Mengimpor data...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${importProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Sukses */}
              {importDone && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="font-bold text-green-700 text-lg">Import Berhasil!</p>
                  <p className="text-sm text-gray-500 mt-1">{importTotal.toLocaleString('id-ID')} barang berhasil diimpor.</p>
                  <button onClick={() => setShowImport(false)} className="btn-primary mt-4 mx-auto">
                    Tutup
                  </button>
                </div>
              )}
            </div>

            {!importDone && (
              <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
                <button onClick={() => setShowImport(false)} className="flex-1 btn-secondary justify-center">Batal</button>
                <button
                  onClick={handleImport}
                  disabled={importLoading || importTotal === 0}
                  className="flex-1 btn-primary justify-center disabled:opacity-50"
                >
                  {importLoading ? `Mengimpor... ${importProgress}%` : `Import ${importTotal > 0 ? importTotal.toLocaleString('id-ID') + ' Barang' : ''}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
