import 'server-only'

import { buildAbsensiSiswaFromJurnal, monthRange, type RekapAbsensiJurnal } from '@/lib/absensi-siswa-logic'
import { currentMonthKey } from '@/lib/format'
import { kueriDenganUnit, rosterJurnalUnit } from '@/lib/isolasi-kueri'
import { saringJurnalUnit } from '@/lib/jurnal-isolasi'
import { normalKelasJurnal } from '@/lib/kelas-jurnal'
import { isStudentId } from '@/lib/student-id'
import { getSupabase } from '@/lib/supabase'
import { unitLogin } from '@/lib/unit-isolasi'

function kolomGuruTidakAda(error?: { code?: string; message?: string } | null) {
  const pesan = String(error?.message || '').toLowerCase()
  return (
    error?.code === 'PGRST204' ||
    error?.code === '42703' ||
    (pesan.includes('guru') && pesan.includes('does not exist'))
  )
}

async function fetchJurnalKelasRentang(kelas: string, unit: string, start: string, end: string) {
  const className = kelas.trim()
  const unitAktif = unitLogin(unit)
  if (!className || !unitAktif) return { rows: [] as Record<string, unknown>[], error: null as { message?: string } | null }

  const kunci = normalKelasJurnal(className)
  const variasi = Array.from(
    new Set(
      [className, className.replace(/\s+/g, ''), className.replace(/\s+/g, ' ').trim(), `Kelas ${className}`].filter(
        Boolean,
      ),
    ),
  )
  const kolomDenganGuru =
    'id, tanggal, kelas, mapel, materi, kegiatan, jam, semester, hadir, tidak_hadir, siswa_tidak_hadir, guru'
  const kolomTanpaGuru =
    'id, tanggal, kelas, mapel, materi, kegiatan, jam, semester, hadir, tidak_hadir, siswa_tidak_hadir'

  const supabase = getSupabase()
  const roster = await rosterJurnalUnit(className, unitAktif)
  const cocokKelas = (daftar: Record<string, unknown>[]) =>
    saringJurnalUnit(
      daftar.filter((row) => normalKelasJurnal(String(row.kelas || '')) === kunci),
      roster,
    )

  async function ambil(kolom: string) {
    const pageSize = 1000
    const all: Record<string, unknown>[] = []
    let from = 0

    const filterKelas = variasi.map((nama) => `kelas.eq.${nama}`).join(',')

    while (true) {
      const { rows, error } = await kueriDenganUnit(
        unitAktif,
        () =>
          supabase
            .from('jurnal_pembelajaran')
            .select(`${kolom}, unit`)
            .gte('tanggal', start)
            .lte('tanggal', end)
            .or(filterKelas)
            .eq('unit', unitAktif)
            .order('tanggal', { ascending: true })
            .range(from, from + pageSize - 1),
        () =>
          supabase
            .from('jurnal_pembelajaran')
            .select(kolom)
            .gte('tanggal', start)
            .lte('tanggal', end)
            .or(filterKelas)
            .order('tanggal', { ascending: true })
            .range(from, from + pageSize - 1),
      )
      if (error) return { rows: all, error }
      all.push(...rows)
      if (rows.length < pageSize) break
      from += pageSize
    }

    return { rows: cocokKelas(all), error: null }
  }

  let hasil = await ambil(kolomDenganGuru)
  if (hasil.error && kolomGuruTidakAda(hasil.error)) {
    hasil = await ambil(kolomTanpaGuru)
  }
  return hasil
}

/** Rekap absensi satu siswa (sesi per jam) dari jurnal kelas — hanya untuk id siswa sesi wali. */
export async function getAbsensiJurnalSiswa(opts: {
  idSiswa: string
  namaSiswa: string
  kelas: string
  unit?: string
  bulan?: string
}): Promise<{ data: RekapAbsensiJurnal; error: string | null }> {
  if (!isStudentId(opts.idSiswa)) {
    return {
      data: buildAbsensiSiswaFromJurnal([], {
        idSiswa: opts.idSiswa,
        namaSiswa: opts.namaSiswa,
        bulan: opts.bulan || currentMonthKey(),
      }),
      error: 'Sesi tidak valid.',
    }
  }

  const bulan = opts.bulan || currentMonthKey()
  const { start, end } = monthRange(bulan)
  const { rows, error } = await fetchJurnalKelasRentang(opts.kelas, opts.unit || '', start, end)

  if (error) {
    console.error('absensi jurnal wali', error.message)
    return {
      data: buildAbsensiSiswaFromJurnal([], { ...opts, bulan }),
      error: 'Rekap absensi belum bisa dimuat.',
    }
  }

  return {
    data: buildAbsensiSiswaFromJurnal(rows, { idSiswa: opts.idSiswa, namaSiswa: opts.namaSiswa, bulan }),
    error: null,
  }
}
