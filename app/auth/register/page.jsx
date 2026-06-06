'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Icon from '@/components/Icon'

// Terjemahkan error Supabase ke Bahasa Indonesia
const translateError = (msg = '') => {
  if (msg.includes('User already registered') || msg.includes('already been registered'))
    return 'EMAIL_SUDAH_TERDAFTAR'
  if (msg.includes('Password should be at least'))
    return 'Password minimal 6 karakter.'
  if (msg.includes('Unable to validate email'))
    return 'Format email tidak valid. Periksa kembali.'
  if (msg.includes('Signup is disabled'))
    return 'Pendaftaran sementara ditutup. Coba lagi nanti.'
  if (msg.includes('rate limit') || msg.includes('Too many'))
    return 'Terlalu banyak percobaan. Tunggu beberapa menit.'
  return 'Terjadi kesalahan. Silakan coba lagi.'
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    namaLengkap: '', email: '', password: '', konfirmasi: '',
    namaWarung: '', noHp: ''
  })
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [emailTerdaftar, setEmailTerdaftar] = useState(false)

  const handleStep1 = (e) => {
    e.preventDefault()
    setError('')
    setEmailTerdaftar(false)
    if (form.password.length < 6) { setError('Password minimal 6 karakter.'); return }
    if (form.password !== form.konfirmasi) { setError('Konfirmasi password tidak cocok.'); return }
    setStep(2)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setEmailTerdaftar(false)
    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email:    form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name:   form.namaLengkap,
            nama_warung: form.namaWarung,
            no_hp:       form.noHp,
          },
        },
      })

      if (signUpError) throw signUpError

      // Supabase kadang tidak throw error tapi user sudah ada
      // Cirinya: data.user ada tapi identities kosong
      if (data?.user && data.user.identities?.length === 0) {
        setEmailTerdaftar(true)
        setLoading(false)
        return
      }

      router.push('/setup')
    } catch (err) {
      const translated = translateError(err.message)
      if (translated === 'EMAIL_SUDAH_TERDAFTAR') {
        setEmailTerdaftar(true)
      } else {
        setError(translated)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
            <Icon name="store" size={20} color="white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">WarungKu</h1>
            <p className="text-xs text-gray-400">Daftar akun baru — gratis!</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${step > s ? 'bg-green-500 text-white' : step === s ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {step > s ? <Icon name="check" size={13} color="white" /> : s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? 'text-blue-700' : 'text-gray-400'}`}>
                {s === 1 ? 'Akun' : 'Warung'}
              </span>
              {s < 2 && <div className={`flex-1 h-0.5 transition-colors ${step > s ? 'bg-blue-700' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Error umum */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4 flex items-start gap-2">
            <span className="flex-shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Error email sudah terdaftar */}
        {emailTerdaftar && (
          <div className="bg-orange-50 border border-orange-200 px-4 py-3 rounded-xl text-sm mb-4">
            <p className="font-semibold text-orange-700 mb-1">📧 Email sudah terdaftar!</p>
            <p className="text-orange-600 text-xs leading-relaxed mb-3">
              Email <strong>{form.email}</strong> sudah pernah didaftarkan di WarungKu.
            </p>
            <div className="flex gap-2">
              <Link
                href="/auth/login"
                className="flex-1 text-center bg-blue-700 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Masuk ke Akun
              </Link>
              <button
                onClick={() => {
                  setEmailTerdaftar(false)
                  setStep(1)
                  setForm(f => ({ ...f, email: '', password: '', konfirmasi: '' }))
                }}
                className="flex-1 text-center border border-gray-200 text-gray-600 text-xs font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Ganti Email
              </button>
            </div>
          </div>
        )}

        {/* Step 1 — Data Akun */}
        {!emailTerdaftar && step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Data Akun</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
              <input type="text" placeholder="Nama lengkap Anda" className="input-field"
                value={form.namaLengkap} onChange={e => setForm(p => ({ ...p, namaLengkap: e.target.value }))} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" placeholder="email@contoh.com" className="input-field"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 karakter" className="input-field pr-10"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Icon name={showPass ? 'eyeoff' : 'eye'} size={16} color="#9ca3af" />
                </button>
              </div>
              {/* Password strength indicator */}
              {form.password && (
                <div className="mt-1.5 flex gap-1">
                  {[1,2,3].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      form.password.length >= i * 4
                        ? i === 1 ? 'bg-red-400' : i === 2 ? 'bg-yellow-400' : 'bg-green-500'
                        : 'bg-gray-100'
                    }`} />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">
                    {form.password.length < 4 ? 'Lemah' : form.password.length < 8 ? 'Cukup' : 'Kuat'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password</label>
              <input type="password" placeholder="Ulangi password" className="input-field"
                value={form.konfirmasi} onChange={e => setForm(p => ({ ...p, konfirmasi: e.target.value }))} required />
              {form.konfirmasi && form.konfirmasi !== form.password && (
                <p className="text-xs text-red-500 mt-1">⚠️ Password tidak cocok</p>
              )}
              {form.konfirmasi && form.konfirmasi === form.password && (
                <p className="text-xs text-green-600 mt-1">✓ Password cocok</p>
              )}
            </div>

            <button type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-bold text-sm transition-colors">
              Lanjut →
            </button>
          </form>
        )}

        {/* Step 2 — Data Warung */}
        {!emailTerdaftar && step === 2 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Data Warung</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Warung <span className="text-red-500">*</span>
              </label>
              <input type="text" placeholder="Contoh: Warung Barokah Jaya" className="input-field"
                value={form.namaWarung} onChange={e => setForm(p => ({ ...p, namaWarung: e.target.value }))} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor HP / WhatsApp</label>
              <input type="tel" placeholder="08xxxxxxxxxx" className="input-field"
                value={form.noHp} onChange={e => setForm(p => ({ ...p, noHp: e.target.value }))} />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
              💡 Kamu mulai dengan paket <strong>Gratis</strong> — bisa upgrade kapan saja.
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => { setStep(1); setError('') }}
                className="flex-1 btn-secondary justify-center text-sm py-3">
                ← Kembali
              </button>
              <button type="submit" disabled={loading || !form.namaWarung}
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-60">
                {loading ? 'Mendaftar...' : 'Daftar Sekarang 🎉'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/auth/login" className="text-blue-700 hover:underline font-semibold">Masuk</Link>
        </p>
      </div>
    </div>
  )
}
