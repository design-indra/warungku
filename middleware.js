import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({ request })

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
    }
  )

  // ── Cek session dari cookie lokal (tidak hit network) ───────────────────
  // getSession() aman dipakai di middleware karena baca JWT dari cookie
  // getUser() tidak cocok di sini karena selalu hit Supabase server
  let session = null
  try {
    const { data } = await supabase.auth.getSession()
    session = data?.session ?? null
  } catch {
    // Jika Supabase SDK error, fallback ke cek cookie manual
    session = null
  }

  // ── Fallback: cek cookie Supabase secara manual ─────────────────────────
  // Dipakai jika getSession() gagal (jarang, tapi bisa terjadi)
  const hasSessionCookie = request.cookies.getAll().some(c =>
    c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )

  const isAuthenticated = !!session || hasSessionCookie

  // Protect dashboard — izinkan jika ada session ATAU ada cookie session
  if (pathname.startsWith('/dashboard') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect user yang sudah login dari halaman auth
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
