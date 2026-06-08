'use client'
import { useEffect } from 'react'

export default function OnlineSyncHandler() {
  useEffect(() => {
    const handleOnline = async () => {
      const { syncPendingTransaksi } = await import('@/lib/useOfflineSync')
      await syncPendingTransaksi()
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  return null
}
