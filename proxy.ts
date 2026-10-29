import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { readSessionToken, SESSION_COOKIE } from '@/lib/session-token'

export async function proxy(request: NextRequest) {
  const sessionId = await readSessionToken(request.cookies.get(SESSION_COOKIE)?.value)
  const isLogin = request.nextUrl.pathname === '/login'

  if (!sessionId && !isLogin) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (sessionId && isLogin) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:png|svg|jpg|jpeg|gif|webp|ico)$).*)'],
}
