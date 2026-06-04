'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import Icon from '@/components/Icon'
import { createClient } from '@/lib/supabase'

const TABS             = ['Semua', 'Stok Rendah', 'Hampir Habis', 'Stok Habis']
const KATEGORI_OPTIONS = ['Makanan', 'Minuman', 'Sembako', 'Rokok', 'Kebutuhan', 'Lainnya']
const SATUAN_OPTIONS   = ['pcs', 'kg', 'liter', 'pack', 'dus', 'slof', 'karton', 'botol', 'sachet']
const EMPTY_FORM = {
  kode_barang: '', nama: '', kategori: 'Makanan', satuan: 'pcs',
  harga_beli: '', harga_jual: '', stok: '', stok_minimum: '5',
  emoji: '📦', foto_url: '', barcode: '',
}
const PAGE_SIZE = 5

const rp        = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')
const rpShort   = (n) => n >= 1000000 ? `Rp ${(n / 1000000).toFixed(1)} jt` : rp(n)
const stokColor = (s) => s === 0 ? '#dc2626' : s <= 5 ? '#dc2626' : s <= 10 ? '#f59e0b' : '#16a34a'
const stokBg    = (s) => s === 0 ? '#fee2e2' : s <= 5 ? '#fee2e2' : s <= 10 ? '#fef3c7' : '#dcfce7'

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

function mapRow(row) {
  const r = {}
  Object.keys(row).forEach(k => { r[k.trim().toUpperCase()] = row[k] })
  return {
    nama:         String(r['NAMA'] || r['NAMA_BARANG'] || r['NAME'] || r['PRODUCT'] || '').trim(),
    kategori:     String(r['KATEGORI'] || r['CATEGORY'] || r['KAT'] || 'Lainnya').trim(),
    satuan:       String(r['SATUAN_1'] || r['SATUAN'] || r['UNIT'] || 'pcs').trim(),
    harga_beli:   parseFloat(r['HPP'] || r['HARGA_BELI'] || r['COST'] || 0) || 0,
    harga_jual:   parseFloat(r['HARGA_TOKO_1'] || r['HARGA_JUAL'] || r['PRICE'] || 0) || 0,
    stok:         parseFloat(r['TOKO'] || r['STOK'] || r['STOCK'] || r['QTY'] || 0) || 0,
    stok_minimum: parseFloat(r['STOK_MIN'] || r['MIN_STOK'] || 5) || 5,
    emoji:        '📦',
  }
}

async function parseExcel(file) {
  const XLSX = await import('xlsx')
  const buf  = await file.arrayBuffer()
  const wb   = XLSX.read(new Uint8Array(buf), { type: 'array' })
  const ws   = wb.Sheets[wb.SheetNames[0]]
  return XLSX.utils.sheet_to_json(ws, { defval: '' })
}

// ─── Komponen foto picker ─────────────────────────────────────
function FotoPicker({ fotoUrl, onFotoChange, uploading }) {
  const inputRef = useRef(null)
  const [tab, setTab] = useState('galeri') // 'galeri' | 'kamera'
  const [showPicker, setShowPicker] = useState(false)
  const [preview, setPreview] = useState(fotoUrl || null)

  useEffect(() => { setPreview(fotoUrl || null) }, [fotoUrl])

  const handleFile = async (file) => {
    if (!file) return
    setShowPicker(false)
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    onFotoChange(file, localUrl)
  }

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <>
      {/* Zona Foto Utama */}
      <div
        onClick={() => setShowPicker(true)}
        className="relative w-full border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all"
        style={{
          borderColor: preview ? '#2563eb' : '#e5e7eb',
          background: preview ? '#eff6ff' : '#f9fafb',
          minHeight: 110,
        }}
      >
        {preview ? (
          <div className="relative w-full h-28">
            <img src={preview} alt="foto barang" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">Ganti Foto</span>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-blue-600 font-semibold">Mengupload...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-7 gap-2">
            <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
              <Icon name="image" size={20} color="#9ca3af" />
            </div>
            <p className="text-sm font-semibold text-gray-500">Tambah Foto Barang</p>
            <p className="text-xs text-gray-400">JPG, PNG maks. 2MB</p>
          </div>
        )}
      </div>

      {/* Bottom Sheet Pilih Foto */}
      {showPicker && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div
            className="bg-white rounded-t-3xl overflow-hidden"
            style={{ animation: 'slideUp 0.22s ease-out', maxHeight: '85vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <button onClick={() => setShowPicker(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <Icon name="x" size={16} color="#374151" />
              </button>
              <h3 className="font-bold text-gray-900 text-base">Pilih Foto</h3>
              <div className="w-8" />
            </div>

            {/* Tab Galeri / Kamera */}
            <div className="flex border-b border-gray-100">
              {['galeri', 'kamera'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 py-3 text-sm font-semibold capitalize transition-colors relative"
                  style={{ color: tab === t ? '#2563eb' : '#6b7280' }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                  {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
                </button>
              ))}
            </div>

            <div className="p-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              {tab === 'galeri' ? (
                <div
                  onClick={() => { inputRef.current.removeAttribute('capture'); inputRef.current.click() }}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors gap-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <Icon name="image" size={28} color="#2563eb" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-700">Pilih dari Galeri</p>
                    <p className="text-xs text-gray-400 mt-1">Maksimal ukuran 2MB</p>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => { inputRef.current.setAttribute('capture', 'environment'); inputRef.current.click() }}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors gap-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <Icon name="camera" size={28} color="#2563eb" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-700">Ambil Foto</p>
                    <p className="text-xs text-gray-400 mt-1">Gunakan kamera perangkat</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}

// ─── Modal Tambah / Edit Barang ───────────────────────────────
function BarangModal({ editData, onClose, onSaved }) {
  const [form, setForm]         = useState(editData
    ? {
        kode_barang:  editData.kode_barang || '',
        nama:         editData.nama || '',
        kategori:     editData.kategori?.nama || 'Makanan',
        satuan:       editData.satuan || 'pcs',
        harga_beli:   editData.harga_beli || '',
        harga_jual:   editData.harga_jual || '',
        stok:         editData.stok || '',
        stok_minimum: editData.stok_minimum || '5',
        emoji:        editData.emoji || '📦',
        foto_url:     editData.foto_url || '',
        barcode:      editData.barcode || '',
      }
    : EMPTY_FORM
  )
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [fotoFile, setFotoFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleFotoChange = (file, localPreview) => {
    setFotoFile(file)
    setForm(f => ({ ...f, foto_url: localPreview }))
  }

  const uploadFoto = async () => {
    if (!fotoFile) return form.foto_url
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', fotoFile)
      const res = await fetch('/api/barang/upload-foto', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Upload gagal')
      return json.url
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.nama.trim()) { setError('Nama barang wajib diisi'); return }
    setSaving(true); setError('')
    try {
      const foto_url = await uploadFoto()
      const payload  = { ...form, foto_url: foto_url || null }

      const method = editData ? 'PUT' : 'POST'
      const url    = editData ? `/api/barang/${editData.id}` : '/api/barang'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onSaved(json.data)
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div
        className="bg-white w-full sm:rounded-2xl sm:max-w-md shadow-2xl flex flex-col"
        style={{
          animation: 'slideUp 0.22s ease-out',
          maxHeight: '95vh',
          borderRadius: '20px 20px 0 0',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <Icon name="arrow-left" size={18} color="#374151" />
          </button>
          <h3 className="font-bold text-gray-900 text-base flex-1">
            {editData ? 'Edit Barang' : 'Tambah / Edit Barang'}
          </h3>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <Icon name="warning" size={15} color="#dc2626" />
              {error}
            </div>
          )}

          {/* Section: Informasi Barang */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Informasi Barang</p>

            {/* Foto */}
            <FotoPicker
              fotoUrl={form.foto_url}
              onFotoChange={handleFotoChange}
              uploading={uploading}
            />
          </div>

          {/* Kode Barang */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kode Barang</label>
            <input
              type="text"
              placeholder={editData?.kode_barang || 'BRG006'}
              value={form.kode_barang}
              onChange={e => f('kode_barang', e.target.value)}
              className="input-field font-mono"
            />
          </div>

          {/* Nama Barang */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Barang</label>
            <input
              type="text"
              placeholder="Contoh: Kopi Kapal Api 165g"
              value={form.nama}
              onChange={e => f('nama', e.target.value)}
              className="input-field"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori</label>
            <div className="relative">
              <select
                value={form.kategori}
                onChange={e => f('kategori', e.target.value)}
                className="input-field appearance-none pr-10"
              >
                <option value="">Pilih kategori</option>
                {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon name="chevron-down" size={16} color="#9ca3af" />
              </div>
            </div>
          </div>

          {/* Harga Beli + Harga Jual */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga Beli</label>
              <input
                type="number"
                placeholder="Contoh: 12000"
                value={form.harga_beli}
                onChange={e => f('harga_beli', e.target.value)}
                className="input-field"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga Jual</label>
              <input
                type="number"
                placeholder="Contoh: 15000"
                value={form.harga_jual}
                onChange={e => f('harga_jual', e.target.value)}
                className="input-field"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Stok + Satuan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stok</label>
              <input
                type="number"
                placeholder="Contoh: 80"
                value={form.stok}
                onChange={e => f('stok', e.target.value)}
                className="input-field"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Satuan</label>
              <div className="relative">
                <select
                  value={form.satuan}
                  onChange={e => f('satuan', e.target.value)}
                  className="input-field appearance-none pr-10"
                >
                  {SATUAN_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Icon name="chevron-down" size={16} color="#9ca3af" />
                </div>
              </div>
            </div>
          </div>

          {/* Stok Minimum */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stok Minimum (Alert)</label>
            <input
              type="number"
              placeholder="5"
              value={form.stok_minimum}
              onChange={e => f('stok_minimum', e.target.value)}
              className="input-field"
              inputMode="numeric"
            />
          </div>

          {/* Barcode (opsional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Barcode <span className="text-gray-400 font-normal">(opsional)</span></label>
            <input
              type="text"
              placeholder="Scan atau ketik kode barcode"
              value={form.barcode}
              onChange={e => f('barcode', e.target.value)}
              className="input-field font-mono"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center text-gray-700 py-3">
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex-1 justify-center py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 flex items-center gap-2"
            style={{ background: '#2563eb', color: '#fff' }}
          >
            {saving || uploading
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</>
              : <><Icon name="save" size={15} color="#fff" /> Simpan</>
            }
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ─── Kartu Barang (mobile list item) ─────────────────────────
function BarangRow({ b, onEdit, onDelete }) {
  const imgErr = useRef(false)
  const [imgFail, setImgFail] = useState(false)

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
      {/* Foto / Emoji */}
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
        {b.foto_url && !imgFail ? (
          <img
            src={b.foto_url}
            alt={b.nama}
            className="w-full h-full object-cover"
            onError={() => setImgFail(true)}
          />
        ) : (
          <span className="text-2xl">{b.emoji || '📦'}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {b.kode_barang && (
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono leading-tight">
              {b.kode_barang}
            </span>
          )}
          {b.kategori?.nama && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded leading-tight">
              {b.kategori.nama}
            </span>
          )}
        </div>
        <p className="font-semibold text-gray-900 text-sm truncate">{b.nama}</p>
        <p className="text-xs text-gray-500 mt-0.5">{rp(b.harga_jual)}</p>
      </div>

      {/* Stok + Aksi */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded"
          style={{ color: stokColor(b.stok), background: stokBg(b.stok) }}
        >
          Stok: {b.stok}
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(b)}
            className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
          >
            <Icon name="edit" size={13} color="#2563eb" />
          </button>
          <button
            onClick={() => onDelete(b)}
            className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
          >
            <Icon name="trash" size={13} color="#dc2626" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Import ─────────────────────────────────────────────
function ImportModal({ onClose, onDone }) {
  const fileInputRef                = useRef(null)
  const [importFile, setImportFile] = useState(null)
  const [preview, setPreview]       = useState([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(false)
  const [progress, setProgress]     = useState(0)
  const [done, setDone]             = useState(false)
  const [error, setError]           = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImportFile(file); setError(''); setPreview([]); setTotal(0); setLoading(true)
    try {
      let rows = []
      const ext = file.name.split('.').pop().toLowerCase()
      if (ext === 'csv') { rows = parseCSV(await file.text()) }
      else if (ext === 'xls' || ext === 'xlsx') { rows = await parseExcel(file) }
      else throw new Error('Format tidak didukung. Gunakan CSV, XLS, atau XLSX.')
      const mapped = rows.map(mapRow).filter(r => r.nama)
      setTotal(mapped.length)
      setPreview(mapped.slice(0, 5))
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleImport = async () => {
    if (!total) return
    setLoading(true); setProgress(0); setError('')
    try {
      const file = fileInputRef.current.files[0]
      const ext  = file.name.split('.').pop().toLowerCase()
      let rows = ext === 'csv' ? parseCSV(await file.text()) : await parseExcel(file)
      const mapped = rows.map(mapRow).filter(r => r.nama)
      const BATCH  = 50
      let done = 0, inserted = 0
      for (let i = 0; i < mapped.length; i += BATCH) {
        const batch = mapped.slice(i, i + BATCH)
        const res   = await fetch('/api/barang/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: batch }),
        })
        const json = await res.json()
        if (!res.ok) { setError(`Error: ${json.error}`); setLoading(false); return }
        inserted += json.inserted || 0
        done += batch.length
        setProgress(Math.round((done / mapped.length) * 100))
      }
      setTotal(inserted)
      setDone(true)
      onDone()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg shadow-2xl flex flex-col"
        style={{ animation: 'slideUp 0.22s ease-out', maxHeight: '90vh', borderRadius: '20px 20px 0 0' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-900">Import Barang dari File</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><Icon name="x" size={18} color="#6b7280" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">✅ Format: CSV, XLS, XLSX</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {['NAMA','KATEGORI','SATUAN','HPP/HARGA_BELI','HARGA_JUAL','STOK','STOK_MIN'].map(k => (
                <span key={k} className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-blue-800">{k}</span>
              ))}
            </div>
          </div>
          {!done && (
            <div onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <div className="text-3xl mb-2">📂</div>
              <p className="text-sm font-semibold text-gray-700">{importFile ? importFile.name : 'Pilih file CSV atau XLS/XLSX'}</p>
              <p className="text-xs text-gray-400 mt-1">Klik untuk browse</p>
              <input ref={fileInputRef} type="file" accept=".csv,.xls,.xlsx" className="hidden" onChange={handleFileChange} />
            </div>
          )}
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">{error}</div>}
          {loading && progress === 0 && <p className="text-center text-sm text-gray-500">Membaca file...</p>}
          {preview.length > 0 && !done && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Preview 5 data dari <span className="text-blue-700 font-bold">{total}</span> barang:</p>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50"><tr>{['Nama','Kategori','Satuan','H.Beli','H.Jual','Stok'].map(h => (
                    <th key={h} className="px-2 py-2 text-left text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                  ))}</tr></thead>
                  <tbody>{preview.map((r, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-2 py-1.5 font-medium max-w-28 truncate">{r.nama}</td>
                      <td className="px-2 py-1.5 text-gray-500">{r.kategori}</td>
                      <td className="px-2 py-1.5 text-gray-500">{r.satuan}</td>
                      <td className="px-2 py-1.5 text-gray-500">{r.harga_beli.toLocaleString('id-ID')}</td>
                      <td className="px-2 py-1.5 text-gray-500">{r.harga_jual.toLocaleString('id-ID')}</td>
                      <td className="px-2 py-1.5 text-gray-500">{r.stok}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
          {loading && progress > 0 && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Mengimpor...</span><span>{progress}%</span></div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          {done && (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">🎉</div>
              <p className="font-bold text-green-700 text-lg">Import Berhasil!</p>
              <p className="text-sm text-gray-500 mt-1">{total.toLocaleString('id-ID')} barang berhasil diimpor.</p>
              <button onClick={onClose} className="btn-primary mt-4 mx-auto">Tutup</button>
            </div>
          )}
        </div>
        {!done && (
          <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
            <button onClick={onClose} className="flex-1 btn-secondary justify-center">Batal</button>
            <button onClick={handleImport} disabled={loading || total === 0}
              className="flex-1 btn-primary justify-center disabled:opacity-50">
              {loading ? `Mengimpor... ${progress}%` : `Import ${total > 0 ? total + ' Barang' : ''}`}
            </button>
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
export default function StokPage() {
  const supabase = createClient()

  const [barang, setBarang]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState('Semua')
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [modalOpen, setModalOpen]   = useState(false)
  const [editData, setEditData]     = useState(null)   // null = tambah, object = edit
  const [importOpen, setImportOpen] = useState(false)

  // ─── Fetch + Realtime ──────────────────────────────────────
  const fetchBarang = useCallback(async (currentPage = 1, currentTab = tab, currentSearch = search) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page:  currentPage,
        limit: PAGE_SIZE,
        ...(currentSearch && { search: currentSearch }),
        ...(currentTab === 'Stok Rendah'  && { stok: 'rendah' }),
        ...(currentTab === 'Hampir Habis' && { stok: 'rendah' }),
        ...(currentTab === 'Stok Habis'   && { stok: 'habis' }),
      })
      const res  = await fetch(`/api/barang?${params}`)
      const json = await res.json()
      let data = json.data || []

      // Filter lebih halus untuk tab
      if (currentTab === 'Stok Rendah')  data = data.filter(b => b.stok <= 10 && b.stok > 5)
      if (currentTab === 'Hampir Habis') data = data.filter(b => b.stok <= 5 && b.stok > 0)

      setBarang(data)
      setTotalCount(json.total || 0)
    } catch {}
    finally { setLoading(false) }
  }, [tab, search])

  useEffect(() => {
    fetchBarang(page, tab, search)
  }, [page, tab, search])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('barang-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'barang' },
        () => {
          fetchBarang(page, tab, search)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [page, tab, search, fetchBarang])

  // Reset page saat tab/search berubah
  const handleTabChange = (t) => { setTab(t); setPage(1) }
  const handleSearch    = (v) => { setSearch(v); setPage(1) }

  // ─── CRUD handlers ─────────────────────────────────────────
  const handleSaved = (savedData) => {
    fetchBarang(page, tab, search)
  }

  const handleDelete = async (b) => {
    if (!confirm(`Hapus "${b.nama}"?`)) return
    await fetch(`/api/barang/${b.id}`, { method: 'DELETE' })
    fetchBarang(page, tab, search)
  }

  const openAdd  = () => { setEditData(null); setModalOpen(true) }
  const openEdit = (b) => { setEditData(b); setModalOpen(true) }

  // ─── Summary stats ─────────────────────────────────────────
  const totalNilai = barang.reduce((s, b) => s + b.harga_jual * b.stok, 0)
  const totalStok  = barang.reduce((s, b) => s + b.stok, 0)
  const stokRendah = barang.filter(b => b.stok <= 10 && b.stok > 0).length
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="page-content space-y-4">

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Barang', value: totalCount,          sub: 'Jenis',     icon: 'box',      bg: '#eff6ff', color: '#2563eb' },
          { label: 'Total Stok',   value: totalStok,            sub: 'Unit',      icon: 'refresh',  bg: '#f0fdf4', color: '#16a34a' },
          { label: 'Stok Rendah',  value: stokRendah,           sub: 'Item',      icon: 'warning',  bg: '#fff7ed', color: '#ea580c' },
          { label: 'Total Nilai',  value: rpShort(totalNilai),  sub: 'Perkiraan', icon: 'trending', bg: '#faf5ff', color: '#9333ea' },
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

      {/* Search + Tambah */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2"><Icon name="search" size={16} color="#9ca3af" /></span>
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Cari barang..."
            className="input-field pl-9"
          />
        </div>
        <button onClick={() => setImportOpen(true)} className="btn-secondary whitespace-nowrap px-3">
          <Icon name="upload" size={15} color="#374151" />
          <span className="hidden sm:inline">Import</span>
        </button>
        <button onClick={openAdd} className="btn-primary whitespace-nowrap">
          <Icon name="plus" size={15} color="#fff" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map(t => (
          <button key={t} onClick={() => handleTabChange(t)}
            className="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors flex-shrink-0"
            style={tab === t
              ? { background: '#1d4ed8', color: '#fff', borderColor: '#1d4ed8' }
              : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
            }>
            {t}
          </button>
        ))}
      </div>

      {/* Stok rendah warning */}
      {stokRendah > 0 && (
        <div className="flex items-start gap-3 p-3 rounded-xl border border-orange-200 bg-orange-50">
          <Icon name="warning" size={16} color="#ea580c" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-orange-700 mb-1">Peringatan Stok Menipis</p>
            <div className="flex flex-wrap gap-1.5">
              {barang.filter(b => b.stok <= 10 && b.stok > 0).map(b => (
                <span key={b.id} className="text-xs bg-white px-2 py-0.5 rounded-full border border-orange-200 text-orange-600">
                  {b.nama} ({b.stok})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List barang */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            Memuat data...
          </div>
        ) : barang.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📦</div>
            <p className="font-semibold">Tidak ada data barang</p>
            <p className="text-sm mt-1">Tambahkan barang pertama Anda</p>
            <button onClick={openAdd} className="btn-primary mt-4 mx-auto">
              <Icon name="plus" size={15} color="#fff" /> Tambah Barang
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">
                {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, totalCount)} dari {totalCount} data
              </span>
              <button
                onClick={() => setImportOpen(true)}
                className="text-xs text-green-600 font-semibold flex items-center gap-1 hover:underline"
              >
                <Icon name="upload" size={12} color="#16a34a" /> Import CSV/XLS
              </button>
            </div>

            {/* Items */}
            {barang.map(b => (
              <BarangRow key={b.id} b={b} onEdit={openEdit} onDelete={handleDelete} />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 px-4 py-3 border-t border-gray-100">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <Icon name="chevron-left" size={14} color="#374151" />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // Tampilkan halaman sekitar page saat ini
                  let p
                  if (totalPages <= 5) p = i + 1
                  else if (page <= 3) p = i + 1
                  else if (page >= totalPages - 2) p = totalPages - 4 + i
                  else p = page - 2 + i
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold border transition-colors"
                      style={page === p
                        ? { background: '#2563eb', color: '#fff', borderColor: '#2563eb' }
                        : { background: '#fff', color: '#374151', borderColor: '#e5e7eb' }
                      }
                    >
                      {p}
                    </button>
                  )
                })}

                {totalPages > 5 && page < totalPages - 2 && (
                  <>
                    <span className="text-gray-400 text-sm">...</span>
                    <button
                      onClick={() => setPage(totalPages)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <Icon name="chevron-right" size={14} color="#374151" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Tambah/Edit */}
      {modalOpen && (
        <BarangModal
          editData={editData}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Modal Import */}
      {importOpen && (
        <ImportModal
          onClose={() => setImportOpen(false)}
          onDone={() => fetchBarang(page, tab, search)}
        />
      )}
    </div>
  )
}
