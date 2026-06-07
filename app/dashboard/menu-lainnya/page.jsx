'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Store, Barcode, CreditCard, Printer,
  Tag, PackageOpen, Truck, DollarSign,
  Clock, HelpCircle, Headphones,
  Lock, LogOut, ChevronRight, Crown
} from 'lucide-react'

// ── Grid 4: Kelola Usaha ──────────────────────────────────────
// 1. Profil Usaha
// 2. Barcode (ganti Pengaturan)
// 3. Hutang (basic & pro only, ada crown kuning)
// 4. Print & Struk

const masterData = [
  {
    icon: Tag,
    label: 'Satuan & Kategori',
    sub: 'Kelola satuan dan kategori barang',
    color: 'text-teal-600', bg: 'bg-teal-50',
    href: '/dashboard/pengaturan/satuan-kategori',
  },
  {
    icon: Truck,
    label: 'Pemasok',
    sub: 'Agen grosir, distributor, salesman',
    color: 'text-orange-500', bg: 'bg-orange-50',
    href: '/dashboard/pengaturan/pemasok',
  },
  {
    icon: DollarSign,
    label: 'Harga Jual',
    sub: 'Kelola harga jual per barang',
    color: 'text-purple-600', bg: 'bg-purple-50',
    href: '/dashboard/stok',
  },
  {
    icon: Barcode,
    label: 'Barcode',
    sub: 'Cetak dan kelola barcode produk',
    color: 'text-gray-600', bg: 'bg-gray-100',
    href: '/dashboard/barcode',
  },
]

const aktivitas = [
  {
    icon: Clock,
    label: 'Riwayat Aktivitas',
    sub: 'Lihat catatan aktivitas pada aplikasi',
    color: 'text-blue-600', bg: 'bg-blue-50',
    href: '/dashboard/riwayat',
  },
  {
    icon: HelpCircle,
    label: 'Pusat Bantuan',
    sub: 'Panduan penggunaan dan FAQ',
    color: 'text-green-600', bg: 'bg-green-50',
    href: '/dashboard/info',
  },
  {
    icon: Headphones,
    label: 'Hubungi Kami',
    sub: 'Butuh bantuan? Hubungi tim support kami',
    color: 'text-orange-500', bg: 'bg-orange-50',
    href: '/dashboard/cs',
  },
]

function ListItem({ item }) {
  return (
    <Link
      href={item.href}
      className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
    >
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

// Komponen grid item untuk Kelola Usaha
function GridItem({ icon: Icon, label, sub, color, bg, href, locked }) {
  const inner = (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors text-center relative">
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center relative`}>
        <Icon className={`w-6 h-6 ${color}`} />
        {locked && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow">
            <Crown className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800 leading-tight">{label}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{sub}</p>
      </div>
      {locked && (
        <span className="text-[9px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
          Basic & Pro
        </span>
      )}
    </div>
  )

  if (locked) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    )
  }

  return (
    <Link href={href} className="block">
      {inner}
    </Link>
  )
}

export default function MenuLainnyaPage() {
  const router = useRouter()
  const [plan, setPlan] = useState(null) // null=loading, 'free', 'basic', 'pro'

  useEffect(() => {
    fetch('/api/subscription/status')
      .then(r => r.json())
      .then(j => setPlan(j.plan || 'free'))
      .catch(() => setPlan('free'))
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const hutangLocked = plan === 'free' // free plan tidak bisa akses hutang

  const kelolaGrid = [
    {
      icon: Store,
      label: 'Profil Usaha',
      sub: 'Info warung Anda',
      color: 'text-blue-600', bg: 'bg-blue-50',
      href: '/dashboard/pengaturan/profil-warung',
      locked: false,
    },
    {
      icon: Barcode,
      label: 'Barcode',
      sub: 'Kelola barcode produk',
      color: 'text-gray-600', bg: 'bg-gray-100',
      href: '/dashboard/barcode',
      locked: false,
    },
    {
      icon: CreditCard,
      label: 'Hutang',
      sub: hutangLocked ? 'Upgrade untuk akses' : 'Kelola hutang pelanggan',
      color: hutangLocked ? 'text-yellow-500' : 'text-red-500',
      bg: hutangLocked ? 'bg-yellow-50' : 'bg-red-50',
      href: hutangLocked ? '/dashboard/berlangganan' : '/dashboard/hutang',
      locked: hutangLocked,
    },
    {
      icon: Printer,
      label: 'Print & Struk',
      sub: 'Atur printer cetak',
      color: 'text-purple-600', bg: 'bg-purple-50',
      href: '/dashboard/pengaturan/printer-struk',
      locked: false,
    },
  ]

  return (
    <div className="page-content space-y-4 pb-8">

      {/* Kelola Usaha - Grid 4 */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Kelola Usaha</h2>
        </div>
        <div className="grid grid-cols-2 gap-0 p-3">
          {kelolaGrid.map(item => (
            <GridItem key={item.label} {...item} />
          ))}
        </div>
      </div>

      {/* Master Data */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Master Data</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {masterData.map(item => (
            <ListItem key={item.label} item={item} />
          ))}
        </div>
      </div>

      {/* Pengaturan Lanjutan */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Pengaturan Lanjutan</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { icon: Store, label: 'Kelola Cabang', sub: 'Tambah & atur cabang', color: 'text-indigo-600', bg: 'bg-indigo-50', href: '/dashboard/pengaturan/cabang' },
            { icon: Store, label: 'Pengguna & Role', sub: 'Akun kasir & hak akses', color: 'text-green-600', bg: 'bg-green-50', href: '/dashboard/pengaturan/role' },
          ].map(item => (
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
          {aktivitas.map(item => (
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
          <Link
            href="/dashboard/pengaturan/reset-password"
            className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Ubah Password</p>
              <p className="text-xs text-gray-400 mt-0.5">Ubah password akun Anda secara berkala</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3.5 hover:bg-red-50 transition-colors w-full text-left"
          >
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

      <p className="text-center text-xs text-gray-400 py-2">Versi 1.2.0 (Build 120)</p>
    </div>
  )
}
