import Dexie from 'dexie'

export const db = new Dexie('warungku')

db.version(1).stores({
  // Cache barang dari Supabase
  barang: 'id, nama, kode_barang, stok, harga_jual, kategori_id, is_active',

  // Antrian transaksi saat offline
  transaksi_queue: '++id, status, created_at, synced_at',

  // Cache pelanggan
  pelanggan: 'id, nama, telepon',

  // Meta: kapan terakhir sync
  meta: 'key',
})
