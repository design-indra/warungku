'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X } from 'lucide-react'

export default function BarcodeScanner({ onDetected, onClose }) {
  const [error, setError] = useState(null)
  const [permissionStatus, setPermissionStatus] = useState('checking')
  const scannerRef = useRef(null)

  useEffect(() => {
    async function startScanner() {
      try {
        setPermissionStatus('granted')
        const html5QrCode = new Html5Qrcode('reader')
        scannerRef.current = html5QrCode

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (scannerRef.current?.isScanning) {
              scannerRef.current.stop().then(() => {
                onDetected(decodedText)
              }).catch(console.error)
            }
          },
          () => {
            // Abaikan error saat memindai
          }
        )
      } catch (err) {
        console.error('Camera error:', err)
        setPermissionStatus('denied')
        setError('Gagal mengakses kamera. Pastikan izin kamera sudah diaktifkan di pengaturan aplikasi.')
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [onDetected])

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/50 absolute top-0 left-0 right-0 z-10">
        <span className="text-white font-semibold">Arahkan ke Barcode</span>
        <button
          onClick={onClose}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center pt-16">
        {permissionStatus === 'checking' && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm">Memuat kamera...</p>
          </div>
        )}

        {error ? (
          <div className="bg-white p-5 rounded-xl m-4 text-center">
            <p className="text-red-500 font-semibold mb-2">Akses Ditolak</p>
            <p className="text-gray-700 text-sm">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
            >
              Tutup
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm mx-auto overflow-hidden bg-black relative">
            <div id="reader" className="w-full" />
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  )
}
