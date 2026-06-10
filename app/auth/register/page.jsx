'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Store } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useGoogleAuth } from '@/lib/useGoogleAuth'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    namaLengkap: '', email: '', password: '', konfirmasi: '',
    namaWarung: '', noHp: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signInWithGoogle, loading: loadingGoogle } = useGoogleAuth({
    onSuccess: () => router.push('/dashboard'),
    onError: () => setError('Gagal daftar dengan Google. Silakan coba lagi.'),
  })
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  // State untuk tampilkan pesan "cek email konfirmasi"
  const [emailSent, setEmailSent] = useState(false)

  const handleNext = (e) => {
    e.preventDefault()
    if (form.password !== form.konfirmasi) {
      setError('Password tidak cocok'); return
    }
    setError('')
    setStep(2)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.namaLengkap, nama_warung: form.namaWarung, no_hp: form.noHp }
        }
      })

      if (signUpError) {
        // Error eksplisit dari Supabase
        if (signUpError.message.toLowerCase().includes('already registered') ||
            signUpError.message.toLowerCase().includes('user already registered')) {
          setError('Email ini sudah terdaftar. Silakan login atau gunakan email lain.')
        } else {
          setError(signUpError.message || 'Terjadi kesalahan. Silakan coba lagi.')
        }
        return
      }

      // Supabase kadang return user tapi identities kosong = email sudah ada tapi belum verifikasi
      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        setError('Email ini sudah terdaftar. Silakan login atau gunakan "Lupa Password" jika lupa sandi.')
        return
      }

      // Jika email confirmation aktif di Supabase, session akan null
      // Tampilkan pesan "cek email" alih-alih langsung redirect
      if (!data?.session) {
        setEmailSent(true)
        return
      }

      // Jika konfirmasi email dimatikan (auto-confirm), langsung masuk
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegister = () => signInWithGoogle()

  // ── Tampilan setelah daftar sukses, menunggu verifikasi email
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Cek Email Kamu!</h2>
          <p className="text-gray-500 text-sm mb-1 leading-relaxed">
            Kami kirim link konfirmasi ke:
          </p>
          <p className="font-semibold text-blue-700 text-sm mb-4">{form.email}</p>
          <p className="text-gray-400 text-xs leading-relaxed mb-6">
            Klik link di email untuk mengaktifkan akun kamu. Setelah itu bisa langsung login.
            Cek juga folder <strong>Spam / Junk</strong> jika tidak muncul.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-bold text-sm transition-colors"
          >
            Ke Halaman Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">WarungKu</h1>
            <p className="text-xs text-gray-400">Daftar akun baru</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* Google Register Button — hanya tampil di step 1 */}
        {step === 1 && (
          <>
            <button
              onClick={handleGoogleRegister}
              disabled={loadingGoogle || loading}
              className="w-full flex items-center justify-center gap-2.5 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-60 mb-4"
            >
              {loadingGoogle ? (
                <svg className="animate-spin w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
              )}
              {loadingGoogle ? 'Menghubungkan...' : 'Daftar dengan Google'}
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">atau isi form di bawah</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-400'}`}>{s}</div>
              <span className={`text-xs ${step >= s ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>{s === 1 ? 'Akun' : 'Warung'}</span>
              {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-blue-700' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Data Akun</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
              <input type="text" placeholder="Nama lengkap Anda" className="input-field"
                value={form.namaLengkap} onChange={e => setForm({ ...form, namaLengkap: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" placeholder="email@contoh.com" className="input-field"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 karakter" className="input-field pr-10"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password</label>
              <input type="password" placeholder="Ulangi password" className="input-field"
                value={form.konfirmasi} onChange={e => setForm({ ...form, konfirmasi: e.target.value })} required />
            </div>
            <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold text-sm transition-colors">
              Lanjut →
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Data Warung</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Warung</label>
              <input type="text" placeholder="Contoh: Warung Barokah" className="input-field"
                value={form.namaWarung} onChange={e => setForm({ ...form, namaWarung: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor HP / WhatsApp</label>
              <input type="tel" placeholder="08xxxxxxxxxx" className="input-field"
                value={form.noHp} onChange={e => setForm({ ...form, noHp: e.target.value })} required />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 btn-secondary justify-center">
                ← Kembali
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-60">
                {loading ? 'Memuat...' : 'Daftar Sekarang'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">Masuk</Link>
        </p>
      </div>
    </div>
  )
}
