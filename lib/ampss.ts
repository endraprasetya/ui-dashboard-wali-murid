import 'server-only'

import { muatSiswaUnit } from '@/lib/isolasi-kueri'
import { isStudentId } from '@/lib/student-id'
import { saringTagihanBelumTerbayarWali } from '@/lib/ampss-tagihan-aktif'
import { parseAmpss, type HasilParseAmpss } from '@/lib/ampss-parse'

const ASAL = 'https://www.ampss.net'
const UMUR_BERHASIL = 60_000
const UMUR_GAGAL = 20_000

export type HasilKeuanganAmpss = HasilParseAmpss & { error: string | null }

const kosong: HasilParseAmpss = { tagihan: [], riwayat: [], ringkas: { terbayar: 0, belumTerbayar: 0 } }
const cache = new Map<string, { waktu: number; hasil: HasilKeuanganAmpss }>()

function kataSandi() {
  return process.env.AMPSS_PASSWORD?.trim() || '123456'
}

function usernameAman(nilai: string) {
  return /^[A-Za-z0-9._-]{1,32}$/.test(nilai)
}

function simpanCookie(respon: Response, jar: Map<string, string>) {
  const daftar = typeof respon.headers.getSetCookie === 'function' ? respon.headers.getSetCookie() : []
  for (const baris of daftar) {
    const [pasangan] = baris.split(';')
    const sama = pasangan.indexOf('=')
    if (sama > 0) jar.set(pasangan.slice(0, sama).trim(), pasangan.slice(sama + 1).trim())
  }
}

function headerCookie(jar: Map<string, string>) {
  return [...jar.entries()].map(([kunci, nilai]) => `${kunci}=${nilai}`).join('; ')
}

async function halamanSetelahMasuk(username: string) {
  const jar = new Map<string, string>()
  const awal = await fetch(`${ASAL}/login`, {
    cache: 'no-store',
    redirect: 'manual',
    signal: AbortSignal.timeout(12_000),
    headers: { 'user-agent': 'PortalWali/1.0' },
  })
  simpanCookie(awal, jar)
  const formulir = await awal.text()
  const token = formulir.match(/name="_token" value="([^"]+)"/)?.[1]
  if (!token) return ''

  const masuk = await fetch(`${ASAL}/login`, {
    method: 'POST',
    cache: 'no-store',
    redirect: 'manual',
    signal: AbortSignal.timeout(12_000),
    headers: {
      'user-agent': 'PortalWali/1.0',
      'content-type': 'application/x-www-form-urlencoded',
      cookie: headerCookie(jar),
      origin: ASAL,
      referer: `${ASAL}/login`,
    },
    body: new URLSearchParams({ _token: token, username, password: kataSandi() }),
  })
  simpanCookie(masuk, jar)
  const lokasi = masuk.headers.get('location') || ''
  if (!lokasi || /\/login\/?$/.test(lokasi)) return ''
  const tujuan = new URL(lokasi, ASAL)
  if (tujuan.hostname !== 'ampss.net' && tujuan.hostname !== 'www.ampss.net') return ''

  const dasbor = await fetch(`${ASAL}/customer_dashboard`, {
    cache: 'no-store',
    redirect: 'follow',
    signal: AbortSignal.timeout(12_000),
    headers: { 'user-agent': 'PortalWali/1.0', cookie: headerCookie(jar) },
  })
  return dasbor.text()
}

async function tarik(username: string): Promise<HasilKeuanganAmpss> {
  try {
    const html = await halamanSetelahMasuk(username)
    const hasil = parseAmpss(html)
    if (!hasil) return { ...kosong, error: 'Akun AMPSS siswa ini belum bisa dimasuki.' }
    const tagihan = saringTagihanBelumTerbayarWali(hasil.tagihan)
    const belumTerbayar = tagihan.reduce((total, item) => total + item.jumlah, 0)
    return {
      ...hasil,
      tagihan,
      ringkas: { ...hasil.ringkas, belumTerbayar },
      error: null,
    }
  } catch {
    return { ...kosong, error: 'Tagihan AMPSS belum dapat dimuat. Coba lagi beberapa saat.' }
  }
}

export async function ambilKeuanganAmpss(idSiswa: string, nis = ''): Promise<HasilKeuanganAmpss> {
  if (!isStudentId(idSiswa)) return { ...kosong, error: 'Akun siswa tidak dikenali.' }
  const siswa = await muatSiswaUnit(idSiswa)
  if (!siswa) return { ...kosong, error: 'Akun siswa tidak dikenali.' }

  const tersimpan = cache.get(idSiswa)
  if (tersimpan && Date.now() - tersimpan.waktu < (tersimpan.hasil.error ? UMUR_GAGAL : UMUR_BERHASIL)) {
    return tersimpan.hasil
  }

  const urutan = [idSiswa, nis.trim() || siswa.nis].filter(
    (nilai, indeks, daftar) => usernameAman(nilai) && daftar.indexOf(nilai) === indeks,
  )
  let hasil = await tarik(urutan[0] || idSiswa)
  if (hasil.error && urutan[1]) hasil = await tarik(urutan[1])
  cache.set(idSiswa, { waktu: Date.now(), hasil })
  return hasil
}
