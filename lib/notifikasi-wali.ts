import 'server-only'

import { todayIso } from '@/lib/format'
import { getSupabase } from '@/lib/supabase'
import type { ButirNotifikasi } from '@/lib/notifikasi-tipe'
import { adaIsiTugas, sudahDikonfirmasi } from '@/lib/tugas-status'

export type { ButirNotifikasi } from '@/lib/notifikasi-tipe'

const PENGUMUMAN = [
  {
    id: 'pengumuman:spmb-2027',
    judul: 'SPMB 2027/2028',
    detail: '1 Oktober – 31 Desember 2026',
    sampai: '2026-12-31',
    href: '/',
  },
  {
    id: 'pengumuman:asas-gasal',
    judul: 'Asesmen Sumatif Akhir Semester Gasal',
    detail: '30 November – 12 Desember 2026',
    sampai: '2026-12-12',
    href: '/',
  },
  {
    id: 'pengumuman:rapor-gasal',
    judul: 'Penyerahan Buku Laporan Hasil Belajar',
    detail: '19 Desember 2026',
    sampai: '2026-12-19',
    href: '/',
  },
  {
    id: 'pengumuman:libur-gasal',
    judul: 'Libur Akhir Semester Gasal',
    detail: '21 Desember 2026 – 2 Januari 2027',
    sampai: '2027-01-02',
    href: '/',
  },
]

function teks(nilai: unknown) {
  return String(nilai ?? '').trim()
}

function pengumumanAktif(): ButirNotifikasi[] {
  const hari = todayIso()
  return PENGUMUMAN.filter((item) => item.sampai >= hari).map(({ id, judul, detail, href }) => ({
    id,
    judul,
    detail,
    href,
  }))
}

async function barisSiswa<T>(tabel: 'setoran_qiroah' | 'setoran_tahfidz', kolom: string, idSiswa: string) {
  const supabase = getSupabase()
  const pertama = await supabase.from(tabel).select(kolom).eq('id_siswa', idSiswa).order('tanggal', { ascending: false }).limit(40)
  if (pertama.error || (pertama.data?.length ?? 0) > 0 || !/^\d+$/.test(idSiswa)) return pertama
  return supabase.from(tabel).select(kolom).eq('id_siswa', Number(idSiswa)).order('tanggal', { ascending: false }).limit(40)
}

export async function getNotifikasiWali(idSiswa: string): Promise<{ item: ButirNotifikasi[]; error: string | null }> {
  const [qiroah, tahfidz] = await Promise.all([
    barisSiswa('setoran_qiroah', 'id_qiroah,tanggal,tugas_rumah,status_setoran', idSiswa),
    barisSiswa('setoran_tahfidz', 'id_setoran,tanggal,tugas_rumah,konfirmasi_ortu', idSiswa),
  ])

  const tugasQiroah = ((qiroah.data || []) as Record<string, unknown>[])
    .filter((row) => teks(row.id_qiroah) && adaIsiTugas(teks(row.tugas_rumah)) && !sudahDikonfirmasi(teks(row.status_setoran)))
    .slice(0, 5)
    .map((row) => ({
      id: `qiroah:${teks(row.id_qiroah)}`,
      judul: 'Tugas rumah Qiroah',
      detail: teks(row.tugas_rumah),
      href: '/qiroah#tugas-rumah',
    }))

  const tugasTahfidz = ((tahfidz.data || []) as Record<string, unknown>[])
    .filter((row) => teks(row.id_setoran) && adaIsiTugas(teks(row.tugas_rumah)) && !sudahDikonfirmasi(teks(row.konfirmasi_ortu)))
    .slice(0, 5)
    .map((row) => ({
      id: `tahfidz:${teks(row.id_setoran)}`,
      judul: 'Tugas rumah Tahfidz',
      detail: teks(row.tugas_rumah),
      href: '/tahfidz#tugas-tahfidz',
    }))

  return {
    item: [...tugasQiroah, ...tugasTahfidz, ...pengumumanAktif()],
    error: qiroah.error || tahfidz.error ? 'Notifikasi tugas belum lengkap.' : null,
  }
}
