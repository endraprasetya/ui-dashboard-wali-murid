import type { Metadata } from 'next'
import { PengaduanWaliKonten } from '@/components/dashboard/pengaduan-wali-konten'
import { DataBelumLengkap } from '@/components/dashboard/data-belum-lengkap'
import { PortalGagal, PortalKerangka } from '@/components/dashboard/portal-kerangka'
import { muatPortal } from '@/lib/muat-portal'
import { muatRiwayatPengaduanWali, namaWaliDariDataDiri, noWaDariDataDiri } from '@/lib/pengaduan-wali'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Layanan Pengaduan | Portal Wali Murid',
}

export default async function PengaduanPage() {
  const { dashboard, diri, gagal, notifikasi } = await muatPortal('pengaduan')
  if (gagal || !dashboard.student) return <PortalGagal pesan={gagal || 'Data siswa belum bisa dimuat.'} />

  const namaWali = namaWaliDariDataDiri(diri.data)
  const waliDariDataDiri = namaWali.length >= 3
  let riwayatAwal: Awaited<ReturnType<typeof muatRiwayatPengaduanWali>> = []
  let riwayatGalat = ''
  try {
    riwayatAwal = await muatRiwayatPengaduanWali(dashboard.student.idSiswa)
  } catch (cause) {
    riwayatGalat = cause instanceof Error ? cause.message : 'Riwayat pengaduan belum dapat dimuat.'
  }

  return (
    <PortalKerangka
      nama={dashboard.student.name}
      inisial={dashboard.student.initials}
      unit={dashboard.student.unit}
      aktif="/pengaduan"
      notifikasi={notifikasi}
    >
      <DataBelumLengkap kurang={diri.kurang} belumTertaut={!diri.data && !diri.error} pesan={diri.error} tautan="/profil" />
      <PengaduanWaliKonten
        riwayatAwal={riwayatAwal}
        riwayatGalatAwal={riwayatGalat}
        idSiswa={dashboard.student.idSiswa}
        namaAnak={dashboard.student.name}
        kelasAnak={dashboard.student.kelas}
        namaWaliAwal={namaWali}
        waliDariDataDiri={waliDariDataDiri}
        noWaAwal={noWaDariDataDiri(diri.data)}
      />
    </PortalKerangka>
  )
}