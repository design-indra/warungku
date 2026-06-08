import { db } from './localdb'

// Simpan barang ke IndexedDB
export async function cacheBarang(data) {
  await db.barang.bulkPut(data)
  await db.meta.put({ key: 'barang_last_sync', value: new Date().toISOString() })
}

// Ambil barang: online → Supabase, offline → IndexedDB
export async function getBarang() {
  if (navigator.onLine) {
    const res = await fetch('/api/barang?limit=999')
    const json = await res.json()
    await cacheBarang(json.data)
    return json.data
  } else {
    return await db.barang
      .filter(b => b.is_active !== false)
      .toArray()
  }
}

// Simpan transaksi: online → langsung, offline → queue
export async function simpanTransaksi(payload) {
  if (navigator.onLine) {
    const res = await fetch('/api/transaksi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    return await res.json()
  } else {
    // Masuk antrian offline
    const id = await db.transaksi_queue.add({
      ...payload,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    // Update stok lokal sementara
    for (const item of payload.items) {
      const barang = await db.barang.get(item.barang_id)
      if (barang) {
        await db.barang.update(item.barang_id, {
          stok: barang.stok - item.qty
        })
      }
    }
    return { offline: true, queue_id: id }
  }
}

// Sync semua pending saat online
export async function syncPendingTransaksi() {
  const pending = await db.transaksi_queue
    .where('status').equals('pending')
    .toArray()

  for (const item of pending) {
    try {
      const { id, ...payload } = item
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
      }
    } catch (e) {
      console.error('Sync gagal:', e)
    }
  }
}
