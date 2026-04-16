import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SESSION_DURATION_MS = 60 * 60 * 1000 // 1 hora
export const SESSION_STARTED_COOKIE = 'session_started_at'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const sessionStartedAt = request.cookies.get(SESSION_STARTED_COOKIE)?.value
    const now = Date.now()

    if (!sessionStartedAt) {
      // Primera request después del login — guardar el momento de inicio
      supabaseResponse.cookies.set(SESSION_STARTED_COOKIE, String(now), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24h techo para evitar cookies huérfanas
      })
    } else if (now - parseInt(sessionStartedAt) > SESSION_DURATION_MS) {
      // Sesión expirada — forzar logout
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      const response = NextResponse.redirect(url)
      response.cookies.delete(SESSION_STARTED_COOKIE)
      return response
    }
  }

  // Rutas protegidas
  const protectedPaths = ['/dashboard', '/predict', '/leaderboard', '/rules']
  const pathname = request.nextUrl.pathname

  if (!user && protectedPaths.some(p => pathname.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    // La verificación de admin se hace en el layout del admin
  }

  return supabaseResponse
}
