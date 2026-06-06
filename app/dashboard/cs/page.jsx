'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Headphones, MessageSquare, ChevronDown, ChevronUp,
  Send, Phone, HelpCircle, Zap, ShoppingCart, CreditCard, Package,
  Lock, Crown
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
    a: 'Bisa chat langsung di sini dengan AI CS kami, atau WhatsApp admin langsung (khusus pelanggan Basic & Pro). Tim kami aktif Senin–Sabtu pukul 08.00–21.00 WIB.',
  },
]

export default function CSPage() {
  const [openFaq, setOpenFaq] = useState(null)
  const [plan, setPlan]       = useState(null)
  const isPremium             = plan === 'basic' || plan === 'pro'

  // Chat state
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Halo! Selamat datang di Customer Service WarungKu 👋 Ada yang bisa saya bantu?' }
  ])
  const [chatInput, setChatInput]   = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  // Fetch plan user
  useEffect(() => {
    fetch('/api/subscription/status')
      .then(r => r.json())
      .then(json => setPlan(json.plan || 'free'))
      .catch(() => setPlan('free'))
  }, [])

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
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, saya sedang gangguan teknis. Coba beberapa saat lagi ya 🙏' }])
    } finally {
      setChatLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat() }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
          <Headphones className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Customer Service</h1>
          <p className="text-xs text-gray-400">Kami siap membantu kamu</p>
        </div>
        {plan && (
          <span className={`ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1
            ${isPremium ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
            {isPremium ? <><Crown className="w-3 h-3" /> {plan.toUpperCase()}</> : 'FREE'}
          </span>
        )}
      </div>

      {/* Chat CS */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col mb-5" style={{ height: '460px' }}>
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-700 text-white flex-shrink-0">
          <div className="relative">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-blue-700 rounded-full" />
          </div>
          <div>
            <p className="font-bold text-sm">AI Customer Service</p>
            <p className="text-[11px] text-blue-100">● Online sekarang · Powered by Grok</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
          {chatMessages.map((msg, i) => {
            const isUser = msg.role === 'user'
            return (
              <div key={i} className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isUser && (
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                    <Headphones className="w-3.5 h-3.5 text-blue-700" />
                  </div>
                )}
                <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${isUser ? 'bg-blue-700 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'}`}>
                  {msg.content}
                </div>
              </div>
            )
          })}
          {chatLoading && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Headphones className="w-3.5 h-3.5 text-blue-700" />
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
        <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 bg-white flex-shrink-0">
          <textarea rows={1} placeholder="Ketik pertanyaan kamu..."
            value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={handleKeyDown}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            style={{ maxHeight: '80px' }} />
          <button onClick={handleChat} disabled={!chatInput.trim() || chatLoading}
            className="w-10 h-10 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tombol WA Admin — hanya untuk Basic & Pro */}
      {plan !== null && (
        isPremium ? (
          <a
            href={`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent('Halo admin WarungKu, saya ingin bertanya...')}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl p-4 mb-5 transition-colors shadow-sm"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Chat WhatsApp Admin</p>
              <p className="text-xs text-blue-100">Aktif Senin–Sabtu · 08.00–21.00 WIB</p>
            </div>
            <span className="text-2xl">💬</span>
          </a>
        ) : (
          <div className="flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-2xl p-4 mb-5">
            <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-500">Chat WhatsApp Admin</p>
              <p className="text-xs text-gray-400">Khusus pelanggan Basic & Pro</p>
            </div>
            <a href="/dashboard/berlangganan"
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors flex-shrink-0">
              <Crown className="w-3.5 h-3.5" /> Upgrade
            </a>
          </div>
        )
      )}

      {/* FAQ */}
      <div className="mb-5">
        <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-700" />
          Pertanyaan yang Sering Ditanyakan
        </p>
        <div className="space-y-2">
          {FAQ.map((item, i) => {
            const Icon = item.icon
            const isOpen = openFaq === i
            return (
              <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(isOpen ? null : i)}>
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-700" />
                  </div>
                  <p className="flex-1 text-sm font-semibold text-gray-800 text-left">{item.q}</p>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-sm text-gray-700 leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
