'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Users, Search, Download, ArrowLeft, AlertTriangle,
  Phone, MapPin, ChevronDown, ChevronUp, RefreshCw,
  ShoppingBag, CreditCard, Calendar, CheckCircle2,
} from 'lucide-react'

const rp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')
const BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des']
const fmtTglLen = (iso) => {
  if (!iso) return '-'
  const [dt] = iso.split('T')
  const [y, m, d] = dt.split('-')
  return `${d} ${BULAN[m - 1]} ${y}`
}
const relativeTime = (iso) => {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hari ini'
  if (days === 1) return 'Kemarin'
  if (days < 7)  return `${days} hari lalu`
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`
  return `${Math.floor(days / 30)} bulan lalu`
}

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function LaporanPelangganPage() {
  const [data, setData]           = useState([])
  const [summary, setSummary]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('semua')   // semua | hutang | lunas
  const [sortBy, setSortBy]       = useState('nama')    // nama | belanja | hutang | trx
  const [expanded, setExpanded]   = useState(null)      // pelanggan_id yang dibuka

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/laporan/pelanggan')
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json.data || [])
      setSummary(json.summary || null)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Filter + search + sort
  const filtered = useMemo(() => {
    let list = [...data]

    // Filter hutang
    if (filter === 'hutang') list = list.filter(p => p.hutang > 0)
    if (filter === 'lunas')  list = list.filter(p => p.hutang === 0)

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.nama?.toLowerCase().includes(q) ||
        p.no_hp?.toLowerCase().includes(q) ||
        p.alamat?.toLowerCase().includes(q)
      )
    }

    // Sort
    if (sortBy === 'belanja') list.sort((a, b) => b.total_belanja - a.total_belanja)
    if (sortBy === 'hutang')  list.sort((a, b) => b.hutang - a.hutang)
    if (sortBy === 'trx')     list.sort((a, b) => b.jumlah_trx - a.jumlah_trx)
    if (sortBy === 'nama')    list.sort((a, b) => a.nama.localeCompare(b.nama))

    return list
  }, [data, filter, search, sortBy])

  const exportCSV = () => {
    const rows = [
      ['Laporan Pelanggan WarungKu'],
      [`Export: ${new Date().toLocaleDateString('id-ID')}`],
      [],
      ['Nama', 'No HP', 'Alamat', 'Jumlah Transaksi', 'Total Belanja', 'Sisa Hutang', 'Terakhir Belanja'],
      ...filtered.map(p => [
        p.nama, p.no_hp || '-', p.alamat || '-',
        p.jumlah_trx, p.total_belanja, p.hutang,
        fmtTglLen(p.last_trx),
      ]),
    ]
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `laporan-pelanggan-${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  // Avatar inisial
  const avatar = (nama) => {
    const parts = (nama || '?').split(' ')
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (nama[0] || '?').toUpperCase()
  }

  const AVATAR_COLORS = [
    ['#dbeafe','#1d4ed8'], ['#dcfce7','#15803d'], ['#fef3c7','#b45309'],
    ['#fce7f3','#be185d'], ['#ede9fe','#6d28d9'], ['#cffafe','#0e7490'],
  ]
  const avatarColor = (nama) => {
    const idx = (nama?.charCodeAt(0) || 0) % AVATAR_COLORS.length
    return AVATAR_COLORS[idx]
  }

  return (
    <div className="page-content space-y-4 pb-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button onClick={() => history.back()}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="font-extrabold text-gray-900 text-base leading-tight">Laporan Pelanggan</h1>
          <p className="text-xs text-gray-400 mt-0.5">Data pelanggan, hutang & riwayat belanja</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-gray-50 shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {!loading && filtered.length > 0 && (
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-sm">
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="card p-4 border-l-4 border-red-400 bg-red-50 text-xs text-red-700">{error}</div>
      )}

      {/* ── Loading ── */}
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20" /><Skeleton className="h-20" />
            <Skeleton className="h-20" /><Skeleton className="h-20" />
          </div>
          <Skeleton className="h-12" /><Skeleton className="h-12" />
          <Skeleton className="h-72" />
        </div>
      ) : (
        <div className="space-y-4">

          {/* ── Summary 2×2 ── */}
          {summary && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Pelanggan',  value: summary.total_pelanggan,  icon: Users,        color: '#2563eb', bg: '#eff6ff', sub: 'terdaftar' },
                { label: 'Ada Hutang',       value: summary.ada_hutang,       icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb', sub: 'belum lunas' },
                { label: 'Total Hutang',     value: rp(summary.total_hutang), icon: CreditCard,   color: '#ef4444', bg: '#fef2f2', sub: 'beredar' },
                { label: 'Total Belanja',    value: rp(summary.total_belanja),icon: ShoppingBag,  color: '#16a34a', bg: '#f0fdf4', sub: 'semua transaksi' },
              ].map(s => (
                <div key={s.label} className="card p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: s.bg }}>
                      <s.icon size={15} style={{ color: s.color }} />
                    </div>
                    <p className="text-[11px] text-gray-500 leading-tight">{s.label}</p>
                  </div>
                  <p className="font-extrabold text-sm truncate" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Filter hutang status ── */}
          <div className="flex gap-2">
            {[
              { id: 'semua',  label: `Semua (${data.length})` },
              { id: 'hutang', label: `⚠️ Ada Hutang (${data.filter(p => p.hutang > 0).length})` },
              { id: 'lunas',  label: `✅ Lunas (${data.filter(p => p.hutang === 0).length})` },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={[
                  'flex-1 py-2 rounded-xl text-xs font-bold border transition-all leading-tight',
                  filter === f.id ? 'bg-blue-700 text-white border-blue-700 shadow-sm' : 'bg-white text-gray-500 border-gray-200',
                ].join(' ')}>
                {f.label}
              </button>
            ))}
          </div>

          {/* ── Search + Sort ── */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama atau no HP..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 focus:outline-none focus:border-blue-400 cursor-pointer">
              <option value="nama">A–Z</option>
              <option value="belanja">Belanja ↓</option>
              <option value="hutang">Hutang ↓</option>
              <option value="trx">Transaksi ↓</option>
            </select>
          </div>

          {/* ── Daftar pelanggan ── */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-600">
                {filter === 'hutang' ? '⚠️ Pelanggan Ada Hutang'
                 : filter === 'lunas' ? '✅ Pelanggan Lunas'
                 : 'Semua Pelanggan'}
              </p>
              <span className="text-[10px] text-gray-400">{filtered.length} pelanggan</span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-2 text-gray-400">
                <Users className="w-8 h-8 opacity-30" />
                <p className="text-sm">
                  {search ? 'Pelanggan tidak ditemukan' : 'Belum ada pelanggan'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map((p, i) => {
                  const isOpen = expanded === p.id
                  const [bgColor, textColor] = avatarColor(p.nama)
                  const lastBelanja = relativeTime(p.last_trx)

                  return (
                    <div key={p.id}>
                      {/* ── Row utama ── */}
                      <button
                        onClick={() => setExpanded(isOpen ? null : p.id)}
                        className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-gray-50/60 transition-colors">

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-extrabold"
                          style={{ background: bgColor, color: textColor }}>
                          {avatar(p.nama)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-800 truncate">{p.nama}</p>
                            {p.hutang > 0 && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded-full flex-shrink-0">
                                Hutang
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {p.jumlah_trx > 0 && (
                              <span className="text-[10px] text-gray-400">{p.jumlah_trx}× belanja</span>
                            )}
                            {lastBelanja && (
                              <span className="text-[10px] text-gray-400">{lastBelanja}</span>
                            )}
                          </div>
                        </div>

                        {/* Belanja / hutang + chevron */}
                        <div className="text-right flex-shrink-0 flex items-center gap-2">
                          <div>
                            {p.total_belanja > 0 && (
                              <p className="text-xs font-bold text-gray-700">{rp(p.total_belanja)}</p>
                            )}
                            {p.hutang > 0 && (
                              <p className="text-[10px] font-bold text-amber-500">-{rp(p.hutang)}</p>
                            )}
                          </div>
                          {isOpen
                            ? <ChevronUp className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                            : <ChevronDown className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                          }
                        </div>
                      </button>

                      {/* ── Detail expand ── */}
                      {isOpen && (
                        <div className="px-4 pb-4 bg-gray-50/40 border-t border-gray-100">
                          <div className="pt-3 space-y-3">

                            {/* Info kontak */}
                            <div className="grid grid-cols-2 gap-2">
                              {p.no_hp && (
                                <a href={`tel:${p.no_hp}`}
                                  className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                  <Phone className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                  <span className="text-xs text-gray-600 truncate">{p.no_hp}</span>
                                </a>
                              )}
                              {p.alamat && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-100">
                                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                  <span className="text-xs text-gray-600 truncate">{p.alamat}</span>
                                </div>
                              )}
                            </div>

                            {/* Statistik belanja */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-white rounded-xl border border-gray-100 p-2.5 text-center">
                                <ShoppingBag className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                                <p className="text-sm font-extrabold text-blue-600">{p.jumlah_trx}</p>
                                <p className="text-[9px] text-gray-400">Transaksi</p>
                              </div>
                              <div className="bg-white rounded-xl border border-gray-100 p-2.5 text-center">
                                <CreditCard className="w-4 h-4 text-green-500 mx-auto mb-1" />
                                <p className="text-[11px] font-extrabold text-green-600 leading-tight">{rpShort(p.total_belanja)}</p>
                                <p className="text-[9px] text-gray-400">Total Belanja</p>
                              </div>
                              <div className="bg-white rounded-xl border border-gray-100 p-2.5 text-center">
                                {p.hutang > 0
                                  ? <>
                                      <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                                      <p className="text-[11px] font-extrabold text-amber-500 leading-tight">{rpShort(p.hutang)}</p>
                                      <p className="text-[9px] text-gray-400">Hutang</p>
                                    </>
                                  : <>
                                      <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto mb-1" />
                                      <p className="text-sm font-extrabold text-green-500">✓</p>
                                      <p className="text-[9px] text-gray-400">Lunas</p>
                                    </>
                                }
                              </div>
                            </div>

                            {/* Terakhir belanja */}
                            {p.last_trx && (
                              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-100">
                                <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <p className="text-xs text-gray-500">Terakhir belanja: <span className="font-semibold text-gray-700">{fmtTglLen(p.last_trx)}</span></p>
                              </div>
                            )}

                            {/* Link hutang detail */}
                            {p.hutang > 0 && (
                              <a href={`/dashboard/hutang?pelanggan=${p.id}`}
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold rounded-xl transition-colors">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Lihat Detail Hutang →
                              </a>
                            )}

                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  )
}

// Helper
function rpShort(n) {
  n = Number(n || 0)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}rb`
  return String(n)
}
