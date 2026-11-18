'use server'

import { revalidatePath, updateTag } from 'next/cache'
import {
  ajukanKeringanan,
  muatPengajuanUntukNis,
  nisUntukKeringanan,
  pengajuanTerbaru,
  simpanSuratResmiKeringanan,
  type PengajuanKeringanan,
} from '@/lib/pengajuan-keringanan'
import { draftSuratResmiKeringanan } from '@/lib/surat-resmi-keringanan'
import { muatSiswaUnit } from '@/lib/isolasi-kueri'
import { getSession } from '@/lib/session'
import { isStudentId } from '@/lib/student-id'

export async function muatKeringananSiswaLogin(): Promise<{ pengajuan: PengajuanKeringanan | null; galat: string | null }> {
  const session = await getSession()
  if (!session || !isStudentId(session.idSiswa)) return { pengajuan: null, galat: 'Sesi tidak valid.' }

  const siswa = await muatSiswaUnit(session.idSiswa)
  if (!siswa) return { pengajuan: null, galat: null }

  try {
    const daftar = await muatPengajuanUntukNis([siswa.nis, siswa.idSiswa, session.idSiswa])
    return { pengajuan: pengajuanTerbaru(daftar, siswa.nis, siswa.idSiswa, session.idSiswa) ?? null, galat: null }
  } catch {
    return { pengajuan: null, galat: 'Pengajuan keringanan belum dapat dimuat.' }
  }
}

export async function kirimPengajuanKeringanan(input: {
  jenisKegiatan: string
  mekanismePelunasan: string
  nominalAngsuran?: number
  tanggalRencanaLunas: string
  nominalTunggakan: number
  alasanPengajuan: string
}): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || !isStudentId(session.idSiswa)) return { error: 'Sesi berakhir. Silakan masuk lagi.' }

  const siswa = await muatSiswaUnit(session.idSiswa)
  if (!siswa) return { error: 'Data siswa tidak dikenali.' }

  try {
    await ajukanKeringanan({
      nis: nisUntukKeringanan(siswa.nis, siswa.idSiswa),
      namaSiswa: siswa.nama,
      kelas: siswa.kelas,
      unit: siswa.unit,
      nominalTunggakan: input.nominalTunggakan,
      jenisKegiatan: input.jenisKegiatan,
      mekanismePelunasan: input.mekanismePelunasan,
      nominalAngsuran: input.nominalAngsuran,
      tanggalRencanaLunas: input.tanggalRencanaLunas,
      alasanPengajuan: input.alasanPengajuan,
    })
    updateTag(`wali:${session.idSiswa}`)
    revalidatePath('/')
    revalidatePath('/keuangan')
    return { error: null }
  } catch (cause) {
    const pesan = cause instanceof Error ? cause.message : 'Pengajuan belum dapat dikirim.'
    return { error: pesan }
  }
}

export async function kirimSuratResmiKeringanan(input: {
  idPengajuan: string
  namaWali: string
  pernyataanTambahan?: string
  setujuKlausul: boolean
}): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || !isStudentId(session.idSiswa)) return { error: 'Sesi berakhir. Silakan masuk lagi.' }
  if (!input.setujuKlausul) return { error: 'Anda harus menyetujui pernyataan wajib pada surat.' }

  const siswa = await muatSiswaUnit(session.idSiswa)
  if (!siswa) return { error: 'Data siswa tidak dikenali.' }

  try {
    const daftar = await muatPengajuanUntukNis([siswa.nis, siswa.idSiswa, session.idSiswa])
    const pengajuan = pengajuanTerbaru(daftar, siswa.nis, siswa.idSiswa, session.idSiswa)
    if (!pengajuan || pengajuan.id !== input.idPengajuan) {
      return { error: 'Pengajuan tidak dikenali.' }
    }
    if (pengajuan.statusPersetujuan !== 'Disetujui') {
      return { error: 'Pengajuan belum disetujui Kepala Sekolah.' }
    }
    if (pengajuan.suratResmiDikirimPada) {
      return { error: 'Surat resmi sudah dikirim sebelumnya.' }
    }

    const isi = draftSuratResmiKeringanan(pengajuan, input.namaWali, input.pernyataanTambahan)
    await simpanSuratResmiKeringanan(pengajuan.id, siswa.nis || session.idSiswa, isi)
    updateTag(`wali:${session.idSiswa}`)
    revalidatePath('/')
    revalidatePath('/keuangan')
    return { error: null }
  } catch (cause) {
    const pesan = cause instanceof Error ? cause.message : 'Surat resmi belum dapat dikirim.'
    return { error: pesan }
  }
}