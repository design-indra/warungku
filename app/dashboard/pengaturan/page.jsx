'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { User, Lock, Camera, Crown, Shield, Users } from 'lucide-react'

// Pembungkus Suspense wajib di Next.js App Router saat menggunakan useSearchParams
export default function PengaturanPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Memuat Pengaturan...</div>}>
      <PengaturanContent />
    </Suspense>
  )
}

function PengaturanContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Membaca tab dari URL secara langsung, jika kosong default ke 'profil'
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

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Pengaturan Sistem</h1>

      {/* Tab Navigasi Atas */}
      <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
        
        {/* Konten: Profil Saya */}
        {currentTab === 'profil' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-800">Informasi Profil</h3>
            <p className="text-xs text-gray-400">Kelola informasi nama dan detail akun warung Anda.</p>
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Muhamad Holis" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Warung</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Warungku Digital" />
              </div>
            </div>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Simpan Perubahan
            </button>
          </div>
        )}

        {/* Konten: Ganti Kata Sandi */}
        {currentTab === 'password' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-800">Keamanan & Kata Sandi</h3>
            <p className="text-xs text-gray-400">Amankan akun Anda dengan memperbarui kata sandi secara berkala.</p>
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kata Sandi Lama</label>
                <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kata Sandi Baru</label>
                <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="••••••••" />
              </div>
            </div>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Perbarui Kata Sandi
            </button>
          </div>
        )}

        {/* Konten: Foto Profil */}
        {currentTab === 'foto' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-800">Foto Profil & Warung</h3>
            <p className="text-xs text-gray-400">Unggah logo atau foto warung untuk ditampilkan pada struk belanjaan dan dashboard.</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="w-20 h-20 bg-gray-100 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 transition-colors">
                  Pilih Gambar
                </button>
                <p className="text-[11px] text-gray-400 mt-1">Maksimal resolusi 500x500px, format JPG/PNG.</p>
              </div>
            </div>
          </div>
        )}

        {/* Konten: Paket Berlangganan */}
        {currentTab === 'paket' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-800">Status Langganan Anda</h3>
            <p className="text-xs text-gray-400">Pantau paket aktif dan kelola tagihan langganan fitur premium warung Anda.</p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mt-4 flex items-start gap-3">
              <Crown className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">Paket Free Trial</h4>
                <p className="text-xs text-amber-700 mt-0.5">Masa aktif Anda tersisa 14 hari lagi. Tingkatkan ke Pro untuk akses tanpa batas.</p>
                <button className="mt-3 bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                  Upgrade Premium
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Konten: User & Role */}
        {currentTab === 'user-role' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-800">Manajemen Karyawan (Kasir)</h3>
            <p className="text-xs text-gray-400">Kelola daftar akun karyawan dan akses otorisasi untuk masing-masing cabang warung.</p>
            {/* Tampilan default tabel cabang/user anda */}
            <div className="mt-4 text-xs text-gray-500 border border-gray-100 rounded-lg p-4 bg-gray-50">
              Modul data user, kasir, dan cabang aktif.
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
