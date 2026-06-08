'use client'
import { useEffect, useRef } from 'react'

export default function OnlineSyncHandler() {
  const wasOffline = useRef(false)

  useEffect(() => {
    if (!navigator.onLine) {
      wasOffline.current = true
    }

    const handleOffline = () => {
      wasOffline.current = true
    }

    const handleOnline = async () => {
      // FIX 8: Sebelumnya syncPendingTransaksi() dan refreshSession() dijalankan
      // bersamaan tanpa urutan pasti (keduanya awaited tapi dalam satu handler).
      // Sekarang: sync dulu, baru refresh session — karena transaksi butuh token
      // yang valid. Jika token sudah expired, refresh dulu sebelum sync.

      // Langkah 1: refresh session dulu agar token valid sebelum sync ke server
      if (wasOffline.current) {
        wasOffline.current = false
        try {
          const { createClient } = await import('@/lib/supabase')
          const supabase = createClient()
          await supabase.auth.refreshSession()
        } catch (e) {
          // Abaikan — session lama mungkin masih valid
        }
      }

      // Langkah 2: baru sync pending transaksi (token sudah segar)
      try {
        const { syncPendingTransaksi } = await import('@/lib/useOfflineSync')
        await syncPendingTransaksi()
      } catch (e) {
        console.error('Sync transaksi gagal:', e)
      }
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    // FIX 9: Tambah sync otomatis saat komponen mount (jika ada pending dari
    // sesi sebelumnya yang belum tersync — misal app ditutup saat offline).
    if (navigator.onLine) {
      import('@/lib/useOfflineSync')
        .then(({ syncPendingTransaksi }) => syncPendingTransaksi())
        .catch(() => {})
    }

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return null
}
