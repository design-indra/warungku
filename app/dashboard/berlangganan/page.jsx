'use client'

import { useState, useEffect, useRef } from 'react'
import Icon from '@/components/Icon'

export default function BerlanggananPage() {
  // ── Keadaan Subscription / Paket (Asli) ──
  const [subStatus, setSubStatus]     = useState(null)   // { active, plan, expired_at }
  const [subLoading, setSubLoading]   = useState(false)
  const [orderData, setOrderData]     = useState(null)   // { qr_url, order_id, amount, expires_at }
  const [payingPlan, setPayingPlan]   = useState(null) // 'basic' | 'pro' | null
  const [pollMsg, setPollMsg]         = useState('')
  const pollRef = useRef(null)

  // ── Pembantu Subscription (Asli) ──
  const fetchSubStatus = async () => {
    setSubLoading(true)
    try {
      const res = await fetch('/api/subscription/status')
      const json = await res.json()
      setSubStatus(json)
    } catch { setSubStatus({ active: false }) }
    finally { setSubLoading(false) }
  }

  // Ambil status automatik semasa halaman dimuatkan
  useEffect(() => {
    fetchSubStatus()
  }, [])

  const handleBuPaket = async (plan) => {
    setPayingPlan(plan)
    setOrderData(null)
    setPollMsg('')
    try {
      const res = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const json = await res.json()
      if (!json.success) { alert(json.error || 'Gagal membuat order'); return }
      setOrderData(json)
      startPolling(json.order_id)
    } catch { alert('Gagal terhubung ke server') }
    finally { setPayingPlan(null) }
  }

  const startPolling = (orderId) => {
    setPollMsg('Menunggu pembayaran...')
    let attempt = 0
    const MAX = 60 // max 5 minit (5s selang masa)
    pollRef.current = setInterval(async () => {
      attempt++
      try {
        const res = await fetch('/api/subscription/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderId }),
        })
        const json = await res.json()
        if (json.settled) {
          clearInterval(pollRef.current)
          setPollMsg('✅ Pembayaran berhasil! Paket aktif.')
          setOrderData(null)
          fetchSubStatus()
        } else if (json.status === 'EXPIRED' || attempt >= MAX) {
          clearInterval(pollRef.current)
          setPollMsg('⏱ QR Code kadaluarsa. Silakan buat order baru.')
          setOrderData(null)
        }
      } catch { /* silent */ }
    }, 5000)
  }

  useEffect(() => () => clearInterval(pollRef.current), [])

  return (
    <div className="overflow-y-auto page-content space-y-4">
      <div className="max-w-lg mx-auto space-y-4">

        {/* ── Status Aktif ── */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-3">Status Paket</h3>
          {subLoading ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
              <Icon name="refresh" size={15} color="#9ca3af" /> Memuat...
            </div>
          ) : subStatus?.active ? (
            <div className="flex items-center gap-3 bg-green-50 rounded-xl p-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-xl">✅</div>
              <div>
                <p className="font-bold text-green-800 capitalize">Paket {subStatus.plan} Aktif</p>
                <p className="text-xs text-green-600 mt-0.5">
                  Berlaku hingga: {new Date(subStatus.expired_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 text-xl">🆓</div>
              <div>
                <p className="font-bold text-gray-700">Paket Free</p>
                <p className="text-xs text-gray-500 mt-0.5">Upgrade untuk fitur lengkap</p>
              </div>
            </div>
          )}
          {pollMsg && (
            <p className={`mt-3 text-sm font-semibold text-center ${pollMsg.startsWith('✅') ? 'text-green-600' : 'text-amber-600'}`}>
              {pollMsg}
            </p>
          )}
        </div>

        {/* ── QR Code (Semasa menunggu pembayaran) ── */}
        {orderData && (
          <div className="card p-5 text-center">
            <p className="font-bold text-gray-900 mb-1">Scan QRIS untuk Bayar</p>
            <p className="text-xs text-gray-500 mb-4">
              Paket {orderData.plan} — Rp {Number(orderData.amount).toLocaleString('id-ID')}
            </p>
            <div className="flex justify-center mb-4">
              <img
                src={orderData.qr_url}
                alt="QRIS QR Code"
                className="w-52 h-52 border border-gray-200 rounded-xl"
              />
            </div>
            <p className="text-xs text-gray-400 mb-1">
              Kode: <span className="font-mono font-semibold text-gray-600">{orderData.order_id}</span>
            </p>
            <p className="text-xs text-amber-600 font-medium">
              QR berlaku hingga: {orderData.expires_at ? new Date(orderData.expires_at).toLocaleTimeString('id-ID') : '—'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 animate-pulse">
              <Icon name="refresh" size={13} color="#9ca3af" />
              Mendeteksi pembayaran otomatis...
            </div>
            <button
              onClick={() => { clearInterval(pollRef.current); setOrderData(null); setPollMsg('') }}
              className="mt-3 text-xs text-red-400 hover:text-red-600 underline"
            >
              Batalkan
            </button>
          </div>
        )}

        {/* ── Pilihan Paket ── */}
        {!orderData && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-sm px-1">Pilih Paket</h3>

            {/* Basic */}
            <div className="card p-5 border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900 text-base">Basic</p>
                  <p className="text-2xl font-extrabold text-blue-700 mt-0.5">
                    Rp 49.000 <span className="text-sm font-normal text-gray-400">/ bulan</span>
                  </p>
                </div>
                <span className="text-3xl">📦</span>
              </div>
              <ul className="space-y-1.5 mb-4">
                {['3 Cabang', 'Max 3 Kasir', 'Laporan bulanan', 'Manajemen stok & hutang', 'Chat WA Admin'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleBuPaket('basic')}
                disabled={payingPlan !== null || subStatus?.plan === 'basic' || subStatus?.plan === 'pro'}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors
                  ${payingPlan !== null || subStatus?.plan === 'basic' || subStatus?.plan === 'pro'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-700 hover:bg-blue-800 text-white'}`}
              >
                {payingPlan === 'basic' ? 'Memproses...' : subStatus?.plan === 'basic' ? 'Sudah Aktif' : subStatus?.plan === 'pro' ? 'Tidak Bisa Downgrade' : 'Pilih Basic'}
              </button>
            </div>

            {/* Pro */}
            <div className="card p-5 border-2 border-blue-600 relative">
              <div className="absolute -top-3 left-4">
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Populer</span>
              </div>
              <div className="flex items-start justify-between mb-3 mt-1">
                <div>
                  <p className="font-bold text-gray-900 text-base">Pro</p>
                  <p className="text-2xl font-extrabold text-blue-700 mt-0.5">
                    Rp 2.000 <span className="text-sm font-normal text-gray-400">/ bulan</span>
                  </p>
                </div>
                <span className="text-3xl">🚀</span>
              </div>
              <ul className="space-y-1.5 mb-4">
                {['Cabang tidak terbatas', 'Kasir tidak terbatas', 'Laporan & analitik lengkap', 'Manajemen stok & hutang', 'Prioritas support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleBuPaket('pro')}
                disabled={payingPlan !== null || subStatus?.plan === 'pro'}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors
                  ${payingPlan !== null || subStatus?.plan === 'pro'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-700 hover:bg-blue-800 text-white'}`}
              >
                {payingPlan === 'pro' ? 'Memproses...' : subStatus?.plan === 'pro' ? 'Sudah Aktif' : 'Pilih Pro'}
              </button>
            </div>

            <p className="text-xs text-center text-gray-400 pb-2">
              Pembayaran via QRIS · Diproses oleh Cashi.id
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
