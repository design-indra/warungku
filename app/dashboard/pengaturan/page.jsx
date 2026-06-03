'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { User, Lock, Camera, Crown, Users, Plus, Shield } from 'lucide-react'

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
  
  // 1. Ambil tab aktif dari URL, jika tidak ada default ke 'profil'
  const tabFromUrl = searchParams.get('tab') || 'profil'
  const [activeTab, setActiveTab] = useState(tabFromUrl)

  // 2. Efek untuk mensinkronisasi state ketika ada perubahan URL dari Dropdown Profil
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const tabs = [
    { id: 'profil',     label: 'Profil Saya',        icon: User },
    { id: 'password',   label: 'Ganti Kata Sandi',   icon: Lock },
    { id: 'foto',       label: 'Foto Profil',        icon: Camera },
    { id: 'paket',      label: 'Paket Berlangganan', icon: Crown },
    { id: 'user-role',  label: 'User & Role',        icon: Users },
  ]

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    router.push(`/dashboard/pengaturan?tab=${tabId}`)
  }

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
          const isActive = activeTab === tab.id
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
        
        {/* TAB 1: PROFIL SAYA */}
        {activeTab === 'profil' && (
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

        {/* TAB 2: GANTI KATA SANDI */}
        {activeTab === 'password' && (
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

        {/* TAB 3: FOTO PROFIL */}
        {activeTab === 'foto' && (
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

        {/* TAB 4: PAKET BERLANGGANAN */}
        {activeTab === 'paket' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-800">Status & Paket Langganan</h3>
              <p className="text-xs text-gray-400">Pantau masa aktif paket Anda dan pilih opsi berlangganan terbaik.</p>
            </div>
            
            {/* Kartu Status Aktif */}
            <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <Crown className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-amber-900">Paket Premium Pro (Masa Uji Coba)</h4>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">14 Hari Tersisa</span>
                </div>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">Anda sedang menikmati akses penuh fitur kelola multi-cabang, riwayat laporan tak terbatas, dan multi-akun kasir karyawan.</p>
              </div>
            </div>

            {/* Pilihan Paket */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Basic</span>
                <h5 className="text-base font-bold text-gray-800 mt-1">Gratis Selamanya</h5>
                <p className="text-xs text-gray-500 mt-1">Cocok untuk rintisan awal toko tunggal.</p>
                <div className="text-lg font-bold text-gray-900 mt-3">Rp 0 <span className="text-xs font-normal text-gray-400">/ bulan</span></div>
              </div>
              <div className="border-2 border-blue-500 rounded-xl p-4 bg-blue-50/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl">POPULER</div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Professional</span>
                <h5 className="text-base font-bold text-gray-800 mt-1">Premium Full Akses</h5>
                <p className="text-xs text-gray-500 mt-1">Akses mutakhir tanpa batasan fitur.</p>
                <div className="text-lg font-bold text-blue-600 mt-3">Rp 49.000 <span className="text-xs font-normal text-gray-400">/ bulan</span></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: USER & ROLE */}
        {activeTab === 'user-role' && (
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
                  <tr className="border-b border-gray-100">
                    <th className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Nama Lengkap</th>
                    <th className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Email</th>
                    <th className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Hak Akses / Role</th>
                    <th className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">Muhamad Holis</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">holis@warungku.com</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                        <Shield className="w-3 h-3" /> Owner
                      </span>
                    </td>
                    <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Aktif</span></td>
                    <td className="px-4 py-3 text-center"><button className="text-xs font-semibold text-blue-600 hover:text-blue-700 mx-2">Edit</button></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">Andi Kasir 1</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">kasir1@warungku.com</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">Kasir</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Aktif</span></td>
                    <td className="px-4 py-3 text-center"><button className="text-xs font-semibold text-blue-600 hover:text-blue-700 mx-2">Edit</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
