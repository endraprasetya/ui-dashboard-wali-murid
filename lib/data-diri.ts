import 'server-only'

import { getSupabase } from '@/lib/supabase'
import { isStudentId } from '@/lib/student-id'
import { KOLOM_EDIT, KOLOM_IDENTITAS, KOLOM_PENTING, type DataDiri } from '@/lib/data-diri-shared'
import { kueriDenganUnit, muatSiswaUnit } from '@/lib/isolasi-kueri'
import { unitLogin, unitSama } from '@/lib/unit-isolasi'

const KOLOM = [...KOLOM_IDENTITAS, ...KOLOM_EDIT].join(',')

export type { DataDiri } from '@/lib/data-diri-shared'

export type HasilDataDiri = {
  data: DataDiri | null
  error: string | null
  kurang: string[]
}

function teks(nilai: unknown) {
  return String(nilai ?? '').trim()
}

function normNama(nilai: string) {
  return nilai
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function keData(row: Record<string, unknown>): DataDiri {
  const data = {
    nama_lengkap: teks(row.nama_lengkap),
    kelas: teks(row.kelas),
    nomor_induk_sekolah: Number(row.nomor_induk_sekolah),
  } as DataDiri
  for (const kunci of KOLOM_EDIT) data[kunci] = teks(row[kunci])
  return data
}

export function kolomKosong(data: DataDiri) {
  return KOLOM_PENTING.filter((item) => !data[item.kunci]).map((item) => item.label)
}

function varianNomor(nilai: string) {
  const bersih = nilai.trim()
  if (!bersih) return []
  const daftar = [bersih]
  if (/^\d+$/.test(bersih)) {
    const angka = String(Number(bersih))
    if (angka !== '0' && angka !== bersih) daftar.push(angka)
  }
  return daftar
}

function kunciPencarian(idSiswa: string, nis: string) {
  const angka = idSiswa.replace(/\D/g, '')
  const ekor = angka.length >= 4 ? angka.slice(-4) : ''
  return [...new Set([ekor, nis, idSiswa].flatMap(varianNomor))]
}

function pilihBaris(rows: Record<string, unknown>[], nama: string, kelas: string, unit: string) {
  const unitAktif = unitLogin(unit)
  const dalamUnit = unitAktif
    ? rows.filter((row) => {
        const unitBaris = teks(row.unit)
        return !unitBaris || unitSama(unitBaris, unitAktif)
      })
    : rows
  if (dalamUnit.length === 1) return dalamUnit[0]
  const samaKelas = dalamUnit.filter(
    (row) => normNama(teks(row.nama_lengkap)) === nama && teks(row.kelas).toUpperCase() === kelas,
  )
  if (samaKelas.length === 1) return samaKelas[0]
  const samaNama = dalamUnit.filter((row) => normNama(teks(row.nama_lengkap)) === nama)
  return samaNama.length === 1 ? samaNama[0] : null
}

async function ambilDenganNomor(nomor: string, unit: string) {
  const supabase = getSupabase()
  const angka = /^\d+$/.test(nomor) ? String(Number(nomor)) : ''
  const percobaan: Array<string | number> = angka && angka !== nomor ? [nomor, Number(nomor)] : [nomor]
  const unitAktif = unitLogin(unit)
  let galat = false
  for (const nilai of percobaan) {
    const { rows, error } = await kueriDenganUnit(
      unitAktif,
      () => supabase.from('data_diri_siswa').select(`${KOLOM},unit`).eq('nomor_induk_sekolah', nilai).eq('unit', unitAktif).limit(5),
      () => supabase.from('data_diri_siswa').select(KOLOM).eq('nomor_induk_sekolah', nilai).limit(5),
    )
    if (error) {
      galat = true
      continue
    }
    if (rows.length > 0 || percobaan.length === 1) return { rows, error: null }
  }
  return { rows: [] as Record<string, unknown>[], error: galat ? 'Buku induk belum bisa dimuat.' : null }
}

async function cariLewatNama(nama: string, kelas: string, unit: string) {
  const supabase = getSupabase()
  const unitAktif = unitLogin(unit)
  const { rows, error } = await kueriDenganUnit(
    unitAktif,
    () =>
      supabase
        .from('data_diri_siswa')
        .select('nama_lengkap,kelas,nomor_induk_sekolah,unit')
        .eq('kelas', kelas)
        .eq('unit', unitAktif)
        .limit(200),
    () =>
      supabase
        .from('data_diri_siswa')
        .select('nama_lengkap,kelas,nomor_induk_sekolah')
        .eq('kelas', kelas)
        .limit(200),
  )
  if (error) return { data: null, error: 'Buku induk belum bisa dimuat.' }

  const samaNama = rows.filter((row) => normNama(teks(row.nama_lengkap)) === nama)
  const pilih = samaNama.length === 1 ? samaNama[0] : pilihBaris(samaNama, nama, kelas, unitAktif)
  if (!pilih) {
    return {
      data: null,
      error: samaNama.length > 1 ? 'Ada lebih dari satu data dengan nama yang sama. Hubungi sekolah untuk menautkan buku induk.' : null,
    }
  }

  const penuh = await ambilDenganNomor(teks(pilih.nomor_induk_sekolah), unitAktif)
  if (penuh.error) return { data: null, error: penuh.error }
  const ketemu = penuh.rows.find((row) => normNama(teks(row.nama_lengkap)) === nama) || penuh.rows[0] || null
  return { data: ketemu, error: null }
}

export async function getDataDiriSiswa(idSiswa: string): Promise<HasilDataDiri> {
  if (!isStudentId(idSiswa)) return { data: null, error: 'Akun siswa tidak dikenali.', kurang: [] }

  const siswa = await muatSiswaUnit(idSiswa)
  if (!siswa) return { data: null, error: 'Data siswa belum bisa dimuat.', kurang: [] }

  const nama = normNama(siswa.nama)
  const kelas = siswa.kelas.toUpperCase()
  const unitAktif = siswa.unit
  for (const nomor of kunciPencarian(idSiswa, siswa.nis)) {
    const hasil = await ambilDenganNomor(nomor, unitAktif)
    if (hasil.error) return { data: null, error: hasil.error, kurang: [] }
    const baris = pilihBaris(hasil.rows, nama, kelas, unitAktif)
    if (baris) {
      const data = keData(baris)
      return { data, error: null, kurang: kolomKosong(data) }
    }
  }

  const lewatNama = await cariLewatNama(nama, kelas, unitAktif)
  if (lewatNama.error || !lewatNama.data) return { data: null, error: lewatNama.error, kurang: [] }
  const data = keData(lewatNama.data)
  return { data, error: null, kurang: kolomKosong(data) }
}
