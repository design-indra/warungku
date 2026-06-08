import { db } from './localdb'

// Simpan barang ke IndexedDB
export async function cacheBarang(data) {
  await db.barang.bulkPut(data)
  await db.meta.put({ key: 'barang_last_sync', value: new Date().toISOString() })
}

// Ambil barang: online → Supabase, offline → IndexedDB
export async function getBarang() {
  // FIX 1: Tambah try-catch saat fetch online.
  // Sebelumnya jika fetch gagal (timeout, dll) saat online, error tidak ditangani
  // dan barang tidak di-fallback ke cache IndexedDB.
  if (navigator.onLine) {
    try {
      const res = await fetch('/api/barang?limit=999')
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const json = await res.json()
      await cacheBarang(json.data)
      return json.data
    } catch (e) {
      // Jika fetch gagal walau online (misal: server lambat / error),
      // fallback ke IndexedDB agar kasir tetap bisa pakai data terakhir.
      console.warn('getBarang online gagal, pakai cache:', e)
      return await db.barang.filter(b => b.is_active !== false).toArray()
    }
  } else {
    return await db.barang
      .filter(b => b.is_active !== false)
      .toArray()
  }
}

// Simpan transaksi: online → langsung, offline → queue
export async function simpanTransaksi(payload) {
  if (navigator.onLine) {
    // FIX 2: Sebelumnya saat online, error dari server (4xx/5xx) tidak ditangani.
    // res.json() dipanggil tapi tidak ada cek res.ok, sehingga error tertelan.
    try {
      const res = await fetch('/api/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal simpan transaksi')
      return json
    } catch (e) {
      // FIX 3: Jika fetch online gagal (jaringan putus tiba-tiba di tengah proses),
      // fallback ke queue offline daripada langsung throw error ke user.
      console.warn('simpanTransaksi online gagal, masuk queue:', e)
      return await _simpanKeQueue(payload)
    }
  } else {
    return await _simpanKeQueue(payload)
  }
}

// Helper: simpan ke antrian offline + update stok lokal
async function _simpanKeQueue(payload) {
  const id = await db.transaksi_queue.add({
    ...payload,
    status: 'pending',
    created_at: new Date().toISOString(),
  })
  // Update stok lokal sementara
  for (const item of payload.items) {
    // FIX 4: Sebelumnya menggunakan item.barang_id, tapi di kasir/page.jsx
    // field yang dipakai adalah item.id (id barang). Samakan key-nya.
    const barangId = item.barang_id ?? item.id
    const barang = await db.barang.get(barangId)
    if (barang) {
      await db.barang.update(barangId, {
        stok: Math.max(0, barang.stok - item.qty)
      })
    }
  }
  return { offline: true, queue_id: id }
}

// Sync semua pending saat online
export async function syncPendingTransaksi() {
  const pending = await db.transaksi_queue
    .where('status').equals('pending')
    .toArray()

  for (const item of pending) {
    try {
      // FIX 5: Sebelumnya spread { id, ...payload } tapi field "status" dan
      // "created_at" (dari queue) ikut terkirim ke API, menyebabkan payload kotor.
      // Sekarang hanya kirim field yang dibutuhkan API transaksi.
      const { id, status, created_at, synced_at, ...payload } = item
      const res = await fetch('/api/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        await db.transaksi_queue.update(id, {
          status: 'synced',
          synced_at: new Date().toISOString()
        })
      } else {
        // FIX 6: Tandai 'failed' jika server tolak (misal 400/403),
        // bukan terus coba ulang selamanya (infinite retry).
        const json = await res.json().catch(() => ({}))
        console.error('Sync ditolak server:', json.error)
        await db.transaksi_queue.update(id, { status: 'failed' })
      }
    } catch (e) {
      // Network error → biarkan status 'pending', akan retry saat online lagi
      console.error('Sync gagal (network):', e)
    }
  }
}
