'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

function isCapacitorNative() {
  return (
    typeof window !== 'undefined' &&
    window.Capacitor !== undefined &&
    window.Capacitor.isNativePlatform?.() === true
  )
}

async function nativeGoogleSignIn(supabase) {
  const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')

  await GoogleAuth.initialize({
    clientId: '112112398934-ofphqa4hkeaktka3npf0f79moqs8688i.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    grantOfflineAccess: true,
  })

  const googleUser = await GoogleAuth.signIn()

  const idToken = googleUser.authentication?.idToken
  if (!idToken) throw new Error('Gagal mendapat ID token dari Google.')

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  })

  if (error) throw error
  return data
}

async function webGoogleSignIn(supabase) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
}

export function useGoogleAuth({ onSuccess, onError } = {}) {
  const [loading, setLoading] = useState(false)

  const signInWithGoogle = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      if (isCapacitorNative()) {
        const data = await nativeGoogleSignIn(supabase)
        onSuccess?.(data)
      } else {
        await webGoogleSignIn(supabase)
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
