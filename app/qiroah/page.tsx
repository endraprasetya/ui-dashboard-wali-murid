import type { Metadata } from 'next'
import { QiroahDashboard } from '@/components/dashboard/qiroah-dashboard'
import { UjianBanner } from '@/components/dashboard/ujian-banner'
import { UjianQiroahRiwayat } from '@/components/dashboard/ujian-qiroah-riwayat'
import { PortalGagal, PortalKerangka } from '@/components/dashboard/portal-kerangka'
import { muatPortal } from '@/lib/muat-portal'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Qiroatul Quran | Portal Wali Murid',
}

export default async function QiroahPage() {
  const { dashboard, gagal, notifikasi } = await muatPortal('qiroah')
  if (gagal || !dashboard.student) return <PortalGagal pesan={gagal || 'Data siswa belum bisa dimuat.'} />

  const profil = {
    nama: dashboard.student.name,
    kelas: dashboard.student.kelas,
    unit: dashboard.student.unit,
    idSiswa: dashboard.student.idSiswa,
  }

  return (
    <PortalKerangka nama={dashboard.student.name} inisial={dashboard.student.initials} unit={dashboard.student.unit} aktif="/qiroah" notifikasi={notifikasi}>
      <UjianBanner jadwal={dashboard.jadwalUjian} />
      {dashboard.rekapanUjian.length === 0 ? (
        <p className="rounded-2xl border bg-card px-4 py-5 text-sm text-muted-foreground">
          Belum ada riwayat ujian kenaikan jilid untuk ananda.
        </p>
      ) : (
        <UjianQiroahRiwayat baris={dashboard.rekapanUjian} profil={profil} varian="penuh" />
      )}
      <QiroahDashboard
        nama={dashboard.student.name}
        kelas={dashboard.student.kelas}
        unit={dashboard.student.unit}
        data={dashboard.qiroah.data}
        error={dashboard.qiroah.error}
      />
    </PortalKerangka>
  )
}
