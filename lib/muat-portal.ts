import 'server-only'

import { redirect } from 'next/navigation'
import { cacheBagian } from '@/lib/cache-portal'
import { getDataDiriSiswa, type HasilDataDiri } from '@/lib/data-diri'
import { getNotifikasiWali, type ButirNotifikasi } from '@/lib/notifikasi-wali'
import {
  dashboardKosong,
  getAbsensi,
  getInfoUjian,
  getJurnal,
  getQiroah,
  getStudent,
  getTahfidz,
  getTertib,
  type DashboardData,
} from '@/lib/queries'
import { clearSession, getSession } from '@/lib/session'

const diriKosong: HasilDataDiri = { data: null, error: null, kurang: [] }

export type BagianPortal =
  | 'beranda'
  | 'tahfidz'
  | 'qiroah'
  | 'jurnal'
  | 'absensi'
  | 'tertib'
  | 'profil'
  | 'keuangan'
  | 'pengumuman'

const sukses = (hasil: { error: string | null }) => hasil.error == null

export async function muatPortal(bagian: BagianPortal = 'beranda'): Promise<{
  dashboard: DashboardData
  diri: HasilDataDiri
  gagal: string | null
  notifikasi: ButirNotifikasi[]
}> {
  const session = await getSession()
  if (!session) redirect('/login')

  const id = session.idSiswa
  const [studentResult, notifikasiHasil] = await Promise.all([
    cacheBagian(id, 'siswa', () => getStudent(id), (hasil) => hasil.error == null && hasil.data != null),
    cacheBagian(id, 'notifikasi', () => getNotifikasiWali(id), sukses),
  ])

  if (!studentResult.data) {
    if (!studentResult.error) {
      await clearSession()
      redirect('/login')
    }
    return {
      dashboard: dashboardKosong(null, studentResult.error),
      diri: diriKosong,
      gagal: studentResult.error,
      notifikasi: notifikasiHasil.item,
    }
  }

  const student = studentResult.data
  const dashboard = dashboardKosong(student)

  if (bagian === 'beranda') {
    const [tahfidz, qiroah, jurnal, absensi, tertib, infoUjian, diri] = await Promise.all([
      cacheBagian(id, 'tahfidz', () => getTahfidz(id), sukses),
      cacheBagian(id, 'qiroah', () => getQiroah(id), sukses),
      getJurnal(student.kelas),
      cacheBagian(id, 'absensi', () => getAbsensi(id), sukses),
      cacheBagian(id, 'tertib', () => getTertib(id), sukses),
      cacheBagian(id, 'ujian-status', () => getInfoUjian(id)),
      cacheBagian(id, 'diri', () => getDataDiriSiswa(id), sukses),
    ])
    return {
      dashboard: {
        ...dashboard,
        tahfidz,
        qiroah,
        jurnal,
        absensi,
        tertib,
        jadwalUjian: infoUjian.berlangsung,
        hasilUjian: infoUjian.hasil,
      },
      diri,
      gagal: null,
      notifikasi: notifikasiHasil.item,
    }
  }

  let diri = diriKosong
  if (bagian === 'tahfidz') dashboard.tahfidz = await cacheBagian(id, 'tahfidz', () => getTahfidz(id), sukses)
  if (bagian === 'qiroah') dashboard.qiroah = await cacheBagian(id, 'qiroah', () => getQiroah(id), sukses)
  if (bagian === 'tahfidz' || bagian === 'qiroah') {
    const infoUjian = await cacheBagian(id, 'ujian-status', () => getInfoUjian(id))
    dashboard.jadwalUjian = infoUjian.berlangsung
    dashboard.hasilUjian = infoUjian.hasil
  }
  if (bagian === 'jurnal') dashboard.jurnal = await getJurnal(student.kelas)
  if (bagian === 'tertib') dashboard.tertib = await cacheBagian(id, 'tertib', () => getTertib(id), sukses)
  if (bagian === 'profil') diri = await cacheBagian(id, 'diri', () => getDataDiriSiswa(id), sukses)

  return { dashboard, diri, gagal: null, notifikasi: notifikasiHasil.item }
}
