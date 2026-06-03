'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Package, BarChart3,
  Users, Settings, LogOut, Store, Menu, X,
  Bell, User, Lock, Camera, Crown, ChevronRight,
  Edit3
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

const navItems = [
  { href: '/dashboard',              label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/dashboard/kasir',        label: 'Kasir',       icon: ShoppingCart },
  { href: '/dashboard/stok',         label: 'Stok',        icon: Package },
  { href: '/dashboard/laporan',      label: 'Laporan',     icon: BarChart3 },
  { href: '/dashboard/hutang',       label: 'Hutang',      icon: Users },
  { href: '/dashboard/pengaturan',   label: 'Pengaturan',  icon: Settings },
]

// ─── Profile Dropdown Overlay ───────────────────────────────────────────────
function ProfileDropdown({ user, warungName, onClose, onLogout, router }) {
  const dropRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const initial = user?.email?.[0]?.toUpperCase() || 'A'
  const fullName = user?.user_metadata?.full_name || 'Admin'
  const email = user?.email || ''

  const menuItems = [
    {
      icon: User,
      label: 'Profil Saya',
      sub: 'Nama & info akun',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      action: () => { router.push('/dashboard/pengaturan?tab=profil'); onClose() }
    },
    {
      icon: Lock,
      label: 'Ganti Kata Sandi',
      sub: 'Keamanan akun',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      action: () => { router.push('/dashboard/pengaturan?tab=password'); onClose() }
    },
    {
      icon: Camera,
      label: 'Foto Profil',
      sub: 'Unggah foto warung',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      action: () => { router.push('/dashboard/pengaturan?tab=foto'); onClose() }
    },
    {
      icon: Crown,
      label: 'Paket Berlangganan',
      sub: 'Upgrade & kelola paket',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      action: () => { router.push('/dashboard/pengaturan?tab=paket'); onClose() }
    },
  ]

  return (
    <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.15)' }}>
      <div
        ref={dropRef}
        className="absolute right-3 top-14 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        style={{ animation: 'dropIn 0.18s ease-out' }}
      >
        {/* Header - user info */}
        <div className="px-4 py-4 bg-gradient-to-br from-blue-700 to-blue-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white text-lg font-bold border-2 border-white/30 flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{fullName}</p>
              <p className="text-blue-200 text-xs truncate">{email}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                <span className="text-emerald-300 text-[10px] font-semibold">Owner · {warungName}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Menu items */}
        <div className="py-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
            >
              <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-[11px] text-gray-400">{item.sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </button>
          ))}
        </div>

        {/* Divider + Logout */}
        <div className="border-t border-gray-100 px-3 py-2.5">
          <button
            onClick={() => { onLogout(); onClose() }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
              <LogOut className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-sm font-semibold text-red-500">Keluar Akun</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

// ─── Main Layout ─────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [warungName, setWarungName] = useState('WarungKu')
  const [cabang, setCabang] = useState('Cabang A')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      const meta = data.user.user_metadata
      if (meta?.nama_warung) setWarungName(meta.nama_warung)
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const bottomNavItems = [
    { href: '/dashboard',         label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/kasir',   label: 'Kasir',     icon: ShoppingCart },
    { href: '/dashboard/stok',    label: 'Stok',      icon: Package },
    { href: '/dashboard/laporan', label: 'Laporan',     icon: BarChart3 },
    { href: '/dashboard/hutang',  label: 'Hutang',    icon: Users },
  ]

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden md:flex flex-col w-56 lg:w-60 bg-blue-900 text-white flex-shrink-0">
        <div className="px-4 py-5 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 text-blue-700" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-white truncate">{warungName}</p>
              <p className="text-blue-300 text-xs truncate">{cabang}</p>
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

      {/* ─── MOBILE SIDEBAR OVERLAY ─── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-blue-900 text-white flex flex-col h-full z-10">
            <div className="px-4 py-5 border-b border-blue-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <p className="font-bold text-sm">{warungName}</p>
                  <p className="text-blue-300 text-xs">{cabang}</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-blue-300" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                  className={`nav-item ${isActive(href) ? 'active' : ''}`}>
                  <Icon className="icon" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-blue-800">
              <button onClick={handleLogout} className="nav-item w-full text-red-300">
                <LogOut className="icon" />
                <span>Keluar</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {navItems.find(n => isActive(n.href))?.label || 'Dashboard'}
              </h2>
              <p className="text-xs text-gray-400 hidden sm:block">{warungName} · {cabang}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifikasi */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Avatar */}
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 pl-2 border-l border-gray-200 hover:bg-gray-50 rounded-lg pr-1 py-1 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-200">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-gray-800 leading-tight">
                  {user?.user_metadata?.full_name || 'Admin'}
                </p>
                <p className="text-[10px] text-gray-400">Owner</p>
              </div>
              <Edit3 className="w-3 h-3 text-gray-400 hidden sm:block" />
            </button>
          </div>
        </header>

        {/* Profile Dropdown */}
        {profileOpen && (
          <ProfileDropdown
            user={user}
            warungName={warungName}
            onClose={() => setProfileOpen(false)}
            onLogout={handleLogout}
            router={router}
          />
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>

        {/* ─── MOBILE BOTTOM NAV ─── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center safe-area-pb z-20">
          {bottomNavItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`bottom-nav-item ${isActive(href) ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] truncate max-w-[50px] text-center">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
