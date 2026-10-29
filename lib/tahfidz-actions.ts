'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { getSession } from '@/lib/session'
import { getSupabase } from '@/lib/supabase'
import { isStudentId } from '@/lib/student-id'
import { sudahDikonfirmasi } from '@/lib/tugas-status'

const STATUS_SELESAI = 'Sudah Dikerjakan'

export async function konfirmasiTugasTahfidz(idSetoran: string): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session) return { error: 'Sesi berakhir. Silakan masuk lagi.' }

  const id = idSetoran.trim()
  if (!id || id.startsWith('tahfidz-') || !isStudentId(session.idSiswa)) return { error: 'Tugas tidak dikenali.' }

  const supabase = getSupabase()
  const baca = await supabase.from('setoran_tahfidz').select('id_setoran,id_siswa').eq('id_setoran', id)
  const ulang =
    !baca.error && (baca.data?.length ?? 0) === 0 && /^\d+$/.test(id)
      ? await supabase.from('setoran_tahfidz').select('id_setoran,id_siswa').eq('id_setoran', Number(id))
      : baca
  const { data: baris, error: galatBaca } = ulang

  if (galatBaca) {
    console.error('tahfidz confirm read failed', galatBaca.code ?? '', galatBaca.message ?? '')
    return { error: 'Konfirmasi belum tersimpan. Coba lagi.' }
  }

  const milik = (baris ?? []).filter((row) => String(row.id_siswa) === session.idSiswa)
  if (milik.length !== 1) return { error: 'Tugas tidak dikenali.' }

  // setoran_tahfidz tidak punya status_setoran. Status tugas orang tua disimpan di konfirmasi_ortu.
  const { data: tersimpan, error: galatUbah } = await supabase
    .from('setoran_tahfidz')
    .update({ konfirmasi_ortu: STATUS_SELESAI })
    .eq('id_setoran', milik[0].id_setoran)
    .eq('id_siswa', milik[0].id_siswa)
    .select('konfirmasi_ortu')

  if (galatUbah || tersimpan?.length !== 1) {
    console.error('tahfidz confirm update failed', galatUbah?.code ?? '', galatUbah?.message ?? '')
    return { error: 'Konfirmasi belum tersimpan. Coba lagi.' }
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
