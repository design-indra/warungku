'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Store } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    namaLengkap: '', email: '', password: '', konfirmasi: '',
    namaWarung: '', noHp: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

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
      if (signUpError) throw signUpError
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.')
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
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">WarungKu</h1>
            <p className="text-xs text-gray-400">Daftar akun baru</p>
          </div>
        </div>

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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

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
