'use client'

import { useState, useEffect } from 'react'
import {
  Headphones, MessageSquare, ChevronDown, ChevronUp,
  Send, Phone, CheckCircle, Clock, AlertCircle,
  HelpCircle, Zap, ShoppingCart, CreditCard, Package,
  History, X, Bot
} from 'lucide-react'

const ADMIN_WA = '6283803888990'

const FAQ = [
  {
    icon: ShoppingCart,
    q: 'Bagaimana cara menambah barang ke stok?',
    a: 'Masuk ke menu Stok → klik tombol "+ Tambah Barang" → isi nama, harga beli, harga jual, dan stok awal → klik Simpan.',
  },
  {
    icon: CreditCard,
    q: 'Bagaimana cara mencatat hutang pelanggan?',
    a: 'Saat di menu Kasir, pilih pelanggan terlebih dahulu → setelah selesai belanja, pilih metode bayar "Hutang" → klik Proses. Hutang otomatis tercatat di menu Hutang.',
  },
  {
    icon: Package,
    q: 'Bagaimana cara melihat laporan omzet?',
    a: 'Buka menu Laporan → pilih rentang tanggal → laporan omzet, transaksi, dan produk terlaris akan tampil secara otomatis.',
  },
  {
    icon: Zap,
    q: 'Apakah WarungKu bisa dipakai di lebih dari 1 cabang?',
    a: 'Ya! WarungKu mendukung multi-cabang. Upgrade ke paket Basic atau Pro untuk mengaktifkan fitur multi-cabang. Hubungi admin untuk info lebih lanjut.',
  },
  {
    icon: HelpCircle,
    q: 'Data saya aman? Apakah bisa hilang?',
    a: 'Data tersimpan aman di cloud (Supabase) dengan enkripsi penuh. Selama berlangganan aktif, data Anda tidak akan hilang.',
  },
  {
    icon: Phone,
    q: 'Bagaimana cara menghubungi admin?',
    a: 'Kamu bisa kirim pesan lewat form di bawah ini, atau langsung chat WhatsApp admin. Tim kami aktif Senin–Sabtu pukul 08.00–21.00 WIB.',
  },
]

const TOPIK = ['Umum', 'Laporan Bug', 'Pertanyaan Fitur', 'Upgrade Paket', 'Lainnya']

export default function CSPage() {
  const [openFaq, setOpenFaq]       = useState(null)
  const [tab, setTab]               = useState('form') // 'form' | 'riwayat'
  const [riwayat, setRiwayat]       = useState([])
  const [loadRiwayat, setLoadRiwayat] = useState(false)

  // Form state
  const [form, setForm] = useState({ nama: '', no_hp: '', topik: 'Umum', pesan: '' })
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [errMsg, setErrMsg]     = useState('')

  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSend = async () => {
    if (!form.nama.trim() || !form.pesan.trim()) {
      setErrMsg('Nama dan pesan wajib diisi')
      return
    }
    setSending(true)
    setErrMsg('')
    try {
      const res  = await fetch('/api/cs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setSent(true)
      setForm({ nama: '', no_hp: '', topik: 'Umum', pesan: '' })
      setTimeout(() => setSent(false), 4000)
    } catch (e) {
      setErrMsg(e.message)
    } finally {
      setSending(false)
    }
  }

  const fetchRiwayat = async () => {
    setLoadRiwayat(true)
    try {
      const res  = await fetch('/api/cs')
      const json = await res.json()
      setRiwayat(json.data || [])
    } finally {
      setLoadRiwayat(false)
    }
  }

  useEffect(() => {
    if (tab === 'riwayat') fetchRiwayat()
  }, [tab])

  const formatTgl = (iso) =>
    new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit' })

  const statusBadge = (s) => ({
    baru:     { label: 'Baru',      cls: 'bg-blue-100 text-blue-700' },
    diproses: { label: 'Diproses',  cls: 'bg-amber-100 text-amber-700' },
    selesai:  { label: 'Selesai',   cls: 'bg-emerald-100 text-emerald-700' },
  }[s] || { label: s, cls: 'bg-gray-100 text-gray-600' })

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Headphones className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Customer Service</h1>
          <p className="text-xs text-gray-400">Kami siap membantu kamu</p>
        </div>
      </div>

      {/* Tombol WA Admin */}
      <a
        href={`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent('Halo admin WarungKu, saya ingin bertanya...')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl p-4 mb-5 transition-colors shadow-sm"
      >
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Phone className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">Chat WhatsApp Admin</p>
          <p className="text-xs text-emerald-100">Aktif Senin–Sabtu · 08.00–21.00 WIB</p>
        </div>
        <span className="text-2xl">💬</span>
      </a>

      {/* Placeholder AI Asisten — siap dikembangkan */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 mb-5">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm text-indigo-800">AI Asisten <span className="text-[10px] bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold ml-1">Segera Hadir</span></p>
          <p className="text-xs text-indigo-500 mt-0.5">Asisten cerdas yang siap menjawab pertanyaan 24 jam</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-5">
        <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-teal-600" />
          Pertanyaan yang Sering Ditanyakan
        </p>
        <div className="space-y-2">
          {FAQ.map((item, i) => {
            const Icon = item.icon
            const isOpen = openFaq === i
            return (
              <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <button
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                >
                  <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-teal-600" />
                  </div>
                  <p className="flex-1 text-sm font-semibold text-gray-800 text-left">{item.q}</p>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="bg-teal-50 rounded-xl p-3">
                      <p className="text-sm text-gray-700 leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Tab Form / Riwayat */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'form',    label: 'Kirim Pesan',    icon: MessageSquare },
          { key: 'riwayat', label: 'Riwayat Pesan',  icon: History },
        ].map(t => {
          const Icon = t.icon
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors
                ${tab === t.key ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab: Form Kirim Pesan */}
      {tab === 'form' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-teal-600" />
            Kirim Pesan ke Admin
          </p>

          {/* Sukses */}
          {sent && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl p-3 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Pesan terkirim! Admin akan segera menghubungi kamu.
            </div>
          )}

          {/* Error */}
          {errMsg && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl p-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errMsg}
              <button onClick={() => setErrMsg('')} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Nama *</label>
            <input type="text" placeholder="Nama kamu"
              value={form.nama} onChange={e => handleChange('nama', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">No. WhatsApp <span className="text-gray-400 font-normal">(opsional)</span></label>
            <input type="tel" placeholder="08xxxxxxxxxx"
              value={form.no_hp} onChange={e => handleChange('no_hp', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Topik</label>
            <select value={form.topik} onChange={e => handleChange('topik', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
              {TOPIK.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Pesan *</label>
            <textarea rows={4} placeholder="Tulis pertanyaan atau keluhan kamu di sini..."
              value={form.pesan} onChange={e => handleChange('pesan', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
          </div>

          <button onClick={handleSend} disabled={sending}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Kirim Pesan
              </>
            )}
          </button>
        </div>
      )}

      {/* Tab: Riwayat Pesan */}
      {tab === 'riwayat' && (
        <div className="space-y-3">
          {loadRiwayat && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-2.5 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          )}
          {!loadRiwayat && riwayat.length === 0 && (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Belum ada pesan</p>
            </div>
          )}
          {!loadRiwayat && riwayat.map(p => {
            const sb = statusBadge(p.status)
            return (
              <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500">{p.topik}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sb.cls}`}>{sb.label}</span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">{p.pesan}</p>
                <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTgl(p.created_at)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
