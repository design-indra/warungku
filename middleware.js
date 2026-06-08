import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Halaman yang boleh diakses offline (sudah di-cache SW)
const OFFLINE_ALLOWED = [
  '/dashboard',
  '/dashboard/kasir',
  '/dashboard/stok',
  '/dashboard/laporan',
  '/dashboard/hutang',
  '/dashboard/pelanggan',
  '/dashboard/riwayat',
  '/dashboard/menu-lainnya',
]

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Deteksi request offline via header SW atau Service-Worker
  // Saat offline, browser kirim request dari cache SW — tidak ada Supabase session
  // Kita allow akses dashboard jika:
  // 1. Request dari Service Worker (SW navigation preload)
  // 2. Header X-Offline-Request ada
  const isOfflineRequest =
    request.headers.get('x-offline-request') === '1' ||
    request.headers.get('service-worker-navigation-preload') !== null

  // Kalau offline request ke halaman yang diizinkan → langsung allow
  if (isOfflineRequest && OFFLINE_ALLOWED.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

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
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user
  } catch {
    // Supabase tidak bisa dihubungi (offline) → cek cookie session manual
    const sessionCookie =
      request.cookies.get('sb-access-token') ||
      request.cookies.get('supabase-auth-token') ||
      // next-pwa stores session in cookie with this pattern
      [...request.cookies.getAll()].find(c => c.name.includes('auth-token'))

    if (sessionCookie && pathname.startsWith('/dashboard')) {
      // Ada session cookie → izinkan akses (offline dengan session tersimpan)
      return NextResponse.next()
    }
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect logged-in users away from auth pages
  if (
    pathname.startsWith('/auth') &&
    !pathname.startsWith('/auth/callback') &&
    user
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
