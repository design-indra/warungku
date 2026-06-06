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

  // Lupa password state
  const [showForgot, setShowForgot]       = useState(false)
  const [forgotEmail, setForgotEmail]     = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotError, setForgotError]     = useState('')

  // ── Terjemahkan error Supabase ke Bahasa Indonesia
  const translateError = (msg = '') => {
    if (msg.includes('Invalid login credentials'))   return 'Email atau password salah. Periksa kembali dan coba lagi.'
    if (msg.includes('Email not confirmed'))          return 'Email kamu belum diverifikasi. Cek inbox / spam lalu klik link verifikasi.'
    if (msg.includes('Too many requests'))            return 'Terlalu banyak percobaan login. Tunggu beberapa menit lalu coba lagi.'
    if (msg.includes('User not found'))               return 'Akun dengan email ini tidak ditemukan.'
    return 'Gagal masuk. Silakan coba lagi.'
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email:    form.email.trim(),
        password: form.password,
      })
      if (loginErr) throw loginErr

      // Cek apakah perlu setup warung
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile }  = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) {
        router.push('/setup')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(translateError(err.message))
    } finally {
      setLoading(false)
    }
  }

  // ── Kirim email reset password
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotEmail.trim(),
        { redirectTo: `${window.location.origin}/auth/reset-password` }
      )
      if (error) throw error
      setForgotSuccess(true)
    } catch (err) {
      if (err.message.includes('rate limit') || err.message.includes('Too many'))
        setForgotError('Terlalu banyak permintaan. Tunggu beberapa menit.')
      else
        setForgotError('Gagal kirim email. Pastikan email kamu benar.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{
      background: 'linear-gradient(160deg, #1d4ed8 0%, #1e40af 60%, #1e3a8a 100%)',
    }}>
      {/* ── LEFT: Login form ── */}
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
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-xl text-sm mb-4 flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Icon name="store" size={17} color="#9ca3af" />
                  </span>
                  <input
                    type="email"
                    placeholder="email@contoh.com"
                    className="input-field pl-10"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Icon name="eye" size={17} color="#9ca3af" />
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    className="input-field pl-10 pr-10"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Icon name={showPass ? 'eyeoff' : 'eye'} size={17} color="#9ca3af" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-xs text-gray-600">Ingat saya</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setForgotSuccess(false); setForgotError(''); setForgotEmail('') }}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Lupa password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-60"
                style={{ background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1d4ed8, #1e40af)' }}
              >
                {loading ? 'Masuk...' : 'Login'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-4">
              Belum punya akun?{' '}
              <Link href="/auth/register" className="text-blue-600 font-semibold hover:underline">Daftar Gratis</Link>
            </p>
          </div>
        </div>

        <p className="text-blue-300/60 text-xs mt-6">© 2025 WarungKu. Semua hak dilindungi.</p>
      </div>

      {/* ── RIGHT: Desktop panel ── */}
      <div className="hidden lg:flex flex-col justify-center w-96 px-10 text-white">
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
            { icon: 'cart',  label: 'Kasir POS',          desc: 'Proses transaksi cepat & cetak struk' },
            { icon: 'box',   label: 'Stok Barang',         desc: 'Pantau stok & notifikasi menipis' },
            { icon: 'users', label: 'Hutang Pelanggan',    desc: 'Catat & kelola hutang dengan mudah' },
            { icon: 'chart', label: 'Laporan Lengkap',     desc: 'Harian, mingguan, dan bulanan' },
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

      {/* ── MODAL LUPA PASSWORD ── */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-gray-900">🔑 Lupa Password</h3>
              <button
                onClick={() => setShowForgot(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <Icon name="x" size={18} color="#6b7280" />
              </button>
            </div>

            {forgotSuccess ? (
              // ── Sukses kirim email
              <div className="text-center py-4">
                <div className="text-5xl mb-4">📧</div>
                <h4 className="font-bold text-gray-900 mb-2">Email Terkirim!</h4>
                <p className="text-gray-500 text-sm leading-relaxed mb-2">
                  Link reset password sudah dikirim ke:
                </p>
                <p className="font-bold text-blue-700 text-sm mb-4 break-all">{forgotEmail}</p>
                <p className="text-gray-400 text-xs leading-relaxed mb-5">
                  Cek inbox atau folder spam kamu. Link berlaku selama <strong>1 jam</strong>.
                </p>
                <button
                  onClick={() => setShowForgot(false)}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-bold text-sm transition-colors"
                >
                  Oke, Mengerti
                </button>
              </div>
            ) : (
              // ── Form kirim email
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-gray-500 text-sm leading-relaxed">
                  Masukkan email yang kamu gunakan saat daftar. Kami akan kirim link untuk reset password.
                </p>

                {forgotError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-xl text-sm">
                    ⚠️ {forgotError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="email@contoh.com"
                    className="input-field"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="flex-1 btn-secondary justify-center text-sm py-3"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotEmail}
                    className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                  >
                    {forgotLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
