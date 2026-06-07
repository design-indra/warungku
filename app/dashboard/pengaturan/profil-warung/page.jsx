'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Save, Camera } from 'lucide-react'
import Icon from '@/components/Icon'

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Terjadi kesalahan')
  return json
}

export default function ProfilWarungPage() {
  const router = useRouter()
  const [form, setForm]         = useState({ nama_warung: '', no_hp: '', alamat: '' })
  const [logoUrl, setLogoUrl]   = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    apiFetch('/api/pengaturan/profil')
      .then(d => {
        setForm({ nama_warung: d.nama_warung || '', no_hp: d.no_hp || '', alamat: d.alamat || '' })
        setLogoUrl(d.logo_url || '')
      })
      .catch(e => setMsg('❌ ' + e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUrl(URL.createObjectURL(file))
    setUploading(true)
    setMsg('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/pengaturan/upload-logo', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Upload gagal')
      setLogoUrl(json.url)
      setMsg('✅ Foto warung berhasil diperbarui!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg('❌ ' + err.message)
      setLogoUrl('')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    if (!form.nama_warung.trim()) { setMsg('❌ Nama warung wajib diisi'); return }
    setSaving(true); setMsg('')
    try {
      await apiFetch('/api/pengaturan/profil', { method: 'PUT', body: JSON.stringify(form) })
      setMsg('✅ Profil berhasil disimpan!')
      setTimeout(() => setMsg(''), 3000)
    } catch (e) { setMsg('❌ ' + e.message) }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="spinner" />
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Profil Warung</h1>
      </div>

      <div className="flex-1 overflow-y-auto page-content">
        <div className="max-w-lg space-y-4">
          <div className="card p-5">
            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="relative cursor-pointer group"
                onClick={() => !uploading && fileRef.current?.click()}
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-blue-50 flex items-center justify-center">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo warung" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl select-none">🏪</span>
                  )}
                </div>
                <div className={`absolute inset-0 rounded-2xl flex items-center justify-center transition-all
                  ${uploading ? 'bg-black/40' : 'bg-black/0 group-hover:bg-black/40'}`}>
                  {uploading ? (
                    <svg className="w-7 h-7 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  ) : (
                    <Camera className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                {uploading ? 'Mengupload foto...' : 'Ketuk foto untuk mengganti'}
              </p>
              <p className="text-[10px] text-gray-300 mt-0.5">JPG, PNG, WebP • Maks. 10MB</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>

            {/* Form */}
            <div className="space-y-3">
              {[
                { label: 'Nama Warung', key: 'nama_warung', placeholder: 'Nama warung Anda' },
                { label: 'No. Telepon', key: 'no_hp', placeholder: '0812-xxx-xxxx' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                  <input
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="input-field"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Alamat</label>
                <textarea
                  value={form.alamat}
                  onChange={e => setForm(p => ({ ...p, alamat: e.target.value }))}
                  rows={3} className="input-field resize-none"
                  placeholder="Alamat warung Anda"
                />
              </div>
            </div>

            {msg && (
              <p className={`mt-3 text-xs font-medium ${msg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>
            )}
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="w-full btn-primary justify-center mt-4 py-3"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
