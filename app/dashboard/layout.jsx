'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Package, BarChart3,
  Settings, LogOut, Store, Menu, X,
  Bell, Crown, ChevronRight, Receipt, MoreHorizontal
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
  { href: '/dashboard/hutang',       label: 'Hutang',            icon: Receipt },
  { href: '/dashboard/pelanggan',    label: 'Pelanggan',         icon: LayoutDashboard },
  { href: '/dashboard/riwayat',      label: 'Riwayat Transaksi', icon: Receipt },
  { href: '/dashboard/pengaturan',   label: 'Pengaturan',        icon: Settings },
  { href: '/dashboard/menu-lainnya', label: 'Menu Lainnya',      icon: MoreHorizontal },
]

// ─── Mobile Sidebar Drawer ───────────────────────────────────────────────────
function MobileSidebar({ open, onClose, navItems, isActive, user, warungName, onLogout, router }) {
  const fullName = user?.user_metadata?.full_name || 'Pemilik Warung'
  const email = user?.email || ''
  const initial = email?.[0]?.toUpperCase() || 'P'

  if (!open) return null

  return (
    <div className="md:hidden fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="relative w-72 bg-white flex flex-col h-full z-10 shadow-2xl">
        {/* Header sidebar */}
        <div className="bg-blue-600 px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">{warungName}</p>
                <p className="text-blue-200 text-xs">Kasir Pos & Warung</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          {/* User info */}
          <div className="bg-white/15 rounded-xl px-3 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{fullName}</p>
              <p className="text-blue-200 text-xs truncate">{email}</p>
              <span className="inline-block mt-0.5 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">Pemilik</span>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-300 flex-shrink-0" />
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActive(href) ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-100 px-3 py-3">
          <button onClick={() => { onClose(); onLogout() }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Keluar Akun</span>
          </button>
          <p className="text-center text-[10px] text-gray-400 mt-2">Versi 1.2.0 (Build 120)</p>
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
        navItems={navItems}
        isActive={isActive}
        user={user}
        warungName={warungName}
        onLogout={handleLogout}
        router={router}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── MOBILE HEADER (biru, sesuai mockup) ── */}
        <header className="md:hidden bg-blue-600 text-white px-4 pt-4 pb-3 flex-shrink-0">
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
