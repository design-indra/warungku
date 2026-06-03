'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { User, Lock, Camera, Crown, Users, Plus, Shield, ShieldAlert } from 'lucide-react'

export default function PengaturanPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500 animate-pulse">Memuat Pengaturan...</div>}>
      <PengaturanContent />
    </Suspense>
  )
}

function PengaturanContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Membaca tab aktif langsung dari URL (?tab=...)
  const currentTab = searchParams.get('tab') || 'profil'

  const tabs = [
    { id: 'profil',     label: 'Profil Saya',        icon: User },
    { id: 'password',   label: 'Ganti Kata Sandi',   icon: Lock },
    { id: 'foto',       label: 'Foto Profil',        icon: Camera },
    { id: 'paket',      label: 'Paket Berlangganan', icon: Crown },
    { id: 'user-role',  label: 'User & Role',        icon: Users },
  ]

  const handleTabChange = (tabId) => {
    router.push(`/dashboard/pengaturan?tab=${tabId}`)
  }

  // State Dummy khusus untuk Tab User & Role (Admin/Kasir) agar berfungsi jelas
  const [users, setUsers] = useState([
    { id: 1, nama: 'Muhamad Holis', email: 'holis@warungku.com', role: 'Owner', status: 'Aktif' },
    { id: 2, nama: 'Andi Wijaya', email: 'andi@warungku.com', role: 'Admin', status: 'Aktif' },
    { id: 3, nama: 'Siti Rahma', email: 'siti@warungku.com', role: 'Kasir', status: 'Aktif' },
  ])

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto pb-24">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Pengaturan Sistem</h1>
        <p className="text-xs text-gray-500 mt-0.5">Kelola data profil, keamanan akun, hingga hak akses karyawan.</p>
      </div>

      {/* Tab Navigasi Atas */}
      <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar mb-6 bg-white p-1 rounded-xl shadow-sm border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Area Konten Masing-Masing Menu */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        
        {/* 1. KONTEN: PROFIL SAYA */}
        {currentTab === 'profil' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Informasi Profil</h3>
              <p className="text-xs text-gray-400">Kelola informasi nama pemilik dan detail nama akun warung Anda.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" defaultValue="Muhamad Holis" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Warung</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" defaultValue="Warungku Digital" />
              </div>
            </div>
            <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
              Simpan Perubahan
            </button>
          </div>
        )}

        {/* 2. KONTEN: GANTI KATA SANDI */}
        {currentTab === 'password' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Keamanan & Kata Sandi</h3>
              <p className="text-xs text-gray-400">Amankan akun Anda dengan memperbarui kata sandi secara berkala.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 mt-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kata Sandi Lama</label>
                <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kata Sandi Baru</label>
                <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="••••••••" />
              </div>
            </div>
            <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
              Perbarui Kata Sandi
            </button>
          </div>
        )}

        {/* 3. KONTEN: FOTO PROFIL */}
        {currentTab === 'foto' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Foto Profil & Warung</h3>
              <p className="text-xs text-gray-400">Unggah logo warung untuk ditampilkan pada struk belanjaan fisik/digital dan dashboard.</p>
            </div>
            <div className="flex items-center gap-5 mt-4 p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50 w-full max-w-xl">
              <div className="w-20 h-20 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm flex-shrink-0">
                <Camera className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <button className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold border border-gray-200 transition-colors shadow-sm">
                  Pilih Berkas Foto
                </button>
                <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">Format yang didukung: JPG, PNG. Rekomendasi ukuran maks 500x500 piksel.</p>
              </div>
            </div>
          </div>
        )}

        {/* 4. KONTEN: PAKET BERLANGGANAN */}
        {currentTab === 'paket' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Status Langganan Anda</h3>
              <p className="text-xs text-gray-400">Pantau tipe paket aktif dan kelola tagihan fitur premium warung Anda.</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl mt-4 flex items-start gap-4 max-w-2xl">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <Crown className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-amber-900">Paket Pro (Free Trial)</h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">Masa uji coba gratis Anda tersisa 14 hari lagi. Tingkatkan ke Pro Permanen untuk membuka kunci fitur kelola multi-cabang tanpa batasan kasir.</p>
                <button className="mt-3 bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
                  Upgrade Ke Premium Pro
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. KONTEN: USER & ROLE (MANAJEMEN ADMIN/KASIR) */}
        {currentTab === 'user-role' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-800">Manajemen Pengguna & Otorisasi</h3>
                <p className="text-xs text-gray-400">Kelola pendaftaran akun staff karyawan, hak tingkatan akses admin, serta otorisasi kasir toko.</p>
              </div>
              <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors self-start sm:self-center shadow-sm">
                <Plus className="w-3.5 h-3.5" />
                Tambah User Baru
              </button>
            </div>

            {/* Tabel Hak Akses User */}
            <div className="overflow-x-auto border border-gray-100 rounded-xl mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <th className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Nama Lengkap</th>
                  <th className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Email</th>
                  <th className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Hak Akses / Role</th>
                  <th className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3 text-center">Aksi</th>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {users.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-800">{item.nama}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{item.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.role === 'Owner' ? 'bg-purple-100 text-purple-700' :
                          item.role === 'Admin' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {item.role === 'Owner' && <Shield className="w-3 h-3" />}
                          {item.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 mx-2">Edit</button>
                        {item.role !== 'Owner' && (
                          <button className="text-xs font-semibold text-red-500 hover:text-red-600 mx-2">Hapus</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
