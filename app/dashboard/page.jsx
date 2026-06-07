'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Icon from '@/components/Icon'
import { ShoppingCart, Package, BarChart3, MoreHorizontal, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const rp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

const quickMenus = [
  { label: 'Kasir Pos',     href: '/dashboard/kasir',        icon: ShoppingCart, color: 'text-blue-600',   bg: 'bg-blue-50' },
  { label: 'Stock Barang',  href: '/dashboard/stok',          icon: Package,      color: 'text-green-600',  bg: 'bg-green-50' },
  { label: 'Laporan',       href: '/dashboard/laporan',       icon: BarChart3,    color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'Menu Lainnya',  href: '/dashboard/menu-lainnya',  icon: MoreHorizontal, color: 'text-purple-600', bg: 'bg-purple-50' },
]

export default function DashboardPage() {
  const today = new Date().toISOString().split('T')[0]
  const week  = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]

  const [laporan, setLaporan]   = useState(null)
  const [recentTx, setRecentTx] = useState([])
  const [loading, setLoading]   = useState(true)
  const [userName, setUserName] = useState('Pemilik Warungku')
  const [logoUrl, setLogoUrl]   = useState('')

  useEffect(() => {
    // Ambil nama user
    try {
      const supabase = require('@/lib/supabase').createClient()
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.user_metadata?.full_name) setUserName(data.user.user_metadata.full_name)
        else if (data?.user?.email) setUserName(data.user.email.split('@')[0])
      })
    } catch {}

    // Ambil logo warung
    fetch('/api/pengaturan/profil')
      .then(r => r.json())
      .then(d => { if (d.logo_url) setLogoUrl(d.logo_url) })
      .catch(() => {})

    Promise.all([
      fetch(`/api/laporan?from=${week}&to=${today}`).then(r => r.json()),
      fetch(`/api/transaksi?limit=5`).then(r => r.json()),
    ]).then(([lap, trx]) => {
      setLaporan(lap.data)
      setRecentTx(trx.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const chartData = laporan?.omzet_per_hari?.map(d => ({
    day: d.tgl.slice(5),
    tgl: d.tgl,
    omzet: d.omzet,
    jumlah: d.jumlah_trx || 0,
  })).sort((a, b) => a.tgl.localeCompare(b.tgl)) || []

  const maxOmzet = Math.max(...chartData.map(d => d.omzet), 1)

  const todayOmzet = laporan?.omzet_per_hari?.find(d => d.tgl === today)?.omzet || 0

  const stats = laporan ? [
    {
      label: 'Total Penjualan', value: rp(todayOmzet),
      sub: '12% dari kemarin', up: true, icon: '🛍️', color: 'bg-blue-100', iconColor: 'text-blue-600'
    },
    {
      label: 'Transaksi', value: laporan.total_transaksi || 0,
      sub: '8% dari kemarin', up: true, icon: '💵', color: 'bg-green-100', iconColor: 'text-green-600'
    },
    {
      label: 'Barang Terjual', value: laporan.total_qty || 0,
      sub: '10% dari kemarin', up: true, icon: '📦', color: 'bg-orange-100', iconColor: 'text-orange-500'
    },
    {
      label: 'Keuntungan', value: rp(laporan.total_laba || 0),
      sub: '15% dari kemarin', up: true, icon: '📈', color: 'bg-purple-100', iconColor: 'text-purple-600'
    },
  ] : []

  if (loading) return (
    <div className="page-content flex items-center justify-center py-24 gap-2 text-gray-400">
      <Icon name="refresh" size={20} color="#9ca3af" /> Memuat dashboard...
    </div>
  )

  return (
    <div className="space-y-0">
      {/* ── Welcome Card ── */}
      <div className="mx-4 mt-4 mb-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex-1">
              <p className="text-gray-500 text-sm">Selamat datang,</p>
              <h2 className="text-lg font-bold text-gray-900 mt-0.5">{userName}</h2>
              <p className="text-gray-400 text-xs mt-1">Semoga harimu menyenangkan!</p>
            </div>
            <div className="w-20 h-20 flex-shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl overflow-hidden flex items-center justify-center">
                {logoUrl
                  ? <img src={logoUrl} alt="Logo warung" className="w-full h-full object-cover" />
                  : <span className="text-3xl">🏪</span>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Ringkasan Hari Ini ── */}
      {stats.length > 0 && (
        <div className="mx-4 mt-3">
          <div className="bg-blue-600 rounded-2xl p-4">
            <p className="text-blue-100 text-sm font-semibold mb-3">Ringkasan Hari Ini</p>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s, i) => (
                <div key={s.label} className="text-center">
                  <div className={`w-12 h-12 rounded-full ${s.color} flex items-center justify-center text-xl mx-auto mb-1.5`}>
                    {s.icon}
                  </div>
                  <p className="text-blue-200 text-[10px] mb-0.5">{s.label}</p>
                  <p className="text-white font-bold text-sm leading-tight">{s.value}</p>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    {s.up
                      ? <TrendingUp className="w-3 h-3 text-green-300" />
                      : <TrendingDown className="w-3 h-3 text-red-300" />}
                    <span className="text-[9px] text-blue-200">{s.sub}</span>
                  </div>
                  {/* divider (right) for col 1 */}
                  {(i === 0 || i === 2) && (
                    <div className="absolute" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Menu Cepat ── */}
      <div className="mx-4 mt-3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">Menu Cepat</h3>
            <Link href="/dashboard/menu-lainnya" className="text-blue-600 text-xs font-semibold flex items-center gap-0.5">
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {quickMenus.map((m) => (
              <Link key={m.label} href={m.href}
                className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center`}>
                  <m.icon className={`w-6 h-6 ${m.color}`} />
                </div>
                <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight">{m.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Transaksi Terakhir ── */}
      <div className="mx-4 mt-3 mb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Transaksi Terakhir</h3>
            <Link href="/dashboard/riwayat" className="text-blue-600 text-xs font-semibold flex items-center gap-0.5">
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {recentTx.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {recentTx.map((tx, i) => {
                const colors = ['bg-green-100', 'bg-blue-100', 'bg-orange-100', 'bg-purple-100', 'bg-pink-100']
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-full ${colors[i % colors.length]} flex items-center justify-center flex-shrink-0`}>
                      🛍️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{tx.nomor_transaksi}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' • '}
                        {new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-800">{rp(tx.total)}</p>
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5
                        ${tx.status === 'lunas' ? 'bg-green-100 text-green-700' : tx.status === 'hutang' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {tx.status === 'lunas' ? 'Selesai' : tx.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">Belum ada transaksi</div>
          )}
        </div>
      </div>

      {/* ── Grafik (tetap ada, di bawah) ── */}
      {chartData.length > 0 && (
        <div className="mx-4 mb-4">
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-4">Grafik Omzet (7 Hari)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickFormatter={v => v >= 1000000 ? (v/1000000).toFixed(1)+'jt' : v >= 1000 ? v/1000+'k' : v}
                  axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  cursor={{ fill: '#eff6ff', radius: 4 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
                        <p className="font-bold text-gray-700 mb-1">{label}</p>
                        <p className="text-blue-600 font-semibold">{rp(payload[0]?.value || 0)}</p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="omzet" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.tgl === today ? '#2563eb' : entry.omzet >= maxOmzet * 0.8 ? '#3b82f6' : '#93c5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
