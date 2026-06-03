'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Icon from '@/components/Icon'

const FEATURES = [
  'Kelola stok barang',
  'Catat penjualan & hutang',
  'Laporan lengkap & akurat',
  'Bisa diakses dari berbagai perangkat',
]

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (error) throw error
      router.push('/dashboard')
    } catch {
      setError('Email atau password salah. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{
      background: 'linear-gradient(160deg, #1d4ed8 0%, #1e40af 60%, #1e3a8a 100%)',
    }}>
      {/* ── LEFT: Login form (mobile-first, centered) ── */}
      <div className="flex-1 flex flex-col items-center justify-start py-10 px-5 overflow-y-auto">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🏪</div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">WarungKu</h1>
          <p className="text-blue-200 text-sm mt-1">Aplikasi manajemen warung mudah &amp; lengkap</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7">

          {/* Feature list */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
              Kelola warung Anda<br />dengan lebih mudah
            </h2>
            <div className="space-y-2">
              {FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Icon name="check" size={12} color="#fff" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-600">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Login</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-xl text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email / Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Icon name="store" size={17} color="#9ca3af" />
                  </span>
                  <input type="text" placeholder="Masukkan email atau username"
                    className="input-field pl-10"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Icon name="eye" size={17} color="#9ca3af" />
                  </span>
                  <input type={showPass ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    className="input-field pl-10 pr-10"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <Icon name={showPass ? 'eyeoff' : 'eye'} size={17} color="#9ca3af" />
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                  <span className="text-xs text-gray-600">Ingat saya</span>
                </label>
                <a href="#" className="text-xs text-blue-600 font-semibold hover:underline">Lupa password?</a>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-60"
                style={{ background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1d4ed8, #1e40af)' }}>
                {loading ? 'Masuk...' : 'Login'}
              </button>
            </form>

            <div className="text-center text-xs text-gray-400 my-3">atau masuk dengan</div>

            <button className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-2xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              <span className="text-lg font-bold text-blue-600">G</span>
              Masuk dengan Google
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              Belum punya akun?{' '}
              <Link href="/auth/register" className="text-blue-600 font-semibold hover:underline">Daftar Gratis</Link>
            </p>
          </div>
        </div>

        <p className="text-blue-300/60 text-xs mt-6">© 2024 WarungKu. Semua hak dilindungi.</p>
      </div>

      {/* ── RIGHT: Deskripsi panel (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-center w-96 px-10 text-white">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold mb-3 leading-tight">
            Satu Aplikasi<br />Semua Kebutuhan Warung
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed">
            Dari kasir, stok, hutang pelanggan, sampai laporan — semuanya ada di WarungKu.
            Mudah dipakai, bisa multi-cabang, dan tersedia di HP maupun laptop.
          </p>
        </div>
        <div className="space-y-3">
          {[
            { icon: 'cart',  label: 'Kasir POS', desc: 'Proses transaksi cepat & cetak struk' },
            { icon: 'box',   label: 'Stok Barang', desc: 'Pantau stok & notifikasi menipis' },
            { icon: 'users', label: 'Hutang Pelanggan', desc: 'Catat & kelola hutang dengan mudah' },
            { icon: 'chart', label: 'Laporan Lengkap', desc: 'Harian, mingguan, dan bulanan' },
          ].map(f => (
            <div key={f.icon} className="flex items-center gap-3 p-3 rounded-xl bg-white/10">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={f.icon} size={18} color="#fff" />
              </div>
              <div>
                <p className="font-semibold text-sm">{f.label}</p>
                <p className="text-blue-200 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
