'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import Icon from '@/components/Icon'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
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

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true)
    setError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `https://warungku-one.vercel.app/auth/callback`,
        },
      })
      if (error) throw error
    } catch {
      setError('Gagal masuk dengan Google. Silakan coba lagi.')
      setLoadingGoogle(false)
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{
      background: 'linear-gradient(160deg, #1d4ed8 0%, #1e40af 60%, #1e3a8a 100%)',
    }}>

      {/* ── Brand header (ringkas) ── */}
      <div className="text-center pt-5 pb-3 flex-shrink-0">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">WarungKu</h1>
        <p className="text-blue-200 text-xs mt-0.5">Aplikasi manajemen warung mudah &amp; lengkap</p>
      </div>

      {/* ── Card utama (flex-1, tidak overflow) ── */}
      <div className="flex-1 flex flex-col px-4 pb-4 min-h-0">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-auto flex flex-col overflow-hidden h-full">

          {/* Ilustrasi splash */}
          <div className="flex-shrink-0 h-52 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #1d4ed8, #1e3a8a)' }}>
            <Image
              src="/assets/login.png"
              alt="WarungKu Illustration"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Konten scrollable jika perlu, tapi dirancang muat */}
          <div className="flex-1 overflow-y-auto px-5 py-4">

            {/* Feature list — horizontal compact */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-4">
              {[
                'Kelola stok barang',
                'Catat penjualan & hutang',
                'Laporan lengkap & akurat',
                'Multi perangkat',
              ].map(f => (
                <div key={f} className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Icon name="check" size={10} color="#fff" strokeWidth={3} />
                  </div>
                  <span className="text-xs text-gray-600 leading-tight">{f}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3">
              <h3 className="text-base font-bold text-gray-900 mb-3">Login</h3>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs mb-3">
                  {error}
                </div>
              )}

              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                disabled={loadingGoogle || loading}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-2xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-60 mb-3"
              >
                {loadingGoogle ? (
                  <svg className="animate-spin w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </svg>
                )}
                {loadingGoogle ? 'Menghubungkan...' : 'Masuk dengan Google'}
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">atau dengan email</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <form onSubmit={handleLogin} className="space-y-2.5">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Icon name="store" size={14} color="#d1d5db" />
                    </span>
                    <input type="email" placeholder="Masukkan email"
                      className="input-field pl-8 py-2.5 text-sm"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Icon name="lock" size={14} color="#d1d5db" />
                    </span>
                    <input type={showPass ? 'text' : 'password'}
                      placeholder="Masukkan password"
                      className="input-field pl-8 pr-9 py-2.5 text-sm"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                      <Icon name={showPass ? 'eyeoff' : 'eye'} size={14} color="currentColor" />
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600" />
                    <span className="text-xs text-gray-600">Ingat saya</span>
                  </label>
                  <a href="#" className="text-xs text-blue-600 font-semibold hover:underline">Lupa password?</a>
                </div>

                <button type="submit" disabled={loading || loadingGoogle}
                  className="w-full py-3 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-60"
                  style={{ background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1d4ed8, #1e40af)' }}>
                  {loading ? 'Masuk...' : 'Login'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-500 mt-3">
                Belum punya akun?{' '}
                <Link href="/auth/register" className="text-blue-600 font-semibold hover:underline">Daftar Gratis</Link>
              </p>

              {/* Logo bawah */}
              <div className="flex flex-col items-center mt-4 pt-3 border-t border-gray-100">
                <div className="w-12 h-12 relative mb-1.5">
                  <Image
                    src="/icons/icon-128x128.png"
                    alt="WarungKu"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-[10px] text-gray-400 text-center">
                  WarungKu · Kelola warung, makin mudah
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Desktop panel ── */}
      <div className="hidden lg:flex flex-col justify-center w-96 px-10 text-white absolute right-0 top-0 h-full">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold mb-3 leading-tight">
            Satu Aplikasi<br />Semua Kebutuhan Warung
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed">
            Dari kasir, stok, hutang pelanggan, sampai laporan — semuanya ada di WarungKu.
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
