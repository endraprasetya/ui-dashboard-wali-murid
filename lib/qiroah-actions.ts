'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { getSession } from '@/lib/session'
import { getSupabase } from '@/lib/supabase'
import { isStudentId } from '@/lib/student-id'
import { sudahDikonfirmasi } from '@/lib/tugas-status'

const STATUS_SELESAI = 'Sudah Dikerjakan'

export async function konfirmasiTugasQiroah(idQiroah: string): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session) return { error: 'Sesi berakhir. Silakan masuk lagi.' }

  const id = idQiroah.trim()
  if (!id || id.startsWith('qiroah-') || !isStudentId(session.idSiswa)) return { error: 'Tugas tidak dikenali.' }

  const supabase = getSupabase()
  const baca = await supabase.from('setoran_qiroah').select('id_qiroah,id_siswa').eq('id_qiroah', id)
  const ulang =
    !baca.error && (baca.data?.length ?? 0) === 0 && /^\d+$/.test(id)
      ? await supabase.from('setoran_qiroah').select('id_qiroah,id_siswa').eq('id_qiroah', Number(id))
      : baca
  const { data: baris, error: galatBaca } = ulang

  if (galatBaca) {
    console.error('qiroah confirm read failed', galatBaca.code ?? '', galatBaca.message ?? '')
    return { error: 'Konfirmasi belum tersimpan. Coba lagi.' }
  }

  const milik = (baris ?? []).filter((row) => String(row.id_siswa) === session.idSiswa)
  if (milik.length !== 1) return { error: 'Tugas tidak dikenali.' }

  const { data: tersimpan, error: galatUbah } = await supabase
    .from('setoran_qiroah')
    .update({ status_setoran: STATUS_SELESAI })
    .eq('id_qiroah', milik[0].id_qiroah)
    .eq('id_siswa', milik[0].id_siswa)
    .select('status_setoran')

  if (galatUbah || tersimpan?.length !== 1) {
    console.error('qiroah confirm update failed', galatUbah?.code ?? '', galatUbah?.message ?? '')
    return { error: 'Konfirmasi belum tersimpan. Coba lagi.' }
  }

  const { data: cek, error: galatCek } = await supabase
    .from('setoran_qiroah')
    .select('status_setoran')
    .eq('id_qiroah', milik[0].id_qiroah)
    .eq('id_siswa', milik[0].id_siswa)
    .maybeSingle()

  if (galatCek || !cek || !sudahDikonfirmasi(String(cek.status_setoran ?? ''))) {
    return { error: 'Status di database belum berubah. Coba lagi.' }
  }

  updateTag(`wali:${session.idSiswa}:qiroah`)
  updateTag(`wali:${session.idSiswa}:notifikasi`)
  revalidatePath('/')
  revalidatePath('/qiroah')
  return { error: null }
}
