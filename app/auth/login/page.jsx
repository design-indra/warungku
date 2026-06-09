'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]               = useState({ email: '', password: '' })
  const [showPass, setShowPass]       = useState(false)
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-10">

      {/* ── Logo & Ilustrasi ── */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-28 h-28 relative mb-4">
          <Image
            src="/icons/icon-128x128.png"
            alt="WarungKu Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">WarungKu</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola warung lebih mudah dan efisien</p>
      </div>

      {/* ── Form Card ── */}
      <div className="w-full max-w-sm">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm mb-4">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-blue-500 mb-1.5">Email</label>
          <input
            type="email"
            placeholder="contoh@email.com"
            className="w-full bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-blue-500 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition pr-12"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPass ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <div className="text-right mt-1.5">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-xs text-blue-500 hover:underline"
            >
              Lupa password?
            </button>
          </div>
        </div>

        {/* Tombol Masuk */}
        <button
          onClick={handleLogin}
          disabled={loading || loadingGoogle}
          className="w-full py-4 rounded-full text-white font-bold text-base transition-all disabled:opacity-60 mb-5"
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
        >
          {loading ? 'Masuk...' : 'Masuk'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-blue-100" />
          <span className="text-xs text-blue-400 font-medium">atau masuk dengan</span>
          <div className="flex-1 h-px bg-blue-100" />
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loadingGoogle || loading}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-full py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-60 mb-6"
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
          {loadingGoogle ? 'Menghubungkan...' : 'Masuk dengan Google'}
        </button>

        {/* Daftar */}
        <p className="text-center text-sm text-gray-500">
          Belum punya akun?{' '}
          <Link href="/auth/register" className="text-gray-900 font-bold hover:underline">
            Daftar Sekarang
          </Link>
        </p>
      </div>

      {/* ── MODAL LUPA PASSWORD ── */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
            {forgotSuccess ? (
              <div className="text-center py-2">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Email Terkirim!</h3>
                <p className="text-gray-500 text-sm mb-1">Link reset password dikirim ke:</p>
                <p className="font-semibold text-blue-700 text-sm mb-3">{forgotEmail}</p>
                <p className="text-gray-400 text-xs leading-relaxed mb-5">
                  Cek kotak masuk email kamu dan klik link di dalamnya.
                  Cek juga folder <strong>Spam</strong> jika tidak muncul.
                  Link berlaku <strong>1 jam</strong>.
                </p>
                <button
                  onClick={closeForgot}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Lupa Password?</h3>
                  <button
                    onClick={closeForgot}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                  Masukkan email akun kamu. Kami akan kirim link untuk reset password.
                </p>
                {forgotError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs mb-3">
                    ⚠️ {forgotError}
                  </div>
                )}
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="email@contoh.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-60"
                  >
                    {forgotLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                  </button>
                  <button
                    type="button"
                    onClick={closeForgot}
                    className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
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
