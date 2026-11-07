import { normalizeSiswaTidakHadir } from '@/lib/absensi-siswa-logic'
import { normalKelasJurnal } from '@/lib/kelas-jurnal'
import { unitLogin, unitSama } from '@/lib/unit-isolasi'

function normNama(nilai: unknown) {
  return String(nilai ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export type RosterIsolasiJurnal = {
  unit: string
  kelas: string
  rosterIds: Set<string>
  rosterNama: Set<string>
  idsUnitLain: Set<string>
  namaUnitLain: Set<string>
  ukuranKelas: number
}

/** Jurnal hanya untuk kelas + unit siswa login; baris unit lain dibuang. */
export function saringJurnalUnit(rows: Record<string, unknown>[], roster: RosterIsolasiJurnal) {
  const unitAktif = unitLogin(roster.unit)
  const kunciKelas = normalKelasJurnal(roster.kelas)
  if (!kunciKelas) return []

  return rows.filter((row) => {
    if (normalKelasJurnal(String(row.kelas || '')) !== kunciKelas) return false

    const unitBaris = String(row.unit ?? '').trim()
    if (unitBaris) {
      return Boolean(unitAktif) && unitSama(unitBaris, unitAktif)
    }

    const absen = normalizeSiswaTidakHadir(row.siswa_tidak_hadir)
    const idAbsen = absen.map((item) => String(item.id_siswa || '').trim()).filter(Boolean)
    const namaAbsen = absen.map((item) => normNama(item.nama)).filter(Boolean)

    if (idAbsen.some((id) => roster.idsUnitLain.has(id))) return false
    if (namaAbsen.some((nama) => roster.namaUnitLain.has(nama) && !roster.rosterNama.has(nama))) return false
    if (idAbsen.some((id) => roster.rosterIds.has(id))) return true
    if (namaAbsen.some((nama) => roster.rosterNama.has(nama))) return true

    const hadir = Number(row.hadir)
    const tidakHadir = Number(row.tidak_hadir)
    const total =
      (Number.isFinite(hadir) ? hadir : 0) + (Number.isFinite(tidakHadir) ? tidakHadir : absen.length)
    if (roster.ukuranKelas > 0 && total === roster.ukuranKelas) return true

    return roster.idsUnitLain.size === 0
  })
}
