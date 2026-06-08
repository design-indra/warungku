'use client'
import { useState, useEffect } from 'react'

export default function OfflineBadge() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline  = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    // Guard: hanya jalan di browser
    if (typeof window === 'undefined') return

    async function countPending() {
      try {
        const { db } = await import('@/lib/localdb')
        const count = await db.transaksi_queue
          .where('status').equals('pending')
          .count()
        setPendingCount(count)
      } catch (e) {
        // Dexie belum siap, abaikan
      }
    }

    countPending()
    const interval = setInterval(countPending, 5000)
    return () => clearInterval(interval)
  }, [])

  if (isOnline && pendingCount === 0) return null

  return (
    <div className={`fixed top-0 left-0 right-0 text-white text-center text-sm py-2 z-50
      ${isOnline ? 'bg-blue-500' : 'bg-yellow-500'}`}>
      {isOnline
        ? `🔄 Menyinkronkan ${pendingCount} transaksi...`
        : `⚠️ Offline — transaksi tersimpan lokal${pendingCount > 0 ? ` (${pendingCount} pending)` : ''}`
      }
    </div>
  )
}
