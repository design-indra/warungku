'use client'

import { useState, useMemo, useEffect } from 'react'
import Icon from '@/components/Icon'

const CATEGORIES = ['Semua', 'Makanan', 'Minuman', 'Sembako', 'Rokok', 'Lainnya']
const rp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

function ReceiptView({ tx, onBack }) {
  return (
    <div className="page-content max-w-md mx-auto">
      <div className="card p-5 mb-4">
        <div className="text-center pb-4 border-b border-dashed border-gray-200 mb-4">
          <p className="text-xl font-extrabold tracking-widest">WARUNGKU</p>
          <p className="text-xs text-gray-500">Terima kasih telah berbelanja</p>
        </div>
        <div className="pb-4 border-b border-dashed border-gray-200 mb-4 space-y-1">
          {[['No. Transaksi', tx.nomor_transaksi || tx.id], ['Tanggal', new Date().toLocaleDateString('id-ID')], ['Kasir', 'Kasir']].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-gray-500">{k}</span><span className="font-medium">: {v}</span>
            </div>
          ))}
        </div>
        <div className="pb-4 border-b border-dashed border-gray-200 mb-4">
          {tx.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm mb-1">
              <span>{item.nama} x{item.qty}</span>
              <span className="font-medium">{rp(item.harga * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{rp(tx.total)}</span></div>
        </div>
        <div className="flex justify-between border-t-2 border-gray-900 pt-2 mb-2">
          <span className="font-extrabold">Total</span><span className="font-extrabold">{rp(tx.total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Bayar</span><span>{rp(tx.bayar)}</span>
        </div>
        <div className="flex justify-between font-bold mt-1">
          <span>Kembalian</span><span className="text-green-600">{rp(tx.kembalian)}</span>
        </div>
        <p className="text-center text-gray-400 text-xs mt-5">— Simpan struk ini sebagai bukti —</p>
      </div>
      <div className="flex gap-3">
        <button className="flex-1 btn-secondary justify-center gap-2"><Icon name="printer" size={16} color="#2563eb" /> Print</button>
        <button className="flex-1 btn-secondary justify-center gap-2"><Icon name="share" size={16} color="#16a34a" /> Share</button>
        <button onClick={onBack} className="flex-1 btn-primary justify-center">Transaksi Baru</button>
      </div>
    </div>
  )
}

export default function KasirPage() {
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [cart, setCart]           = useState([])
  const [bayar, setBayar]         = useState('')
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastTx, setLastTx]       = useState(null)
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    fetch('/api/barang')
      .then(r => r.json())
      .then(j => { setProducts(j.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => products.filter(p =>
    (activeCategory === 'Semua' || p.kategori?.nama === activeCategory) &&
    p.nama.toLowerCase().includes(search.toLowerCase()) &&
    p.stok > 0
  ), [search, activeCategory, products])

  const addToCart = (p) => setCart(prev => {
    const ex = prev.find(c => c.id === p.id)
    if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: Math.min(c.qty + 1, p.stok) } : c)
    return [...prev, { ...p, harga: p.harga_jual, qty: 1 }]
  })
  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id))
  const updateQty = (id, d) => setCart(prev =>
    prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + d) } : c)
  )

  const total       = cart.reduce((s, c) => s + c.harga * c.qty, 0)
  const kembalian   = Number(bayar) - total
  const canBayar    = bayar && Number(bayar) >= total

  const handleBayar = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total, total_bayar: Number(bayar), metode_bayar: 'tunai',
          items: cart.map(c => ({ id: c.id, nama: c.nama, harga: c.harga, harga_beli: c.harga_beli, qty: c.qty })),
        }),
      })
      const json = await res.json()
      setLastTx({ ...json.data, items: cart, total, bayar: Number(bayar), kembalian })
      setShowReceipt(true)
      setCart([])
      setBayar('')
    } catch { alert('Gagal menyimpan transaksi') }
    finally { setSaving(false) }
  }

  if (showReceipt && lastTx) return <ReceiptView tx={lastTx} onBack={() => { setShowReceipt(false); setLastTx(null) }} />

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto page-content">
        <div className="relative mb-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2"><Icon name="search" size={16} color="#9ca3af" /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama barang..." className="input-field pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors
                ${activeCategory === c ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-500 border-gray-200'}`}>
              {c}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
            <Icon name="refresh" size={18} color="#9ca3af" /> Memuat barang...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map(p => (
              <button key={p.id} onClick={() => addToCart(p)}
                className="card p-3 text-left hover:border-blue-300 hover:shadow-md transition-all active:scale-95">
                <div className="text-3xl mb-2">{p.emoji}</div>
                <p className="text-xs font-semibold text-gray-800 mb-1 leading-tight">{p.nama}</p>
                <p className="text-sm font-bold text-blue-700">{rp(p.harga_jual)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Stok: {p.stok}</p>
              </button>
            ))}
            {filtered.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 text-gray-400">Tidak ada barang ditemukan</div>
            )}
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 space-y-2 flex-shrink-0 max-h-72 overflow-y-auto">
          <p className="font-semibold text-sm text-gray-800">Keranjang ({cart.length} item)</p>
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-2">
              <span className="text-base">{item.emoji}</span>
              <span className="flex-1 text-xs text-gray-700 truncate">{item.nama}</span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded border border-gray-200 bg-gray-50 flex items-center justify-center">
                  <Icon name="minus" size={11} color="#374151" />
                </button>
                <span className="w-5 text-center text-xs font-semibold">{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded border border-gray-200 bg-gray-50 flex items-center justify-center">
                  <Icon name="plus" size={11} color="#374151" />
                </button>
                <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded bg-red-100 flex items-center justify-center">
                  <Icon name="trash" size={11} color="#dc2626" />
                </button>
              </div>
              <span className="text-xs font-bold text-gray-900 w-20 text-right">{rp(item.harga * item.qty)}</span>
            </div>
          ))}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <input value={bayar} onChange={e => setBayar(e.target.value)}
              placeholder={`Total: ${rp(total)}`} type="number" className="input-field flex-1 text-sm" />
            <button onClick={handleBayar} disabled={!canBayar || saving}
              className={`px-5 py-2 rounded-lg font-bold text-sm transition-colors
                ${canBayar && !saving ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-100 text-green-300 cursor-not-allowed'}`}>
              {saving ? 'Simpan...' : 'Bayar'}
            </button>
          </div>
          {canBayar && <p className="text-xs font-semibold text-green-600">Kembalian: {rp(kembalian)}</p>}
        </div>
      )}
    </div>
  )
}
