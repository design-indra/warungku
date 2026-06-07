'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [form, setForm]       = useState({ password: '', konfirmasi: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')

  const handleSave = async () => {
    if (!form.password) { setMsg('❌ Password baru wajib diisi'); return }
    if (form.password.length < 6) { setMsg('❌ Password minimal 6 karakter'); return }
    if (form.password !== form.konfirmasi) { setMsg('❌ Konfirmasi password tidak cocok'); return }
    setLoading(true); setMsg('')
    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: form.password })
      if (error) throw new Error(error.message)
      setMsg('✅ Password berhasil diubah!')
      setForm({ password: '', konfirmasi: '' })
    } catch (e) { setMsg('❌ ' + e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Ubah Password</h1>
      </div>

      <div className="flex-1 overflow-y-auto page-content">
        <div className="max-w-lg space-y-4">
          {/* Icon */}
          <div className="flex justify-center pt-4">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-1">Ubah Password</h3>
            <p className="text-xs text-gray-400 mb-4">Masukkan password baru untuk akun kamu. Minimal 6 karakter.</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Password Baru</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Minimal 6 karakter"
                    className="input-field w-full pr-10"
                  />
                  <button
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Konfirmasi Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.konfirmasi}
                  onChange={e => setForm(p => ({ ...p, konfirmasi: e.target.value }))}
                  placeholder="Ulangi password baru"
                  className="input-field w-full"
                />
              </div>
            </div>

            {/* Strength indicator sederhana */}
            {form.password && (
              <div className="mt-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        form.password.length >= i * 3
                          ? form.password.length >= 10 ? 'bg-green-500' : 'bg-yellow-400'
                          : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {form.password.length < 6 ? 'Terlalu pendek' :
                   form.password.length < 10 ? 'Cukup kuat' : 'Sangat kuat'}
                </p>
              </div>
            )}

            {msg && (
              <p className={`mt-3 text-xs font-medium ${msg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>
            )}

            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-primary w-full mt-4 justify-center py-3"
            >
              <Lock className="w-4 h-4" />
              {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </div>

          {/* Tips keamanan */}
          <div className="card p-4">
            <p className="text-xs font-bold text-gray-700 mb-2">Tips Keamanan Password</p>
            {[
              'Gunakan minimal 8 karakter',
              'Kombinasikan huruf besar, kecil, dan angka',
              'Hindari informasi pribadi (tanggal lahir, nama)',
              'Jangan gunakan password yang sama di banyak akun',
            ].map(tip => (
              <div key={tip} className="flex items-start gap-2 mb-1.5">
                <span className="text-green-500 text-xs mt-0.5">✓</span>
                <p className="text-xs text-gray-500">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
