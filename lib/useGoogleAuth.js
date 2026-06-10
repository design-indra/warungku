'use client'

/**
 * useGoogleAuth — Smart Google Sign-In
 *
 * - APK (Capacitor native Android) → @codetrix-studio/capacitor-google-auth
 *   → Dialog pilih akun muncul DI DALAM app, tanpa buka browser eksternal.
 * - PWA / Browser biasa → supabase.auth.signInWithOAuth (redirect OAuth biasa).
 *
 * CARA PAKAI:
 *   const { signInWithGoogle, loading } = useGoogleAuth()
 *   <button onClick={() => signInWithGoogle()} disabled={loading}>Login Google</button>
 */

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

// ─── Deteksi apakah berjalan di dalam Capacitor (APK Android) ───────────────
function isCapacitorNative() {
  return (
    typeof window !== 'undefined' &&
    window.Capacitor !== undefined &&
    window.Capacitor.isNativePlatform?.() === true
  )
}

// ─── Ambil token Google via native SDK, lalu kirim ke Supabase ──────────────
async function nativeGoogleSignIn(supabase) {
  // Plugin ini harus sudah terinstall: npm install @codetrix-studio/capacitor-google-auth
  // dan di-sync: npx cap sync android
  const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')

  // Muncul dialog pilih akun Google native di dalam app
  const googleUser = await GoogleAuth.signIn()

  // googleUser.authentication.idToken adalah JWT dari Google
  const idToken = googleUser.authentication?.idToken
  if (!idToken) throw new Error('Gagal mendapat ID token dari Google.')

  // Kirim token ke Supabase untuk verifikasi dan buat sesi
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  })

  if (error) throw error
  return data
}

// ─── OAuth biasa untuk PWA / browser ────────────────────────────────────────
async function webGoogleSignIn(supabase) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
  // Redirect otomatis, tidak ada return value yang perlu dihandle
}

// ─── Hook utama ──────────────────────────────────────────────────────────────
export function useGoogleAuth({ onSuccess, onError } = {}) {
  const [loading, setLoading] = useState(false)

  const signInWithGoogle = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      if (isCapacitorNative()) {
        // Android APK: gunakan native dialog (tidak buka browser)
        const data = await nativeGoogleSignIn(supabase)
        onSuccess?.(data)
      } else {
        // PWA / browser: OAuth redirect seperti biasa
        await webGoogleSignIn(supabase)
        // Tidak ada onSuccess di sini karena halaman akan redirect
      }
    } catch (err) {
      console.error('[GoogleAuth]', err)
      onError?.(err)
    } finally {
      setLoading(false)
    }
  }, [onSuccess, onError])

  return { signInWithGoogle, loading, isNative: isCapacitorNative() }
}
