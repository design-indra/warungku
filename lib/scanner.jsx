'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

// Scanner universal — pakai html5-qrcode + WebRTC
// Bekerja di PWA (Chrome) maupun APK (Capacitor WebView load dari URL)
export default function BarcodeScanner({ onDetected, onClose }) {
  const [error, setError]     = useState(null)
  const [ready, setReady]     = useState(false)
  const scannerRef            = useRef(null)

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
              }).catch(() => {
                if (mounted) onDetected(decodedText)
              })
            }
          },
          () => {} // ignore per-frame errors
        )

        if (mounted) setReady(true)
      } catch (err) {
        if (mounted) setError('Izin kamera ditolak atau tidak tersedia. Aktifkan di Pengaturan HP.')
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
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/60 absolute top-0 left-0 right-0 z-10">
        <span className="text-white font-semibold text-sm">Arahkan ke Barcode</span>
        <button
          onClick={onClose}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 relative flex flex-col items-center justify-center pt-16">
        {!ready && !error && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm">Memuat kamera...</p>
          </div>
        )}

        {error && (
          <div className="bg-white p-5 rounded-xl m-4 text-center">
            <p className="text-red-500 font-semibold mb-2">Kamera Tidak Bisa Dibuka</p>
            <p className="text-gray-700 text-sm">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
            >
              Tutup
            </button>
          </div>
        )}

        {!error && (
          <div className="w-full max-w-sm mx-auto overflow-hidden bg-black relative">
            <div id="reader" className="w-full" />
            {ready && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-[50px] border-black/50" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
