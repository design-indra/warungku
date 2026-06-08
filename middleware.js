import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({ request })

  // FIX 12: Sebelumnya middleware selalu hit Supabase untuk getSession(),
  // padahal saat offline request tetap lewat middleware (di server).
  // getSession() di middleware sebenarnya aman (baca cookie lokal),
  // tapi jika Supabase SDK mencoba refresh token di background → bisa hang offline.
  // Solusi: tambahkan autoRefreshToken: false di createServerClient middleware.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
      // FIX 13: Matikan auto-refresh di middleware → tidak ada network call
      // background yang bisa gagal/hang saat offline.
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  let session = null
  try {
    const { data } = await supabase.auth.getSession()
    session = data?.session ?? null
  } catch {
    session = null
  }

  const hasSessionCookie = request.cookies.getAll().some(c =>
    c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )

  const isAuthenticated = !!session || hasSessionCookie

  if (pathname.startsWith('/dashboard') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (
    pathname.startsWith('/auth') &&
    !pathname.startsWith('/auth/callback') &&
    isAuthenticated
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
