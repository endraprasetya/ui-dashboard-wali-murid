'use server'

import { muatSiswaUnit } from '@/lib/isolasi-kueri'
import { kirimPengaduanWaliKeDb, muatRiwayatPengaduanWali } from '@/lib/pengaduan-wali'
import type { PengaduanWaliRiwayatItem, TipeLampiranPengaduan } from '@/lib/pengaduan-wali-shared'
import { getSession } from '@/lib/session'
import { isStudentId } from '@/lib/student-id'

export async function kirimPengaduanWali(input: {
  namaWaliMurid: string
  noWa: string
  kategori: string
  isiPengaduan: string
  lampiranUrl?: string | null
  lampiranTipe?: TipeLampiranPengaduan | null
}): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || !isStudentId(session.idSiswa)) {
    return { error: 'Sesi berakhir. Silakan masuk lagi.' }
  }

  const siswa = await muatSiswaUnit(session.idSiswa)
  if (!siswa) return { error: 'Data siswa tidak dikenali.' }

  try {
    await kirimPengaduanWaliKeDb({
      idSiswa: siswa.idSiswa,
      nis: siswa.nis,
      unit: siswa.unit,
      namaWaliMurid: input.namaWaliMurid,
      noWa: input.noWa,
      namaAnak: siswa.nama,
      kelasAnak: siswa.kelas,
      kategori: input.kategori,
      isiPengaduan: input.isiPengaduan,
      lampiranUrl: input.lampiranUrl,
      lampiranTipe: input.lampiranTipe,
    })
    return { error: null }
  } catch (cause) {
    const pesan = cause instanceof Error ? cause.message : 'Pengaduan belum dapat dikirim.'
    return { error: pesan }
  }
}

export async function muatRiwayatPengaduanWaliAksi(): Promise<{
  data: PengaduanWaliRiwayatItem[]
  error: string | null
}> {
  const session = await getSession()
  if (!session || !isStudentId(session.idSiswa)) {
    return { data: [], error: 'Sesi berakhir. Silakan masuk lagi.' }
  }
  try {
    const data = await muatRiwayatPengaduanWali(session.idSiswa)
    return { data, error: null }
  } catch (cause) {
    const pesan = cause instanceof Error ? cause.message : 'Riwayat pengaduan belum dapat dimuat.'
    return { data: [], error: pesan }
  }
}