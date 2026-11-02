import type { Metadata } from 'next'
import { HafalanHistoryTable } from '@/components/dashboard/hafalan-history-table'
import { PortalGagal, PortalKerangka } from '@/components/dashboard/portal-kerangka'
import { TahfidzCard } from '@/components/dashboard/tahfidz-card'
import { UjianBanner } from '@/components/dashboard/ujian-banner'
import { muatPortal } from '@/lib/muat-portal'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tahfidzul Quran | Portal Wali Murid',
}

export default async function TahfidzPage() {
  const { dashboard, gagal, notifikasi } = await muatPortal('tahfidz')
  if (gagal || !dashboard.student) return <PortalGagal pesan={gagal || 'Data siswa belum bisa dimuat.'} />

  return (
    <PortalKerangka nama={dashboard.student.name} inisial={dashboard.student.initials} unit={dashboard.student.unit} aktif="/tahfidz" notifikasi={notifikasi}>
      <UjianBanner jadwal={dashboard.jadwalUjian} hasil={dashboard.hasilUjian} />
      <TahfidzCard data={dashboard.tahfidz.data} error={dashboard.tahfidz.error} />
      <HafalanHistoryTable rows={dashboard.tahfidz.data.history} error={dashboard.tahfidz.error} />
    </PortalKerangka>
  )
}
