'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Icon from '@/components/Icon'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword]   = useState('')
  const [konfirmasi, setKonfirmasi] = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [checking, setChecking]   = useState(true)

  useEffect(() => {
    // Supabase otomatis set session dari URL hash setelah klik link email
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true)
      }
      setChecking(false)
    })
    // Timeout fallback
    setTimeout(() => setChecking(false), 3000)
  }, [])

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password minimal 6 karakter.'); return }
    if (password !== konfirmasi) { setError('Konfirmasi password tidak cocok.'); return }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => router.push('/auth/login'), 3000)
    } catch (err) {
      if (err.message.includes('same password'))
        setError('Password baru tidak boleh sama dengan password lama.')
      else
        setError('Gagal reset password. Coba minta link baru.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memverifikasi link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
            <Icon name="store" size={20} color="white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">WarungKu</h1>
            <p className="text-xs text-gray-400">Reset password</p>
          </div>
        </div>

        {success ? (
          // ── Berhasil reset
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="check" size={32} color="#16a34a" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Password Berhasil Diubah!</h2>
            <p className="text-gray-500 text-sm mb-4">
              Kamu akan diarahkan ke halaman login dalam 3 detik...
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-bold text-sm transition-colors"
            >
              Login Sekarang
            </button>
          </div>
        ) : !validSession ? (
          // ── Link tidak valid / expired
          <div className="text-center py-4">
            <div className="text-5xl mb-4">⏰</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Link Sudah Kadaluarsa</h2>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              Link reset password hanya berlaku <strong>1 jam</strong>. Silakan minta link baru.
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-bold text-sm transition-colors"
            >
              Kembali ke Login
            </button>
          </div>
        ) : (
          // ── Form reset password
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Buat Password Baru</h2>
              <p className="text-gray-500 text-sm">Masukkan password baru untuk akun kamu.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Baru</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 karakter"
                  className="input-field pr-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required minLength={6}
                  autoFocus
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Icon name={showPass ? 'eyeoff' : 'eye'} size={16} color="#9ca3af" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password</label>
              <input
                type="password"
                placeholder="Ulangi password baru"
                className="input-field"
                value={konfirmasi}
                onChange={e => setKonfirmasi(e.target.value)}
                required
              />
              {konfirmasi && konfirmasi !== password && (
                <p className="text-xs text-red-500 mt-1">⚠️ Password tidak cocok</p>
              )}
              {konfirmasi && konfirmasi === password && (
                <p className="text-xs text-green-600 mt-1">✓ Password cocok</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password || !konfirmasi}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
