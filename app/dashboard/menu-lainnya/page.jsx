'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  Store, Users, Settings, Printer,
  Tag, PackageOpen, Truck, DollarSign, Barcode,
  Clock, HelpCircle, Headphones,
  Lock, LogOut, ChevronRight
} from 'lucide-react'

const kelolaSections = [
  {
    id: 'profil',
    icon: Store,
    label: 'Profil Usaha',
    sub: 'Kelola informasi warung Anda',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    href: '/dashboard/pengaturan?tab=profil',
  },
  {
    id: 'pengguna',
    icon: Users,
    label: 'Pengguna',
    sub: 'Kelola akun dan hak akses',
    color: 'text-green-600',
    bg: 'bg-green-50',
    href: '/dashboard/pengaturan?tab=users',
  },
  {
    id: 'pengaturan',
    icon: Settings,
    label: 'Pengaturan',
    sub: 'Atur preferensi aplikasi',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    href: '/dashboard/pengaturan',
  },
  {
    id: 'printer',
    icon: Printer,
    label: 'Printer & Struk',
    sub: 'Atur perangkat cetak struk',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    href: '/dashboard/pengaturan?tab=printer',
  },
]

const masterData = [
  {
    icon: Tag,
    label: 'Kategori Barang',
    sub: 'Kelola kategori untuk mengelompokkan barang',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    href: '/dashboard/stok?tab=kategori',
  },
  {
    icon: PackageOpen,
    label: 'Satuan Barang',
    sub: 'Kelola satuan seperti pcs, kg, liter, dll',
    color: 'text-green-600',
    bg: 'bg-green-50',
    href: '/dashboard/pengaturan?tab=satuan',
  },
  {
    icon: Truck,
    label: 'Pemasok',
    sub: 'Kelola data pemasok / supplier',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    href: '/dashboard/pelanggan?tab=pemasok',
  },
  {
    icon: DollarSign,
    label: 'Harga Jual',
    sub: 'Kelola harga jual per barang',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    href: '/dashboard/stok',
  },
  {
    icon: Barcode,
    label: 'Barcode',
    sub: 'Cetak dan kelola barcode produk',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    href: '/dashboard/stok?tab=barcode',
  },
]

const aktivitas = [
  {
    icon: Clock,
    label: 'Riwayat Aktivitas',
    sub: 'Lihat catatan aktivitas pada aplikasi',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    href: '/dashboard/riwayat',
  },
  {
    icon: HelpCircle,
    label: 'Pusat Bantuan',
    sub: 'Panduan penggunaan dan FAQ',
    color: 'text-green-600',
    bg: 'bg-green-50',
    href: '/dashboard/info',
  },
  {
    icon: Headphones,
    label: 'Hubungi Kami',
    sub: 'Butuh bantuan? Hubungi tim support kami',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    href: '/dashboard/cs',
  },
]

function ListItem({ item }) {
  return (
    <Link href={item.href}
      className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0">
      <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
        <item.icon className={`w-5 h-5 ${item.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{item.label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
    </Link>
  )
}

export default function MenuLainnyaPage() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="page-content space-y-4 pb-8">
      {/* Kelola Usaha - Grid 4 */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Kelola Usaha</h2>
        </div>
        <div className="grid grid-cols-2 gap-0 p-3">
          {kelolaSections.map((item) => (
            <Link key={item.id} href={item.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors text-center">
              <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 leading-tight">{item.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{item.sub}</p>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-300" />
            </Link>
          ))}
        </div>
      </div>

      {/* Master Data */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Master Data</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {masterData.map((item) => (
            <ListItem key={item.label} item={item} />
          ))}
        </div>
      </div>

      {/* Aktivitas & Bantuan */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Aktivitas & Bantuan</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {aktivitas.map((item) => (
            <ListItem key={item.label} item={item} />
          ))}
        </div>
      </div>

      {/* Akun & Keamanan */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Akun & Keamanan</h2>
        </div>
        <div className="divide-y divide-gray-50">
          <Link href="/dashboard/pengaturan?tab=password"
            className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Ubah Password</p>
              <p className="text-xs text-gray-400 mt-0.5">Ubah password akun Anda secara berkala</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3.5 hover:bg-red-50 transition-colors w-full text-left">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-600">Keluar</p>
              <p className="text-xs text-gray-400 mt-0.5">Keluar dari akun warungku</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Version info */}
      <p className="text-center text-xs text-gray-400 py-2">Versi 1.2.0 (Build 120)</p>
    </div>
  )
}
