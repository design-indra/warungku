'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Store, GitBranch, Users2, Tag, PackageOpen,
  Truck, Printer, Lock, ChevronRight
} from 'lucide-react'

const sections = [
  {
    title: 'Profil & Usaha',
    items: [
      {
        icon: Store,
        label: 'Profil Warung',
        sub: 'Nama, logo, alamat warung',
        color: 'text-blue-600', bg: 'bg-blue-50',
        href: '/dashboard/pengaturan/profil-warung',
      },
      {
        icon: GitBranch,
        label: 'Kelola Cabang',
        sub: 'Tambah dan atur cabang',
        color: 'text-indigo-600', bg: 'bg-indigo-50',
        href: '/dashboard/pengaturan/cabang',
      },
      {
        icon: Users2,
        label: 'Pengguna & Role',
        sub: 'Akun kasir, admin, hak akses',
        color: 'text-green-600', bg: 'bg-green-50',
        href: '/dashboard/pengaturan/role',
      },
    ],
  },
  {
    title: 'Master Data',
    items: [
      {
        icon: Tag,
        label: 'Satuan & Kategori',
        sub: 'Kelola satuan dan kategori barang',
        color: 'text-teal-600', bg: 'bg-teal-50',
        href: '/dashboard/pengaturan/satuan-kategori',
      },
      {
        icon: Truck,
        label: 'Pemasok / Supplier',
        sub: 'Agen grosir, distributor, salesman',
        color: 'text-orange-500', bg: 'bg-orange-50',
        href: '/dashboard/pengaturan/pemasok',
      },
    ],
  },
  {
    title: 'Perangkat & Keamanan',
    items: [
      {
        icon: Printer,
        label: 'Printer & Struk',
        sub: 'Konfigurasi printer thermal',
        color: 'text-purple-600', bg: 'bg-purple-50',
        href: '/dashboard/pengaturan/printer-struk',
      },
      {
        icon: Lock,
        label: 'Ubah Password',
        sub: 'Ganti password akun Anda',
        color: 'text-red-500', bg: 'bg-red-50',
        href: '/dashboard/pengaturan/reset-password',
      },
    ],
  },
]

export default function PengaturanPage() {
  return (
    <div className="page-content space-y-4 pb-8">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Pengaturan</h1>
        <p className="text-xs text-gray-400">Kelola semua preferensi warung kamu</p>
      </div>

      {sections.map(section => (
        <div key={section.title} className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">{section.title}</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {section.items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors"
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
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
