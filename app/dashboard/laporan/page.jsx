'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Icon from '@/components/Icon'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  ShoppingBag, Receipt, TrendingUp, Users, BarChart3,
  Package, Wallet, Archive, ChevronRight, Download,
  Calendar, ChevronDown,
} from 'lucide-react'

const rp      = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')
const rpShort = (n) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}jt` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}rb` : String(n)

// ─── Warna donut ───────────────────────────────────────────────
const COLORS_KAT    = ['#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#6b7280', '#ec4899', '#06b6d4']
const COLORS_METODE = ['#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899']

const LABEL_METODE = {
  tunai:    'Tunai',
  qris:     'QRIS',
  transfer: 'Transfer',
  hutang:   'Hutang',
  debit:    'Kartu Debit',
}

// ─── Date helpers ──────────────────────────────────────────────
const fmt8 = (d) => d.toISOString().split('T')[0]
const todayStr = () => fmt8(new Date())
const offsetStr = (days) => { const d = new Date(); d.setDate(d.getDate() - days); return fmt8(d) }

const PERIODS = [
  { label: 'Hari Ini',  from: () => todayStr(),                                        to: () => todayStr() },
  { label: '7 Hari',    from: () => offsetStr(6),                                       to: () => todayStr() },
  { label: '30 Hari',   from: () => offsetStr(29),                                      to: () => todayStr() },
  { label: 'Bulan Ini', from: () => new Date().toISOString().slice(0, 7) + '-01',       to: () => todayStr() },
]

// ─── Format label bulan lokal ──────────────────────────────────
const BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des']
const fmtTgl = (iso) => {
  const [, m, d] = iso.split('-')
  return `${d} ${BULAN[Number(m) - 1]}`
}

// ─── Custom Tooltip Grafik ─────────────────────────────────────
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

// ─── Donut Chart ───────────────────────────────────────────────
function DonutChart({ data, colors, labelKey = 'nama', valueKey = 'persen', title }) {
  const chartData = data.map((d) => ({ ...d, value: d[valueKey] }))
  return (
    <div>
      <p className="font-bold text-gray-900 text-sm mb-3">{title}</p>
      {data.length === 0 ? (
        <p className="text-center text-xs text-gray-400 py-6">Belum ada data</p>
      ) : (
        <div className="flex items-center gap-3">
          {/* Pie */}
          <div className="flex-shrink-0" style={{ width: 100, height: 100 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={46}
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex-1 space-y-1.5 min-w-0">
            {data.map((d, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: colors[i % colors.length] }} />
                  <span className="text-xs text-gray-600 truncate">{d[labelKey]}</span>
                </div>
                <span className="text-xs font-bold text-gray-800 flex-shrink-0">{d[valueKey]}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab laporan lainnya ───────────────────────────────────────
const SUB_LAPORAN = [
  { label: 'Laporan Penjualan', icon: ShoppingBag,  color: '#2563eb', bg: '#eff6ff', href: '#' },
  { label: 'Laporan Produk',    icon: Package,       color: '#16a34a', bg: '#f0fdf4', href: '#' },
  { label: 'Laporan Stok',      icon: Archive,       color: '#f59e0b', bg: '#fffbeb', href: '#' },
  { label: 'Laporan Kas',       icon: Wallet,        color: '#9333ea', bg: '#faf5ff', href: '#' },
  { label: 'Laporan Pelanggan', icon: Users,         color: '#ec4899', bg: '#fdf2f8', href: '#' },
]

// ─── Date Picker sederhana ─────────────────────────────────────
function DateRangePicker({ from, to, onChange }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({ from, to })
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const apply = () => {
    onChange(draft.from, draft.to)
    setOpen(false)
  }

  const fmtRange = (f, t) => {
    const fmt = (s) => {
      const [, m, d] = s.split('-')
      return `${d} ${BULAN[Number(m) - 1]}`
    }
    return f === t ? fmt(f) : `${fmt(f)} – ${fmt(t)}`
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:border-blue-300 transition-colors shadow-sm"
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
          <button onClick={apply}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors">
            Terapkan
          </button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function LaporanPage() {
  const [period, setPeriod]   = useState(1)          // index PERIODS
  const [from, setFrom]       = useState(offsetStr(6))
  const [to, setTo]           = useState(todayStr())
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [plan, setPlan]       = useState(null)
  const [activeTab, setActiveTab] = useState('ringkasan')
  const [chartMode, setChartMode] = useState('harian') // 'harian' | 'mingguan'

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
    const p = PERIODS[period]
    setFrom(p.from())
    setTo(p.to())
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
      ['Laporan Warungku', '', ''],
      [`Periode: ${from} s/d ${to}`, '', ''],
      ['', '', ''],
      ['RINGKASAN', '', ''],
      ['Total Omzet', data.total_omzet, ''],
      ['Total Laba', data.total_laba, ''],
      ['Total Transaksi', data.total_transaksi, ''],
      ['Total Qty Terjual', data.total_qty, ''],
      ['Rata-rata Transaksi', data.rata_rata, ''],
      ['', '', ''],
      ['BARANG TERLARIS', '', ''],
      ['No', 'Nama Barang', 'Qty'],
      ...(data.top_barang || []).map((b, i) => [i + 1, b.nama, b.qty]),
      ['', '', ''],
      ['OMZET PER HARI', '', ''],
      ['Tanggal', 'Omzet', 'Jumlah Transaksi'],
      ...(data.omzet_per_hari || []).map(d => [d.tgl, d.omzet, d.jumlah_trx || 0]),
      ['', '', ''],
      ['PENJUALAN PER KATEGORI', '', ''],
      ['Kategori', 'Omzet', 'Persen'],
      ...(data.per_kategori || []).map(k => [k.nama, k.omzet, k.persen + '%']),
      ['', '', ''],
      ['METODE PEMBAYARAN', '', ''],
      ['Metode', 'Jumlah Transaksi', 'Persen'],
      ...(data.per_metode || []).map(m => [LABEL_METODE[m.metode] || m.metode, m.jumlah, m.persen + '%']),
    ]
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `laporan-warungku-${from}-${to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Chart data
  const chartData = (data?.omzet_per_hari || []).map(d => ({
    label: fmtTgl(d.tgl),
    omzet: d.omzet,
    trx:   d.jumlah_trx || 0,
  }))

  // Donut data metode — label friendly
  const metodeData = (data?.per_metode || []).map(m => ({
    ...m,
    nama: LABEL_METODE[m.metode] || m.metode,
  }))

  // ─── Stat cards ─────────────────────────────────────────────
  const stats = [
    {
      label: 'Total Penjualan', value: rp(data?.total_omzet),
      sub: 'Omzet periode ini', icon: ShoppingBag, color: '#2563eb', bg: '#eff6ff',
    },
    {
      label: 'Total Transaksi', value: data?.total_transaksi ?? 0,
      sub: 'Jumlah transaksi', icon: Receipt, color: '#16a34a', bg: '#f0fdf4',
    },
    {
      label: 'Total Laba Kotor', value: rp(data?.total_laba),
      sub: 'Estimasi laba', icon: TrendingUp, color: '#f59e0b', bg: '#fffbeb',
    },
    {
      label: 'Rata-rata Transaksi', value: rp(data?.rata_rata),
      sub: 'Per transaksi', icon: BarChart3, color: '#9333ea', bg: '#faf5ff',
    },
  ]

  const TABS = [
    { id: 'ringkasan', label: 'Ringkasan', icon: BarChart3 },
    { id: 'penjualan', label: 'Penjualan', icon: ShoppingBag },
    { id: 'produk',    label: 'Produk',    icon: Package },
  ]

  return (
    <div className="page-content space-y-4 pb-6">

      {/* ── Upgrade wall free ────────────────────────────── */}
      {plan === 'free' && (
        <div className="card p-4 flex items-start gap-3 border-l-4 border-amber-400 bg-amber-50">
          <div className="text-2xl">🔒</div>
          <div className="flex-1">
            <p className="font-bold text-amber-800 text-sm">Laporan terbatas — Paket Free</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Hanya laporan <strong>Hari Ini</strong> yang tersedia. Upgrade ke <strong>Basic</strong> atau <strong>Pro</strong> untuk laporan lengkap & ekspor CSV.
            </p>
            <a href="/dashboard/berlangganan"
              className="inline-block mt-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors">
              Upgrade Sekarang →
            </a>
          </div>
        </div>
      )}

      {/* ── Header: Date picker + Filter ─────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <DateRangePicker
          from={from}
          to={to}
          onChange={(f, t) => {
            if (!canFullReport) return
            setFrom(f); setTo(t); setPeriod(-1) // -1 = custom
          }}
        />
        <div className="flex-1" />
        {canFullReport && !loading && data && (
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        )}
      </div>

      {/* ── Period chips ──────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 hide-scrollbar">
        {PERIODS.map((p, i) => {
          const locked = !canFullReport && i > 0
          return (
            <button
              key={p.label}
              onClick={() => { if (!locked) setPeriod(i) }}
              disabled={locked}
              className={[
                'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                locked
                  ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                  : period === i
                    ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300',
              ].join(' ')}
            >
              {locked ? `🔒 ${p.label}` : p.label}
            </button>
          )
        })}
      </div>

      {/* ── Tab navigasi laporan ───────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 hide-scrollbar">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={[
              'flex items-center gap-1.5 flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-all',
              activeTab === t.id
                ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300',
            ].join(' ')}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════
          LOADING
      ═══════════════════════════════════════════════════ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Memuat laporan...</p>
        </div>
      ) : (

      /* ═══════════════════════════════════════════════════
         TAB: RINGKASAN
      ═══════════════════════════════════════════════════ */
      activeTab === 'ringkasan' ? (
        <div className="space-y-4">

          {/* Ringkasan Periode label */}
          <h3 className="text-sm font-bold text-gray-800">Ringkasan Periode</h3>

          {/* Stat cards 2×2 */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map(s => (
              <div key={s.label} className="card p-3.5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                  <s.icon size={16} style={{ color: s.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 leading-tight">{s.label}</p>
                  <p className="font-extrabold text-gray-900 text-sm mt-0.5 leading-tight truncate">{s.value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Grafik penjualan */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm">Grafik Penjualan</h3>
              <div className="flex gap-1">
                {['harian'].map(m => (
                  <button key={m} onClick={() => setChartMode(m)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-colors capitalize ${chartMode === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-200'}`}>
                    Per Hari
                  </button>
                ))}
              </div>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => rpShort(v)}
                    width={36}
                  />
                  <Tooltip content={<GrafikTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="omzet"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                Belum ada transaksi pada periode ini
              </div>
            )}
          </div>

          {/* Donut charts: per kategori + per metode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="card p-4">
              <DonutChart
                data={data?.per_kategori || []}
                colors={COLORS_KAT}
                title="Penjualan per Kategori"
              />
            </div>
            <div className="card p-4">
              <DonutChart
                data={metodeData}
                colors={COLORS_METODE}
                title="Metode Pembayaran"
              />
            </div>
          </div>

          {/* Laporan Lainnya */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Laporan Lainnya</h3>
            <div className="grid grid-cols-1 gap-2">
              {SUB_LAPORAN.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  className="card px-4 py-3 flex items-center gap-3 hover:border-blue-200 hover:bg-blue-50/40 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                    <s.icon size={16} style={{ color: s.color }} />
                  </div>
                  <span className="flex-1 font-semibold text-gray-800 text-sm">{s.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>

      /* ═══════════════════════════════════════════════════
         TAB: PENJUALAN
      ═══════════════════════════════════════════════════ */
      ) : activeTab === 'penjualan' ? (
        <div className="space-y-4">
          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total Omzet',     value: rp(data?.total_omzet),     color: '#2563eb', bg: '#eff6ff' },
              { label: 'Transaksi',        value: data?.total_transaksi ?? 0, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Avg / Transaksi', value: rp(data?.rata_rata),        color: '#9333ea', bg: '#faf5ff' },
            ].map(s => (
              <div key={s.label} className="card p-3 text-center">
                <p className="text-[10px] text-gray-500">{s.label}</p>
                <p className="font-extrabold text-sm mt-0.5 truncate" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Grafik */}
          <div className="card p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Grafik Omzet Harian</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={rpShort} width={36} />
                  <Tooltip content={<GrafikTooltip />} />
                  <Line type="monotone" dataKey="omzet" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-gray-400 py-10">Belum ada data</p>
            )}
          </div>

          {/* Tabel omzet per hari */}
          {chartData.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Detail Per Hari</p>
              </div>
              <div className="divide-y divide-gray-50">
                {(data?.omzet_per_hari || []).map((d, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{fmtTgl(d.tgl)}</p>
                      <p className="text-xs text-gray-400">{d.jumlah_trx || 0} transaksi</p>
                    </div>
                    <p className="font-bold text-blue-600 text-sm">{rp(d.omzet)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metode pembayaran */}
          <div className="card p-4">
            <DonutChart
              data={metodeData}
              colors={COLORS_METODE}
              title="Metode Pembayaran"
            />
          </div>
        </div>

      /* ═══════════════════════════════════════════════════
         TAB: PRODUK
      ═══════════════════════════════════════════════════ */
      ) : activeTab === 'produk' ? (
        <div className="space-y-4">
          {/* Summary strip */}
          <div className="grid grid-cols-2 gap-2">
            <div className="card p-3 text-center">
              <p className="text-[10px] text-gray-500">Total Item Terjual</p>
              <p className="font-extrabold text-lg text-blue-600 mt-0.5">{data?.total_qty ?? 0}</p>
              <p className="text-[10px] text-gray-400">pcs</p>
            </div>
            <div className="card p-3 text-center">
              <p className="text-[10px] text-gray-500">Jenis Produk Terjual</p>
              <p className="font-extrabold text-lg text-green-600 mt-0.5">{data?.top_barang?.length ?? 0}</p>
              <p className="text-[10px] text-gray-400">produk berbeda</p>
            </div>
          </div>

          {/* Penjualan per kategori */}
          <div className="card p-4">
            <DonutChart
              data={data?.per_kategori || []}
              colors={COLORS_KAT}
              title="Penjualan per Kategori"
            />
          </div>

          {/* Barang terlaris */}
          <div className="card overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
              <span className="text-base">🏆</span>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Barang Terlaris</p>
            </div>
            {(data?.top_barang?.length ?? 0) === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">Belum ada data penjualan</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {(data?.top_barang || []).map((b, i) => {
                  const pct = data.top_barang[0]?.qty ? Math.round((b.qty / data.top_barang[0].qty) * 100) : 0
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      {/* Rank badge */}
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                        style={{
                          background: i === 0 ? '#fef3c7' : i === 1 ? '#f1f5f9' : i === 2 ? '#fff7ed' : '#f9fafb',
                          color: i === 0 ? '#d97706' : i === 1 ? '#64748b' : i === 2 ? '#ea580c' : '#9ca3af',
                        }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{b.nama}</p>
                        {/* Progress bar */}
                        <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: COLORS_KAT[i % COLORS_KAT.length] }}
                          />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">{b.qty} <span className="text-xs font-normal text-gray-400">pcs</span></p>
                        {b.omzet > 0 && <p className="text-xs text-blue-600">{rp(b.omzet)}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : null
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
