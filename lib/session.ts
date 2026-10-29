import 'server-only'

import { cookies } from 'next/headers'
import { createSessionToken, readSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/session-token'

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE,
}

export async function createSession(idSiswa: string) {
  const token = await createSessionToken(idSiswa)
  if (!token) {
    throw new Error('Session secret is not configured')
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, cookieOptions)
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSession() {
  const cookieStore = await cookies()
  const idSiswa = await readSessionToken(cookieStore.get(SESSION_COOKIE)?.value)
  return idSiswa ? { idSiswa } : null
}
