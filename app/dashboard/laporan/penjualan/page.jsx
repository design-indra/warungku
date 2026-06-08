'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  ShoppingBag, Receipt, TrendingUp, BarChart3,
  Download, Calendar, ChevronDown, ArrowLeft, CreditCard,
} from 'lucide-react'

const rp      = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')
const rpShort = (n) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}jt` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}rb` : String(n)

const COLORS_METODE = ['#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899']
const LABEL_METODE  = { tunai: 'Tunai', qris: 'QRIS', transfer: 'Transfer', hutang: 'Hutang', debit: 'Kartu Debit' }
const BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des']

const fmt8     = (d) => d.toISOString().split('T')[0]
const todayStr = () => fmt8(new Date())
const offsetStr = (days) => { const d = new Date(); d.setDate(d.getDate() - days); return fmt8(d) }
const fmtTgl   = (iso) => { const [, m, d] = iso.split('-'); return `${d} ${BULAN[Number(m) - 1]}` }
const fmtTglPanjang = (iso) => {
  const [y, m, d] = iso.split('-')
  const hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
  const dt = new Date(y, m - 1, d)
  return `${hari[dt.getDay()]}, ${d} ${BULAN[m - 1]} ${y}`
}

const PERIODS = [
  { label: 'Hari Ini',  from: () => todayStr(),                             to: () => todayStr() },
  { label: '7 Hari',    from: () => offsetStr(6),                            to: () => todayStr() },
  { label: '30 Hari',   from: () => offsetStr(29),                           to: () => todayStr() },
  { label: 'Bulan Ini', from: () => new Date().toISOString().slice(0, 7) + '-01', to: () => todayStr() },
]

function GrafikTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-blue-600 font-bold">{rp(payload[0]?.value)}</p>
      {payload[1] && <p className="text-gray-500">{payload[1].value} transaksi</p>}
    </div>
  )
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
      <button
        onClick={() => !disabled && setOpen(v => !v)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:border-blue-300 transition-colors shadow-sm disabled:opacity-50"
      >
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

// ── Skeleton loader ────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function LaporanPenjualanPage() {
  const [period, setPeriod]   = useState(1)
  const [from, setFrom]       = useState(offsetStr(6))
  const [to, setTo]           = useState(todayStr())
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [plan, setPlan]       = useState(null)

  const canFullReport = plan === 'basic' || plan === 'pro'

  // Fetch plan
  useEffect(() => {
    fetch('/api/subscription/status')
      .then(r => r.json())
      .then(j => setPlan(j.plan || 'free'))
      .catch(() => setPlan('free'))
  }, [])

  // Sync period ↔ from/to
  useEffect(() => {
    if (period < 0) return
    const p = PERIODS[period]
    setFrom(p.from()); setTo(p.to())
  }, [period])

  const fetchData = useCallback(async () => {
    if (!plan) return
    setLoading(true)
    try {
      const res  = await fetch(`/api/laporan?from=${from}&to=${to}`)
      const json = await res.json()
      setData(json.data)
    } catch {}
    finally { setLoading(false) }
  }, [from, to, plan])

  useEffect(() => { fetchData() }, [fetchData])

  // Export CSV
  const exportCSV = () => {
    if (!data) return
    const rows = [
      ['Laporan Penjualan WarungKu'],
      [`Periode: ${from} s/d ${to}`],
      [],
      ['RINGKASAN'],
      ['Total Omzet', data.total_omzet],
      ['Total Laba', data.total_laba],
      ['Total Transaksi', data.total_transaksi],
      ['Rata-rata Transaksi', data.rata_rata],
      [],
      ['DETAIL PER HARI'],
      ['Tanggal', 'Omzet', 'Jumlah Transaksi'],
      ...(data.omzet_per_hari || []).map(d => [d.tgl, d.omzet, d.jumlah_trx || 0]),
      [],
      ['METODE PEMBAYARAN'],
      ['Metode', 'Jumlah Transaksi', 'Persen'],
      ...(data.per_metode || []).map(m => [LABEL_METODE[m.metode] || m.metode, m.jumlah, m.persen + '%']),
    ]
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `laporan-penjualan-${from}-${to}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const chartData = (data?.omzet_per_hari || []).map(d => ({
    label: fmtTgl(d.tgl), omzet: d.omzet, trx: d.jumlah_trx || 0,
  }))
  const metodeData = (data?.per_metode || []).map(m => ({
    ...m, nama: LABEL_METODE[m.metode] || m.metode,
  }))

  const stats = [
    { label: 'Total Omzet',       value: rp(data?.total_omzet),       icon: ShoppingBag, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Total Transaksi',   value: data?.total_transaksi ?? 0,   icon: Receipt,     color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Total Laba Kotor',  value: rp(data?.total_laba),         icon: TrendingUp,  color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Rata-rata / Trx',   value: rp(data?.rata_rata),          icon: BarChart3,   color: '#9333ea', bg: '#faf5ff' },
  ]

  // Hitung trend vs kemarin (perbandingan hari pertama vs terakhir pada chart)
  const trend = (() => {
    if (!chartData.length || chartData.length < 2) return null
    const last  = chartData[chartData.length - 1]?.omzet || 0
    const prev  = chartData[chartData.length - 2]?.omzet || 0
    if (!prev) return null
    const pct = Math.round(((last - prev) / prev) * 100)
    return { pct, up: pct >= 0 }
  })()

  return (
    <div className="page-content space-y-4 pb-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button onClick={() => history.back()}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="font-extrabold text-gray-900 text-base leading-tight">Laporan Penjualan</h1>
          <p className="text-xs text-gray-400 mt-0.5">Omzet, transaksi & metode pembayaran</p>
        </div>
        {canFullReport && !loading && data && (
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        )}
      </div>

      {/* ── Upgrade wall ── */}
      {plan === 'free' && (
        <div className="card p-4 flex items-start gap-3 border-l-4 border-amber-400 bg-amber-50">
          <div className="text-2xl">🔒</div>
          <div className="flex-1">
            <p className="font-bold text-amber-800 text-sm">Laporan terbatas — Paket Free</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Hanya data <strong>Hari Ini</strong> yang tersedia. Upgrade ke <strong>Basic</strong> atau <strong>Pro</strong> untuk laporan lengkap & ekspor CSV.
            </p>
            <a href="/dashboard/berlangganan"
              className="inline-block mt-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors">
              Upgrade Sekarang →
            </a>
          </div>
        </div>
      )}

      {/* ── Filter periode ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <DateRangePicker
          from={from} to={to} disabled={!canFullReport}
          onChange={(f, t) => { setFrom(f); setTo(t); setPeriod(-1) }}
        />
      </div>

      {/* ── Period chips ── */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 hide-scrollbar">
        {PERIODS.map((p, i) => {
          const locked = !canFullReport && i > 0
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

      {/* ── Loading skeleton ── */}
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}
          </div>
          <Skeleton className="h-52" />
          <Skeleton className="h-40" />
        </div>
      ) : (
        <div className="space-y-4">

          {/* ── Summary 2×2 ── */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map(s => (
              <div key={s.label} className="card p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: s.bg }}>
                    <s.icon size={15} style={{ color: s.color }} />
                  </div>
                  <p className="text-[11px] text-gray-500 leading-tight">{s.label}</p>
                </div>
                <p className="font-extrabold text-gray-900 text-sm truncate">{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Grafik omzet harian ── */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-900 text-sm">Omzet Harian</h3>
              {trend && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trend.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                  {trend.up ? '↑' : '↓'} {Math.abs(trend.pct)}% vs kemarin
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mb-4">Total omzet per hari pada periode ini</p>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={rpShort} width={38} />
                  <Tooltip content={<GrafikTooltip />} />
                  <Line type="monotone" dataKey="omzet" stroke="#2563eb" strokeWidth={2.5}
                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#2563eb' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
                <ShoppingBag className="w-8 h-8 opacity-30" />
                <p className="text-sm">Belum ada transaksi pada periode ini</p>
              </div>
            )}
          </div>

          {/* ── Tabel detail per hari ── */}
          {(data?.omzet_per_hari?.length > 0) && (
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-700">Detail Per Hari</p>
                <p className="text-[10px] text-gray-400">{data.omzet_per_hari.length} hari</p>
              </div>
              <div className="divide-y divide-gray-50">
                {[...(data.omzet_per_hari || [])].reverse().map((d, i) => {
                  const isToday = d.tgl === todayStr()
                  return (
                    <div key={i} className="flex items-center justify-between px-4 py-3.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-800">{fmtTglPanjang(d.tgl)}</p>
                          {isToday && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">Hari Ini</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{d.jumlah_trx || 0} transaksi</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600 text-sm">{rp(d.omzet)}</p>
                        {d.jumlah_trx > 0 && (
                          <p className="text-[10px] text-gray-400">avg {rp(Math.round(d.omzet / d.jumlah_trx))}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Metode pembayaran ── */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <p className="font-bold text-gray-900 text-sm">Metode Pembayaran</p>
            </div>

            {metodeData.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">Belum ada data</p>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0" style={{ width: 110, height: 110 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={metodeData.map(d => ({ ...d, value: d.persen }))}
                        dataKey="value" cx="50%" cy="50%"
                        innerRadius={30} outerRadius={50} paddingAngle={2} startAngle={90} endAngle={-270}>
                        {metodeData.map((_, i) => (
                          <Cell key={i} fill={COLORS_METODE[i % COLORS_METODE.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  {metodeData.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: COLORS_METODE[i % COLORS_METODE.length] }} />
                      <span className="text-xs text-gray-600 flex-1 truncate">{m.nama}</span>
                      <span className="text-xs font-bold text-gray-800">{m.jumlah}×</span>
                      <span className="text-xs text-gray-400 w-8 text-right">{m.persen}%</span>
                    </div>
                  ))}
                </div>
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
