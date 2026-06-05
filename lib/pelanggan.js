/**
 * lib/pelanggan.js
 * Helper functions untuk semua operasi data pelanggan.
 * Import: import { fetchPelanggan, tambahPelanggan, cariPelanggan } from '@/lib/pelanggan'
 */

/**
 * Ambil seluruh daftar pelanggan dari API.
 * @returns {Promise<Array>} Array of { id, nama, no_hp, alamat, ... }
 */
export async function fetchPelanggan() {
  const res = await fetch('/api/pelanggan')
  if (!res.ok) throw new Error('Gagal mengambil data pelanggan')
  const json = await res.json()
  return json.data || []
}

/**
 * Tambah pelanggan baru via API.
 * @param {string} nama  - Nama pelanggan (wajib)
 * @param {string} no_hp - Nomor HP pelanggan (wajib)
 * @returns {Promise<Object>} Data pelanggan yang baru dibuat { id, nama, no_hp, ... }
 */
export async function tambahPelanggan(nama, no_hp) {
  const res = await fetch('/api/pelanggan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nama: nama.trim(), no_hp: no_hp.trim() }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Gagal menambah pelanggan')
  return json.data
}

/**
 * Filter pelanggan secara lokal berdasarkan keyword (nama atau no HP).
 * Tidak melakukan API call — gunakan array yang sudah di-fetch sebelumnya.
 * @param {Array}  list    - Array pelanggan hasil fetchPelanggan()
 * @param {string} keyword - Kata kunci pencarian
 * @returns {Array} Subset dari list yang cocok
 */
export function cariPelanggan(list, keyword) {
  if (!keyword || !keyword.trim()) return list
  const q = keyword.trim().toLowerCase()
  return list.filter(
    (p) =>
      p.nama?.toLowerCase().includes(q) ||
      p.no_hp?.toLowerCase().includes(q)
  )
}
