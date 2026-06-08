'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import {
  Package, Trophy, Download, Calendar, ChevronDown,
  ArrowLeft, Tag, ShoppingBag,
} from 'lucide-react'

const rp      = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')
const rpShort = (n) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}jt` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}rb` : String(n)

const COLORS_KAT = ['#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#6b7280', '#ec4899', '#06b6d4']

const BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des']
const fmt8      = (d) => d.toISOString().split('T')[0]
const todayStr  = () => fmt8(new Date())
const offsetStr = (days) => { const d = new Date(); d.setDate(d.getDate() - days); return fmt8(d) }

const PERIODS = [
  { label: 'Hari Ini',  from: () => todayStr(),                                  to: () => todayStr() },
  { label: '7 Hari',    from: () => offsetStr(6),                                 to: () => todayStr() },
  { label: '30 Hari',   from: () => offsetStr(29),                                to: () => todayStr() },
  { label: 'Bulan Ini', from: () => new Date().toISOString().slice(0, 7) + '-01', to: () => todayStr() },
]

const RANK_STYLE = [
  { bg: '#fef3c7', color: '#d97706', emoji: '🥇' },
  { bg: '#f1f5f9', color: '#64748b', emoji: '🥈' },
  { bg: '#fff7ed', color: '#ea580c', emoji: '🥉' },
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

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function LaporanProdukPage() {
  const [period, setPeriod]   = useState(1)
  const [from, setFrom]       = useState(offsetStr(6))
  const [to, setTo]           = useState(todayStr())
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [plan, setPlan]       = useState(null)
  const [viewMode, setViewMode] = useState('ranking') // 'ranking' | 'kategori'

  const canFullReport = plan === 'basic' || plan === 'pro'

  useEffect(() => {
    fetch('/api/subscription/status')
      .then(r => r.json())
      .then(j => setPlan(j.plan || 'free'))
      .catch(() => setPlan('free'))
  }, [])

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
      ['Laporan Produk WarungKu'],
      [`Periode: ${from} s/d ${to}`],
      [],
      ['RANKING PRODUK TERLARIS'],
      ['No', 'Nama Produk', 'Qty Terjual', 'Omzet'],
      ...(data.top_barang || []).map((b, i) => [i + 1, b.nama, b.qty, b.omzet]),
      [],
      ['PER KATEGORI'],
      ['Kategori', 'Omzet', 'Persen'],
      ...(data.per_kategori || []).map(k => [k.nama, k.omzet, k.persen + '%']),
    ]
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `laporan-produk-${from}-${to}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const topBarang    = data?.top_barang || []
  const perKategori  = data?.per_kategori || []
  const maxQty       = topBarang[0]?.qty || 1
  const totalQtyAll  = topBarang.reduce((s, b) => s + b.qty, 0)

  // Bar chart data (top 5)
  const barData = topBarang.slice(0, 7).map(b => ({
    label: b.nama.length > 12 ? b.nama.slice(0, 12) + '…' : b.nama,
    qty:   b.qty,
    omzet: b.omzet,
  }))

  function BarTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
        <p className="font-semibold text-gray-700 mb-1 max-w-32 truncate">{label}</p>
        <p className="text-blue-600 font-bold">{payload[0]?.value} pcs</p>
        {payload[0]?.payload?.omzet > 0 && (
          <p className="text-gray-500">{rp(payload[0].payload.omzet)}</p>
        )}
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
          <h1 className="font-extrabold text-gray-900 text-base leading-tight">Laporan Produk</h1>
          <p className="text-xs text-gray-400 mt-0.5">Produk terlaris & penjualan per kategori</p>
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
              Upgrade ke <strong>Basic</strong> atau <strong>Pro</strong> untuk laporan produk lengkap.
            </p>
            <a href="/dashboard/berlangganan"
              className="inline-block mt-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors">
              Upgrade Sekarang →
            </a>
          </div>
        </div>
      )}

      {/* ── Filter ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <DateRangePicker from={from} to={to} disabled={!canFullReport}
          onChange={(f, t) => { setFrom(f); setTo(t); setPeriod(-1) }} />
      </div>

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

      {/* ── Loading ── */}
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
          <Skeleton className="h-48" /><Skeleton className="h-64" />
        </div>
      ) : (
        <div className="space-y-4">

          {/* ── Summary strip ── */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total Item Terjual', value: totalQtyAll,         unit: 'pcs',     color: '#2563eb', bg: '#eff6ff', icon: ShoppingBag },
              { label: 'Jenis Produk',        value: topBarang.length,   unit: 'produk',  color: '#16a34a', bg: '#f0fdf4', icon: Package },
              { label: 'Kategori',            value: perKategori.length, unit: 'kategori', color: '#f59e0b', bg: '#fffbeb', icon: Tag },
            ].map(s => (
              <div key={s.label} className="card p-3 text-center">
                <div className="w-7 h-7 rounded-lg mx-auto mb-1.5 flex items-center justify-center" style={{ background: s.bg }}>
                  <s.icon size={13} style={{ color: s.color }} />
                </div>
                <p className="font-extrabold text-base" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{s.unit}</p>
              </div>
            ))}
          </div>

          {/* ── Tab: Ranking | Kategori ── */}
          <div className="flex gap-2">
            {[
              { id: 'ranking',  label: '🏆 Terlaris', icon: Trophy },
              { id: 'kategori', label: '🏷️ Kategori', icon: Tag },
            ].map(t => (
              <button key={t.id} onClick={() => setViewMode(t.id)}
                className={[
                  'flex-1 py-2 rounded-xl text-xs font-bold border transition-all',
                  viewMode === t.id ? 'bg-blue-700 text-white border-blue-700 shadow-sm' : 'bg-white text-gray-500 border-gray-200',
                ].join(' ')}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TAB: RANKING ── */}
          {viewMode === 'ranking' && (
            <div className="space-y-4">

              {/* Bar chart top 7 */}
              {barData.length > 0 && (
                <div className="card p-4">
                  <p className="font-bold text-gray-900 text-sm mb-4">Top {barData.length} Produk (Qty)</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={barData} margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={22} />
                      <Tooltip content={<BarTooltip />} cursor={{ fill: '#f0f9ff' }} />
                      <Bar dataKey="qty" radius={[6, 6, 0, 0]}>
                        {barData.map((_, i) => (
                          <Cell key={i} fill={COLORS_KAT[i % COLORS_KAT.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Daftar ranking detail */}
              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-bold text-gray-700">Ranking Produk Terlaris</p>
                  <span className="ml-auto text-[10px] text-gray-400">{topBarang.length} produk</span>
                </div>
                {topBarang.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-2 text-gray-400">
                    <Package className="w-8 h-8 opacity-30" />
                    <p className="text-sm">Belum ada data penjualan produk</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {topBarang.map((b, i) => {
                      const pct  = Math.round((b.qty / maxQty) * 100)
                      const rank = RANK_STYLE[i] || { bg: '#f9fafb', color: '#9ca3af', emoji: null }
                      const qtyPct = totalQtyAll > 0 ? Math.round((b.qty / totalQtyAll) * 100) : 0
                      return (
                        <div key={i} className="px-4 py-3.5">
                          <div className="flex items-center gap-3 mb-2">
                            {/* Rank */}
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                              style={{ background: rank.bg, color: rank.color }}>
                              {rank.emoji || (i + 1)}
                            </div>
                            {/* Nama + omzet */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{b.nama}</p>
                              {b.omzet > 0 && (
                                <p className="text-[10px] text-gray-400">{rp(b.omzet)}</p>
                              )}
                            </div>
                            {/* Qty */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-gray-900">{b.qty} <span className="text-xs font-normal text-gray-400">pcs</span></p>
                              <p className="text-[10px] text-gray-400">{qtyPct}% dari total</p>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: COLORS_KAT[i % COLORS_KAT.length] }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: KATEGORI ── */}
          {viewMode === 'kategori' && (
            <div className="space-y-4">

              {perKategori.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-14 gap-2 text-gray-400">
                  <Tag className="w-8 h-8 opacity-30" />
                  <p className="text-sm">Belum ada data kategori</p>
                </div>
              ) : (
                <>
                  {/* Donut */}
                  <div className="card p-4">
                    <p className="font-bold text-gray-900 text-sm mb-4">Omzet per Kategori</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0" style={{ width: 120, height: 120 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={perKategori.map(k => ({ ...k, value: k.persen }))}
                              dataKey="value" cx="50%" cy="50%"
                              innerRadius={32} outerRadius={54}
                              paddingAngle={2} startAngle={90} endAngle={-270}>
                              {perKategori.map((_, i) => (
                                <Cell key={i} fill={COLORS_KAT[i % COLORS_KAT.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        {perKategori.map((k, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ background: COLORS_KAT[i % COLORS_KAT.length] }} />
                            <span className="text-xs text-gray-600 flex-1 truncate">{k.nama}</span>
                            <span className="text-xs font-bold text-gray-800">{k.persen}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tabel kategori */}
                  <div className="card overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-700">Detail per Kategori</p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {perKategori.map((k, i) => (
                        <div key={i} className="px-4 py-3.5">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ background: COLORS_KAT[i % COLORS_KAT.length] }} />
                              <p className="text-sm font-semibold text-gray-800">{k.nama}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-blue-600">{rp(k.omzet)}</p>
                              <p className="text-[10px] text-gray-400">{k.qty} pcs · {k.persen}%</p>
                            </div>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full"
                              style={{ width: `${k.persen}%`, background: COLORS_KAT[i % COLORS_KAT.length] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
