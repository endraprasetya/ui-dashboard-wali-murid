import 'server-only'

import { getSupabase } from '@/lib/supabase'
import { isStudentId } from '@/lib/student-id'
import { kolomUnitTidakAda, saringBarisMilikUnit, unitLogin, unitSama } from '@/lib/unit-isolasi'
import { normalKelasJurnal } from '@/lib/kelas-jurnal'
import type { RosterIsolasiJurnal } from '@/lib/jurnal-isolasi'

export type SiswaUnit = {
  idSiswa: string
  nama: string
  kelas: string
  unit: string
  nis: string
}

function teks(nilai: unknown) {
  return String(nilai ?? '').trim()
}

export async function muatSiswaUnit(idSiswa: string): Promise<SiswaUnit | null> {
  if (!isStudentId(idSiswa)) return null
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('siswa')
    .select('id_siswa, nama_siswa, kelas, unit, nis')
    .eq('id_siswa', idSiswa)
    .maybeSingle()

  if (error || !data) return null
  const unit = unitLogin(teks(data.unit))
  return {
    idSiswa: teks(data.id_siswa),
    nama: teks(data.nama_siswa),
    kelas: teks(data.kelas),
    unit,
    nis: teks(data.nis),
  }
}

export async function siswaMilikUnit(idSiswa: string, unit: string) {
  const siswa = await muatSiswaUnit(idSiswa)
  if (!siswa) return null
  const unitAktif = unitLogin(unit) || siswa.unit
  if (unitAktif && siswa.unit && !unitSama(siswa.unit, unitAktif)) return null
  return { ...siswa, unit: unitAktif || siswa.unit }
}

export async function daftarSiswaKelasUnit(kelas: string, unit: string) {
  const className = kelas.trim()
  const unitAktif = unitLogin(unit)
  if (!className || !unitAktif) return [] as { id: string; nama: string; unit: string }[]

  const supabase = getSupabase()
  const pilih = (rows: { id_siswa?: unknown; nama_siswa?: unknown; kelas?: unknown; unit?: unknown }[] | null) =>
    (rows || [])
      .filter((row) => unitSama(row.unit, unitAktif) && normalKelasJurnal(teks(row.kelas)) === normalKelasJurnal(className))
      .map((row) => ({ id: teks(row.id_siswa), nama: teks(row.nama_siswa), unit: teks(row.unit) }))

  const ketat = await supabase
    .from('siswa')
    .select('id_siswa, nama_siswa, kelas, unit')
    .eq('kelas', className)
    .eq('unit', unitAktif)
    .not('kelas', 'ilike', '%Alumni%')
    .limit(500)

  const dariKetat = pilih(ketat.data)
  if (!ketat.error && dariKetat.length > 0) return dariKetat

  const longgar = await supabase
    .from('siswa')
    .select('id_siswa, nama_siswa, kelas, unit')
    .eq('kelas', className)
    .not('kelas', 'ilike', '%Alumni%')
    .limit(800)

  if (longgar.error) return dariKetat
  return pilih(longgar.data)
}

export async function idsSiswaKelasUnitLain(kelas: string, unit: string) {
  const className = kelas.trim()
  const unitAktif = unitLogin(unit)
  if (!className || !unitAktif) return { ids: new Set<string>(), nama: new Set<string>() }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('siswa')
    .select('id_siswa, nama_siswa, kelas, unit')
    .eq('kelas', className)
    .not('kelas', 'ilike', '%Alumni%')
    .limit(800)

  if (error) return { ids: new Set<string>(), nama: new Set<string>() }

  const ids = new Set<string>()
  const nama = new Set<string>()
  for (const row of data || []) {
    if (unitSama(row.unit, unitAktif)) continue
    const id = teks(row.id_siswa)
    const nm = teks(row.nama_siswa)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (id) ids.add(id)
    if (nm) nama.add(nm)
  }
  return { ids, nama }
}

export async function rosterJurnalUnit(kelas: string, unit: string): Promise<RosterIsolasiJurnal> {
  const unitAktif = unitLogin(unit)
  const [roster, lain] = await Promise.all([daftarSiswaKelasUnit(kelas, unitAktif), idsSiswaKelasUnitLain(kelas, unitAktif)])
  return {
    unit: unitAktif,
    kelas,
    rosterIds: new Set(roster.map((row) => row.id).filter(Boolean)),
    rosterNama: new Set(
      roster.map((row) =>
        row.nama
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim(),
      ).filter(Boolean),
    ),
    idsUnitLain: lain.ids,
    namaUnitLain: lain.nama,
    ukuranKelas: roster.length,
  }
}

type HasilKueri = { data?: unknown; error: { code?: string; message?: string } | null }

export async function kueriDenganUnit<T extends Record<string, unknown> = Record<string, unknown>>(
  unit: string,
  denganUnit: () => PromiseLike<HasilKueri>,
  tanpaUnit: () => PromiseLike<HasilKueri>,
  opts?: { idSiswa?: string; idsSah?: Set<string> },
): Promise<{ rows: T[]; error: HasilKueri['error'] }> {
  const unitAktif = unitLogin(unit)
  if (unitAktif) {
    const pertama = await denganUnit()
    if (!pertama.error) {
      return {
        rows: saringBarisMilikUnit((pertama.data as Record<string, unknown>[]) || [], unitAktif, opts) as T[],
        error: null,
      }
    }
    if (!kolomUnitTidakAda(pertama.error)) return { rows: [], error: pertama.error }
  }

  const cadangan = await tanpaUnit()
  if (cadangan.error) return { rows: [], error: cadangan.error }
  return {
    rows: saringBarisMilikUnit((cadangan.data as Record<string, unknown>[]) || [], unitAktif, opts) as T[],
    error: null,
  }
}
