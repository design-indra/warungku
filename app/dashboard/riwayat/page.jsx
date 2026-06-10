'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  ClipboardList, Search, Filter, X, ChevronDown, ChevronUp,
  Calendar, User, CreditCard, ShoppingBag, RefreshCw,
  AlertCircle, Receipt, TrendingUp, Package, Printer
} from 'lucide-react'

const rp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')

const badgeMetode = (m) => {
  const map = {
    tunai:   { label: 'Tunai',   cls: 'bg-emerald-100 text-emerald-700' },
    transfer:{ label: 'Transfer',cls: 'bg-blue-100 text-blue-700' },
    qris:    { label: 'QRIS',    cls: 'bg-purple-100 text-purple-700' },
    hutang:  { label: 'Hutang',  cls: 'bg-red-100 text-red-700' },
  }
  return map[m] || { label: m || '—', cls: 'bg-gray-100 text-gray-600' }
}

const today = () => new Date().toISOString().split('T')[0]
const sevenDaysAgo = () => {
  const d = new Date(); d.setDate(d.getDate() - 7)
  return d.toISOString().split('T')[0]
}

export default function RiwayatPage() {
  const [transaksi, setTransaksi]   = useState([])
  const [pelanggan, setPelanggan]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [expandedId, setExpandedId] = useState(null)

  // Filter state
  const [search, setSearch]         = useState('')
  const [filterPelanggan, setFilterPelanggan] = useState('')
  const [filterMetode, setFilterMetode]       = useState('')
  const [filterStatus, setFilterStatus]       = useState('')
  const [dateFrom, setDateFrom]     = useState(sevenDaysAgo())
  const [dateTo, setDateTo]         = useState(today())
  const [showFilter, setShowFilter] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [trxRes, pelRes] = await Promise.all([
        fetch(`/api/transaksi?limit=200&from=${dateFrom}&to=${dateTo}`),
        fetch('/api/pelanggan'),
      ])
      const trxJson = await trxRes.json()
      const pelJson = await pelRes.json()
      setTransaksi(trxJson.data || [])
      setPelanggan(pelJson.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = useMemo(() => {
    let data = transaksi
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(t =>
        t.nomor_transaksi?.toLowerCase().includes(q) ||
        t.pelanggan?.nama?.toLowerCase().includes(q)
      )
    }
    if (filterPelanggan) data = data.filter(t => t.pelanggan_id === filterPelanggan)
    if (filterMetode)    data = data.filter(t => t.metode_bayar === filterMetode)
    if (filterStatus)    data = data.filter(t => t.status === filterStatus)
    return data
  }, [transaksi, search, filterPelanggan, filterMetode, filterStatus])

  const totalOmzet = useMemo(() =>
    filtered.reduce((s, t) => s + (t.total || 0), 0), [filtered]
  )

  const activeFilters = [filterPelanggan, filterMetode, filterStatus].filter(Boolean).length

  const resetFilter = () => {
    setFilterPelanggan('')
    setFilterMetode('')
    setFilterStatus('')
    setSearch('')
  }

  const formatTgl = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const cetakUlangStruk = async (t) => {
    const METODE_LABEL = { tunai: 'Tunai', transfer: 'Transfer', qris: 'QRIS', hutang: 'Hutang' }
    const namaMetode   = METODE_LABEL[t.metode_bayar] || 'Tunai'
    const paperWidth   = 32 // default 58mm, bisa dikembangkan ambil dari settings
    const mmWidth      = paperWidth === 32 ? '58mm' : '80mm'

    // Ambil nama warung dari profil (cache di state)
    let namaWarung = 'WARUNGKU'
    try {
      const res = await fetch('/api/pengaturan/profil')
      const p   = await res.json()
      if (p.nama_warung) namaWarung = p.nama_warung
    } catch {}

    // Mapping detail_transaksi → format items struk
    const items = (t.detail_transaksi || []).map(d => ({
      nama:  d.nama_barang,
      qty:   d.qty,
      harga: d.harga_jual,
    }))

    const totalItem  = items.reduce((s, i) => s + i.qty, 0)
    const rp         = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')
    const fmt        = (d) => new Date(d).toLocaleString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })

    const itemsHtml = items.map(item =>
      `<div style="display:flex;justify-content:space-between;margin-bottom:2px;">
        <span style="flex:1;">${item.nama}<br/>
          <span style="font-size:9px;color:#666;">${item.qty} x ${Number(item.harga).toLocaleString('id-ID')}</span>
        </span>
        <span style="white-space:nowrap;margin-left:8px;">${Number(item.harga * item.qty).toLocaleString('id-ID')}</span>
      </div>`
    ).join('')

    const kembalianHtml = (t.kembalian > 0)
      ? `<div style="display:flex;justify-content:space-between;font-weight:700;"><span>Kembalian</span><span>${rp(t.kembalian)}</span></div>`
      : ''

    const printBtnStyle = `position:fixed;bottom:20px;right:20px;z-index:999;background:#1d4ed8;color:#fff;border:none;border-radius:12px;padding:12px 24px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.2);font-family:sans-serif;`

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
      <title>Struk - ${t.nomor_transaksi || ''}</title>
      <style>@page{margin:0;size:${mmWidth} auto;}*{box-sizing:border-box;}body{font-family:'Courier New',Courier,monospace;font-size:11px;width:${mmWidth};margin:0 auto;padding:6mm 4mm;color:#111;background:#fff;}
      .center{text-align:center;}.bold{font-weight:700;}.small{font-size:9px;color:#555;}.dash{border-top:1px dashed #999;margin:5px 0;}
      .row{display:flex;justify-content:space-between;margin-bottom:2px;}.total-row{display:flex;justify-content:space-between;font-weight:700;font-size:12px;border-top:1px solid #333;padding-top:4px;margin-top:4px;}
      @media print{.no-print{display:none!important;}body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style>
      </head><body>
      <button class="no-print" style="${printBtnStyle}" onclick="window.print()">🖨️ Cetak / Save PDF</button>
      <div class="center bold" style="font-size:13px;letter-spacing:2px;margin-bottom:2px;">${namaWarung}</div>
      <div class="dash"></div>
      <div class="row"><span>No. Transaksi</span><span>${t.nomor_transaksi || '-'}</span></div>
      <div class="row"><span>Tanggal</span><span>${fmt(t.created_at)}</span></div>
      <div class="row"><span>Kasir</span><span>Admin</span></div>
      <div class="dash"></div>
      ${itemsHtml}
      <div class="dash"></div>
      <div class="row"><span>Total Item</span><span>${totalItem}</span></div>
      <div class="row"><span>Subtotal</span><span>${rp(t.subtotal || t.total)}</span></div>
      ${t.diskon > 0 ? `<div class="row"><span>Diskon</span><span>-${rp(t.diskon)}</span></div>` : ''}
      <div class="total-row"><span>TOTAL</span><span>${rp(t.total)}</span></div>
      <div class="dash"></div>
      <div class="row"><span>Dibayar (${namaMetode})</span><span>${rp(t.bayar || t.total)}</span></div>
      ${kembalianHtml}
      <div class="dash"></div>
      <div class="center small" style="margin-top:6px;">Terima kasih telah berbelanja</div>
      <div class="center small">*** Simpan struk ini sebagai bukti ***</div>
      </body></html>`

    // ── APK Capacitor: kirim ke /api/struk → Browser.open ──
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
      try {
        const { Browser } = await import('@capacitor/browser')
        const res = await fetch('/api/struk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html }),
        })
        if (!res.ok) throw new Error('Gagal menyimpan struk ke server')
        const { token } = await res.json()
        if (!token) throw new Error('Token tidak diterima dari server')
        const url = `${window.location.origin}/api/struk?token=${token}`
        await Browser.open({ url, presentationStyle: 'fullscreen' })
      } catch (err) {
        if (err?.name !== 'AbortError') alert('Gagal mencetak struk: ' + (err?.message || err))
      }
      return
    }

    // ── PWA / Browser: buka tab baru lalu print ──
    const win = window.open('', '_blank', 'width=400,height=600')
    if (!win) { alert('Popup diblokir browser. Izinkan popup untuk halaman ini.'); return }
    win.document.write(html)
    win.document.close()
    win.onload = () => { win.focus(); win.print() }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Riwayat Transaksi</h1>
          <p className="text-xs text-gray-400">
            {loading ? 'Memuat...' : `${filtered.length} transaksi`}
          </p>
        </div>
        <button onClick={fetchData} className="ml-auto p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Ringkasan Omzet */}
      {!loading && filtered.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-4 mb-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 opacity-70" />
            <span className="text-xs opacity-70">Total Omzet (hasil filter)</span>
          </div>
          <p className="text-2xl font-bold">{rp(totalOmzet)}</p>
          <p className="text-xs opacity-60 mt-1">{filtered.length} transaksi · {dateFrom} s/d {dateTo}</p>
        </div>
      )}

      {/* Filter Tanggal */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">Rentang Tanggal</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-gray-400 mb-0.5 block">Dari</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-gray-400 mb-0.5 block">Sampai</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Cari no. transaksi atau pelanggan..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
        </div>
        <button onClick={() => setShowFilter(v => !v)}
          className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors
            ${showFilter || activeFilters > 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
          <Filter className="w-4 h-4" />
          {activeFilters > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Panel Filter */}
      {showFilter && (
        <div className="bg-white border border-gray-200 rounded-xl p-3 mb-3 space-y-3">
          {/* Filter Pelanggan */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Pelanggan
            </label>
            <select value={filterPelanggan} onChange={e => setFilterPelanggan(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Semua Pelanggan</option>
              {pelanggan.map(p => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            {/* Filter Metode */}
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" /> Metode
              </label>
              <select value={filterMetode} onChange={e => setFilterMetode(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Semua</option>
                <option value="tunai">Tunai</option>
                <option value="transfer">Transfer</option>
                <option value="qris">QRIS</option>
                <option value="hutang">Hutang</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5" /> Status
              </label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Semua</option>
                <option value="lunas">Lunas</option>
                <option value="hutang">Hutang</option>
              </select>
            </div>
          </div>

          {activeFilters > 0 && (
            <button onClick={resetFilter}
              className="w-full py-2 text-xs text-red-500 font-semibold hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1">
              <X className="w-3.5 h-3.5" /> Reset Filter
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Tidak ada transaksi</p>
          <p className="text-gray-400 text-xs mt-1">Coba ubah rentang tanggal atau filter</p>
        </div>
      )}

      {/* List Transaksi */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(t => {
            const metode = badgeMetode(t.metode_bayar)
            const isOpen = expandedId === t.id
            return (
              <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header transaksi */}
                <button
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isOpen ? null : t.id)}
                >
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {t.nomor_transaksi}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${metode.cls}`}>
                        {metode.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{formatTgl(t.created_at)}</span>
                      {t.pelanggan?.nama && (
                        <>
                          <span className="text-gray-200">·</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {t.pelanggan.nama}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-sm">{rp(t.total)}</p>
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 ml-auto mt-1" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-auto mt-1" />}
                  </div>
                </button>

                {/* Detail items */}
                {isOpen && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                    {t.detail_transaksi?.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <Package className="w-3 h-3" /> Detail Item
                        </p>
                        {t.detail_transaksi.map((d, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-gray-700 flex-1 truncate">{d.nama_barang}</span>
                            <span className="text-gray-500 mx-2">{d.qty}x</span>
                            <span className="font-semibold text-gray-800">{rp(d.subtotal)}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-xs font-bold">
                          <span className="text-gray-600">Total</span>
                          <span className="text-gray-900">{rp(t.total)}</span>
                        </div>
                        {t.diskon > 0 && (
                          <div className="flex justify-between text-xs text-emerald-600">
                            <span>Diskon</span>
                            <span>- {rp(t.diskon)}</span>
                          </div>
                        )}
                        {t.catatan && (
                          <p className="text-xs text-gray-400 italic mt-1">📝 {t.catatan}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-2">Detail tidak tersedia</p>
                    )}

                    {/* Tombol Cetak Ulang */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={(e) => { e.stopPropagation(); cetakUlangStruk(t) }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Cetak Ulang Struk
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
