'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Icon from '@/components/Icon'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const rp  = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')
const today = new Date().toISOString().split('T')[0]
const week  = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]

export default function DashboardPage() {
  const [laporan, setLaporan]   = useState(null)
  const [recentTx, setRecentTx] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/laporan?from=${week}&to=${today}`).then(r => r.json()),
      fetch(`/api/transaksi?limit=5`).then(r => r.json()),
    ]).then(([lap, trx]) => {
      setLaporan(lap.data)
      setRecentTx(trx.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const chartData = laporan?.omzet_per_hari?.map(d => ({
    day: d.tgl.slice(5), omzet: d.omzet,
  })) || []

  const stats = laporan ? [
    { label:'Omzet Hari Ini',  value: rp(laporan.omzet_per_hari?.find(d => d.tgl === today)?.omzet || 0), sub: '7 hari terakhir', icon:'trending',  color:'#2563eb', bg:'#eff6ff' },
    { label:'Total Transaksi', value: laporan.total_transaksi || 0,                                       sub: '7 hari terakhir', icon:'cart',      color:'#16a34a', bg:'#f0fdf4' },
    { label:'Laba Kotor',      value: rp(laporan.total_laba || 0),                                        sub: '7 hari terakhir', icon:'trending',  color:'#9333ea', bg:'#faf5ff' },
    { label:'Total Omzet',     value: rp(laporan.total_omzet || 0),                                       sub: '7 hari terakhir', icon:'chart',     color:'#0891b2', bg:'#ecfeff' },
  ] : []

  if (loading) return (
    <div className="page-content flex items-center justify-center py-24 gap-2 text-gray-400">
      <Icon name="refresh" size={20} color="#9ca3af" /> Memuat dashboard...
    </div>
  )

  return (
    <div className="page-content space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-gray-500 font-medium leading-tight">{s.label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ml-1" style={{ background: s.bg }}>
                <Icon name={s.icon} size={15} color={s.color} />
              </div>
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">{s.value}</p>
            <p className="text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart + Top Barang */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-4 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Grafik Omzet (7 Hari)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000000 ? v/1000000+'jt' : v/1000+'k'} />
                <Tooltip formatter={(v) => rp(v)} />
                <Line type="monotone" dataKey="omzet" stroke="#2563eb" strokeWidth={2} dot={{ r: 4, fill: '#2563eb' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Belum ada transaksi minggu ini</div>
          )}
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-sm">🏆 Barang Terlaris</h3>
            <Link href="/dashboard/laporan" className="text-blue-600 text-xs hover:underline">Lihat semua</Link>
          </div>
          {laporan?.top_barang?.length > 0 ? (
            <div className="space-y-3">
              {laporan.top_barang.slice(0, 5).map((b, i) => (
                <div key={b.nama} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: i === 0 ? '#fef3c7' : '#f3f4f6', color: i === 0 ? '#d97706' : '#6b7280' }}>
                    {i + 1}
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">{b.nama}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{b.qty} pcs</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">Belum ada data</div>
          )}
        </div>
      </div>

      {/* Transaksi Terbaru */}
      <div className="card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Transaksi Terbaru</h3>
          <Link href="/dashboard/laporan" className="text-blue-600 text-xs hover:underline">Lihat laporan</Link>
        </div>
        {recentTx.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">No. Transaksi</th>
                  <th className="table-header">Total</th>
                  <th className="table-header hidden sm:table-cell">Metode</th>
                  <th className="table-header hidden sm:table-cell">Waktu</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-blue-700 font-medium text-xs">{tx.nomor_transaksi}</td>
                    <td className="table-cell font-semibold">{rp(tx.total)}</td>
                    <td className="table-cell hidden sm:table-cell text-gray-500 capitalize">{tx.metode_bayar}</td>
                    <td className="table-cell hidden sm:table-cell text-gray-400 text-xs">
                      {new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${tx.status === 'lunas' ? 'badge-green' : tx.status === 'hutang' ? 'badge-red' : 'badge-gray'}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 text-sm">Belum ada transaksi</div>
        )}
      </div>
    </div>
  )
}
