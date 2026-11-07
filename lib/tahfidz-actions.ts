'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { muatSiswaUnit } from '@/lib/isolasi-kueri'
import { getSession } from '@/lib/session'
import { getSupabase } from '@/lib/supabase'
import { isStudentId } from '@/lib/student-id'
import { sudahDikonfirmasi } from '@/lib/tugas-status'
import { kolomUnitTidakAda, unitSama } from '@/lib/unit-isolasi'

const STATUS_SELESAI = 'Sudah Dikerjakan'

export async function konfirmasiTugasTahfidz(idSetoran: string): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session) return { error: 'Sesi berakhir. Silakan masuk lagi.' }

  const id = idSetoran.trim()
  if (!id || id.startsWith('tahfidz-') || !isStudentId(session.idSiswa)) return { error: 'Tugas tidak dikenali.' }

  const siswa = await muatSiswaUnit(session.idSiswa)
  if (!siswa) return { error: 'Tugas tidak dikenali.' }

  const supabase = getSupabase()
  async function baca(nilai: string | number) {
    const denganUnit = await supabase.from('setoran_tahfidz').select('id_setoran,id_siswa,unit').eq('id_setoran', nilai)
    if (kolomUnitTidakAda(denganUnit.error)) {
      return supabase.from('setoran_tahfidz').select('id_setoran,id_siswa').eq('id_setoran', nilai)
    }
    return denganUnit
  }

  const pertama = await baca(id)
  const ulang = !pertama.error && (pertama.data?.length ?? 0) === 0 && /^\d+$/.test(id) ? await baca(Number(id)) : pertama
  const { data: baris, error: galatBaca } = ulang

  if (galatBaca) {
    console.error('tahfidz confirm read failed', galatBaca.code ?? '', galatBaca.message ?? '')
    return { error: 'Konfirmasi belum tersimpan. Coba lagi.' }
  }

  const milik = (baris ?? []).filter((row) => {
    if (String(row.id_siswa) !== session.idSiswa) return false
    const unitBaris = String((row as { unit?: unknown }).unit ?? '').trim()
    if (unitBaris && siswa.unit && !unitSama(unitBaris, siswa.unit)) return false
    return true
  })
  if (milik.length !== 1) return { error: 'Tugas tidak dikenali.' }

  let ubah = supabase
    .from('setoran_tahfidz')
    .update({ konfirmasi_ortu: STATUS_SELESAI })
    .eq('id_setoran', milik[0].id_setoran)
    .eq('id_siswa', milik[0].id_siswa)
  if (siswa.unit) ubah = ubah.eq('unit', siswa.unit)

  const { data: tersimpan, error: galatUbah } = await ubah.select('konfirmasi_ortu')

  if (galatUbah || tersimpan?.length !== 1) {
    if (galatUbah && kolomUnitTidakAda(galatUbah)) {
      const ulangUbah = await supabase
        .from('setoran_tahfidz')
        .update({ konfirmasi_ortu: STATUS_SELESAI })
        .eq('id_setoran', milik[0].id_setoran)
        .eq('id_siswa', milik[0].id_siswa)
        .select('konfirmasi_ortu')
      if (ulangUbah.error || ulangUbah.data?.length !== 1) {
        console.error('tahfidz confirm update failed', ulangUbah.error?.code ?? '', ulangUbah.error?.message ?? '')
        return { error: 'Konfirmasi belum tersimpan. Coba lagi.' }
      }
    } else {
      console.error('tahfidz confirm update failed', galatUbah?.code ?? '', galatUbah?.message ?? '')
      return { error: 'Konfirmasi belum tersimpan. Coba lagi.' }
    }
  }

  const { data: cek, error: galatCek } = await supabase
    .from('setoran_tahfidz')
    .select('konfirmasi_ortu')
    .eq('id_setoran', milik[0].id_setoran)
    .eq('id_siswa', milik[0].id_siswa)
    .maybeSingle()

  if (galatCek || !cek || !sudahDikonfirmasi(String(cek.konfirmasi_ortu ?? ''))) {
    return { error: 'Status di database belum berubah. Coba lagi.' }
  }

  updateTag(`wali:${session.idSiswa}:tahfidz`)
  updateTag(`wali:${session.idSiswa}:notifikasi`)
  revalidatePath('/')
  revalidatePath('/tahfidz')
  return { error: null }
}
