'use client'
import { useEffect, useRef } from 'react'

export default function OnlineSyncHandler() {
  // Track apakah sebelumnya offline
  const wasOffline = useRef(false)

  useEffect(() => {
    // Set flag awal berdasarkan status saat mount
    if (!navigator.onLine) {
      wasOffline.current = true
    }

    const handleOffline = () => {
      wasOffline.current = true
    }

    const handleOnline = async () => {
      // 1. Sync pending transaksi ke Supabase
      try {
        const { syncPendingTransaksi } = await import('@/lib/useOfflineSync')
        await syncPendingTransaksi()
      } catch (e) {
        console.error('Sync transaksi gagal:', e)
      }

      // 2. Jika sebelumnya offline, refresh session Supabase
      //    supaya token valid kembali tanpa hard reload
      if (wasOffline.current) {
        wasOffline.current = false
        try {
          const { createClient } = await import('@/lib/supabase')
          const supabase = createClient()
          // refreshSession() akan ambil token baru dari server
          // Ini NON-BLOCKING — tidak menyebabkan error jika gagal
          await supabase.auth.refreshSession()
        } catch (e) {
          // Abaikan — session lama masih valid untuk sementara
        }
      }
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return null
}
