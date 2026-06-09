'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Pacifico } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const pacifico = Pacifico({
  subsets: ['latin'],
  weight: '400',
})

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]               = useState({ email: '', password: '' })
  const [remember, setRemember]       = useState(false)
  const [loading, setLoading]         = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [error, setError]             = useState('')

  // ── State modal lupa password
  const [showForgot, setShowForgot]       = useState(false)
  const [forgotEmail, setForgotEmail]     = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError]     = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)

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
    } catch (err) {
      if (err.message?.toLowerCase().includes('email not confirmed')) {
        setError('Email belum dikonfirmasi. Cek kotak masuk email kamu dan klik link verifikasi.')
      } else {
        setError('Email atau password salah. Silakan coba lagi.')
      }
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

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `https://warungku-one.vercel.app/auth/reset-password`,
      })
      if (error) throw error
      setForgotSuccess(true)
    } catch (err) {
      setForgotError(err.message || 'Gagal mengirim email. Coba beberapa saat lagi.')
    } finally {
      setForgotLoading(false)
    }
  }

  const closeForgot = () => {
    setShowForgot(false)
    setForgotEmail('')
    setForgotError('')
    setForgotSuccess(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-blue-600">
      {/* Background patterns as absolutely positioned elements */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <svg width="418" height="497" viewBox="0 0 418 497" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
          <circle cx="209" cy="248.5" r="209" fill="#93C5FD"/>
        </svg>
        <svg width="343" height="343" viewBox="0 0 343 343" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
          <circle cx="171.5" cy="171.5" r="171.5" fill="#93C5FD"/>
        </svg>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center z-10">
        
        {/* ── Logo & Ilustrasi ── */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-36 h-36 relative mb-1">
            <Image
              src="/icons/icon-128x128.png"
              alt="WarungKu Logo"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>

          <div className="relative mb-4">
            <h1
              className={`${pacifico.className} text-6xl md:text-7xl text-white leading-none select-none`}
              style={{
                WebkitTextStroke: '3px rgba(255,255,255,0.9)',
                textShadow: '0 4px 8px rgba(0,0,0,.15), 0 8px 18px rgba(37,99,235,.45)',
              }}
            >
              WarungKu
            </h1>

            <div
              className="absolute left-10 right-10 -bottom-2 h-2 rounded-full bg-white opacity-95"
              style={{ transform: 'skewX(-20deg)' }}
            />
          </div>

          <p className="text-blue-100 text-lg font-medium opacity-90">
            Kelola warung, makin mudah
          </p>
        </div>

        {/* ── Form Card ── */}
        <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-xl">

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-100 px-4 py-3 rounded-2xl text-sm mb-6 text-center font-medium">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-6">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-blue-100 mb-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Alamat Email
            </label>
            <input
              type="email"
              placeholder="contoh@email.com"
              className="w-full bg-white rounded-2xl px-5 py-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-100/30 transition shadow-sm"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-blue-100 mb-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Kata Sandi
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full bg-white rounded-2xl px-5 py-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-100/30 transition shadow-sm"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {/* Ingat saya + Lupa password */}
          <div className="flex items-center justify-between mb-8">
            <button
              type="button"
              onClick={() => setRemember(!remember)}
              className="flex items-center gap-2.5"
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${remember ? 'bg-white border-white' : 'border-blue-100/50'}`}>
                {remember && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium text-blue-100">
                Ingat Saya
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-sm text-white font-medium hover:underline opacity-90"
            >
              Lupa Kata Sandi?
            </button>
          </div>

          {/* Tombol Masuk */}
          <button
            onClick={handleLogin}
            disabled={loading || loadingGoogle}
            className="w-full bg-white/20 text-white font-extrabold text-base py-4 px-6 rounded-2xl shadow-lg border border-white/10 transition-all hover:bg-white/30 disabled:opacity-60 mb-6"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-xs text-blue-100/70 font-medium whitespace-nowrap">-- Atau login menggunakan --</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loadingGoogle || loading}
            className="w-full flex items-center justify-center gap-3.5 bg-white rounded-2xl py-4 px-6 text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow disabled:opacity-60"
          >
            {loadingGoogle ? (
              <svg className="animate-spin w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
            )}
            Masuk dengan Google
          </button>
        </div>
      </div>

      {/* ── MODAL LUPA PASSWORD ── */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            {forgotSuccess ? (
              <div className="text-center py-2">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-inner">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1.5">Email Terkirim!</h3>
                <p className="text-gray-500 text-sm mb-1">Link reset password dikirim ke:</p>
                <p className="font-semibold text-blue-700 text-sm mb-4">{forgotEmail}</p>
                <p className="text-gray-400 text-xs leading-relaxed mb-6">
                  Cek kotak masuk email kamu dan klik link di dalamnya.
                  Cek juga folder <strong>Spam</strong> jika tidak muncul.
                  Link berlaku <strong>1 jam</strong>.
                </p>
                <button
                  onClick={closeForgot}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-md"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-gray-900">Lupa Password?</h3>
                  <button
                    onClick={closeForgot}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                  Masukkan email akun kamu. Kami akan kirim link untuk reset password.
                </p>
                {forgotError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs mb-4 text-center font-medium">
                    ⚠️ {forgotError}
                  </div>
                )}
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Email</label>
                    <input
                      type="email"
                      placeholder="email@contoh.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100/50 transition shadow-sm"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition disabled:opacity-60 shadow-md"
                  >
                    {forgotLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                  </button>
                  <button
                    type="button"
                    onClick={closeForgot}
                    className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
