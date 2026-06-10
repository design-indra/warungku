
'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import {
  Search, QrCode, ShoppingCart, Trash2, Plus, Minus, CreditCard,
  Wallet, Banknote, ScanLine, CheckCircle2, Printer, ArrowLeft,
  X, History, Receipt, Bluetooth, BluetoothSearching, AlertCircle,
  FileDown, ChevronDown, ChevronUp, XCircle, Users,
  Camera, Keyboard, // <-- Icon baru ditambah di sini
  MessageCircle, Send, Phone
} from 'lucide-react'

// IMPORT COMPONENT SCANNER
import BarcodeScanner from '@/lib/scanner'

// IMPORT HELPER PELANGGAN
import { fetchPelanggan, tambahPelanggan } from '@/lib/pelanggan'
import { getBarang, simpanTransaksi } from '@/lib/useOfflineSync'

const rp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')

const fmt = (d) => new Date(d).toLocaleString('id-ID', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

const today = () => new Date().toLocaleString('id-ID', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}).replace(',', '')

// ─── METODE BAYAR (+ Hutang) ──────────────────────────────────────────────────
const METODE = [
  { id: 'tunai',    label: 'Tunai',           icon: Banknote   },
  { id: 'qris',     label: 'QRIS / E-Wallet', icon: QrCode     },
  { id: 'transfer', label: 'Transfer Bank',   icon: CreditCard },
  { id: 'hutang',   label: 'Hutang',          icon: Users      },
]

// ─── RIWAYAT ─────────────────────────────────────────────────────────────────
function RiwayatView({ onBack }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('semua')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState({}) 
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    fetch('/api/transaksi?limit=50').then(r => r.json()).then(j => { setList(j.data || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => list.filter(t => {
    if (tab === 'selesai' && t.status !== 'lunas') return false
    if (tab === 'hutang' && t.status !== 'hutang') return false
    if (tab === 'dibatalkan' && t.status !== 'batal') return false
    if (search && !t.nomor_transaksi?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [list, tab, search])

  const badge = (s) => {
    if (s === 'lunas') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">Selesai</span>
    if (s === 'hutang') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">Hutang</span>
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">Dibatalkan</span>
  }

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const handleCancel = async (trx) => {
    if (!confirm(`Batalkan transaksi ${trx.nomor_transaksi}?`)) return
    setCancelling(trx.id)
    try {
      const res = await fetch(`/api/transaksi/${trx.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'batal' }) })
      if (!res.ok) throw new Error((await res.json()).error || 'Gagal membatalkan')
      setList(prev => prev.map(t => t.id === trx.id ? { ...t, status: 'batal' } : t))
    } catch (e) { alert('Gagal: ' + e.message) } finally { setCancelling(null) }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
        <h2 className="font-bold text-gray-900">Riwayat Transaksi</h2>
      </div>
      <div className="bg-white border-b border-gray-100 px-4 flex-shrink-0 overflow-x-auto">
        <div className="flex min-w-max">
          {[['semua', 'Semua'], ['selesai', 'Selesai'], ['hutang', 'Hutang'], ['dibatalkan', 'Dibatalkan']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${tab === k ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari no. transaksi..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
          </div>
        </div>
        <div className="px-4 pb-6 space-y-3">
          {loading ? <p className="text-center py-12 text-gray-400 text-sm">Memuat...</p> : filtered.length === 0 ? <p className="text-center py-12 text-gray-400 text-sm">Tidak ada transaksi</p> : filtered.map(t => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{t.nomor_transaksi || t.id?.slice(0, 8)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmt(t.created_at)}</p>
                    {t.pelanggan?.nama && <p className="text-xs text-blue-600 mt-0.5">👤 {t.pelanggan.nama}</p>}
                    <p className="text-xs text-gray-400">{t.detail_transaksi?.length || 0} item</p>
                  </div>
                  <div className="text-right">
                    {badge(t.status)}
                    <p className="font-bold text-base text-blue-700 mt-1">{rp(t.total)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                  {(t.detail_transaksi?.length > 0) && (
                    <button onClick={() => toggleExpand(t.id)} className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                      {expanded[t.id] ? <><ChevronUp className="w-3.5 h-3.5" /> Sembunyikan</> : <><ChevronDown className="w-3.5 h-3.5" /> Lihat Detail</>}
                    </button>
                  )}
                  <div className="flex-1" />
                  {t.status !== 'batal' && (
                    <button onClick={() => handleCancel(t)} disabled={cancelling === t.id} className="flex items-center gap-1 text-xs text-red-500 font-semibold hover:text-red-700 transition-colors disabled:opacity-50">
                      <XCircle className="w-3.5 h-3.5" />{cancelling === t.id ? 'Membatalkan...' : 'Batalkan'}
                    </button>
                  )}
                </div>
              </div>
              {expanded[t.id] && t.detail_transaksi?.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-2">
                  {t.detail_transaksi.map((d, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-gray-700 font-medium">{d.nama_barang}</span>
                      <span className="text-gray-500">{d.qty} × {rp(d.harga_jual)} = <span className="font-semibold text-gray-800">{rp(d.subtotal)}</span></span>
                    </div>
                  ))}
                  {t.diskon > 0 && (
                    <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
                      <span className="text-gray-500">Diskon</span><span className="text-red-500 font-semibold">-{rp(t.diskon)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ModalUangDiterima({ totalAkhir, diskon, subtotal, onKonfirmasi, onKembali, saving }) {
  const [bayarStr, setBayarStr] = useState('')

  const bayarNum = Number(bayarStr.replace(/\D/g, '')) || 0
  const kembalian = bayarNum - totalAkhir

  const handleNumpad = (val) => {
    if (val === 'del') {
      setBayarStr(prev => {
        const raw = prev.replace(/\D/g, '')
        const next = raw.slice(0, -1)
        return next ? Number(next).toLocaleString('id-ID') : ''
      })
    } else if (val === '000') {
      setBayarStr(prev => {
        const raw = prev.replace(/\D/g, '') + '000'
        return Number(raw).toLocaleString('id-ID')
      })
    } else {
      setBayarStr(prev => {
        const raw = prev.replace(/\D/g, '') + val
        return Number(raw).toLocaleString('id-ID')
      })
    }
  }

  const handleUangPas = () => {
    setBayarStr(totalAkhir.toLocaleString('id-ID'))
  }

  const quickAmounts = [...new Set([
    Math.ceil(totalAkhir / 5000) * 5000,
    Math.ceil(totalAkhir / 10000) * 10000,
    50000,
    100000
  ])].filter(v => v >= totalAkhir).slice(0, 3)

  const canKonfirmasi = bayarNum >= totalAkhir

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onKembali}>
      <div
        className="w-full max-w-md bg-white rounded-t-2xl pb-6 pt-2 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Banknote className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-bold text-gray-900 text-base">Uang Diterima</span>
          </div>
          <button onClick={onKembali} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Summary Box */}
        <div className="mx-5 bg-gray-50 rounded-xl px-4 py-3 mb-4 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Total Tagihan</span>
            <span>{rp(subtotal)}</span>
          </div>
          {diskon > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Diskon</span>
              <span className="text-red-500 font-semibold">- {rp(diskon)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-blue-600 text-base border-t border-gray-200 pt-1.5 mt-1">
            <span className="text-gray-700">Total Akhir</span>
            <span>{rp(totalAkhir)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Bayar</span>
            <span>{bayarNum > 0 ? rp(bayarNum) : '-'}</span>
          </div>
          {bayarNum >= totalAkhir && (
            <div className="flex justify-between font-bold text-green-600 text-sm">
              <span>Kembali</span>
              <span>{rp(kembalian)}</span>
            </div>
          )}
        </div>

        {/* Input + Uang Pas */}
        <div className="flex gap-2 px-5 mb-3">
          <div className="flex-1 flex items-center border-2 border-gray-200 rounded-xl px-3 py-3 bg-white">
            <span className="text-gray-500 font-semibold mr-2 text-sm">Rp</span>
            <span className="flex-1 text-xl font-bold text-gray-900">
              {bayarStr || <span className="text-gray-300">0</span>}
            </span>
            {bayarStr && (
              <button onClick={() => setBayarStr('')} className="ml-1">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          <button
            onClick={handleUangPas}
            className="px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-sm whitespace-nowrap"
          >
            Uang Pas
          </button>
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex gap-2 px-5 mb-3">
          {quickAmounts.map(v => (
            <button
              key={v}
              onClick={() => setBayarStr(v.toLocaleString('id-ID'))}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${bayarNum === v ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'}`}
            >
              {rp(v)}
            </button>
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 px-5 mb-4">
          {['1','2','3','4','5','6','7','8','9','000','0','del'].map(k => (
            <button
              key={k}
              onClick={() => handleNumpad(k)}
              className={`py-3 rounded-xl text-lg font-bold transition-colors flex items-center justify-center ${k === 'del' ? 'bg-red-50 hover:bg-red-100 text-red-500' : 'bg-gray-50 hover:bg-gray-100 text-gray-800'}`}
            >
              {k === 'del'
                ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
                : k
              }
            </button>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 px-5">
          <button
            onClick={onKembali}
            className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 font-bold text-gray-700 hover:bg-gray-50"
          >
            Kembali
          </button>
          <button
            onClick={() => canKonfirmasi && onKonfirmasi(bayarNum, kembalian)}
            disabled={!canKonfirmasi || saving}
            className={`flex-1 py-3.5 rounded-xl font-bold text-base transition-colors ${canKonfirmasi && !saving ? 'bg-blue-700 hover:bg-blue-800 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {saving ? 'Memproses...' : 'Konfirmasi'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PembayaranView({ total, diskon, onBack, onBayar, saving, canUseHutang = false }) {
  const [metode, setMetode] = useState('tunai')
  const [pelangganList, setPelangganList] = useState([])
  const [pelangganId, setPelangganId] = useState('')
  const [loadingPelanggan, setLoadingPelanggan] = useState(false)
  const [showUangDiterima, setShowUangDiterima] = useState(false)

  // State untuk form tambah pelanggan inline
  const [showTambah, setShowTambah] = useState(false)
  const [namaBaru, setNamaBaru] = useState('')
  const [noHpBaru, setNoHpBaru] = useState('')
  const [alamatBaru, setAlamatBaru] = useState('')
  const [savingPelanggan, setSavingPelanggan] = useState(false)
  const [errorTambah, setErrorTambah] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const totalAkhir = total - diskon
  const canBayar = metode === 'hutang' ? !!pelangganId : true

  useEffect(() => {
    if (metode === 'hutang' && pelangganList.length === 0) {
      setLoadingPelanggan(true)
      fetchPelanggan().then(data => setPelangganList(data)).catch(() => {}).finally(() => setLoadingPelanggan(false))
    }
  }, [metode, pelangganList.length])

  // Auto-hide notifikasi sukses setelah 3 detik
  useEffect(() => {
    if (!successMsg) return
    const t = setTimeout(() => setSuccessMsg(''), 3000)
    return () => clearTimeout(t)
  }, [successMsg])

  const handleTambahPelanggan = async () => {
    setErrorTambah('')
    // Validasi
    if (!namaBaru.trim()) { setErrorTambah('Nama pelanggan wajib diisi.'); return }
    if (!noHpBaru.trim()) { setErrorTambah('Nomor HP wajib diisi.'); return }
    const noHpClean = noHpBaru.replace(/\D/g, '')
    if (noHpClean.length < 10) { setErrorTambah('Nomor HP minimal 10 digit.'); return }

    setSavingPelanggan(true)
    try {
      const baru = await tambahPelanggan(namaBaru, noHpBaru.trim(), alamatBaru)
      // Tambahkan ke list & langsung pilih otomatis
      setPelangganList(prev => [...prev, baru].sort((a, b) => a.nama.localeCompare(b.nama)))
      setPelangganId(baru.id)
      // Reset form & tutup
      setNamaBaru('')
      setNoHpBaru('')
      setAlamatBaru('')
      setShowTambah(false)
      setSuccessMsg(`Pelanggan "${baru.nama}" berhasil ditambahkan & dipilih.`)
    } catch (e) {
      setErrorTambah(e.message || 'Gagal menyimpan pelanggan.')
    } finally {
      setSavingPelanggan(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 flex-shrink-0">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
        <h2 className="font-bold text-gray-900">Pembayaran</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium text-base">Total Bayar</span>
          <span className="text-2xl font-extrabold text-green-600">{rp(totalAkhir)}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Metode Pembayaran</p>
          <div className="space-y-2">
            {METODE.filter(m => m.id !== 'hutang' || canUseHutang).map(m => (
              <button key={m.id} onClick={() => setMetode(m.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${metode === m.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${metode === m.id ? 'bg-blue-600' : 'bg-gray-100'}`}><m.icon className={`w-4 h-4 ${metode === m.id ? 'text-white' : 'text-gray-500'}`} /></div>
                <span className={`flex-1 text-left font-semibold text-sm ${metode === m.id ? 'text-blue-700' : 'text-gray-700'}`}>{m.label}</span>
                {m.id === 'hutang' && <span className="text-[10px] text-yellow-600 font-bold bg-yellow-100 px-2 py-0.5 rounded-full">Catat Piutang</span>}
                {metode === m.id && <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0"><CheckCircle2 className="w-4 h-4 text-white" /></div>}
              </button>
            ))}
          </div>
          {!canUseHutang && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl mt-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-700">Fitur Hutang tidak tersedia</p>
                <p className="text-xs text-amber-600 mt-0.5">Upgrade ke paket <strong>Basic</strong> atau <strong>Pro</strong> untuk mencatat hutang pelanggan.</p>
              </div>
            </div>
          )}
        </div>

        {metode === 'hutang' && (
          <div className="space-y-2">
            {/* Header label + tombol tambah */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Pilih Pelanggan <span className="text-red-500">*</span></p>
              <button
                onClick={() => { setShowTambah(v => !v); setErrorTambah('') }}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${showTambah ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
              >
                {showTambah ? <><X className="w-3.5 h-3.5" /> Batal</> : <><Plus className="w-3.5 h-3.5" /> Tambah Pelanggan</>}
              </button>
            </div>

            {/* Notifikasi sukses */}
            {successMsg && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-xs font-medium text-green-700">{successMsg}</p>
              </div>
            )}

            {/* Form tambah pelanggan inline */}
            {showTambah && (
              <div className="border-2 border-blue-200 bg-blue-50 rounded-xl p-3 space-y-2.5">
                <p className="text-xs font-bold text-blue-700">Pelanggan Baru</p>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Nama <span className="text-red-500">*</span></label>
                    <input
                      value={namaBaru}
                      onChange={e => setNamaBaru(e.target.value)}
                      placeholder="Nama lengkap"
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:border-blue-400 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">No HP <span className="text-red-500">*</span></label>
                    <input
                      value={noHpBaru}
                      onChange={e => setNoHpBaru(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      inputMode="tel"
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:border-blue-400 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Alamat <span className="text-gray-400 font-normal">(opsional)</span></label>
                    <input
                      value={alamatBaru}
                      onChange={e => setAlamatBaru(e.target.value)}
                      placeholder="Jl. Contoh No. 1, Kota"
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:border-blue-400 bg-white"
                    />
                  </div>
                </div>
                {errorTambah && (
                  <p className="text-xs text-red-500 font-medium">{errorTambah}</p>
                )}
                <button
                  onClick={handleTambahPelanggan}
                  disabled={savingPelanggan}
                  className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${savingPelanggan ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  {savingPelanggan ? 'Menyimpan...' : <><Plus className="w-4 h-4" /> Simpan & Pilih</>}
                </button>
              </div>
            )}

            {/* Dropdown pilih pelanggan */}
            {loadingPelanggan ? <p className="text-xs text-gray-400">Memuat pelanggan...</p> : (
              <select value={pelangganId} onChange={e => setPelangganId(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-blue-400 bg-white">
                <option value="">— Pilih pelanggan —</option>
                {pelangganList.map(p => <option key={p.id} value={p.id}>{p.nama}{p.no_hp ? ` (${p.no_hp})` : ''}</option>)}
              </select>
            )}
            {!pelangganId && <p className="text-xs text-red-500 mt-1">Pilih pelanggan untuk mencatat hutang.</p>}
          </div>
        )}

        {/* Info hutang — panel kuning */}
        {metode === 'hutang' && pelangganId && (
          <div className="flex items-start gap-2 px-4 py-3 bg-yellow-50 rounded-xl border border-yellow-200">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700">
              Transaksi akan dicatat sebagai hutang sebesar <strong>{rp(totalAkhir)}</strong> atas nama pelanggan yang dipilih.
            </p>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={() => {
            if (metode === 'tunai') {
              setShowUangDiterima(true)
            } else {
              onBayar({ metode, bayar: totalAkhir, kembalian: 0, pelanggan_id: metode === 'hutang' ? pelangganId : null })
            }
          }}
          disabled={!canBayar || saving}
          className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors ${canBayar && !saving ? 'bg-blue-700 hover:bg-blue-800 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          <Receipt className="w-5 h-5" />{saving ? 'Memproses...' : metode === 'hutang' ? 'CATAT HUTANG' : 'BAYAR'}
        </button>
      </div>

      {/* Modal Uang Diterima (Tunai) */}
      {showUangDiterima && (
        <ModalUangDiterima
          totalAkhir={totalAkhir}
          diskon={diskon}
          subtotal={total}
          saving={saving}
          onKembali={() => setShowUangDiterima(false)}
          onKonfirmasi={(bayarNum, kembalian) => {
            setShowUangDiterima(false)
            onBayar({ metode: 'tunai', bayar: bayarNum, kembalian, pelanggan_id: null })
          }}
        />
      )}
    </div>
  )
}

function KeranjangPanel({ cart, subtotal, totalItem, diskon, setDiskon, diskonNominal, total, updateQty, removeFromCart, clearCart, onBayar, onClose }) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-blue-700" />
          <span className="font-bold text-gray-900">Keranjang ({totalItem})</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={clearCart} className="text-xs text-red-500 font-semibold hover:text-red-700">Hapus</button>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {cart.map(item => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
              {item.foto_url ? <img src={item.foto_url} alt={item.nama} className="w-full h-full object-cover" /> : (item.emoji || '📦')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{item.nama}</p>
              <p className="text-xs text-blue-700">{rp(item.harga)}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => item.qty === 1 ? removeFromCart(item.id) : updateQty(item.id, -1)} className="w-6 h-6 rounded border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100"><Minus className="w-3 h-3 text-gray-600" /></button>
              <span className="w-5 text-center text-xs font-bold">{item.qty}</span>
              <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100"><Plus className="w-3 h-3 text-gray-600" /></button>
              <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded bg-red-50 flex items-center justify-center ml-0.5 hover:bg-red-100"><Trash2 className="w-3 h-3 text-red-500" /></button>
            </div>
            <span className="text-xs font-bold text-gray-900 w-16 text-right flex-shrink-0">{rp(item.harga * item.qty)}</span>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-gray-100 space-y-2 flex-shrink-0">
        <div className="flex justify-between text-sm"><span className="text-gray-500">Total Item</span><span className="font-semibold">{totalItem}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-semibold">{rp(subtotal)}</span></div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-gray-500">Diskon</span>
          <div className="flex items-center gap-1">
            <select value={diskon.type} onChange={e => setDiskon(d => ({ ...d, type: e.target.value, nilai: 0 }))} className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none"><option value="%">%</option><option value="Rp">Rp</option></select>
            <input value={diskon.nilai || ''} onChange={e => setDiskon(d => ({ ...d, nilai: e.target.value }))} inputMode="numeric" placeholder="0" className="w-16 text-xs border border-gray-200 rounded-lg px-2 py-1 text-right focus:outline-none focus:border-blue-400" />
            <span className="text-xs font-semibold text-red-500 w-20 text-right">{diskonNominal > 0 ? `-${rp(diskonNominal)}` : rp(0)}</span>
          </div>
        </div>
        <div className="flex justify-between font-extrabold text-base border-t border-gray-100 pt-2"><span>Total Bayar</span><span className="text-green-600">{rp(total)}</span></div>
      </div>
      <div className="px-4 pb-4 flex-shrink-0">
        <button onClick={onBayar} className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors">
          <Receipt className="w-5 h-5" /> BAYAR
        </button>
      </div>
    </>
  )
}

async function generateStrukPDF(tx, store, paperWidth = 32) {
  const namaMetode = METODE.find(m => m.id === tx.metode_bayar)?.label || 'Tunai'
  const mmWidth = paperWidth === 32 ? '58mm' : '80mm'
  const totalItem = tx.items.reduce((s, i) => s + i.qty, 0)
  const itemsHtml = tx.items.map(item => `
    <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
      <span style="flex:1;">${item.nama}<br/><span style="font-size:9px;color:#666;">${item.qty} x ${Number(item.harga).toLocaleString('id-ID')}</span></span>
      <span style="white-space:nowrap;margin-left:8px;">${Number(item.harga * item.qty).toLocaleString('id-ID')}</span>
    </div>`
  ).join('')
  const kembalianHtml = tx.kembalian > 0 ? `<div style="display:flex;justify-content:space-between;font-weight:700;"><span>Kembalian</span><span>${rp(tx.kembalian)}</span></div>` : ''
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Struk - ${tx.nomor_transaksi || ''}</title><style>@page { margin: 0; size: ${mmWidth} auto; } * { box-sizing: border-box; } body { font-family: 'Courier New', Courier, monospace; font-size: 11px; width: ${mmWidth}; margin: 0 auto; padding: 6mm 4mm; color: #111; background: #fff; } .center { text-align: center; } .bold { font-weight: 700; } .small { font-size: 9px; color: #555; } .dash { border-top: 1px dashed #999; margin: 5px 0; } .row { display: flex; justify-content: space-between; margin-bottom: 2px; } .total-row { display: flex; justify-content: space-between; font-weight: 700; font-size: 12px; border-top: 1px solid #333; padding-top: 4px; margin-top: 4px; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style></head><body><div class="center bold" style="font-size:13px;letter-spacing:2px;margin-bottom:2px;">${store.nama_warung || 'WARUNGKU'}</div>${store.alamat ? `<div class="center small">${store.alamat}</div>` : ''}${store.no_hp ? `<div class="center small">Telp: ${store.no_hp}</div>` : ''}<div class="dash"></div><div class="row"><span>No. Transaksi</span><span>${tx.nomor_transaksi || '-'}</span></div><div class="row"><span>Tanggal</span><span>${fmt(tx.created_at || new Date())}</span></div><div class="row"><span>Kasir</span><span>Admin</span></div><div class="dash"></div>${itemsHtml}<div class="dash"></div><div class="row"><span>Total Item</span><span>${totalItem}</span></div><div class="row"><span>Subtotal</span><span>${rp(tx.subtotal)}</span></div>${tx.diskon > 0 ? `<div class="row"><span>Diskon</span><span>-${rp(tx.diskon)}</span></div>` : ''}<div class="total-row"><span>TOTAL</span><span>${rp(tx.total)}</span></div><div class="dash"></div><div class="row"><span>Dibayar (${namaMetode})</span><span>${rp(tx.bayar)}</span></div>${kembalianHtml}<div class="dash"></div><div class="center small" style="margin-top:6px;">Terima kasih telah berbelanja</div><div class="center small">*** Simpan struk ini sebagai bukti ***</div></body></html>`

  // ── APK Capacitor: window.open() diblokir WebView → simpan HTML lalu share ──
  if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem')
      const { Share } = await import('@capacitor/share')

      const namaFile = `struk-${tx.nomor_transaksi || 'belanja'}.html`
      const base64 = btoa(unescape(encodeURIComponent(html)))

      await Filesystem.writeFile({
        path: `struk/${namaFile}`,
        data: base64,
        directory: Directory.Cache,
        recursive: true,
      })

      const { uri } = await Filesystem.getUri({
        path: `struk/${namaFile}`,
        directory: Directory.Cache,
      })

      await Share.share({
        title: `Struk ${tx.nomor_transaksi || 'Belanja'}`,
        text: `Struk belanja dari ${store.nama_warung || 'WarungKu'} — buka di browser lalu Print/Save as PDF`,
        url: uri,
        dialogTitle: 'Simpan / Cetak Struk',
      })
    } catch (err) {
      if (err?.name !== 'AbortError') {
        alert('Gagal membuka struk: ' + (err?.message || err))
      }
    }
    return
  }

  // ── PWA / Browser: buka di tab baru lalu print seperti biasa ──
  const win = window.open('', '_blank', 'width=400,height=600')
  if (!win) { alert('Popup diblokir browser. Izinkan popup untuk halaman ini.'); return }
  win.document.write(html)
  win.document.close()
  win.onload = () => { win.focus(); win.print() }
}

async function generateStrukWA(tx, store, nomorPelanggan) {
  const namaMetode = METODE.find(m => m.id === tx.metode_bayar)?.label || 'Tunai'
  const totalItem = tx.items.reduce((s, i) => s + i.qty, 0)
  const tgl = fmt(tx.created_at || new Date())

  const itemsText = tx.items.map(item =>
    `• ${item.nama}\n  ${item.qty} x ${Number(item.harga).toLocaleString('id-ID')} = Rp ${Number(item.harga * item.qty).toLocaleString('id-ID')}`
  ).join('\n')

  const lines = [
    `🧾 *STRUK BELANJA*`,
    `*${store.nama_warung || 'WARUNGKU'}*`,
    store.alamat ? store.alamat : null,
    store.no_hp ? `Telp: ${store.no_hp}` : null,
    ``,
    `No. Transaksi: ${tx.nomor_transaksi || '-'}`,
    `Tanggal: ${tgl}`,
    ``,
    `*Detail Belanja:*`,
    itemsText,
    ``,
    `Total Item  : ${totalItem}`,
    `Subtotal    : ${rp(tx.subtotal)}`,
    tx.diskon > 0 ? `Diskon      : -${rp(tx.diskon)}` : null,
    `*TOTAL       : ${rp(tx.total)}*`,
    ``,
    `Dibayar (${namaMetode}): ${tx.metode_bayar === 'hutang' ? 'Hutang' : rp(tx.bayar)}`,
    tx.kembalian > 0 ? `Kembalian   : ${rp(tx.kembalian)}` : null,
    ``,
    `_Terima kasih telah berbelanja! 🙏_`,
  ].filter(l => l !== null).join('\n')

  // Bersihkan nomor HP: hapus spasi, tanda hubung, pastikan diawali 62
  let nomor = (nomorPelanggan || '').replace(/[\s\-().]/g, '')
  if (nomor.startsWith('0')) nomor = '62' + nomor.slice(1)
  if (nomor && !nomor.startsWith('62')) nomor = '62' + nomor

  const encoded = encodeURIComponent(lines)
  const url = nomor
    ? `https://wa.me/${nomor}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`

  // Di APK Capacitor, window.open() tidak bekerja untuk URL eksternal
  // Gunakan Capacitor Browser plugin jika tersedia, fallback window.open untuk PWA
  if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
    try {
      const { Browser } = await import('@capacitor/browser')
      await Browser.open({ url })
    } catch {
      window.open(url, '_blank')
    }
  } else {
    window.open(url, '_blank')
  }
}

// Kirim struk sebagai GAMBAR ke WhatsApp menggunakan Web Share API
// Bekerja di APK Capacitor maupun PWA Android
// Generate gambar struk pakai Canvas API native (tanpa html2canvas)
// Bekerja di APK Capacitor WebView maupun PWA
function buatGambarStruk(tx, store, paperWidth = 32) {
  const namaMetode = METODE.find(m => m.id === tx.metode_bayar)?.label || 'Tunai'
  const lebar = paperWidth === 32 ? 380 : 520  // px, sesuai 58mm / 80mm
  const fontMono = '13px "Courier New", monospace'
  const fontMonoBold = 'bold 13px "Courier New", monospace'
  const fontBesar = 'bold 15px "Courier New", monospace'
  const fontKecil = '11px "Courier New", monospace'
  const pad = 20
  const colW = lebar - pad * 2

  // Hitung tinggi canvas dulu (dry run)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  function hitungBaris() {
    let y = pad
    const baris = (h = 18) => { y += h }
    baris(10)                              // margin atas
    baris(22)                              // nama warung
    if (store.alamat) baris(16)
    if (store.no_hp) baris(16)
    baris(10)                              // garis
    baris(16)                              // no transaksi
    baris(16)                              // tanggal
    baris(16)                              // kasir
    baris(10)                              // garis
    tx.items.forEach(item => {
      baris(18)                            // nama item
      baris(15)                            // qty x harga
    })
    baris(10)                              // garis
    baris(16)                              // total item
    baris(16)                              // subtotal
    if (tx.diskon > 0) baris(16)
    baris(20)                              // TOTAL (besar)
    baris(10)                              // garis
    baris(16)                              // dibayar
    if (tx.kembalian > 0) baris(16)
    baris(10)                              // garis
    baris(18)                              // terima kasih
    baris(15)                              // simpan struk
    baris(20)                              // margin bawah
    return y
  }

  const tinggi = hitungBaris()
  canvas.width = lebar
  canvas.height = tinggi

  // Background putih
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, lebar, tinggi)

  ctx.fillStyle = '#111111'
  let y = pad + 10

  // Helper draw
  const teks = (t, x, bold = false, size = 13) => {
    ctx.font = bold ? `bold ${size}px "Courier New", monospace` : `${size}px "Courier New", monospace`
    ctx.fillText(t, x, y)
  }
  const tengah = (t, bold = false, size = 13) => {
    ctx.font = bold ? `bold ${size}px "Courier New", monospace` : `${size}px "Courier New", monospace`
    const w = ctx.measureText(t).width
    ctx.fillText(t, (lebar - w) / 2, y)
  }
  const garis = (tebal = false) => {
    ctx.strokeStyle = tebal ? '#333' : '#aaa'
    ctx.setLineDash(tebal ? [] : [4, 3])
    ctx.lineWidth = tebal ? 1.5 : 1
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(lebar - pad, y); ctx.stroke()
    ctx.setLineDash([])
    y += 10
  }
  const baris2 = (kiri, kanan, bold = false) => {
    ctx.font = bold ? fontMonoBold : fontMono
    ctx.fillText(kiri, pad, y)
    const w = ctx.measureText(kanan).width
    ctx.fillText(kanan, lebar - pad - w, y)
    y += 18
  }

  // Nama warung
  tengah(store.nama_warung || 'WARUNGKU', true, 15); y += 22
  if (store.alamat) { tengah(store.alamat, false, 11); y += 16 }
  if (store.no_hp) { tengah(`Telp: ${store.no_hp}`, false, 11); y += 16 }

  garis()
  baris2('No. Transaksi', tx.nomor_transaksi || '-')
  baris2('Tanggal', new Date(tx.created_at || Date.now()).toLocaleString('id-ID'))
  baris2('Kasir', 'Admin')
  garis()

  // Items
  tx.items.forEach(item => {
    ctx.font = fontMono
    ctx.fillText(item.nama, pad, y)
    const hargaTotal = Number(item.harga * item.qty).toLocaleString('id-ID')
    const w = ctx.measureText(hargaTotal).width
    ctx.fillText(hargaTotal, lebar - pad - w, y)
    y += 18
    ctx.font = fontKecil
    ctx.fillStyle = '#666'
    ctx.fillText(`  ${item.qty} x ${Number(item.harga).toLocaleString('id-ID')}`, pad, y)
    ctx.fillStyle = '#111'
    y += 15
  })

  garis()
  baris2('Total Item', String(tx.items.reduce((s, i) => s + i.qty, 0)))
  baris2('Subtotal', rp(tx.subtotal))
  if (tx.diskon > 0) baris2('Diskon', `-${rp(tx.diskon)}`)

  // TOTAL besar
  ctx.strokeStyle = '#333'; ctx.setLineDash([]); ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(lebar - pad, y); ctx.stroke()
  y += 6
  ctx.font = `bold 15px "Courier New", monospace`
  ctx.fillText('TOTAL', pad, y)
  const totalStr = rp(tx.total)
  const wTotal = ctx.measureText(totalStr).width
  ctx.fillText(totalStr, lebar - pad - wTotal, y)
  y += 22

  garis()
  baris2(`Dibayar (${namaMetode})`, tx.metode_bayar === 'hutang' ? 'HUTANG' : rp(tx.bayar))
  if (tx.kembalian > 0) baris2('Kembalian', rp(tx.kembalian), true)

  garis()
  ctx.font = fontKecil; ctx.fillStyle = '#555'
  tengah('Terima kasih telah berbelanja'); y += 18
  tengah('*** Simpan struk ini sebagai bukti ***'); y += 15
  ctx.fillStyle = '#111'

  return canvas
}

async function kirimStrukGambarWA(strukeRef, tx, store, nomorPelanggan, paperWidth = 32) {
  try {
    // Generate gambar struk pakai Canvas API native (tidak butuh html2canvas)
    const canvas = buatGambarStruk(tx, store, paperWidth)

    // Canvas → Blob PNG
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob gagal')), 'image/png')
    })

    const namaFile = `struk-${tx.nomor_transaksi || 'belanja'}.png`

    // ── APK Capacitor: simpan ke galeri lalu share native ──────────────────────
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
      try {
        const { Filesystem, Directory } = await import('@capacitor/filesystem')
        const { Share } = await import('@capacitor/share')

        // Blob → base64 string (tanpa prefix data:...)
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result.split(',')[1])
          reader.onerror = () => reject(new Error('FileReader gagal'))
          reader.readAsDataURL(blob)
        })

        // Simpan ke folder cache internal Capacitor (bisa diakses Share)
        const filePath = `struk/${namaFile}`
        await Filesystem.writeFile({
          path: filePath,
          data: base64,
          directory: Directory.Cache,
          recursive: true,
        })

        // Dapatkan URI native untuk Share
        const { uri } = await Filesystem.getUri({
          path: filePath,
          directory: Directory.Cache,
        })

        // Buka native share sheet — user bisa pilih WhatsApp / dll
        await Share.share({
          title: `Struk ${tx.nomor_transaksi || 'Belanja'}`,
          text: `Struk belanja dari ${store.nama_warung || 'WarungKu'}`,
          url: uri,
          dialogTitle: 'Kirim Struk via',
        })

        return true
      } catch (nativeErr) {
        if (nativeErr?.name === 'AbortError') return true
        console.error('Native share error:', nativeErr)
        // Jatuh ke fallback Web Share di bawah
      }
    }

    // ── PWA / Browser: coba Web Share API dengan file ──────────────────────────
    const file = new File([blob], namaFile, { type: 'image/png' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file] })
      return true
    }

    // ── Fallback terakhir: download biasa (desktop/browser lama) ───────────────
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = namaFile
    a.click()
    URL.revokeObjectURL(url)
    alert('Gambar struk diunduh. Silakan kirim manual via WhatsApp dari galeri.')
    return true

  } catch (err) {
    if (err?.name === 'AbortError') return true
    console.error('kirimStrukGambarWA error:', err)
    return false
  }
}

function StrukView({ tx, onSelesai, store }) {
  const strukeRef = useRef(null)  // ref untuk capture gambar struk
  const [btStatus, setBtStatus] = useState('idle')
  const [btName, setBtName] = useState('')
  const [btError, setBtError] = useState('')
  const [paperWidth, setPaperWidth] = useState(32)
  const [showWaInput, setShowWaInput] = useState(false)
  const [waPhone, setWaPhone] = useState('')
  const [waSharing, setWaSharing] = useState(false)  // loading state saat share gambar

  const handleConnect = useCallback(async () => {
    setBtStatus('connecting'); setBtError('')
    try { const { connectPrinter } = await import('@/lib/bluetooth-print'); const name = await connectPrinter(); setBtName(name); setBtStatus('connected') } catch (e) { setBtError(e.message); setBtStatus('error') }
  }, [])
  const handleDisconnect = useCallback(async () => { const { disconnectPrinter } = await import('@/lib/bluetooth-print'); await disconnectPrinter(); setBtStatus('idle'); setBtName('') }, [])
  const handlePrint = useCallback(async () => {
    setBtStatus('printing'); setBtError('')
    try { const { printStruk, isConnected, connectPrinter } = await import('@/lib/bluetooth-print'); if (!isConnected()) { const name = await connectPrinter(); setBtName(name) } await printStruk(tx, store, paperWidth); setBtStatus('connected') } catch (e) { setBtError(e.message); setBtStatus('error') }
  }, [tx, store, paperWidth])

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4">
        <div ref={strukeRef} className="bg-white rounded-2xl p-5 shadow-sm max-w-sm mx-auto">
          <div className="text-center mb-5"><div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle2 className="w-8 h-8 text-green-500" /></div><p className="font-extrabold text-lg text-gray-900">{tx.metode_bayar === 'hutang' ? 'Hutang Dicatat' : 'Pembayaran Berhasil'}</p><p className="text-gray-400 text-sm">Terima kasih telah berbelanja</p></div>
          <div className="text-center py-3 border-t border-b border-dashed border-gray-200 mb-4"><p className="font-extrabold tracking-widest text-gray-900 text-sm">{store.nama_warung || 'WARUNGKU'}</p>{store.alamat && <p className="text-xs text-gray-400 mt-0.5">{store.alamat}</p>}{store.no_hp && <p className="text-xs text-gray-400">{store.no_hp}</p>}</div>
          <div className="space-y-1 pb-4 border-b border-dashed border-gray-200 mb-4">
            {[['No. Transaksi', tx.nomor_transaksi || '-'], ['Tanggal', fmt(tx.created_at || new Date())], ['Kasir', 'Admin']].map(([k, v]) => <div key={k} className="flex justify-between text-sm"><span className="text-gray-500">{k}</span><span className="font-medium">: {v}</span></div>)}
          </div>
          <div className="pb-4 border-b border-dashed border-gray-200 mb-4 space-y-1.5">
            {tx.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="flex-1 text-gray-700">{item.nama}<span className="text-gray-400 ml-1 text-xs">{item.qty} x {Number(item.harga).toLocaleString('id-ID')}</span></span>
                <span className="font-semibold ml-3 flex-shrink-0">{Number(item.harga * item.qty).toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Total Item</span><span>{tx.items.reduce((s, i) => s + i.qty, 0)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{rp(tx.subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Diskon</span><span className="text-red-500">{tx.diskon > 0 ? `-${rp(tx.diskon)}` : rp(0)}</span></div>
            <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-1"><span>Total Bayar</span><span className="text-green-600">{rp(tx.total)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Dibayar ({METODE.find(m => m.id === tx.metode_bayar)?.label || 'Tunai'})</span><span>{tx.metode_bayar === 'hutang' ? <span className="text-yellow-600 font-semibold">Hutang</span> : rp(tx.bayar)}</span></div>
            {tx.kembalian > 0 && <div className="flex justify-between font-bold text-sm"><span>Kembalian</span><span className="text-green-600">{rp(tx.kembalian)}</span></div>}
          </div>
          <p className="text-center text-gray-300 text-[10px] mt-5">— Simpan struk ini sebagai bukti —</p>
        </div>
        <div className="max-w-sm mx-auto mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => generateStrukPDF(tx, store, paperWidth)} className="flex flex-col items-center justify-center gap-1.5 py-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 rounded-2xl font-semibold text-sm hover:bg-emerald-100 transition-colors"><FileDown className="w-5 h-5" /><span className="text-xs font-bold">Cetak PDF</span></button>
            {btStatus !== 'connected' ? (
              <button onClick={handleConnect} disabled={btStatus === 'connecting'} className={`flex flex-col items-center justify-center gap-1.5 py-4 border-2 rounded-2xl font-semibold text-sm transition-colors ${btStatus === 'connecting' ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'}`}>
                {btStatus === 'connecting' ? <><BluetoothSearching className="w-5 h-5 animate-pulse" /><span className="text-xs font-bold">Mencari...</span></> : <><Bluetooth className="w-5 h-5" /><span className="text-xs font-bold">Bluetooth</span></>}
              </button>
            ) : (
              <button onClick={handlePrint} disabled={btStatus === 'printing'} className={`flex flex-col items-center justify-center gap-1.5 py-4 border-2 rounded-2xl font-semibold text-sm transition-colors ${btStatus === 'printing' ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-700 border-blue-700 text-white hover:bg-blue-800'}`}>
                {btStatus === 'printing' ? <><BluetoothSearching className="w-5 h-5 animate-spin" /><span className="text-xs font-bold">Mencetak...</span></> : <><Printer className="w-5 h-5" /><span className="text-xs font-bold">Cetak BT</span></>}
              </button>
            )}
          </div>
          {btStatus === 'connected' && <div className="flex items-center justify-between px-3 py-2 bg-blue-50 rounded-xl border border-blue-200"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /><span className="text-xs font-semibold text-blue-700">{btName || 'Printer Terhubung'}</span></div><button onClick={handleDisconnect} className="text-[10px] text-red-500 font-semibold hover:text-red-700">Putuskan</button></div>}
          {btStatus === 'error' && <div className="flex items-start gap-2 px-3 py-2 bg-red-50 rounded-xl border border-red-200"><AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /><p className="text-xs text-red-600">{btError}</p></div>}
          {/* Tombol Kirim WhatsApp */}
          <button
            onClick={() => setShowWaInput(v => !v)}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-50 border-2 border-green-300 text-green-700 rounded-2xl font-semibold text-sm hover:bg-green-100 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-bold">Kirim Struk via WhatsApp</span>
          </button>

          {/* Panel input nomor pelanggan */}
          {showWaInput && (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold text-green-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                Nomor WhatsApp Pelanggan
              </p>
              <p className="text-[10px] text-green-600">
                Kosongkan jika ingin pelanggan pilih sendiri dari kontak mereka.
                Nomor pengirim akan menggunakan akun WhatsApp kamu.
              </p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={waPhone}
                  onChange={e => setWaPhone(e.target.value)}
                  placeholder="Contoh: 0812345678"
                  className="flex-1 px-3 py-2 border border-green-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              {/* Dua tombol: Kirim Teks (lama) & Kirim Gambar (baru, lebih bagus di APK) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => generateStrukWA(tx, store, waPhone)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border-2 border-green-400 text-green-700 rounded-xl font-bold text-xs hover:bg-green-50 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim Teks
                </button>
                <button
                  disabled={waSharing}
                  onClick={async () => {
                    setWaSharing(true)
                    const ok = await kirimStrukGambarWA(strukeRef, tx, store, waPhone, paperWidth)
                    if (!ok) alert('Gagal mengirim gambar struk. Coba gunakan Kirim Teks.')
                    setWaSharing(false)
                  }}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors border-2 ${waSharing ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 border-green-600 text-white hover:bg-green-700'}`}
                >
                  {waSharing
                    ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Proses...</>
                    : <><MessageCircle className="w-3.5 h-3.5" /> Kirim Gambar</>
                  }
                </button>
              </div>
              <p className="text-[10px] text-green-700 bg-green-100 rounded-lg px-2 py-1.5">
                📸 <strong>Kirim Gambar</strong> — struk dikirim sebagai foto (cocok untuk APK & PWA)<br/>
                💬 <strong>Kirim Teks</strong> — struk dikirim sebagai pesan teks biasa
              </p>
              {store.no_hp && (
                <p className="text-[10px] text-gray-400">
                  💡 Struk dikirim menggunakan WA kamu ({store.no_hp})
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between px-1"><span className="text-[10px] text-gray-400">Ukuran kertas (Bluetooth & PDF)</span><div className="flex gap-1">{[[32, '58mm'], [48, '80mm']].map(([w, l]) => <button key={w} onClick={() => setPaperWidth(w)} className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-colors ${paperWidth === w ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{l}</button>)}</div></div>
        </div>
      </div>
      <div className="bg-white border-t border-gray-100 p-4 flex-shrink-0">
        <button onClick={onSelesai} className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-700 text-white rounded-xl font-bold text-base hover:bg-blue-800 transition-colors"><CheckCircle2 className="w-5 h-5" /> Selesai</button>
      </div>
    </div>
  )
}

// ─── KASIR MAIN (UPDATED DENGAN SCANNER MENU) ─────────────────────────────────
export default function KasirPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['Semua'])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [cart, setCart] = useState([])
  const [diskon, setDiskon] = useState({ type: '%', nilai: 0 })
  const [showKeranjang, setShowKeranjang] = useState(false)
  const [screen, setScreen] = useState('kasir')
  const [lastTx, setLastTx] = useState(null)
  const [saving, setSaving] = useState(false)
  const [store, setStore] = useState({ nama_warung: '', alamat: '', no_hp: '' })

  // === STATE BARU UNTUK SCANNER ===
  const [showScanMenu, setShowScanMenu] = useState(false)
  const [showCamera, setShowCamera] = useState(false)

  // === PLAN STATE ===
  const [plan, setPlan] = useState('free')
  const canUseHutang = plan === 'basic' || plan === 'pro'

  const searchRef = useRef(null)

  useEffect(() => {
    getBarang().then(data => {
      setProducts(data || [])
      setCategories(['Semua', ...new Set((data || []).map(p => p.kategori?.nama).filter(Boolean))])
      setLoading(false)
    }).catch(() => setLoading(false))

    fetch('/api/pengaturan/profil').then(r => r.json()).then(j => { if (j.nama_warung) setStore(j) }).catch(() => {})

    fetch('/api/subscription/status').then(r => r.json()).then(j => {
      setPlan(j.plan || 'free')
    }).catch(() => {})
  }, [])

  // ── Logika Hardware Scanner (Lama) ──
  const handleHardwareScanClick = () => {
    setShowScanMenu(false)
    setActiveCategory('Semua')
    setSearch('')
    if (searchRef.current) {
      searchRef.current.focus()
      searchRef.current.select()
    }
  }

  // ── Logika Kamera Scanner (Baru) ──
  const handleCameraScanClick = () => {
    setShowScanMenu(false)
    setShowCamera(true)
  }

  // Helper: cocokkan barcode pabrikan ATAU kode internal
  const matchByCode = (p, code) => {
    const c = code.toLowerCase()
    return (
      p.barcode?.toLowerCase() === c ||
      p.kode_barang?.toLowerCase() === c
    )
  }

  // Handle hasil scan dari file lib/scanner
  const handleCameraDetected = (code) => {
    setShowCamera(false)
    const match = products.filter(p => matchByCode(p, code))
    if (match.length === 1) {
      addToCart(match[0])
      setSearch('') // Reset kolom pencarian
    } else {
      alert(`Barang dengan barcode/kode "${code}" tidak ditemukan.`)
    }
  }

  // Jika hasil pencarian dari keyboard/hardware scanner tepat 1, auto-add
  useEffect(() => {
    if (!search) return
    const match = products.filter(p => matchByCode(p, search))
    if (match.length === 1) {
      addToCart(match[0])
      setSearch('')
    }
  }, [search, products])

  const filtered = useMemo(() => products.filter(p =>
    (activeCategory === 'Semua' || p.kategori?.nama === activeCategory) &&
    (
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.kode_barang?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(search.toLowerCase())
    ) &&
    p.stok > 0
  ), [search, activeCategory, products])

  const addToCart = (p) => setCart(prev => {
    const ex = prev.find(c => c.id === p.id)
    if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: Math.min(c.qty + 1, p.stok) } : c)
    return [...prev, { ...p, harga: p.harga_jual, qty: 1 }]
  })

  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id))
  const updateQty = (id, d) => setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, Math.min(c.qty + d, products.find(p => p.id === id)?.stok || 999)) } : c))
  
  const clearCart = () => {
    setCart([])
    setDiskon({ type: '%', nilai: 0 })
    setShowKeranjang(false)
  }

  const subtotal = cart.reduce((s, c) => s + c.harga * c.qty, 0)
  const totalItem = cart.reduce((s, c) => s + c.qty, 0)
  const diskonNominal = diskon.type === '%' ? Math.round(subtotal * (Number(diskon.nilai) || 0) / 100) : Number(diskon.nilai) || 0
  const total = Math.max(0, subtotal - diskonNominal)

  const handleBayar = async ({ metode, bayar, kembalian, pelanggan_id }) => {
    setSaving(true)
    try {
      const payload = {
        total, diskon: diskonNominal, total_bayar: bayar, metode_bayar: metode,
        pelanggan_id: pelanggan_id || null,
        items: cart.map(c => ({ id: c.id, nama: c.nama, harga: c.harga, harga_beli: c.harga_beli, qty: c.qty })),
      }
      const json = await simpanTransaksi(payload)

      if (json.offline) {
        // Transaksi disimpan lokal — tampil struk offline
        setLastTx({
          nomor_transaksi: 'OFFLINE-' + json.queue_id,
          created_at: new Date().toISOString(),
          items: cart, subtotal, total, diskon: diskonNominal,
          bayar, kembalian, metode_bayar: metode, offline: true,
        })
        clearCart()
        setScreen('struk')
        return
      }

      if (json.error) throw new Error(json.error)
      setLastTx({ ...json.data, items: cart, subtotal, total, diskon: diskonNominal, bayar, kembalian, metode_bayar: metode })
      clearCart()
      setScreen('struk')
    } catch (e) { alert('Gagal: ' + e.message) } finally { setSaving(false) }
  }

  if (screen === 'riwayat') return <RiwayatView onBack={() => setScreen('kasir')} />
  if (screen === 'struk' && lastTx) return <StrukView tx={lastTx} store={store} onSelesai={() => { setLastTx(null); setScreen('kasir') }} />
  if (screen === 'bayar') return <PembayaranView total={subtotal} diskon={diskonNominal} onBack={() => setScreen('kasir')} onBayar={handleBayar} saving={saving} canUseHutang={canUseHutang} />

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {/* Sub-header */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
        <div className="flex-1">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">No. Transaksi</p>
          <p className="text-xs font-bold text-gray-600">Auto</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Tanggal</p>
          <p className="text-xs font-bold text-gray-600">{today()}</p>
        </div>
        <button onClick={() => setScreen('riwayat')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
          <History className="w-3.5 h-3.5 text-gray-500" /><span className="text-xs font-semibold text-gray-600">Riwayat</span>
        </button>
      </div>

      {/* Search + Tombol Buka Menu Scan */}
      <div className="bg-white px-4 py-2.5 border-b border-gray-100 flex gap-2 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama / kode barang"
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
          />
        </div>
        {/* Tombol yang sekarang memunculkan bottom sheet pilihan scanner */}
        <button
          onClick={() => setShowScanMenu(true)}
          className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors flex-shrink-0"
        >
          <ScanLine className="w-5 h-5 text-blue-600" />
        </button>
      </div>

      {/* Category tabs */}
      <div className="bg-white px-4 pb-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pt-2.5 hide-scrollbar">
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border transition-colors flex-shrink-0 ${activeCategory === c ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Product list + side panel desktop */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? <p className="text-center py-16 text-gray-400 text-sm">Memuat barang...</p> : filtered.length === 0 ? <p className="text-center py-16 text-gray-400 text-sm">Tidak ada barang ditemukan</p> : filtered.map(p => {
            const inCart = cart.find(c => c.id === p.id)
            return (
              <div key={p.id} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm border border-gray-100 hover:border-blue-200 transition-all">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                  {p.foto_url ? <img src={p.foto_url} alt={p.nama} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = p.emoji || '📦' }} /> : (p.emoji || '📦')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{p.nama}</p>
                  <p className="font-bold text-sm text-blue-700">{rp(p.harga_jual)}</p>
                  <p className="text-xs text-green-600 font-medium">Stok: {p.stok}</p>
                </div>
                {inCart ? (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => inCart.qty === 1 ? removeFromCart(p.id) : updateQty(p.id, -1)} className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors"><Minus className="w-3.5 h-3.5 text-blue-700" /></button>
                    <span className="w-6 text-center text-sm font-bold text-gray-900">{inCart.qty}</span>
                    <button onClick={() => addToCart(p)} className="w-7 h-7 rounded-lg bg-blue-700 flex items-center justify-center hover:bg-blue-800 transition-colors"><Plus className="w-3.5 h-3.5 text-white" /></button>
                  </div>
                ) : (
                  <button onClick={() => addToCart(p)} className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center flex-shrink-0 hover:bg-blue-800 transition-colors"><Plus className="w-4 h-4 text-white" /></button>
                )}
              </div>
            )
          })}
        </div>
        {showKeranjang && cart.length > 0 && (
          <div className="hidden md:flex flex-col w-80 bg-white border-l border-gray-200 flex-shrink-0">
            <KeranjangPanel cart={cart} subtotal={subtotal} totalItem={totalItem} diskon={diskon} setDiskon={setDiskon} diskonNominal={diskonNominal} total={total} updateQty={updateQty} removeFromCart={removeFromCart} clearCart={clearCart} onBayar={() => setScreen('bayar')} onClose={() => setShowKeranjang(false)} />
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">{totalItem} item</span><span className="font-bold text-gray-900 text-base">{rp(total)}</span></div>
        <button onClick={() => { if (cart.length > 0) setShowKeranjang(true) }} disabled={cart.length === 0} className={`w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors ${cart.length > 0 ? 'bg-blue-700 hover:bg-blue-800 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
          <ShoppingCart className="w-5 h-5" /> BAYAR ({totalItem})
        </button>
      </div>

      {/* Keranjang bottom sheet - mobile */}
      {showKeranjang && cart.length > 0 && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col">
          <div className="flex-1 bg-black/50" onClick={() => setShowKeranjang(false)} />
          <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />
            <KeranjangPanel cart={cart} subtotal={subtotal} totalItem={totalItem} diskon={diskon} setDiskon={setDiskon} diskonNominal={diskonNominal} total={total} updateQty={updateQty} removeFromCart={removeFromCart} clearCart={clearCart} onBayar={() => { setShowKeranjang(false); setScreen('bayar') }} onClose={() => setShowKeranjang(false)} />
          </div>
        </div>
      )}

      {/* MODAL SCANNER MENU (Pilihan Hardware vs Kamera) */}
      {showScanMenu && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="flex-1 bg-black/50" onClick={() => setShowScanMenu(false)} />
          <div className="bg-white rounded-t-3xl p-6 shadow-2xl pb-10">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
            <h3 className="font-bold text-gray-900 text-center mb-5">Pilih Mode Scanner</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleCameraScanClick}
                className="flex flex-col items-center gap-3 p-5 bg-blue-50 border-2 border-blue-200 rounded-2xl hover:bg-blue-100 transition-colors"
              >
                <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm">
                  <Camera className="w-7 h-7" />
                </div>
                <span className="font-semibold text-blue-800 text-sm">Kamera HP</span>
              </button>
              
              <button
                onClick={handleHardwareScanClick}
                className="flex flex-col items-center gap-3 p-5 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-14 h-14 bg-gray-700 text-white rounded-full flex items-center justify-center shadow-sm">
                  <Keyboard className="w-7 h-7" />
                </div>
                <span className="font-semibold text-gray-800 text-sm">Hardware USB</span>
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-5">
              Jika menggunakan alat scanner USB/Bluetooth, pilih opsi Hardware USB.
            </p>
          </div>
        </div>
      )}

      {/* FULLSCREEN CAMERA SCANNER */}
      {showCamera && (
        <BarcodeScanner 
          onDetected={handleCameraDetected} 
          onClose={() => setShowCamera(false)} 
        />
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
