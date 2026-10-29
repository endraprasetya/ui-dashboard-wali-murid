import { safeEqual } from '@/lib/safe-equal'
import { isStudentId } from '@/lib/student-id'

export const SESSION_COOKIE = 'wali_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7

type SessionPayload = {
  id: string
  exp: number
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '')
}

function base64UrlEncode(value: string) {
  return bytesToBase64Url(new TextEncoder().encode(value))
}

function base64UrlDecode(value: string) {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (value.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

async function sign(value: string) {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) return null

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return bytesToBase64Url(new Uint8Array(signature))
}

export async function createSessionToken(idSiswa: string) {
  if (!isStudentId(idSiswa)) return null

  const payload: SessionPayload = {
    id: idSiswa,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  }
  const body = base64UrlEncode(JSON.stringify(payload))
  const signature = await sign(body)
  if (!signature) return null
  return `${body}.${signature}`
}

export async function readSessionToken(token: string | undefined | null) {
  if (!token) return null

  const separator = token.lastIndexOf('.')
  if (separator <= 0) return null

  const body = token.slice(0, separator)
  const signature = token.slice(separator + 1)
  const expected = await sign(body)
  if (!expected || !safeEqual(expected, signature)) return null

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as Partial<SessionPayload>
    if (typeof payload.id !== 'string' || typeof payload.exp !== 'number') return null
    if (payload.exp < Date.now() || !isStudentId(payload.id)) return null
    return payload.id
  } catch {
    return null
  }
}
