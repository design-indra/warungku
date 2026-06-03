'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Package, BarChart3,
  Users, Settings, LogOut, Store, Menu, X,
  ChevronDown, Bell
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

const navItems = [
  { href: '/dashboard',              label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/dashboard/kasir',        label: 'Kasir (POS)',      icon: ShoppingCart },
  { href: '/dashboard/stok',         label: 'Stok Barang',      icon: Package },
  { href: '/dashboard/laporan',      label: 'Laporan',          icon: BarChart3 },
  { href: '/dashboard/hutang',       label: 'Hutang Pelanggan', icon: Users },
  { href: '/dashboard/pengaturan',   label: 'Pengaturan',       icon: Settings },
]

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden md:flex flex-col w-56 lg:w-60 bg-blue-900 text-white flex-shrink-0">
        {/* Logo */}
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

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-item ${isActive(href) ? 'active' : ''}`}>
              <Icon className="icon" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
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
            <button className="relative p-2 rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-800">{user?.user_metadata?.full_name || 'Admin'}</p>
                <p className="text-xs text-gray-400">Owner</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>

        {/* ─── MOBILE BOTTOM NAV ─── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center safe-area-pb z-20">
          {navItems.slice(0, 5).map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`bottom-nav-item ${isActive(href) ? 'active' : ''}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] truncate max-w-[50px] text-center">{label.split(' ')[0]}</span>
            </Link>
          ))}
          <button onClick={() => setSidebarOpen(true)} className="bottom-nav-item">
            <Menu className="w-5 h-5" />
            <span className="text-[10px]">Menu</span>
          </button>
        </nav>
      </div>
    </div>
  )
}
