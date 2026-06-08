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

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user
  } catch {
    // Supabase tidak bisa dihubungi (offline)
    // Cek apakah ada session cookie tersimpan di browser
    const cookies = request.cookies.getAll()
    const hasSession = cookies.some(c =>
      c.name.includes('auth-token') ||
      c.name.includes('sb-') ||
      c.name.startsWith('supabase')
    )

    if (hasSession && pathname.startsWith('/dashboard')) {
      // Ada session → izinkan akses saat offline
      return NextResponse.next()
    }
  }

  // Protect dashboard
  if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect user login dari halaman auth
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
