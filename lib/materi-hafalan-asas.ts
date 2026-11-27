import 'server-only'

import { unstable_noStore as noStore } from 'next/cache'
import { getSupabase } from '@/lib/supabase'

export type MateriHafalanAsas = {
  surah: string[]
  indikator: string
  guru: string
}

const PESAN_KOSONG = 'Materi ujian hafalan ASAS sedang disiapkan oleh guru pembimbing.'

function teks(nilai: unknown) {
  return String(nilai ?? '').replace(/\s+/g, ' ').trim()
}

function labelSurah(surah: string, ayat: string) {
  const nama = teks(surah)
  const rentang = teks(ayat).replace(/-/g, '–')
  if (!nama) return ''
  if (!rentang) return nama
  if (/ayat/i.test(rentang)) return `${nama} (${rentang})`
  return `${nama} (Ayat ${rentang})`
}

function asesmenAsas(nilai: string) {
  return /^ASAS\b/i.test(teks(nilai))
}

function kunciUnik(idSiswa: string, nis: string) {
  return [...new Set([idSiswa, nis, idSiswa.replace(/\D/g, ''), nis.replace(/\D/g, '')].map((item) => item.trim()).filter((item) => item.length >= 3))]
}

export async function muatMateriHafalanAsas(idSiswa: string, nis: string): Promise<{ materi: MateriHafalanAsas | null; galat: string }> {
  noStore()
  const kunci = kunciUnik(idSiswa, nis)
  if (kunci.length === 0) return { materi: null, galat: '' }

  const supabase = getSupabase()
  const utama = await supabase
    .from('materi_ujian_tahfidz')
    .select('id_siswa,asesmen,surah,ayat,keterangan,guru')
    .in('id_siswa', kunci)

  let baris = (utama.data || []) as Record<string, unknown>[]
  let galat = utama.error?.message || ''

  if (!utama.error) {
    const lewatNis = await supabase.from('materi_ujian_tahfidz').select('id_siswa,nis,asesmen,surah,ayat,keterangan,guru').in('nis', kunci)
    if (!lewatNis.error) baris = [...baris, ...((lewatNis.data || []) as Record<string, unknown>[])]
  }

  if (utama.error && /column|schema cache/i.test(galat)) {
    const ulang = await supabase
      .from('materi_ujian_tahfidz')
      .select('id_siswa,asesmen,surah,ayat,keterangan,guru')
      .in('id_siswa', kunci)
    baris = (ulang.data || []) as Record<string, unknown>[]
    galat = ulang.error?.message || ''
  }

  if (galat && baris.length === 0) {
    console.error('materi hafalan asas', galat)
    return { materi: null, galat: PESAN_KOSONG }
  }

  const asas = baris.filter((row) => asesmenAsas(teks(row.asesmen)))
  const surah = [...new Set(asas.map((row) => labelSurah(teks(row.surah), teks(row.ayat))).filter(Boolean))]
  const indikator = asas.map((row) => teks(row.keterangan)).find(Boolean) || ''
  const guru = [...new Set(asas.map((row) => teks(row.guru)).filter(Boolean))].join(', ')

  if (surah.length === 0 && !indikator) return { materi: null, galat: '' }
  return { materi: { surah, indikator, guru }, galat: '' }
}

export { PESAN_KOSONG as PESAN_MATERI_HAFALAN_KOSONG }
