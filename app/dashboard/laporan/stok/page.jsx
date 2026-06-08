'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Archive, AlertTriangle, Package, Search, Download,
  ArrowLeft, CheckCircle, XCircle, AlertCircle, RefreshCw,
} from 'lucide-react'

const rp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
}

const FILTER_TABS = [
  { id: 'semua',  label: 'Semua',    icon: Package,       color: '#6b7280', bg: '#f9fafb' },
  { id: 'kritis', label: '⚠️ Kritis', icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb' },
  { id: 'habis',  label: '❌ Habis',  icon: XCircle,       color: '#ef4444', bg: '#fef2f2' },
]

function StatusBadge({ status }) {
  if (status === 'habis')  return <span className="text-[9px] font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded-full">Habis</span>
  if (status === 'kritis') return <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full">Kritis</span>
  return <span className="text-[9px] font-bold px-2 py-0.5 bg-green-100 text-green-600 rounded-full">Aman</span>
}

function StokBar({ stok, minimum }) {
  if (stok === 0) return (
    <div className="h-1.5 bg-red-100 rounded-full overflow-hidden">
      <div className="h-full w-full bg-red-400 rounded-full" />
    </div>
  )
  const target = Math.max(minimum * 3, 10)
  const pct    = Math.min(Math.round((stok / target) * 100), 100)
  const color  = stok <= minimum ? '#f59e0b' : '#22c55e'
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function LaporanStokPage() {
  const [filter, setFilter]   = useState('semua')
  const [search, setSearch]   = useState('')
  const [data, setData]       = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res  = await fetch(`/api/laporan/stok?filter=${filter}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json.data || [])
      setSummary(json.summary || null)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { fetchData() }, [fetchData])

  // Client-side search
  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(b =>
      b.nama?.toLowerCase().includes(q) ||
      b.kode?.toLowerCase().includes(q) ||
      b.kategori?.nama?.toLowerCase().includes(q)
    )
  }, [data, search])

  // Export CSV
  const exportCSV = () => {
    const rows = [
      ['Laporan Stok WarungKu'],
      [`Filter: ${filter} | Export: ${new Date().toLocaleDateString('id-ID')}`],
      [],
      ['Kode', 'Nama Produk', 'Kategori', 'Stok', 'Stok Minimum', 'Status', 'Nilai Stok (HPP)'],
      ...filtered.map(b => [
        b.kode || '-',
        b.nama,
        b.kategori?.nama || 'Lainnya',
        b.stok,
        b.stok_minimum,
        b.status,
        b.stok * (b.harga_beli || 0),
      ]),
    ]
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `laporan-stok-${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
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
          <h1 className="font-extrabold text-gray-900 text-base leading-tight">Laporan Stok</h1>
          <p className="text-xs text-gray-400 mt-0.5">Status & kondisi stok semua produk</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {!loading && filtered.length > 0 && (
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm">
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="card p-4 border-l-4 border-red-400 bg-red-50 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
          <Skeleton className="h-12" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="space-y-4">

          {/* ── Summary cards ── */}
          {summary && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total SKU',    value: summary.total_sku,    icon: Package,       color: '#2563eb', bg: '#eff6ff',
                  sub: 'produk aktif' },
                { label: 'Stok Aman',    value: summary.total_aman,   icon: CheckCircle,   color: '#16a34a', bg: '#f0fdf4',
                  sub: 'di atas minimum' },
                { label: 'Stok Kritis',  value: summary.total_kritis, icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb',
                  sub: 'perlu restok' },
                { label: 'Stok Habis',   value: summary.total_habis,  icon: XCircle,       color: '#ef4444', bg: '#fef2f2',
                  sub: 'segera restok' },
              ].map(s => (
                <div key={s.label} className={`card p-3.5 ${s.label === 'Stok Kritis' && summary.total_kritis > 0 ? 'border-amber-200 bg-amber-50/30' : ''} ${s.label === 'Stok Habis' && summary.total_habis > 0 ? 'border-red-200 bg-red-50/30' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: s.bg }}>
                      <s.icon size={15} style={{ color: s.color }} />
                    </div>
                    <p className="text-[11px] text-gray-500">{s.label}</p>
                  </div>
                  <p className="font-extrabold text-lg leading-none" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
          )}

          {/* Nilai stok banner */}
          {summary && summary.nilai_stok > 0 && (
            <div className="card p-3.5 flex items-center gap-3 bg-blue-50/50">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Archive className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Estimasi Nilai Total Stok</p>
                <p className="font-extrabold text-blue-700 text-sm">{rp(summary.nilai_stok)}</p>
                <p className="text-[10px] text-gray-400">Berdasarkan harga beli (HPP)</p>
              </div>
            </div>
          )}

          {/* ── Filter tabs ── */}
          <div className="flex gap-2">
            {FILTER_TABS.map(t => {
              const count = t.id === 'kritis' ? summary?.total_kritis : t.id === 'habis' ? summary?.total_habis : summary?.total_sku
              return (
                <button key={t.id} onClick={() => setFilter(t.id)}
                  className={[
                    'flex-1 py-2 rounded-xl text-xs font-bold border transition-all',
                    filter === t.id ? 'bg-blue-700 text-white border-blue-700 shadow-sm' : 'bg-white text-gray-500 border-gray-200',
                  ].join(' ')}>
                  {t.label}
                  {count !== undefined && (
                    <span className={`ml-1 text-[9px] font-extrabold ${filter === t.id ? 'opacity-70' : 'text-gray-400'}`}>
                      ({count})
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Search ── */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama produk atau kode..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                ✕
              </button>
            )}
          </div>

          {/* ── Tabel stok ── */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <p className="text-xs font-bold text-gray-600">
                {filter === 'semua' ? 'Semua Produk' : filter === 'kritis' ? '⚠️ Stok Kritis' : '❌ Stok Habis'}
              </p>
              <span className="text-[10px] text-gray-400">{filtered.length} produk</span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-2 text-gray-400">
                <Package className="w-8 h-8 opacity-30" />
                <p className="text-sm">
                  {filter === 'kritis' ? 'Tidak ada produk stok kritis 👍'
                   : filter === 'habis' ? 'Tidak ada produk yang habis 👍'
                   : search ? 'Produk tidak ditemukan'
                   : 'Belum ada produk'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map((b, i) => (
                  <div key={i} className="px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      {/* Info produk */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-800 truncate">{b.nama}</p>
                          <StatusBadge status={b.status} />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {b.kode && <p className="text-[10px] text-gray-400">{b.kode}</p>}
                          {b.kode && b.kategori?.nama && <span className="text-gray-200">·</span>}
                          {b.kategori?.nama && <p className="text-[10px] text-gray-400">{b.kategori.nama}</p>}
                        </div>
                      </div>
                      {/* Stok */}
                      <div className="text-right flex-shrink-0">
                        <p className={`text-base font-extrabold leading-none ${
                          b.stok === 0 ? 'text-red-500'
                          : b.status === 'kritis' ? 'text-amber-500'
                          : 'text-gray-900'
                        }`}>
                          {b.stok}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{b.satuan || 'pcs'}</p>
                        <p className="text-[10px] text-gray-300">min. {b.stok_minimum}</p>
                      </div>
                    </div>
                    <StokBar stok={b.stok} minimum={b.stok_minimum} />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  )
}
