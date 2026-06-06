'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Headphones, MessageSquare, ChevronDown, ChevronUp,
  Send, Phone, CheckCircle, Clock, AlertCircle,
  HelpCircle, Zap, ShoppingCart, CreditCard, Package,
  History, X, Bot, User
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
    a: 'Saat di menu Kasir, pilih pelanggan terlebih dahulu → selesai belanja, pilih metode bayar "Hutang" → klik Proses. Hutang otomatis tercatat di menu Hutang.',
  },
  {
    icon: Package,
    q: 'Bagaimana cara melihat laporan omzet?',
    a: 'Buka menu Laporan → pilih rentang tanggal → laporan omzet, transaksi, dan produk terlaris akan tampil otomatis.',
  },
  {
    icon: Zap,
    q: 'Apakah WarungKu bisa dipakai di lebih dari 1 cabang?',
    a: 'Ya! WarungKu mendukung multi-cabang. Upgrade ke paket Basic atau Pro untuk mengaktifkan fitur ini.',
  },
  {
    icon: HelpCircle,
    q: 'Apakah data saya aman?',
    a: 'Data tersimpan aman di cloud dengan enkripsi penuh. Selama berlangganan aktif, data tidak akan hilang.',
  },
  {
    icon: Phone,
    q: 'Bagaimana cara menghubungi admin?',
    a: 'Bisa chat langsung di sini, kirim pesan via form, atau WhatsApp admin. Tim kami aktif Senin–Sabtu pukul 08.00–21.00 WIB.',
  },
]

const TOPIK = ['Umum', 'Laporan Bug', 'Pertanyaan Fitur', 'Upgrade Paket', 'Lainnya']

export default function CSPage() {
  const [openFaq, setOpenFaq]   = useState(null)
  const [tab, setTab]           = useState('chat') // 'chat' | 'form' | 'riwayat'
  const [riwayat, setRiwayat]   = useState([])
  const [loadRiwayat, setLoadRiwayat] = useState(false)

  // Chat state
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Halo! Selamat datang di Customer Service WarungKu 👋 Ada yang bisa saya bantu?',
    }
  ])
  const [chatInput, setChatInput]   = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  // Form state
  const [form, setForm]     = useState({ nama: '', no_hp: '', topik: 'Umum', pesan: '' })
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [errMsg, setErrMsg]     = useState('')

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatLoading])

  const handleChat = async () => {
    const text = chatInput.trim()
    if (!text || chatLoading) return

    const userMsg = { role: 'user', content: text }
    const newMessages = [...chatMessages, userMsg]
    setChatMessages(newMessages)
    setChatInput('')
    setChatLoading(true)

    try {
      const res  = await fetch('/api/cs/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setChatMessages(prev => [...prev, { role: 'assistant', content: json.reply }])
    } catch (e) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Maaf, saya sedang gangguan teknis. Coba beberapa saat lagi ya 🙏',
      }])
    } finally {
      setChatLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleChat()
    }
  }

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
    new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })

  const statusBadge = (s) => ({
    baru:     { label: 'Baru',     cls: 'bg-blue-100 text-blue-700' },
    diproses: { label: 'Diproses', cls: 'bg-amber-100 text-amber-700' },
    selesai:  { label: 'Selesai',  cls: 'bg-emerald-100 text-emerald-700' },
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
                  <div className="px-4 pb-4">
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

      {/* Tab */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'chat',    label: 'Chat CS',        icon: MessageSquare },
          { key: 'form',    label: 'Kirim Pesan',    icon: Send },
          { key: 'riwayat', label: 'Riwayat',        icon: History },
        ].map(t => {
          const Icon = t.icon
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors
                ${tab === t.key ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab: Chat CS */}
      {tab === 'chat' && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col" style={{ height: '460px' }}>

          {/* Header chat */}
          <div className="flex items-center gap-3 px-4 py-3 bg-teal-600 text-white flex-shrink-0">
            <div className="relative">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Headphones className="w-4 h-4" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-teal-600 rounded-full" />
            </div>
            <div>
              <p className="font-bold text-sm">Customer Service</p>
              <p className="text-[11px] text-teal-100">● Online sekarang</p>
            </div>
          </div>

          {/* Pesan */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {chatMessages.map((msg, i) => {
              const isUser = msg.role === 'user'
              return (
                <div key={i} className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isUser && (
                    <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                      <Headphones className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                  )}
                  <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${isUser
                      ? 'bg-teal-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'}`}>
                    {msg.content}
                  </div>
                </div>
              )
            })}

            {/* Typing indicator */}
            {chatLoading && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 bg-white flex-shrink-0">
            <textarea
              rows={1}
              placeholder="Ketik pesan..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
              style={{ maxHeight: '80px' }}
            />
            <button
              onClick={handleChat}
              disabled={!chatInput.trim() || chatLoading}
              className="w-10 h-10 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab: Form Kirim Pesan */}
      {tab === 'form' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Send className="w-4 h-4 text-teal-600" />
            Kirim Pesan ke Admin
          </p>
          {sent && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl p-3 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Pesan terkirim! Admin akan segera menghubungi kamu.
            </div>
          )}
          {errMsg && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl p-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errMsg}
              <button onClick={() => setErrMsg('')} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Nama *</label>
            <input type="text" placeholder="Nama kamu" value={form.nama}
              onChange={e => handleChange('nama', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">No. WhatsApp <span className="text-gray-400 font-normal">(opsional)</span></label>
            <input type="tel" placeholder="08xxxxxxxxxx" value={form.no_hp}
              onChange={e => handleChange('no_hp', e.target.value)}
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
            <textarea rows={4} placeholder="Tulis pertanyaan atau keluhan kamu..."
              value={form.pesan} onChange={e => handleChange('pesan', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
          </div>
          <button onClick={handleSend} disabled={sending}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {sending ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Mengirim...</>
            ) : (
              <><Send className="w-4 h-4" /> Kirim Pesan</>
            )}
          </button>
        </div>
      )}

      {/* Tab: Riwayat */}
      {tab === 'riwayat' && (
        <div className="space-y-3">
          {loadRiwayat && [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-2.5 bg-gray-100 rounded w-full" />
            </div>
          ))}
          {!loadRiwayat && riwayat.length === 0 && (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Belum ada pesan terkirim</p>
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
                  <Clock className="w-3 h-3" />{formatTgl(p.created_at)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
