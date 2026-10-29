import type { Metadata } from 'next'
import { PortalGagal, PortalKerangka } from '@/components/dashboard/portal-kerangka'
import { TertibCard } from '@/components/dashboard/tertib-card'
import { muatPortal } from '@/lib/muat-portal'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tertib Point | Portal Wali Murid',
}

export default async function TertibPage() {
  const { dashboard, gagal, notifikasi } = await muatPortal('tertib')
  if (gagal || !dashboard.student) return <PortalGagal pesan={gagal || 'Data siswa belum bisa dimuat.'} />

  return (
    <PortalKerangka nama={dashboard.student.name} inisial={dashboard.student.initials} unit={dashboard.student.unit} aktif="/tertib" notifikasi={notifikasi}>
      <TertibCard data={dashboard.tertib.data} error={dashboard.tertib.error} />
    </PortalKerangka>
  )
}
