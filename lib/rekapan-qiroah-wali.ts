import 'server-only'

import { siswaMilikUnit } from '@/lib/isolasi-kueri'
import { isStudentId } from '@/lib/student-id'
import { getSupabase } from '@/lib/supabase'
import { saringBarisMilikUnit } from '@/lib/unit-isolasi'
import type { RekapanRingkas } from '@/lib/ujian-relasi'

/**
 * Tabel `rekapan` (sama dengan Portal Guru / Koordinator QQ / Kepala Sekolah).
 * Urutan kolom dicoba dari yang paling lengkap ke minimal jika PostgREST menolak kolom tertentu.
 */
export const KOLOM_REKAPAN_QIROAH =
  'id_ujian,tanggal_ujian,id_siswa,nama,kelas,guru_pengampu,jilid_asal,jilid_tujuan,penguji,kelancaran,makhraj,harakat,tajwid,adab,keterangan,kelebihan_siswa,predikat,keputusan,nilai_akhir' as const

/** Setara muatan Dashboard Kepala Sekolah (tanpa `keterangan` / `unit`). */
const KOLOM_REKAPAN_KEPSEK =
  'id_ujian,tanggal_ujian,id_siswa,nama,kelas,guru_pengampu,jilid_asal,jilid_tujuan,penguji,kelancaran,makhraj,harakat,tajwid,adab,nilai_akhir,predikat,keputusan,kelebihan_siswa' as const

const KOLOM_REKAPAN_MINIMAL =
  'id_ujian,id_siswa,jilid_asal,jilid_tujuan,tanggal_ujian,penguji,predikat,keputusan,nilai_akhir,kelancaran,makhraj,harakat,tajwid,adab,kelebihan_siswa' as const

const TINGKAT_KOLOM = [KOLOM_REKAPAN_QIROAH, KOLOM_REKAPAN_KEPSEK, KOLOM_REKAPAN_MINIMAL] as const

/** @deprecated Gunakan tier cadangan di `muatRekapanUjianSiswa`; dipertahankan untuk impor lama. */
export const KOLOM_REKAPAN_RINGKAS = KOLOM_REKAPAN_MINIMAL

export type RekapanLengkap = RekapanRingkas

function isiNamaKosong(rows: RekapanLengkap[], profil: { nama: string; kelas: string; unit: string }) {
  return rows.map((row) => ({
    ...row,
    nama: String(row.nama || '').trim() || profil.nama,
    kelas: String(row.kelas || '').trim() || profil.kelas,
    unit: String(row.unit || '').trim() || profil.unit,
  }))
}

function galatKolomSelect(error?: { code?: string; message?: string } | null) {
  const pesan = String(error?.message || '').toLowerCase()
  return (
    error?.code === 'PGRST204' ||
    error?.code === '42703' ||
    pesan.includes('does not exist') ||
    pesan.includes('schema cache') ||
    pesan.includes('could not find') ||
    (pesan.includes('column') && pesan.includes("'"))
  )
}

async function ambilRekapanIdSiswa(idSiswa: string, kolom: string) {
  const supabase = getSupabase()
  return supabase
    .from('rekapan')
    .select(kolom)
    .eq('id_siswa', idSiswa)
    .order('tanggal_ujian', { ascending: false })
    .limit(40)
}

export async function muatRekapanUjianSiswa(
  idSiswa: string,
  unit: string,
  profil: { nama: string; kelas: string; unit: string; nis?: string },
): Promise<{ rows: RekapanLengkap[]; error: string | null }> {
  if (!isStudentId(idSiswa)) return { rows: [], error: null }

  const siswa = await siswaMilikUnit(idSiswa, unit)
  if (!siswa) return { rows: [], error: null }

  const unitAktif = siswa.unit
  let data: Record<string, unknown>[] | null = null

  try {
    for (const kolom of TINGKAT_KOLOM) {
      const hasil = await ambilRekapanIdSiswa(siswa.idSiswa, kolom)
      if (!hasil.error) {
        data = (hasil.data as Record<string, unknown>[]) || []
        break
      }
      if (!galatKolomSelect(hasil.error)) {
        console.error('rekapan ujian wali', hasil.error.message)
        break
      }
    }
  } catch (cause) {
    console.error('rekapan ujian wali', cause)
    return { rows: [], error: null }
  }

  if (!data) return { rows: [], error: null }

  const tersaring = saringBarisMilikUnit(data, unitAktif, { idSiswa: siswa.idSiswa }) as RekapanLengkap[]
  const urut = [...tersaring].sort((a, b) => String(b.tanggal_ujian || '').localeCompare(String(a.tanggal_ujian || '')))
  return {
    rows: isiNamaKosong(urut, { nama: profil.nama, kelas: profil.kelas, unit: unitAktif || profil.unit }),
    error: null,
  }
}
