'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Search, QrCode, ShoppingCart, Trash2, Plus, Minus,
  CreditCard, Wallet, Banknote, ScanLine, CheckCircle2,
  Printer, ArrowLeft, X, History, Receipt
} from 'lucide-react'

const rp  = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')
const fmt = (d) => new Date(d).toLocaleString('id-ID', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
})
const today = () => new Date().toLocaleString('id-ID', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
}).replace(',', '')

const CATEGORIES = ['Semua', 'Makanan', 'Minuman', 'Sembako', 'Rokok', 'Lainnya']
const METODE = [
  { id: 'tunai',   label: 'Tunai',              icon: Banknote  },
  { id: 'qris',    label: 'QRIS',               icon: QrCode    },
  { id: 'debit',   label: 'Kartu Debit/Kredit', icon: CreditCard },
  { id: 'ewallet', label: 'E-Wallet',           icon: Wallet    },
]

// ─── RIWAYAT ─────────────────────────────────────────────────────────────────
function RiwayatView({ onBack }) {
  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('semua')
  const [search, setSearch]   = useState('')

  useEffect(() => {
    fetch('/api/transaksi?limit=50')
      .then(r => r.json())
      .then(j => { setList(j.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => list.filter(t => {
    if (tab === 'selesai'    && t.status !== 'lunas') return false
    if (tab === 'dibatalkan' && t.status !== 'batal') return false
    if (search && !t.nomor_transaksi?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [list, tab, search])

  const badge = (s) => {
    if (s === 'lunas')  return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">Selesai</span>
    if (s === 'hutang') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">Hutang</span>
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">Dibatalkan</span>
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="font-bold text-gray-900">Riwayat Transaksi</h2>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-4 flex-shrink-0">
        <div className="flex">
          {[['semua','Semua'],['selesai','Selesai'],['dibatalkan','Dibatalkan']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors
                ${tab===k ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari no. transaksi..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
          </div>
        </div>

        <div className="px-4 pb-6 space-y-3">
          {loading ? (
            <p className="text-center py-12 text-gray-400 text-sm">Memuat...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-12 text-gray-400 text-sm">Tidak ada transaksi</p>
          ) : filtered.map(t => (
            <div key={t.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-sm text-gray-900">{t.nomor_transaksi || t.id?.slice(0,8)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmt(t.created_at)}</p>
                  <p className="text-xs text-gray-400">{t.detail_transaksi?.length || 0} item</p>
                </div>
                <div className="text-right">
                  {badge(t.status)}
                  <p className="font-bold text-base text-blue-700 mt-1">{rp(t.total)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── STRUK ────────────────────────────────────────────────────────────────────
function StrukView({ tx, onSelesai, store }) {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm max-w-sm mx-auto">

          {/* Status sukses */}
          <div className="text-center mb-5">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <p className="font-extrabold text-lg text-gray-900">Pembayaran Berhasil</p>
            <p className="text-gray-400 text-sm">Terima kasih telah berbelanja</p>
          </div>

          {/* Info toko */}
          <div className="text-center py-3 border-t border-b border-dashed border-gray-200 mb-4">
            <p className="font-extrabold tracking-widest text-gray-900 text-sm">
              {store.nama_warung || 'WARUNGKU'}
            </p>
            {store.alamat && <p className="text-xs text-gray-400 mt-0.5">{store.alamat}</p>}
            {store.no_hp   && <p className="text-xs text-gray-400">{store.no_hp}</p>}
          </div>

          {/* Meta */}
          <div className="space-y-1 pb-4 border-b border-dashed border-gray-200 mb-4">
            {[
              ['No. Transaksi', tx.nomor_transaksi || '-'],
              ['Tanggal',       fmt(tx.created_at || new Date())],
              ['Kasir',         'Admin'],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-medium">: {v}</span>
              </div>
            ))}
          </div>

          {/* Items */}
          <div className="pb-4 border-b border-dashed border-gray-200 mb-4 space-y-1.5">
            {tx.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="flex-1 text-gray-700">
                  {item.nama}
                  <span className="text-gray-400 ml-1 text-xs">
                    {item.qty} x {Number(item.harga).toLocaleString('id-ID')}
                  </span>
                </span>
                <span className="font-semibold ml-3 flex-shrink-0">
                  {Number(item.harga * item.qty).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Item</span>
              <span>{tx.items.reduce((s,i) => s + i.qty, 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{rp(tx.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Diskon</span>
              <span className="text-red-500">{tx.diskon > 0 ? `-${rp(tx.diskon)}` : rp(0)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-1">
              <span>Total Bayar</span>
              <span className="text-green-600">{rp(tx.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Dibayar ({METODE.find(m => m.id === tx.metode_bayar)?.label || 'Tunai'})
              </span>
              <span>{rp(tx.bayar)}</span>
            </div>
            {tx.kembalian > 0 && (
              <div className="flex justify-between font-bold text-sm">
                <span>Kembalian</span>
                <span className="text-green-600">{rp(tx.kembalian)}</span>
              </div>
            )}
          </div>

          <p className="text-center text-gray-300 text-[10px] mt-5">— Simpan struk ini sebagai bukti —</p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border-t border-gray-100 p-4 flex gap-3 flex-shrink-0">
        <button className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-blue-200 text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors">
          <Printer className="w-4 h-4" /> Cetak Struk
        </button>
        <button onClick={onSelesai}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-blue-700 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors">
          <CheckCircle2 className="w-4 h-4" /> Selesai
        </button>
      </div>
    </div>
  )
}

// ─── PEMBAYARAN ───────────────────────────────────────────────────────────────
function PembayaranView({ total, diskon, onBack, onBayar, saving }) {
  const [metode, setMetode]   = useState('tunai')
  const [bayarStr, setBayarStr] = useState('')

  const totalAkhir = total - diskon
  const bayarNum   = Number(bayarStr.replace(/\D/g, '')) || 0
  const kembalian  = bayarNum - totalAkhir
  const canBayar   = metode !== 'tunai' || bayarNum >= totalAkhir

  const handleInput = (v) => {
    const num = v.replace(/\D/g, '')
    setBayarStr(num ? Number(num).toLocaleString('id-ID') : '')
  }

  // Quick amount suggestions
  const quickAmounts = [...new Set([
    totalAkhir,
    Math.ceil(totalAkhir / 5000) * 5000,
    Math.ceil(totalAkhir / 10000) * 10000,
    50000, 100000
  ])].filter(v => v >= totalAkhir).slice(0, 4)

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 flex-shrink-0">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="font-bold text-gray-900">Pembayaran</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium text-base">Total Bayar</span>
          <span className="text-2xl font-extrabold text-green-600">{rp(totalAkhir)}</span>
        </div>

        {/* Metode */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Metode Pembayaran</p>
          <div className="space-y-2">
            {METODE.map(m => (
              <button key={m.id} onClick={() => setMetode(m.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all
                  ${metode === m.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                  ${metode === m.id ? 'bg-blue-600' : 'bg-gray-100'}`}>
                  <m.icon className={`w-4 h-4 ${metode === m.id ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <span className={`flex-1 text-left font-semibold text-sm
                  ${metode === m.id ? 'text-blue-700' : 'text-gray-700'}`}>
                  {m.label}
                </span>
                {metode === m.id && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Input nominal - tunai saja */}
        {metode === 'tunai' && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Dibayar</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">Rp</span>
              <input
                value={bayarStr}
                onChange={e => handleInput(e.target.value)}
                placeholder="0"
                inputMode="numeric"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-xl font-bold text-gray-900 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {quickAmounts.map(v => (
                <button key={v} onClick={() => setBayarStr(v.toLocaleString('id-ID'))}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-700 text-xs font-semibold rounded-lg transition-colors">
                  {rp(v)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Kembalian */}
        {metode === 'tunai' && bayarNum >= totalAkhir && (
          <div className="flex justify-between items-center py-3 px-4 bg-green-50 rounded-xl border border-green-200">
            <span className="font-semibold text-green-700">Kembalian</span>
            <span className="font-extrabold text-xl text-green-600">{rp(kembalian)}</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={() => onBayar({
            metode,
            bayar: metode === 'tunai' ? bayarNum : totalAkhir,
            kembalian: metode === 'tunai' ? kembalian : 0
          })}
          disabled={!canBayar || saving}
          className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors
            ${canBayar && !saving
              ? 'bg-blue-700 hover:bg-blue-800 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
          <Receipt className="w-5 h-5" />
          {saving ? 'Memproses...' : 'BAYAR'}
        </button>
      </div>
    </div>
  )
}

// ─── KERANJANG PANEL ──────────────────────────────────────────────────────────
function KeranjangPanel({ cart, subtotal, totalItem, diskon, setDiskon, diskonNominal, total,
  updateQty, removeFromCart, clearCart, onBayar, onClose }) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-blue-700" />
          <span className="font-bold text-gray-900">Keranjang ({totalItem})</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={clearCart} className="text-xs text-red-500 font-semibold hover:text-red-700">
            Hapus
          </button>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {cart.map(item => (
          <div key={item.id} className="flex items-center gap-2">
            {/* Foto/emoji */}
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
              {item.foto_url
                ? <img src={item.foto_url} alt={item.nama} className="w-full h-full object-cover" />
                : (item.emoji || '📦')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{item.nama}</p>
              <p className="text-xs text-blue-700">{rp(item.harga)}</p>
            </div>
            {/* Qty controls */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => item.qty === 1 ? removeFromCart(item.id) : updateQty(item.id, -1)}
                className="w-6 h-6 rounded border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100">
                <Minus className="w-3 h-3 text-gray-600" />
              </button>
              <span className="w-5 text-center text-xs font-bold">{item.qty}</span>
              <button
                onClick={() => updateQty(item.id, 1)}
                className="w-6 h-6 rounded border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100">
                <Plus className="w-3 h-3 text-gray-600" />
              </button>
              <button
                onClick={() => removeFromCart(item.id)}
                className="w-6 h-6 rounded bg-red-50 flex items-center justify-center ml-0.5 hover:bg-red-100">
                <Trash2 className="w-3 h-3 text-red-500" />
              </button>
            </div>
            <span className="text-xs font-bold text-gray-900 w-16 text-right flex-shrink-0">
              {rp(item.harga * item.qty)}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="px-4 py-3 border-t border-gray-100 space-y-2 flex-shrink-0">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total Item</span>
          <span className="font-semibold">{totalItem}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-semibold">{rp(subtotal)}</span>
        </div>
        {/* Diskon */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-gray-500">Diskon</span>
          <div className="flex items-center gap-1">
            <select
              value={diskon.type}
              onChange={e => setDiskon(d => ({ ...d, type: e.target.value, nilai: 0 }))}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none">
              <option value="%">%</option>
              <option value="Rp">Rp</option>
            </select>
            <input
              value={diskon.nilai || ''}
              onChange={e => setDiskon(d => ({ ...d, nilai: e.target.value }))}
              inputMode="numeric"
              placeholder="0"
              className="w-16 text-xs border border-gray-200 rounded-lg px-2 py-1 text-right focus:outline-none focus:border-blue-400" />
            <span className="text-xs font-semibold text-red-500 w-20 text-right">
              {diskonNominal > 0 ? `-${rp(diskonNominal)}` : rp(0)}
            </span>
          </div>
        </div>
        <div className="flex justify-between font-extrabold text-base border-t border-gray-100 pt-2">
          <span>Total Bayar</span>
          <span className="text-green-600">{rp(total)}</span>
        </div>
      </div>

      <div className="px-4 pb-4 flex-shrink-0">
        <button onClick={onBayar}
          className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors">
          <Receipt className="w-5 h-5" /> BAYAR
        </button>
      </div>
    </>
  )
}

// ─── KASIR MAIN ───────────────────────────────────────────────────────────────
export default function KasirPage() {
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [cart, setCart]           = useState([])
  const [diskon, setDiskon]       = useState({ type: '%', nilai: 0 })
  const [showKeranjang, setShowKeranjang] = useState(false)
  const [screen, setScreen]       = useState('kasir') // kasir | bayar | struk | riwayat
  const [lastTx, setLastTx]       = useState(null)
  const [saving, setSaving]       = useState(false)
  const [store, setStore]         = useState({ nama_warung: '', alamat: '', no_hp: '' })

  useEffect(() => {
    fetch('/api/barang?limit=100')
      .then(r => r.json())
      .then(j => { setProducts(j.data || []); setLoading(false) })
      .catch(() => setLoading(false))
    fetch('/api/pengaturan/profil')
      .then(r => r.json())
      .then(j => { if (j.nama_warung) setStore(j) })
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => products.filter(p =>
    (activeCategory === 'Semua' || p.kategori?.nama === activeCategory) &&
    (p.nama.toLowerCase().includes(search.toLowerCase()) ||
     p.kode_barang?.toLowerCase().includes(search.toLowerCase())) &&
    p.stok > 0
  ), [search, activeCategory, products])

  const addToCart = (p) => setCart(prev => {
    const ex = prev.find(c => c.id === p.id)
    if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: Math.min(c.qty + 1, p.stok) } : c)
    return [...prev, { ...p, harga: p.harga_jual, qty: 1 }]
  })
  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id))
  const updateQty = (id, d) => setCart(prev =>
    prev.map(c => c.id === id
      ? { ...c, qty: Math.max(1, Math.min(c.qty + d, products.find(p => p.id === id)?.stok || 999)) }
      : c)
  )
  const clearCart = () => { setCart([]); setDiskon({ type: '%', nilai: 0 }); setShowKeranjang(false) }

  const subtotal       = cart.reduce((s, c) => s + c.harga * c.qty, 0)
  const totalItem      = cart.reduce((s, c) => s + c.qty, 0)
  const diskonNominal  = diskon.type === '%'
    ? Math.round(subtotal * (Number(diskon.nilai) || 0) / 100)
    : Number(diskon.nilai) || 0
  const total = Math.max(0, subtotal - diskonNominal)

  const handleBayar = async ({ metode, bayar, kembalian }) => {
    setSaving(true)
    try {
      const res = await fetch('/api/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total, diskon: diskonNominal, total_bayar: bayar,
          metode_bayar: metode,
          items: cart.map(c => ({
            id: c.id, nama: c.nama, harga: c.harga,
            harga_beli: c.harga_beli, qty: c.qty
          })),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan')
      setLastTx({
        ...json.data,
        items: cart,
        subtotal,
        total,
        diskon: diskonNominal,
        bayar,
        kembalian,
        metode_bayar: metode,
      })
      clearCart()
      setScreen('struk')
    } catch (e) {
      alert('Gagal: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Route ke screen lain ──
  if (screen === 'riwayat') return <RiwayatView onBack={() => setScreen('kasir')} />
  if (screen === 'struk' && lastTx) return (
    <StrukView tx={lastTx} store={store}
      onSelesai={() => { setLastTx(null); setScreen('kasir') }} />
  )
  if (screen === 'bayar') return (
    <PembayaranView
      total={subtotal} diskon={diskonNominal}
      onBack={() => setScreen('kasir')}
      onBayar={handleBayar} saving={saving} />
  )

  // ── Main kasir screen ──
  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">

      {/* Sub-header: No Transaksi + Tanggal + Riwayat */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
        <div className="flex-1">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">No. Transaksi</p>
          <p className="text-xs font-bold text-gray-600">— akan digenerate —</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Tanggal</p>
          <p className="text-xs font-bold text-gray-600">{today()}</p>
        </div>
        <button
          onClick={() => setScreen('riwayat')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
          <History className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-semibold text-gray-600">Riwayat</span>
        </button>
      </div>

      {/* Search + Scan */}
      <div className="bg-white px-4 py-2.5 border-b border-gray-100 flex gap-2 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama / kode barang"
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" />
        </div>
        <button className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex-shrink-0">
          <ScanLine className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Category tabs */}
      <div className="bg-white px-4 pb-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pt-2.5 hide-scrollbar">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border transition-colors flex-shrink-0
                ${activeCategory === c
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Product list + side panel desktop */}
      <div className="flex flex-1 overflow-hidden">
        {/* Products */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <p className="text-center py-16 text-gray-400 text-sm">Memuat barang...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-16 text-gray-400 text-sm">Tidak ada barang ditemukan</p>
          ) : filtered.map(p => {
            const inCart = cart.find(c => c.id === p.id)
            return (
              <div key={p.id}
                className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm border border-gray-100 hover:border-blue-200 transition-all">
                {/* Foto */}
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                  {p.foto_url
                    ? <img src={p.foto_url} alt={p.nama} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.parentElement.innerHTML = p.emoji || '📦' }} />
                    : (p.emoji || '📦')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{p.nama}</p>
                  <p className="font-bold text-sm text-blue-700">{rp(p.harga_jual)}</p>
                  <p className="text-xs text-green-600 font-medium">Stok: {p.stok}</p>
                </div>
                {inCart ? (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => inCart.qty === 1 ? removeFromCart(p.id) : updateQty(p.id, -1)}
                      className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors">
                      <Minus className="w-3.5 h-3.5 text-blue-700" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-gray-900">{inCart.qty}</span>
                    <button
                      onClick={() => addToCart(p)}
                      className="w-7 h-7 rounded-lg bg-blue-700 flex items-center justify-center hover:bg-blue-800 transition-colors">
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(p)}
                    className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center flex-shrink-0 hover:bg-blue-800 transition-colors">
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Keranjang side panel - desktop */}
        {showKeranjang && cart.length > 0 && (
          <div className="hidden md:flex flex-col w-80 bg-white border-l border-gray-200 flex-shrink-0">
            <KeranjangPanel
              cart={cart} subtotal={subtotal} totalItem={totalItem}
              diskon={diskon} setDiskon={setDiskon}
              diskonNominal={diskonNominal} total={total}
              updateQty={updateQty} removeFromCart={removeFromCart}
              clearCart={clearCart}
              onBayar={() => setScreen('bayar')}
              onClose={() => setShowKeranjang(false)} />
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{totalItem} item</span>
          <span className="font-bold text-gray-900 text-base">{rp(total)}</span>
        </div>
        <button
          onClick={() => { if (cart.length > 0) setShowKeranjang(true) }}
          disabled={cart.length === 0}
          className={`w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors
            ${cart.length > 0
              ? 'bg-blue-700 hover:bg-blue-800 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
          <ShoppingCart className="w-5 h-5" />
          BAYAR ({totalItem})
        </button>
      </div>

      {/* Keranjang bottom sheet - mobile */}
      {showKeranjang && cart.length > 0 && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col">
          <div className="flex-1 bg-black/50" onClick={() => setShowKeranjang(false)} />
          <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />
            <KeranjangPanel
              cart={cart} subtotal={subtotal} totalItem={totalItem}
              diskon={diskon} setDiskon={setDiskon}
              diskonNominal={diskonNominal} total={total}
              updateQty={updateQty} removeFromCart={removeFromCart}
              clearCart={clearCart}
              onBayar={() => { setShowKeranjang(false); setScreen('bayar') }}
              onClose={() => setShowKeranjang(false)} />
          </div>
        </div>
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
