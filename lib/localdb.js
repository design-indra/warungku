import Dexie from 'dexie'

export const db = new Dexie('warungku')

// FIX 7: Versi schema dinaikkan dari 1 ke 2 untuk menambah field status 'failed'
// agar transaksi yang ditolak server bisa dibedakan dari yang belum dicoba.
// Dexie butuh version baru setiap schema berubah.
db.version(1).stores({
  barang: 'id, nama, kode_barang, stok, harga_jual, kategori_id, is_active',
  transaksi_queue: '++id, status, created_at, synced_at',
  pelanggan: 'id, nama, telepon',
  meta: 'key',
})

// Version 2: tambah index 'failed_at' untuk transaksi yang gagal di server
db.version(2).stores({
  barang: 'id, nama, kode_barang, stok, harga_jual, kategori_id, is_active',
  transaksi_queue: '++id, status, created_at, synced_at, failed_at',
  pelanggan: 'id, nama, telepon',
  meta: 'key',
})
