'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Package, BarChart3,
  Settings, LogOut, Store, Menu, X,
  Bell, ChevronRight, Receipt, MoreHorizontal,
  Wallet, Users, ClipboardList,
  Tag, Layers, Truck, DollarSign, Barcode,
  Clock, HelpCircle, Headphones, Lock, Printer
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

// ─── Bottom Nav 5 items (sesuai mockup) ─────────────────────────────────────
const bottomNavItems = [
  { href: '/dashboard',              label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/dashboard/kasir',        label: 'Kasir Pos',    icon: ShoppingCart },
  { href: '/dashboard/stok',         label: 'Stock Barang', icon: Package },
  { href: '/dashboard/laporan',      label: 'Laporan',      icon: Receipt },
  { href: '/dashboard/menu-lainnya', label: 'Menu Lainnya', icon: MoreHorizontal },
]

// ─── Desktop sidebar nav items ───────────────────────────────────────────────
const navItems = [
  { href: '/dashboard',              label: 'Dashboard',         icon: LayoutDashboard },
  { href: '/dashboard/kasir',        label: 'Kasir Pos',         icon: ShoppingCart },
  { href: '/dashboard/stok',         label: 'Stock Barang',      icon: Package },
  { href: '/dashboard/laporan',      label: 'Laporan',           icon: BarChart3 },
  { href: '/dashboard/hutang',       label: 'Hutang',            icon: Wallet },
  { href: '/dashboard/pelanggan',    label: 'Pelanggan',         icon: Users },
  { href: '/dashboard/riwayat',      label: 'Riwayat Transaksi', icon: ClipboardList },
  { href: '/dashboard/pengaturan',   label: 'Pengaturan',        icon: Settings },
  { href: '/dashboard/menu-lainnya', label: 'Menu Lainnya',      icon: MoreHorizontal },
]

// ─── Data struktur sidebar sesuai mockup ────────────────────────────────────
const sidebarSections = [
  {
    title: 'Utama',
    items: [
      { href: '/dashboard',              label: 'Dashboard',    icon: LayoutDashboard },
      { href: '/dashboard/kasir',        label: 'Kasir Pos',    icon: ShoppingCart },
      { href: '/dashboard/stok',         label: 'Stock Barang', icon: Package },
      { href: '/dashboard/laporan',      label: 'Laporan',      icon: BarChart3 },
      { href: '/dashboard/menu-lainnya', label: 'Menu Lainnya', icon: MoreHorizontal },
    ],
  },
  {
    title: 'Kelola Usaha',
    items: [
      { href: '/dashboard/pengaturan?tab=Profil+Warung', label: 'Profil Usaha',    icon: Store },
      { href: '/dashboard/pelanggan',                    label: 'Pelanggan',        icon: Users },
      { href: '/dashboard/pengaturan',                   label: 'Pengaturan',       icon: Settings },
      { href: '/dashboard/pengaturan?tab=Printer+%26+Struk', label: 'Printer & Struk', icon: Printer },
    ],
  },
  {
    title: 'Master Data',
    items: [
      { href: '/dashboard/pengaturan?tab=Kategori+Barang', label: 'Kategori Barang', icon: Tag },
      { href: '/dashboard/pengaturan?tab=Satuan+Barang',   label: 'Satuan Barang',   icon: Layers },
      { href: '/dashboard/pengaturan?tab=Pemasok',         label: 'Pemasok',         icon: Truck },
      { href: '/dashboard/stok',                           label: 'Harga Jual',      icon: DollarSign },
      { href: '/dashboard/stok',                           label: 'Barcode',         icon: Barcode },
    ],
  },
  {
    title: 'Aktivitas & Bantuan',
    items: [
      { href: '/dashboard/riwayat', label: 'Riwayat Aktivitas', icon: Clock },
      { href: '/dashboard/info',    label: 'Pusat Bantuan',     icon: HelpCircle },
      { href: '/dashboard/cs',      label: 'Hubungi Kami',      icon: Headphones },
    ],
  },
  {
    title: 'Akun & Keamanan',
    items: [
      { href: '/dashboard/pengaturan?tab=Ubah+Password', label: 'Ubah Password', icon: Lock },
    ],
  },
]

// ─── Mobile Sidebar Drawer ───────────────────────────────────────────────────
function MobileSidebar({ open, onClose, isActive, user, warungName, onLogout, router }) {
  const fullName = user?.user_metadata?.full_name || 'Pemilik Warungku'
  const email    = user?.email || ''
  const initial  = fullName?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || 'P'

  if (!open) return null

  return (
    <div className="md:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <aside className="relative w-[80vw] max-w-[310px] bg-white flex flex-col h-full z-10 shadow-2xl overflow-hidden">

        {/* ── Header biru: logo + nama warung + X ── */}
        <div className="bg-blue-600 px-4 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
                <Store className="w-6 h-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-base leading-tight truncate">{warungName}</p>
                <p className="text-blue-200 text-xs leading-tight">Kasir Pos & Warung</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0 ml-2"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* ── User card (putih, di bawah header biru) ── */}
        <div className="px-3 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="bg-blue-50 rounded-2xl px-3 py-3 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-bold text-sm leading-tight truncate">{fullName}</p>
              <p className="text-gray-500 text-xs leading-tight truncate mt-0.5">{email}</p>
              <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                Pemilik
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
        </div>

        {/* ── Scrollable nav sections ── */}
        <nav className="flex-1 overflow-y-auto py-2">
          {sidebarSections.map((section) => (
            <div key={section.title} className="mb-1">
              {/* Section title */}
              <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </p>
              {/* Section items */}
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href + label}
                    href={href}
                    onClick={onClose}
                    className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                      ${active
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* ── Footer: Keluar Akun + versi ── */}
        <div className="flex-shrink-0 border-t border-gray-100 px-2 pt-2 pb-4">
          <button
            onClick={() => { onClose(); onLogout() }}
            className="flex items-center gap-3 mx-0 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="w-[18px] h-[18px] text-red-500 flex-shrink-0" />
            <span>Keluar</span>
          </button>
          <p className="text-center text-[11px] text-gray-400 mt-2">Versi 1.2.0 (Build 120)</p>
        </div>
      </aside>
    </div>
  )
}

// ─── Main Layout ─────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [user, setUser] = useState(null)
  const [warungName, setWarungName] = useState('warungku')
  const [cabang, setCabang] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUser(data.user)

      try {
        const res = await fetch('/api/pengaturan/profil')
        const json = await res.json()
        if (json.nama_warung) setWarungName(json.nama_warung)
      } catch {}

      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('cabang:cabang_id(nama)')
          .eq('id', data.user.id)
          .single()
        if (profile?.cabang?.nama) setCabang(profile.cabang.nama)
      } catch {}

      try {
        const res = await fetch('/api/barang?stok=rendah')
        const json = await res.json()
        const stokRendah = json.data || []
        if (stokRendah.length > 0) {
          setNotifs(stokRendah.map(b => ({
            id: b.id,
            type: b.stok === 0 ? 'habis' : 'rendah',
            msg: b.stok === 0
              ? `${b.nama} — stok habis!`
              : `${b.nama} — sisa ${b.stok} ${b.satuan || 'pcs'} (min. ${b.stok_minimum})`,
          })))
        }
      } catch {}
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  // Page title from active nav
  const activeNav = [...navItems].reverse().find(n => isActive(n.href))
  const pageTitle = activeNav?.label || 'Dashboard'

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-56 lg:w-60 bg-blue-900 text-white flex-shrink-0">
        <div className="px-4 py-5 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 text-blue-700" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-white truncate">{warungName}</p>
              <p className="text-blue-300 text-xs truncate">{cabang || 'Kasir Pos & Warung'}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-item ${isActive(href) ? 'active' : ''}`}>
              <Icon className="icon" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-blue-800">
          <button onClick={handleLogout} className="nav-item w-full text-red-300 hover:bg-red-900/30">
            <LogOut className="icon" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR DRAWER */}
      <MobileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isActive={isActive}
        user={user}
        warungName={warungName}
        onLogout={handleLogout}
        router={router}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── MOBILE HEADER (biru, sesuai mockup) ── */}
        <header className="md:hidden bg-blue-600 text-white px-4 pt-4 pb-6 flex-shrink-0"
          style={{ borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px' }}>
          <div className="flex items-center justify-between">
            <button className="p-1.5 rounded-lg hover:bg-white/20" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-2">
              {/* Bell */}
              <div className="relative">
                <button
                  onClick={() => setBellOpen(v => !v)}
                  className="relative p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <Bell className="w-5 h-5 text-white" />
                  {notifs.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {notifs.length > 9 ? '9+' : notifs.length}
                    </span>
                  )}
                </button>
                {bellOpen && (
                  <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    style={{ animation: 'dropIn 0.18s ease-out' }}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <p className="font-bold text-sm text-gray-900">Notifikasi</p>
                      {notifs.length > 0 && (
                        <button onClick={() => setNotifs([])} className="text-[10px] text-gray-400 hover:text-red-500 font-semibold">
                          Hapus semua
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                      {notifs.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-8">Tidak ada notifikasi</p>
                      ) : notifs.map(n => (
                        <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs
                            ${n.type === 'habis' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                            {n.type === 'habis' ? '⛔' : '⚠️'}
                          </div>
                          <p className="text-xs text-gray-700 pt-1">{n.msg}</p>
                        </div>
                      ))}
                    </div>
                    {notifs.length > 0 && (
                      <div className="px-4 py-2.5 border-t border-gray-100">
                        <a href="/dashboard/stok" onClick={() => setBellOpen(false)}
                          className="text-xs text-blue-600 font-semibold hover:underline">
                          Lihat semua stok →
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Avatar */}
              <button
                onClick={() => router.push('/dashboard/menu-lainnya')}
                className="w-9 h-9 bg-white/20 border-2 border-white/40 rounded-full flex items-center justify-center text-white font-bold text-sm hover:bg-white/30 transition-colors"
              >
                {user?.email?.[0]?.toUpperCase() || 'P'}
              </button>
            </div>
          </div>
          {/* App title row */}
          <div className="mt-2">
            <p className="font-bold text-xl text-white leading-tight">{warungName.toLowerCase()}</p>
            <p className="text-blue-200 text-xs">Kasir Pos & Warung</p>
          </div>
        </header>

        {/* ── DESKTOP HEADER ── */}
        <header className="hidden md:flex bg-white border-b border-gray-200 px-4 py-3 items-center justify-between flex-shrink-0 shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-sm font-bold text-gray-900">{pageTitle}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setBellOpen(v => !v)} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-500" />
                {notifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {notifs.length > 9 ? '9+' : notifs.length}
                  </span>
                )}
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 pl-2 border-l border-gray-200 hover:bg-gray-50 rounded-lg pr-2 py-1 transition-colors text-sm text-gray-600"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.email?.[0]?.toUpperCase() || 'P'}
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>

        {/* ── BOTTOM NAV 5 ITEM (mobile only) ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center safe-area-pb z-20">
          {bottomNavItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`bottom-nav-item ${isActive(href) ? 'active' : ''}`}>
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <style jsx global>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
