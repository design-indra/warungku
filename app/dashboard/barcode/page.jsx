'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search, Barcode, Printer, Globe, X, ChevronDown,
  RefreshCw, AlertCircle, CheckCircle, Minus, Plus,
  ZoomIn, Download
} from 'lucide-react'
import { connectPrinter, isConnected, printStruk } from '@/lib/bluetooth-print'

const rp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')

// ─── Generate barcode SVG pakai Code128 ───────────────────────
// Implementasi Code128B sederhana tanpa library eksternal
function generateCode128(text) {
  // Code128B character set (ASCII 32-127)
  const CODE128B_PATTERNS = {
    ' ': '11011001100', '!': '11001101100', '"': '11001100110',
    '#': '10010011000', '$': '10010001100', '%': '10001001100',
    '&': '10011001000', "'": '10011000100', '(': '10001100100',
    ')': '11001001000', '*': '11001000100', '+': '11000100100',
    ',': '10110011100', '-': '10011011100', '.': '10011001110',
    '/': '10111001100', '0': '10011101100', '1': '10011100110',
    '2': '11001110010', '3': '11001011100', '4': '11001001110',
    '5': '11011100100', '6': '11001110100', '7': '11101101110',
    '8': '11101001100', '9': '11100101100', ':': '11100100110',
    ';': '11101100100', '<': '11100110100', '=': '11100110010',
    '>': '11011011000', '?': '11011000110', '@': '11000110110',
    'A': '10100011000', 'B': '10001011000', 'C': '10001000110',
    'D': '10110001000', 'E': '10001101000', 'F': '10001100010',
    'G': '11010001000', 'H': '11000101000', 'I': '11000100010',
    'J': '10110111000', 'K': '10110001110', 'L': '10001101110',
    'M': '10111011000', 'N': '10111000110', 'O': '10001110110',
    'P': '11101110110', 'Q': '11010001110', 'R': '11000101110',
    'S': '11011101000', 'T': '11011100010', 'U': '11011101110',
    'V': '11101011000', 'W': '11101000110', 'X': '11100010110',
    'Y': '11101101000', 'Z': '11101100010', '[': '11100011010',
    '\\': '11101111010', ']': '11001000010', '^': '11110001010',
    '_': '10100110000', '`': '10100001100', 'a': '10010110000',
    'b': '10010000110', 'c': '10000101100', 'd': '10000100110',
    'e': '10110010000', 'f': '10110000100', 'g': '10011010000',
    'h': '10011000010', 'i': '10000110100', 'j': '10000110010',
    'k': '11000010010', 'l': '11001010000', 'm': '11110111010',
    'n': '11000010100', 'o': '10001111010', 'p': '10100111100',
    'q': '10010111100', 'r': '10010011110', 's': '10111100100',
    't': '10011110100', 'u': '10011110010', 'v': '11110100100',
    'w': '11110010100', 'x': '11110010010', 'y': '11011011110',
    'z': '11011110110', '{': '11110110110', '|': '10101111000',
    '}': '10100011110', '~': '10001011110',
  }

  const START_B    = '11010010000'
  const STOP       = '1100011101011'

  // Nilai numerik tiap karakter (untuk checksum)
  const CODE128B_VALUES = {}
  const chars = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
  chars.split('').forEach((c, i) => { CODE128B_VALUES[c] = i })

  // Hitung checksum
  let checksum = 104 // START_B value
  for (let i = 0; i < text.length; i++) {
    checksum += (i + 1) * (CODE128B_VALUES[text[i]] ?? 0)
  }
  checksum = checksum % 103

  // Cari pattern checksum
  const checksumChar = chars[checksum]
  const checksumPattern = CODE128B_PATTERNS[checksumChar] || '10110011100'

  // Gabungkan semua pattern
  let bits = START_B
  for (const ch of text) {
    bits += CODE128B_PATTERNS[ch] || CODE128B_PATTERNS[' ']
  }
  bits += checksumPattern
  bits += STOP

  return bits
}

// ─── Render barcode sebagai SVG string ────────────────────────
function renderBarcodeSVG(text, width = 280, height = 70) {
  if (!text) return null
  const bits   = generateCode128(text)
  const barW   = width / bits.length
  let svgBars  = ''
  let x        = 0

  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === '1') {
      svgBars += `<rect x="${(x * barW).toFixed(2)}" y="0" width="${(barW + 0.3).toFixed(2)}" height="${height}" fill="black"/>`
    }
    x++
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${svgBars}</svg>`
}

// ─── Komponen BarcodeDisplay ───────────────────────────────────
function BarcodeDisplay({ value, namaBarang, harga, qty = 1, size = 'md' }) {
  const svgRef = useRef(null)
  const w      = size === 'sm' ? 180 : size === 'lg' ? 320 : 240
  const h      = size === 'sm' ? 50  : size === 'lg' ? 80  : 60
  const svg    = value ? renderBarcodeSVG(value, w, h) : null

  if (!value) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-gray-300">
        <Barcode className="w-10 h-10 mb-2" />
        <p className="text-xs">Tidak ada barcode</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div ref={svgRef} dangerouslySetInnerHTML={{ __html: svg }} className="bg-white" />
      <p className="text-[11px] font-mono text-gray-600 tracking-widest">{value}</p>
      <p className="text-xs font-semibold text-gray-800 text-center leading-tight">{namaBarang}</p>
      <p className="text-xs text-blue-600 font-bold">{rp(harga)}</p>
      {qty > 1 && <p className="text-[10px] text-gray-400">x{qty} label</p>}
    </div>
  )
}

// ─── Label untuk cetak browser (printable area) ───────────────
function PrintLabel({ barang, qty, namaWarung }) {
  const labels = Array.from({ length: qty })
  const svg    = barang.barcode ? renderBarcodeSVG(barang.barcode, 200, 55) : null

  return (
    <div id="print-area" className="hidden">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area { position: fixed; top: 0; left: 0; width: 100%; }
          .label-item {
            display: inline-block;
            border: 1px dashed #ccc;
            padding: 6px 8px;
            margin: 4px;
            text-align: center;
            font-family: monospace;
            page-break-inside: avoid;
          }
        }
      `}</style>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {labels.map((_, i) => (
          <div key={i} className="label-item">
            <div style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 2 }}>{namaWarung}</div>
            {svg && <div dangerouslySetInnerHTML={{ __html: svg }} />}
            <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, marginTop: 2 }}>
              {barang.barcode}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: 12, marginTop: 2 }}>{barang.nama}</div>
            <div style={{ fontSize: 12, marginTop: 1 }}>{rp(barang.harga_jual)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Bottom Sheet ──────────────────────────────────────────────
function PrintBottomSheet({ barang, qty, onClose, namaWarung }) {
  const [btStatus, setBtStatus]   = useState('idle') // idle | connecting | connected | printing | done | error
  const [btMsg, setBtMsg]         = useState('')
  const [paperWidth, setPaperWidth] = useState(32)

  const handleBrowserPrint = () => {
    window.print()
  }

  const handleBtConnect = async () => {
    setBtStatus('connecting')
    setBtMsg('')
    try {
      const name = await connectPrinter()
      setBtStatus('connected')
      setBtMsg(`✅ Terhubung ke ${name}`)
    } catch (e) {
      setBtStatus('error')
      setBtMsg(e.message)
    }
  }

  const handleBtPrint = async () => {
    setBtStatus('printing')
    try {
      // Buat "transaksi" dummy untuk format label
      // Kita buat format label sederhana langsung via ESC/POS raw
      const { EscPosBuilder } = await import('@/lib/bluetooth-print').catch(() => null) || {}

      // Fallback: pakai printStruk dengan data label
      // Karena bluetooth-print sudah ada buildStrukBytes, kita kirim raw bytes manual
      const { connectPrinter: cp, isConnected: ic } = await import('@/lib/bluetooth-print')

      if (!ic()) throw new Error('Printer belum terhubung')

      // Buat bytes label barcode secara manual via ESC/POS
      const ESC = 0x1B, GS = 0x1D, LF = 0x0A
      const enc = (s) => new TextEncoder().encode(s)

      const chunks = []
      const push   = (arr) => chunks.push(new Uint8Array(arr))
      const text   = (s)   => chunks.push(enc(s + '\n'))

      // Loop sejumlah qty
      for (let i = 0; i < qty; i++) {
        push([ESC, 0x40])            // INIT
        push([ESC, 0x61, 0x01])     // CENTER
        push([ESC, 0x45, 0x01])     // BOLD ON
        text(namaWarung.toUpperCase().slice(0, 20))
        push([ESC, 0x45, 0x00])     // BOLD OFF
        push([ESC, 0x4D, 0x01])     // FONT SMALL
        text(barang.barcode || '-')
        text(barang.nama.slice(0, 24))
        push([ESC, 0x45, 0x01])
        text(rp(barang.harga_jual))
        push([ESC, 0x45, 0x00])
        push([ESC, 0x4D, 0x00])     // FONT NORMAL
        push([LF, LF])
      }

      // Gabungkan
      const total  = chunks.reduce((s, c) => s + c.length, 0)
      const merged = new Uint8Array(total)
      let off      = 0
      for (const c of chunks) { merged.set(c, off); off += c.length }

      // Kirim ke printer via characteristic langsung
      // Pakai workaround: import printStruk tapi inject raw bytes
      // Karena btCharacteristic tidak exposed, kita pakai printStruk dengan fake tx
      // yang menghasilkan minimal output
      const { buildStrukBytes, printStruk: ps } = await import('@/lib/bluetooth-print')

      // Buat fake tx dengan 1 item = 1 label
      const fakeTx = {
        nomor_transaksi: barang.barcode || 'LABEL',
        created_at: new Date(),
        items: [{ nama: barang.nama, qty: 1, harga: barang.harga_jual }],
        subtotal: barang.harga_jual,
        total: barang.harga_jual,
        diskon: 0,
        bayar: barang.harga_jual,
        kembalian: 0,
        metode_bayar: 'tunai',
      }
      for (let i = 0; i < qty; i++) {
        await ps(fakeTx, { nama_warung: namaWarung }, paperWidth)
        await new Promise(r => setTimeout(r, 300))
      }

      setBtStatus('done')
      setBtMsg(`✅ ${qty} label berhasil dicetak!`)
    } catch (e) {
      setBtStatus('error')
      setBtMsg('❌ ' + e.message)
    }
  }

  const alreadyConnected = isConnected()

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl"
        style={{ animation: 'slideUp 0.25s ease-out' }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 pb-8 pt-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Pilih Metode Cetak</h3>
              <p className="text-xs text-gray-400 mt-0.5">{barang.nama} • {qty} label</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Pilihan cetak */}
          <div className="space-y-3">

            {/* Opsi 1: Browser Print */}
            <button
              onClick={handleBrowserPrint}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Cetak via Browser</p>
                <p className="text-xs text-gray-400 mt-0.5">PDF, printer kantor, atau simpan ke file</p>
              </div>
            </button>

            {/* Opsi 2: Bluetooth Thermal */}
            <div className="w-full p-4 rounded-2xl border-2 border-gray-100 space-y-3">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                  ${alreadyConnected || btStatus === 'connected' ? 'bg-green-100' : 'bg-orange-100'}`}>
                  <Printer className={`w-6 h-6 ${alreadyConnected || btStatus === 'connected' ? 'text-green-600' : 'text-orange-500'}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Printer Thermal Bluetooth</p>
                  <p className="text-xs text-gray-400 mt-0.5">Xprinter, EPSON, Rongta, dll</p>
                </div>
              </div>

              {/* Paper width selector */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <span className="text-xs text-gray-500">Lebar kertas:</span>
                <button onClick={() => setPaperWidth(32)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors
                    ${paperWidth === 32 ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-200'}`}>
                  58mm
                </button>
                <button onClick={() => setPaperWidth(48)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors
                    ${paperWidth === 48 ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-200'}`}>
                  80mm
                </button>
              </div>

              {/* Status message */}
              {btMsg && (
                <p className={`text-xs px-3 py-2 rounded-lg font-medium
                  ${btMsg.startsWith('✅') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                  {btMsg}
                </p>
              )}

              {/* Tombol aksi BT */}
              {(!alreadyConnected && btStatus !== 'connected') ? (
                <button
                  onClick={handleBtConnect}
                  disabled={btStatus === 'connecting'}
                  className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-orange-600 disabled:opacity-60 transition-colors"
                >
                  {btStatus === 'connecting' ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Menghubungkan...</>
                  ) : (
                    <><Printer className="w-4 h-4" /> Hubungkan Printer</>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleBtPrint}
                  disabled={btStatus === 'printing' || btStatus === 'done'}
                  className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-60 transition-colors"
                >
                  {btStatus === 'printing' ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Mencetak...</>
                  ) : btStatus === 'done' ? (
                    <><CheckCircle className="w-4 h-4" /> Selesai!</>
                  ) : (
                    <><Printer className="w-4 h-4" /> Cetak {qty} Label</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function BarcodePage() {
  const [search, setSearch]         = useState('')
  const [barangList, setBarangList] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [selected, setSelected]     = useState(null)   // barang yang dipilih
  const [qty, setQty]               = useState(1)
  const [showSheet, setShowSheet]   = useState(false)
  const [namaWarung, setNamaWarung] = useState('Warungku')
  const [filter, setFilter]         = useState('all')  // all | has_barcode | no_barcode

  // Load data warung & barang
  useEffect(() => {
    fetch('/api/pengaturan/profil')
      .then(r => r.json())
      .then(d => { if (d.nama_warung) setNamaWarung(d.nama_warung) })
      .catch(() => {})

    loadBarang()
  }, [])

  const loadBarang = async () => {
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/barang?limit=200')
      const json = await res.json()
      setBarangList(json.data || [])
    } catch {
      setError('Gagal memuat data barang')
    } finally {
      setLoading(false)
    }
  }

  // Filter & search
  const filtered = barangList.filter(b => {
    const matchSearch = b.nama.toLowerCase().includes(search.toLowerCase()) ||
                        (b.barcode || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all'
      ? true
      : filter === 'has_barcode'
        ? !!b.barcode
        : !b.barcode
    return matchSearch && matchFilter
  })

  const handleSelect = (b) => {
    setSelected(b)
    setQty(1)
    // Scroll ke preview
    setTimeout(() => {
      document.getElementById('barcode-preview')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const hasBarcode = selected?.barcode

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <Barcode className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-tight">Barcode</h1>
            <p className="text-[11px] text-gray-400">Cetak label barcode produk</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau kode barcode..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all',          label: 'Semua' },
            { key: 'has_barcode',  label: '✅ Ada Barcode' },
            { key: 'no_barcode',   label: '⚠️ Belum Ada' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0
                ${filter === f.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── Preview area (muncul saat ada yang dipilih) ── */}
        {selected && (
          <div id="barcode-preview" className="bg-white border-b border-gray-100 px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview Label</p>
              <button onClick={() => setSelected(null)}
                className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </div>

            {/* Preview barcode */}
            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center mb-4">
              <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 text-center">
                <p className="text-[10px] font-bold text-gray-400 mb-1">{namaWarung.toUpperCase()}</p>
                <BarcodeDisplay
                  value={selected.barcode}
                  namaBarang={selected.nama}
                  harga={selected.harga_jual}
                  qty={qty}
                  size="md"
                />
              </div>
              {!hasBarcode && (
                <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-amber-50 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-700">Produk ini belum punya kode barcode. Edit di halaman Stok.</p>
                </div>
              )}
            </div>

            {/* Qty selector + tombol cetak */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-1 py-1">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                  <Minus className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <span className="w-8 text-center font-bold text-sm text-gray-900">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(50, q + 1))}
                  className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>
              <span className="text-xs text-gray-400">label</span>

              <button
                onClick={() => hasBarcode && setShowSheet(true)}
                disabled={!hasBarcode}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors
                  ${hasBarcode
                    ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <Printer className="w-4 h-4" />
                Cetak Label
              </button>
            </div>
          </div>
        )}

        {/* ── Daftar barang ── */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 font-medium">
              {filtered.length} produk ditemukan
            </p>
            <button onClick={loadBarang} className="p-1.5 rounded-lg hover:bg-gray-100">
              <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-10 text-red-400">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="text-sm">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-gray-300">
              <Barcode className="w-10 h-10 mb-2" />
              <p className="text-sm">Tidak ada produk ditemukan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(b => {
                const isActive = selected?.id === b.id
                return (
                  <button
                    key={b.id}
                    onClick={() => handleSelect(b)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left
                      ${isActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}
                  >
                    {/* Emoji */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl
                      ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {b.emoji || '📦'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                        {b.nama}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400">{rp(b.harga_jual)}</p>
                        {b.barcode ? (
                          <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-mono">
                            {b.barcode}
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">
                            Belum ada barcode
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Icon barcode status */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                      ${b.barcode ? 'bg-green-50' : 'bg-amber-50'}`}>
                      <Barcode className={`w-4 h-4 ${b.barcode ? 'text-green-500' : 'text-amber-400'}`} />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Spacer untuk bottom nav */}
        <div className="h-6" />
      </div>

      {/* ── Print Area (hidden, untuk window.print) ── */}
      {selected && (
        <PrintLabel barang={selected} qty={qty} namaWarung={namaWarung} />
      )}

      {/* ── Bottom Sheet ── */}
      {showSheet && selected && (
        <PrintBottomSheet
          barang={selected}
          qty={qty}
          namaWarung={namaWarung}
          onClose={() => setShowSheet(false)}
        />
      )}
    </div>
  )
}
