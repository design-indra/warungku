'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X } from 'lucide-react'

export default function BarcodeScanner({ onDetected, onClose }) {
  const [error, setError] = useState(null)
  const scannerRef = useRef(null)

  useEffect(() => {
    // Inisialisasi scanner
    const html5QrCode = new Html5Qrcode("reader")
    scannerRef.current = html5QrCode

    html5QrCode.start(
      { facingMode: "environment" }, // Prioritaskan kamera belakang
      {
        fps: 10,
        qrbox: { width: 250, height: 250 } // Kotak bidik di tengah
      },
      (decodedText) => {
        // Jika berhasil membaca barcode
        if (scannerRef.current?.isScanning) {
          scannerRef.current.stop().then(() => {
            onDetected(decodedText)
          }).catch(console.error)
        }
      },
      (errorMessage) => {
        // Abaikan error saat sedang mencari/fokus barcode
      }
    ).catch((err) => {
      console.error("Camera start error", err)
      setError("Gagal mengakses kamera. Pastikan izin kamera sudah diberikan di browser.")
    })

    // Cleanup saat komponen ditutup/dihancurkan
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [onDetected])

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header Modal Kamera */}
      <div className="flex items-center justify-between p-4 bg-black/50 absolute top-0 left-0 right-0 z-10">
        <span className="text-white font-semibold">Arahkan ke Barcode</span>
        <button 
          onClick={onClose} 
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Viewport Scanner */}
      <div className="flex-1 relative flex flex-col items-center justify-center pt-16">
        {error ? (
          <div className="bg-white p-4 rounded-xl m-4 text-center">
            <p className="text-red-500 font-semibold mb-2">Oops!</p>
            <p className="text-gray-700 text-sm">{error}</p>
          </div>
        ) : (
          <div className="w-full max-w-sm mx-auto overflow-hidden bg-black relative">
            <div id="reader" className="w-full" />
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none" />
          </div>
        )}
        <p className="text-gray-400 text-sm mt-6 text-center px-4">
          Arahkan kamera ke barcode barang.<br />Scanner akan membaca secara otomatis.
        </p>
      </div>
    </div>
  )
}
