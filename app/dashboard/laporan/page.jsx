'use client'

import { useState, useEffect, useCallback } from 'react'
import Icon from '@/components/Icon'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const rp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

const getTanggal = (offsetDays = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  return d.toISOString().split('T')[0]
}

const PERIODS = [
  { label: 'Hari Ini',     from: getTanggal(0),  to: getTanggal(0)  },
  { label: '7 Hari',       from: getTanggal(6),  to: getTanggal(0)  },
  { label: '30 Hari',      from: getTanggal(29), to: getTanggal(0)  },
  { label: 'Bulan Ini',    from: new Date().toISOString().slice(0,7) + '-01', to: getTanggal(0) },
]

export default function LaporanPage() {
  const [period, setPeriod]     = useState(1)
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const p = PERIODS[period]
    try {
      const res  = await fetch(`/api/laporan?from=${p.from}&to=${p.to}`)
      const json = await res.json()
      setData(json.data)
    } catch {}
    finally { setLoading(false) }
  }, [period])

  useEffect(() => { fetchData() }, [fetchData])

  const chartData = data?.omzet_per_hari?.map(d => ({
    label: d.tgl.slice(5),
    omzet: d.omzet,
  })) || []

  const exportCSV = () => {
    if (!data) return
    const p = PERIODS[period]
    const rows = [
      ['Laporan Warung', '', '', ''],
      [`Periode: ${p.label} (${p.from} s/d ${p.to})`, '', '', ''],
      ['', '', '', ''],
      ['Total Omzet', data.total_omzet, '', ''],
      ['Laba Kotor', data.total_laba, '', ''],
      ['Total Transaksi', data.total_transaksi, '', ''],
      ['', '', '', ''],
      ['--- Barang Terlaris ---', '', '', ''],
      ['No', 'Nama Barang', 'Qty Terjual', ''],
      ...(data.top_barang || []).map((b, i) => [i + 1, b.nama, b.qty, '']),
      ['', '', '', ''],
      ['--- Omzet Per Hari ---', '', '', ''],
      ['Tanggal', 'Omzet', 'Jumlah Transaksi', ''],
      ...(data.omzet_per_hari || []).map(d => [d.tgl, d.omzet, d.jumlah_trx || '', '']),
    ]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `laporan-${p.label.toLowerCase().replace(' ', '-')}-${p.from}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page-content space-y-4">

      {/* Period selector + Export */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="card p-1 flex gap-1">
          {PERIODS.map((p, i) => (
            <button key={p.label} onClick={() => setPeriod(i)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors
                ${period === i ? 'bg-blue-700 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
              {p.label}
            </button>
          ))}
        </div>
        {!loading && data && (
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors">
            <Icon name="download" size={13} color="#fff" />
            Export CSV
          </button>
        )}
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
          <Icon name="refresh" size={18} color="#9ca3af" /> Memuat laporan...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Total Omzet',     value: rp(data?.total_omzet || 0),    icon: 'trending', color: '#2563eb', bg: '#eff6ff' },
              { label: 'Laba Kotor',      value: rp(data?.total_laba || 0),     icon: 'trending', color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Total Transaksi', value: data?.total_transaksi || 0,    icon: 'cart',     color: '#9333ea', bg: '#faf5ff' },
            ].map(s => (
              <div key={s.label} className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                    <Icon name={s.icon} size={16} color={s.color} />
                  </div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
                <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-4">Grafik Omzet</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => v >= 1000000 ? v/1000000+'M' : v/1000+'K'} />
                  <Tooltip formatter={v => rp(v)} />
                  <Line type="monotone" dataKey="omzet" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm">Belum ada transaksi pada periode ini</div>
            )}
          </div>

          {/* Barang terlaris */}
          {data?.top_barang?.length > 0 && (
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-4">🏆 Barang Terlaris</h3>
              <div className="space-y-3">
                {data.top_barang.map((b, i) => (
                  <div key={b.nama} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                      style={{ background: i === 0 ? '#fef3c7' : '#f3f4f6', color: i === 0 ? '#d97706' : '#6b7280' }}>
                      {i + 1}
                    </div>
                    <span className="flex-1 font-semibold text-gray-800 text-sm">{b.nama}</span>
                    <span className="text-sm text-gray-500">{b.qty} pcs</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
