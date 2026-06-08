'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Wallet, TrendingUp, TrendingDown, ArrowLeft,
  Calendar, ChevronDown, Download, RefreshCw, AlertCircle,
  ArrowUpCircle, ArrowDownCircle, MinusCircle,
} from 'lucide-react'

const rp      = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')
const rpShort = (n) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}jt` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}rb` : String(n)

const BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des']
const fmt8      = (d) => d.toISOString().split('T')[0]
const todayStr  = () => fmt8(new Date())
const offsetStr = (days) => { const d = new Date(); d.setDate(d.getDate() - days); return fmt8(d) }
const fmtTgl    = (iso) => { const [, m, d] = iso.split('-'); return `${d} ${BULAN[Number(m) - 1]}` }
const fmtTglLen = (isoFull) => {
  const [dt] = isoFull.split('T')
  const [, m, d] = dt.split('-')
  const time = isoFull.split('T')[1]?.slice(0, 5) || ''
  return `${d} ${BULAN[Number(m) - 1]}${time ? ' · ' + time : ''}`
}

const PERIODS = [
  { label: 'Hari Ini',  from: () => todayStr(),                                  to: () => todayStr() },
  { label: '7 Hari',    from: () => offsetStr(6),                                 to: () => todayStr() },
  { label: '30 Hari',   from: () => offsetStr(29),                                to: () => todayStr() },
  { label: 'Bulan Ini', from: () => new Date().toISOString().slice(0, 7) + '-01', to: () => todayStr() },
]

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
}

function DateRangePicker({ from, to, onChange, disabled }) {
  const [open, setOpen]   = useState(false)
  const [draft, setDraft] = useState({ from, to })
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const fmtRange = (f, t) => {
    const fmt = (s) => { const [, m, d] = s.split('-'); return `${d} ${BULAN[Number(m) - 1]}` }
    return f === t ? fmt(f) : `${fmt(f)} – ${fmt(t)}`
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => !disabled && setOpen(v => !v)} disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:border-blue-300 transition-colors shadow-sm disabled:opacity-50">
        <Calendar className="w-3.5 h-3.5 text-blue-500" />
        {fmtRange(from, to)}
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 w-64">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Pilih Rentang Tanggal</p>
          <div className="space-y-2 mb-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Dari</label>
              <input type="date" value={draft.from}
                onChange={e => setDraft(d => ({ ...d, from: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Sampai</label>
              <input type="date" value={draft.to}
                onChange={e => setDraft(d => ({ ...d, to: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>
          <button onClick={() => { onChange(draft.from, draft.to); setOpen(false) }}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors">
            Terapkan
          </button>
        </div>
      )}
    </div>
  )
}

function KasTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-bold">{p.name}: {rp(p.value)}</p>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function LaporanKasPage() {
  const [period, setPeriod]   = useState(1)
  const [from, setFrom]       = useState(offsetStr(6))
  const [to, setTo]           = useState(todayStr())
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [jenisFilter, setJenisFilter] = useState('semua')

  useEffect(() => {
    if (period < 0) return
    const p = PERIODS[period]
    setFrom(p.from()); setTo(p.to())
  }, [period])

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res  = await fetch(`/api/laporan/kas?from=${from}&to=${to}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json.data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [from, to])

  useEffect(() => { fetchData() }, [fetchData])

  const exportCSV = () => {
    if (!data) return
    const rows = [
      ['Laporan Kas WarungKu'],
      [`Periode: ${from} s/d ${to}`],
      [],
      ['RINGKASAN'],
      ['Total Masuk',  data.total_masuk],
      ['Total Keluar', data.total_keluar],
      ['Total Hutang', data.total_hutang],
      ['Saldo Akhir',  data.saldo_akhir],
      [],
      ['RIWAYAT'],
      ['Tanggal', 'Keterangan', 'Jenis', 'Kategori', 'Jumlah'],
      ...(data.riwayat || []).map(r => [r.tanggal, r.keterangan, r.jenis, r.kategori, r.jumlah]),
    ]
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `laporan-kas-${from}-${to}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const isPaid = data?.is_paid ?? false
  const chartData = (data?.per_hari || []).map(d => ({
    label: fmtTgl(d.tgl), masuk: d.masuk, keluar: d.keluar, net: d.net,
  }))

  const riwayatFiltered = (data?.riwayat || []).filter(r =>
    jenisFilter === 'semua' ? true : r.jenis === jenisFilter
  )

  function JenisBadge({ jenis }) {
    if (jenis === 'masuk')  return (
      <div className="flex items-center gap-1">
        <ArrowUpCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
        <span className="text-[9px] font-bold text-green-600">Masuk</span>
      </div>
    )
    if (jenis === 'keluar') return (
      <div className="flex items-center gap-1">
        <ArrowDownCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
        <span className="text-[9px] font-bold text-red-500">Keluar</span>
      </div>
    )
    return (
      <div className="flex items-center gap-1">
        <MinusCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <span className="text-[9px] font-bold text-amber-600">Hutang</span>
      </div>
    )
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
          <h1 className="font-extrabold text-gray-900 text-base leading-tight">Laporan Kas</h1>
          <p className="text-xs text-gray-400 mt-0.5">Aliran uang masuk & keluar warung</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-gray-50 shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {!loading && data && (
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-sm">
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          )}
        </div>
      </div>

      {/* ── Upgrade wall ── */}
      {!isPaid && !loading && (
        <div className="card p-4 flex items-start gap-3 border-l-4 border-amber-400 bg-amber-50">
          <div className="text-2xl">🔒</div>
          <div className="flex-1">
            <p className="font-bold text-amber-800 text-sm">Data terbatas — Hari Ini</p>
            <p className="text-xs text-amber-700 mt-0.5">Upgrade untuk melihat riwayat kas lengkap.</p>
            <a href="/dashboard/berlangganan"
              className="inline-block mt-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg">
              Upgrade Sekarang →
            </a>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="card p-4 border-l-4 border-red-400 bg-red-50 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* ── Filter ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <DateRangePicker from={from} to={to} disabled={!isPaid && !loading}
          onChange={(f, t) => { setFrom(f); setTo(t); setPeriod(-1) }} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0.5 hide-scrollbar">
        {PERIODS.map((p, i) => {
          const locked = !isPaid && i > 0
          return (
            <button key={p.label} onClick={() => !locked && setPeriod(i)} disabled={locked}
              className={[
                'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                locked ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                       : period === i ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                                      : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300',
              ].join(' ')}>
              {locked ? `🔒 ${p.label}` : p.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
          <Skeleton className="h-52" />
          <Skeleton className="h-64" />
        </div>
      ) : data && (
        <div className="space-y-4">

          {/* ── Summary cards ── */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Masuk',   value: rp(data.total_masuk),  icon: TrendingUp,   color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Total Keluar',  value: rp(data.total_keluar), icon: TrendingDown, color: '#ef4444', bg: '#fef2f2' },
              { label: 'Total Hutang',  value: rp(data.total_hutang), icon: MinusCircle,  color: '#f59e0b', bg: '#fffbeb' },
              {
                label: 'Saldo Bersih',
                value: rp(data.saldo_akhir),
                icon: Wallet,
                color: data.saldo_akhir >= 0 ? '#2563eb' : '#ef4444',
                bg:    data.saldo_akhir >= 0 ? '#eff6ff' : '#fef2f2',
              },
            ].map(s => (
              <div key={s.label} className="card p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: s.bg }}>
                    <s.icon size={15} style={{ color: s.color }} />
                  </div>
                  <p className="text-[11px] text-gray-500">{s.label}</p>
                </div>
                <p className="font-extrabold text-sm truncate" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Grafik area ── */}
          {chartData.length > 1 && (
            <div className="card p-4">
              <p className="font-bold text-gray-900 text-sm mb-1">Aliran Kas Harian</p>
              <p className="text-[10px] text-gray-400 mb-4">Perbandingan masuk vs keluar per hari</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradMasuk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradKeluar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={rpShort} width={38} />
                  <Tooltip content={<KasTooltip />} />
                  <Area type="monotone" dataKey="masuk"  name="Masuk"  stroke="#22c55e" strokeWidth={2} fill="url(#gradMasuk)" />
                  <Area type="monotone" dataKey="keluar" name="Keluar" stroke="#ef4444" strokeWidth={2} fill="url(#gradKeluar)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Riwayat kas ── */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <p className="text-xs font-bold text-gray-700">Riwayat Kas</p>
              <div className="flex gap-1">
                {['semua', 'masuk', 'keluar', 'hutang'].map(j => (
                  <button key={j} onClick={() => setJenisFilter(j)}
                    className={[
                      'px-2.5 py-1 text-[9px] font-bold rounded-lg border capitalize transition-colors',
                      jenisFilter === j ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-400 border-gray-200',
                    ].join(' ')}>
                    {j === 'semua' ? 'Semua' : j.charAt(0).toUpperCase() + j.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {riwayatFiltered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
                <Wallet className="w-8 h-8 opacity-30" />
                <p className="text-sm">Belum ada riwayat kas</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {riwayatFiltered.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3.5 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icon jenis */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        r.jenis === 'masuk' ? 'bg-green-50' : r.jenis === 'keluar' ? 'bg-red-50' : 'bg-amber-50'
                      }`}>
                        {r.jenis === 'masuk'  ? <ArrowUpCircle className="w-4 h-4 text-green-500" /> :
                         r.jenis === 'keluar' ? <ArrowDownCircle className="w-4 h-4 text-red-400" /> :
                                                <MinusCircle className="w-4 h-4 text-amber-500" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{r.keterangan}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-gray-400">{fmtTglLen(r.tanggal)}</p>
                          {r.kategori && r.kategori !== 'Penjualan' && (
                            <>
                              <span className="text-gray-200">·</span>
                              <p className="text-[10px] text-gray-400">{r.kategori}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className={`font-bold text-sm flex-shrink-0 ${
                      r.jenis === 'masuk' ? 'text-green-600' : r.jenis === 'keluar' ? 'text-red-500' : 'text-amber-500'
                    }`}>
                      {r.jenis === 'masuk' ? '+' : r.jenis === 'keluar' ? '-' : '~'}{rp(r.jumlah)}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
