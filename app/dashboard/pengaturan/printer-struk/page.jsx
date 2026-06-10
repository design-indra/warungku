'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, Printer, Bluetooth, BluetoothOff, BluetoothSearching,
  Wifi, CheckCircle2, AlertCircle, Save, Eye, FileDown, Zap,
  AlignCenter, Type, Scissors
} from 'lucide-react'

// ─── LOCALSTORAGE KEY ──────────────────────────────────────────────────────────
const LS_KEY = 'warungku_printer_settings'

const DEFAULT_SETTINGS = {
  paperWidth: 32,        // 32 = 58mm, 48 = 80mm
  footerLine1: 'Terima kasih sudah berbelanja!',
  footerLine2: 'Simpan struk sebagai bukti.',
  showStoreName: true,
  showAddress: true,
  showPhone: true,
  showKasir: true,
  autoCut: true,
}

function loadSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
  } catch { return DEFAULT_SETTINGS }
}

function saveSettings(s) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)) } catch {}
}

// ─── DUMMY TX UNTUK PREVIEW ────────────────────────────────────────────────────
const DUMMY_TX = {
  nomor_transaksi: 'TRX-20250607-001',
  created_at: new Date().toISOString(),
  items: [
    { nama: 'Mie Goreng Indomie', qty: 3, harga: 3500 },
    { nama: 'Teh Botol Sosro', qty: 2, harga: 5000 },
    { nama: 'Roti Tawar Sari Roti', qty: 1, harga: 12000 },
  ],
  subtotal: 32500,
  diskon: 0,
  total: 32500,
  bayar: 50000,
  kembalian: 17500,
  metode_bayar: 'tunai',
}

const rp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')
const fmt = (d) => new Date(d).toLocaleString('id-ID', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
})

// ─── PREVIEW STRUK COMPONENT ───────────────────────────────────────────────────
function PreviewStruk({ settings, store }) {
  const w = settings.paperWidth === 48 ? '80mm' : '58mm'
  const charW = settings.paperWidth
  const dash = '-'.repeat(charW)

  const row = (left, right) => {
    const gap = Math.max(1, charW - left.length - right.length)
    return left + ' '.repeat(gap) + right
  }

  return (
    <div className="flex justify-center">
      <div
        className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 font-mono text-[11px] leading-5 overflow-x-auto"
        style={{ width: w, minWidth: '200px', maxWidth: '100%' }}
      >
        {/* Header toko */}
        {settings.showStoreName && (
          <div className="text-center font-bold text-sm tracking-widest">
            {store?.nama_warung || 'NAMA WARUNG'}
          </div>
        )}
        {settings.showAddress && store?.alamat && (
          <div className="text-center text-[10px] text-gray-500">{store.alamat}</div>
        )}
        {settings.showPhone && store?.no_hp && (
          <div className="text-center text-[10px] text-gray-500">Telp: {store.no_hp}</div>
        )}

        <div className="text-gray-300 my-1">{dash}</div>

        {/* Meta */}
        <div className="text-[10px] text-gray-500">
          <div className="flex justify-between"><span>No. Trx</span><span>{DUMMY_TX.nomor_transaksi}</span></div>
          <div className="flex justify-between"><span>Tanggal</span><span>{fmt(DUMMY_TX.created_at)}</span></div>
          {settings.showKasir && <div className="flex justify-between"><span>Kasir</span><span>Admin</span></div>}
        </div>

        <div className="text-gray-300 my-1">{dash}</div>

        {/* Items */}
        {DUMMY_TX.items.map((item, i) => (
          <div key={i}>
            <div className="truncate">{item.nama}</div>
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>  {item.qty} x {item.harga.toLocaleString('id-ID')}</span>
              <span>{(item.qty * item.harga).toLocaleString('id-ID')}</span>
            </div>
          </div>
        ))}

        <div className="text-gray-300 my-1">{dash}</div>

        {/* Totals */}
        <div className="text-[10px] text-gray-500 space-y-0.5">
          <div className="flex justify-between"><span>Subtotal</span><span>{rp(DUMMY_TX.subtotal)}</span></div>
          {DUMMY_TX.diskon > 0 && <div className="flex justify-between"><span>Diskon</span><span>-{rp(DUMMY_TX.diskon)}</span></div>}
        </div>
        <div className="flex justify-between font-bold text-sm mt-1">
          <span>TOTAL BAYAR</span><span>{rp(DUMMY_TX.total)}</span>
        </div>

        <div className="text-gray-300 my-1">{dash}</div>

        <div className="text-[10px] text-gray-500 space-y-0.5">
          <div className="flex justify-between"><span>Metode</span><span>Tunai</span></div>
          <div className="flex justify-between"><span>Dibayar</span><span>{rp(DUMMY_TX.bayar)}</span></div>
          <div className="flex justify-between font-bold text-gray-700"><span>Kembalian</span><span>{rp(DUMMY_TX.kembalian)}</span></div>
        </div>

        <div className="text-gray-300 my-1">{dash}</div>

        {/* Footer */}
        {settings.footerLine1 && (
          <div className="text-center text-[10px] text-gray-400">{settings.footerLine1}</div>
        )}
        {settings.footerLine2 && (
          <div className="text-center text-[10px] text-gray-400">{settings.footerLine2}</div>
        )}

        {settings.autoCut && (
          <div className="flex items-center gap-1 mt-2 text-gray-200">
            <div className="flex-1 border-t border-dashed border-gray-200" />
            <Scissors className="w-3 h-3 text-gray-300" />
            <div className="flex-1 border-t border-dashed border-gray-200" />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function PrinterStrukPage() {
  const router = useRouter()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [store, setStore] = useState({ nama_warung: '', alamat: '', no_hp: '' })
  const [saved, setSaved] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Bluetooth state
  const [btStatus, setBtStatus] = useState('idle') // idle | connecting | connected | printing | error
  const [btName, setBtName] = useState('')
  const [btError, setBtError] = useState('')

  useEffect(() => {
    setSettings(loadSettings())
    fetch('/api/pengaturan/profil')
      .then(r => r.json())
      .then(j => { if (j.nama_warung) setStore(j) })
      .catch(() => {})
  }, [])

  const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }))

  const handleSave = () => {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // ── Bluetooth actions ──
  const handleConnect = useCallback(async () => {
    setBtStatus('connecting'); setBtError('')
    try {
      const { connectPrinter } = await import('@/lib/bluetooth-print')
      const name = await connectPrinter()
      setBtName(name); setBtStatus('connected')
    } catch (e) { setBtError(e.message); setBtStatus('error') }
  }, [])

  const handleDisconnect = useCallback(async () => {
    const { disconnectPrinter } = await import('@/lib/bluetooth-print')
    await disconnectPrinter()
    setBtStatus('idle'); setBtName('')
  }, [])

  const handleTestPrint = useCallback(async () => {
    setBtStatus('printing'); setBtError('')
    try {
      const { printStruk, isConnected, connectPrinter } = await import('@/lib/bluetooth-print')
      if (!isConnected()) {
        const name = await connectPrinter(); setBtName(name)
      }
      await printStruk(DUMMY_TX, store, settings.paperWidth)
      setBtStatus('connected')
    } catch (e) { setBtError(e.message); setBtStatus('error') }
  }, [store, settings.paperWidth])

  const handleTestPDF = async () => {
    const mmWidth = settings.paperWidth === 48 ? '80mm' : '58mm'
    const itemsHtml = DUMMY_TX.items.map(item =>
      `<div class="row"><span>${item.nama} <small>(${item.qty}x${item.harga.toLocaleString('id-ID')})</small></span><span>${(item.qty * item.harga).toLocaleString('id-ID')}</span></div>`
    ).join('')
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Test Struk</title>
    <style>@page{margin:0;size:${mmWidth} auto;}*{box-sizing:border-box;}body{font-family:'Courier New',monospace;font-size:11px;width:${mmWidth};margin:0 auto;padding:6mm 4mm;color:#111;}
    .center{text-align:center;}.bold{font-weight:700;}.small{font-size:9px;color:#555;}.dash{border-top:1px dashed #999;margin:5px 0;}
    .row{display:flex;justify-content:space-between;margin-bottom:2px;}.total-row{display:flex;justify-content:space-between;font-weight:700;font-size:12px;border-top:1px solid #333;padding-top:4px;margin-top:4px;}
    @media print{body{-webkit-print-color-adjust:exact;}}</style></head>
    <body>
    ${settings.showStoreName ? `<div class="center bold" style="font-size:13px;letter-spacing:2px;">${store.nama_warung || 'WARUNGKU'}</div>` : ''}
    ${settings.showAddress && store.alamat ? `<div class="center small">${store.alamat}</div>` : ''}
    ${settings.showPhone && store.no_hp ? `<div class="center small">Telp: ${store.no_hp}</div>` : ''}
    <div class="dash"></div>
    <div class="row"><span>No. Transaksi</span><span>${DUMMY_TX.nomor_transaksi}</span></div>
    <div class="row"><span>Tanggal</span><span>${fmt(DUMMY_TX.created_at)}</span></div>
    ${settings.showKasir ? `<div class="row"><span>Kasir</span><span>Admin</span></div>` : ''}
    <div class="dash"></div>
    ${itemsHtml}
    <div class="dash"></div>
    <div class="row"><span>Subtotal</span><span>${rp(DUMMY_TX.subtotal)}</span></div>
    <div class="total-row"><span>TOTAL</span><span>${rp(DUMMY_TX.total)}</span></div>
    <div class="dash"></div>
    <div class="row"><span>Dibayar (Tunai)</span><span>${rp(DUMMY_TX.bayar)}</span></div>
    <div class="row"><span>Kembalian</span><span>${rp(DUMMY_TX.kembalian)}</span></div>
    <div class="dash"></div>
    ${settings.footerLine1 ? `<div class="center small">${settings.footerLine1}</div>` : ''}
    ${settings.footerLine2 ? `<div class="center small">${settings.footerLine2}</div>` : ''}
    </body></html>`

    // ── APK Capacitor: window.open() diblokir → simpan HTML lalu share native ──
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
      try {
        const { Filesystem, Directory } = await import('@capacitor/filesystem')
        const { Share } = await import('@capacitor/share')
        const base64 = btoa(unescape(encodeURIComponent(html)))
        await Filesystem.writeFile({
          path: 'struk/test-struk.html',
          data: base64,
          directory: Directory.Cache,
          recursive: true,
        })
        const { uri } = await Filesystem.getUri({
          path: 'struk/test-struk.html',
          directory: Directory.Cache,
        })
        await Share.share({
          title: 'Test Struk PDF',
          text: 'Buka di Chrome lalu Print / Save as PDF',
          url: uri,
          dialogTitle: 'Simpan / Cetak Test Struk',
        })
      } catch (err) {
        if (err?.name !== 'AbortError') alert('Gagal membuka test PDF: ' + (err?.message || err))
      }
      return
    }

    // ── PWA / Browser: buka tab baru lalu print ──
    const w = window.open('', '_blank')
    if (!w) { alert('Popup diblokir browser. Izinkan popup untuk halaman ini.'); return }
    w.document.write(html)
    w.document.close()
    w.onload = () => { w.print() }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-base font-bold text-gray-900 flex-1">Printer & Struk</h1>
        <button
          onClick={() => setShowPreview(v => !v)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${showPreview ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>
      </div>

      <div className="flex-1 overflow-y-auto page-content space-y-4">

        {/* ── PREVIEW STRUK ── */}
        {showPreview && (
          <div className="card p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Preview Struk</p>
            <PreviewStruk settings={settings} store={store} />
          </div>
        )}

        {/* ── KONEKSI BLUETOOTH ── */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Bluetooth className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Koneksi Bluetooth</p>
              <p className="text-xs text-gray-400">Printer thermal 58mm / 80mm</p>
            </div>
          </div>

          {/* Status */}
          {btStatus === 'connected' && (
            <div className="flex items-center justify-between px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-blue-700">{btName || 'Printer Terhubung'}</span>
              </div>
              <button onClick={handleDisconnect} className="text-[10px] text-red-500 font-bold hover:text-red-700">
                Putuskan
              </button>
            </div>
          )}
          {btStatus === 'error' && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl mb-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{btError}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {/* Tombol connect/disconnect */}
            {btStatus !== 'connected' ? (
              <button
                onClick={handleConnect}
                disabled={btStatus === 'connecting'}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 transition-colors ${
                  btStatus === 'connecting'
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                }`}
              >
                {btStatus === 'connecting'
                  ? <><BluetoothSearching className="w-4 h-4 animate-pulse" /> Mencari...</>
                  : <><Bluetooth className="w-4 h-4" /> Hubungkan</>
                }
              </button>
            ) : (
              <button
                onClick={handleTestPrint}
                disabled={btStatus === 'printing'}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 transition-colors ${
                  btStatus === 'printing'
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-700 border-blue-700 text-white hover:bg-blue-800'
                }`}
              >
                {btStatus === 'printing'
                  ? <><BluetoothSearching className="w-4 h-4 animate-spin" /> Mencetak...</>
                  : <><Zap className="w-4 h-4" /> Test Print BT</>
                }
              </button>
            )}

            {/* Test PDF */}
            <button
              onClick={handleTestPDF}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              <FileDown className="w-4 h-4" /> Test PDF
            </button>
          </div>

          <p className="text-[10px] text-gray-400 text-center mt-2">
            Gunakan Chrome Android untuk koneksi Bluetooth
          </p>
        </div>

        {/* ── UKURAN KERTAS ── */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Printer className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Ukuran Kertas</p>
              <p className="text-xs text-gray-400">Berlaku untuk Bluetooth & PDF</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { w: 32, label: '58mm', sub: 'Printer mini / portable' },
              { w: 48, label: '80mm', sub: 'Printer kasir standar' },
            ].map(opt => (
              <button
                key={opt.w}
                onClick={() => update('paperWidth', opt.w)}
                className={`py-4 rounded-xl border-2 text-center transition-all ${
                  settings.paperWidth === opt.w
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className={`font-bold text-base ${settings.paperWidth === opt.w ? 'text-blue-700' : 'text-gray-800'}`}>
                  {opt.label}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{opt.sub}</p>
                {settings.paperWidth === opt.w && (
                  <div className="flex justify-center mt-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAMPILAN STRUK ── */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <AlignCenter className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Tampilan Struk</p>
              <p className="text-xs text-gray-400">Pilih info yang tampil di struk</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { key: 'showStoreName', label: 'Nama Warung', sub: 'Tampilkan nama warung di header' },
              { key: 'showAddress',   label: 'Alamat',      sub: 'Tampilkan alamat warung' },
              { key: 'showPhone',     label: 'Nomor HP',    sub: 'Tampilkan nomor telepon' },
              { key: 'showKasir',     label: 'Nama Kasir',  sub: 'Tampilkan nama kasir' },
              { key: 'autoCut',       label: 'Auto Cut',    sub: 'Potong kertas otomatis setelah cetak' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
                <button
                  onClick={() => update(item.key, !settings[item.key])}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${settings[item.key] ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── PESAN FOOTER ── */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Type className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Pesan Footer Struk</p>
              <p className="text-xs text-gray-400">Ucapan di bagian bawah struk</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Baris 1</label>
              <input
                value={settings.footerLine1}
                onChange={e => update('footerLine1', e.target.value)}
                placeholder="Terima kasih sudah berbelanja!"
                maxLength={48}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Baris 2</label>
              <input
                value={settings.footerLine2}
                onChange={e => update('footerLine2', e.target.value)}
                placeholder="Simpan struk sebagai bukti."
                maxLength={48}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-400"
              />
            </div>
            <p className="text-[10px] text-gray-400">Maks. 48 karakter per baris (untuk kertas 80mm)</p>
          </div>
        </div>

        {/* ── INFO KONEKSI ── */}
        <div className="card p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Jenis Koneksi</p>
          <div className="space-y-3">
            {[
              { icon: Bluetooth, label: 'Bluetooth', desc: 'Printer thermal BT (58mm / 80mm) — tersedia', color: 'text-blue-500', bg: 'bg-blue-50', active: true },
              { icon: FileDown,  label: 'PDF / Print Browser', desc: 'Cetak via dialog print browser — tersedia', color: 'text-emerald-500', bg: 'bg-emerald-50', active: true },
              { icon: Wifi,      label: 'WiFi / LAN', desc: 'Printer jaringan via IP Address — segera', color: 'text-gray-300', bg: 'bg-gray-50', active: false },
            ].map(item => (
              <div key={item.label} className={`flex items-center gap-3 ${!item.active ? 'opacity-40' : ''}`}>
                <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                {item.active && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* spacer */}
        <div className="h-2" />
      </div>

      {/* ── TOMBOL SIMPAN ── */}
      <div className="bg-white border-t border-gray-100 p-4 flex-shrink-0">
        <button
          onClick={handleSave}
          className={`w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
            saved ? 'bg-green-600 text-white' : 'bg-blue-700 hover:bg-blue-800 text-white'
          }`}
        >
          {saved
            ? <><CheckCircle2 className="w-5 h-5" /> Pengaturan Disimpan!</>
            : <><Save className="w-5 h-5" /> Simpan Pengaturan</>
          }
        </button>
      </div>
    </div>
  )
}
