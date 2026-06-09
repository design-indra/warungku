'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

// ─── HELPER: Apakah sedang berjalan di dalam Capacitor APK? ───────────────────
function isCapacitorApp() {
  return typeof window !== 'undefined' && !!(window.Capacitor?.isNativePlatform?.())
}

// ─── SCANNER UNTUK PWA (html5-qrcode, pakai WebRTC) ──────────────────────────
function WebScanner({ onDetected, onClose }) {
  const [error, setError]                 = useState(null)
  const [permissionStatus, setPermission] = useState('checking')
  const scannerRef                        = useRef(null)

  useEffect(() => {
    let mounted = true
    async function startScanner() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        const html5QrCode = new Html5Qrcode('reader')
        scannerRef.current = html5QrCode
        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (scannerRef.current?.isScanning) {
              scannerRef.current.stop().then(() => {
                if (mounted) onDetected(decodedText)
              })
            }
          },
          () => {}
        )
        if (mounted) setPermission('granted')
      } catch (err) {
        if (mounted) {
          setPermission('denied')
          setError('Izin kamera ditolak. Aktifkan di Pengaturan HP.')
        }
      }
    }
    startScanner()
    return () => {
      mounted = false
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [onDetected])

  return (
    <ScannerShell onClose={onClose}>
      {permissionStatus === 'checking' && !error && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-sm">Memuat kamera...</p>
        </div>
      )}
      {error ? (
        <ErrorCard message={error} onClose={onClose} />
      ) : (
        <div className="w-full max-w-sm mx-auto overflow-hidden bg-black relative">
          <div id="reader" className="w-full" />
          <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none" />
        </div>
      )}
    </ScannerShell>
  )
}

// ─── SCANNER UNTUK APK (Capacitor Camera Plugin) ──────────────────────────────
function NativeScanner({ onDetected, onClose }) {
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [error, setError]   = useState('')

  const openCamera = async () => {
    setStatus('loading')
    setError('')
    try {
      // Dynamic import agar tidak crash di PWA/browser
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,        // ← paksa kamera, BUKAN galeri
        correctOrientation: true,
        saveToGallery: false,
      })

      // Setelah foto diambil, decode barcode dari gambar menggunakan BarcodeDetector
      // (Android 8+ mendukung BarcodeDetector API)
      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a', 'upc_e'] })
        const img = new Image()
        img.src = image.dataUrl
        await new Promise(r => { img.onload = r })
        const barcodes = await detector.detect(img)
        if (barcodes.length > 0) {
          onDetected(barcodes[0].rawValue)
        } else {
          setError('Barcode tidak terdeteksi. Coba lagi dengan pencahayaan lebih baik.')
          setStatus('error')
        }
      } else {
        // Fallback: pakai html5-qrcode untuk decode static image
        const { Html5Qrcode } = await import('html5-qrcode')
        // Konversi dataUrl ke File
        const res  = await fetch(image.dataUrl)
        const blob = await res.blob()
        const file = new File([blob], 'scan.jpg', { type: 'image/jpeg' })

        const tempId = 'temp-reader-' + Date.now()
        const div    = document.createElement('div')
        div.id       = tempId
        div.style.display = 'none'
        document.body.appendChild(div)

        try {
          const reader = new Html5Qrcode(tempId)
          const result = await reader.scanFile(file, false)
          document.body.removeChild(div)
          onDetected(result)
        } catch {
          document.body.removeChild(div)
          setError('Barcode tidak terdeteksi. Coba ambil foto lebih dekat & terang.')
          setStatus('error')
        }
      }
    } catch (e) {
      // User membatalkan = abaikan, error lain tampilkan
      if (e?.message?.toLowerCase().includes('cancel') || e?.message?.toLowerCase().includes('user denied')) {
        onClose()
      } else {
        setError(e?.message || 'Kamera tidak bisa dibuka.')
        setStatus('error')
      }
    } finally {
      setStatus('idle')
    }
  }

  return (
    <ScannerShell onClose={onClose}>
      <div className="flex flex-col items-center gap-5 px-6 pb-10 text-center">
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
            <rect x="8" y="8" width="8" height="8" rx="1" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-white font-semibold text-base">Scan Barcode</p>
        <p className="text-gray-300 text-sm">Tekan tombol di bawah untuk membuka kamera dan arahkan ke barcode produk.</p>

        {error && (
          <div className="w-full bg-red-900/60 border border-red-500 rounded-xl p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={openCamera}
          disabled={status === 'loading'}
          className="flex items-center gap-2 px-8 py-3.5 bg-white text-gray-900 rounded-2xl font-bold text-base hover:bg-gray-100 transition-colors disabled:opacity-60"
        >
          {status === 'loading' ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Membuka...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Buka Kamera
            </>
          )}
        </button>
      </div>
    </ScannerShell>
  )
}

// ─── SHARED SHELL ─────────────────────────────────────────────────────────────
function ScannerShell({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/50 absolute top-0 left-0 right-0 z-10">
        <span className="text-white font-semibold">Arahkan ke Barcode</span>
        <button onClick={onClose} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 relative flex flex-col items-center justify-center pt-16">
        {children}
      </div>
    </div>
  )
}

function ErrorCard({ message, onClose }) {
  return (
    <div className="bg-white p-5 rounded-xl m-4 text-center">
      <p className="text-red-500 font-semibold mb-2">Akses Ditolak</p>
      <p className="text-gray-700 text-sm">{message}</p>
      <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">Tutup</button>
    </div>
  )
}

// ─── EXPORT UTAMA: Otomatis pilih Native atau Web ─────────────────────────────
export default function BarcodeScanner({ onDetected, onClose }) {
  if (isCapacitorApp()) {
    return <NativeScanner onDetected={onDetected} onClose={onClose} />
  }
  return <WebScanner onDetected={onDetected} onClose={onClose} />
}
