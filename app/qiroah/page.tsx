import type { Metadata } from 'next'
import { QiroahDashboard } from '@/components/dashboard/qiroah-dashboard'
import { PortalGagal, PortalKerangka } from '@/components/dashboard/portal-kerangka'
import { muatPortal } from '@/lib/muat-portal'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Qiroatul Quran | Portal Wali Murid',
}

export default async function QiroahPage() {
  const { dashboard, gagal, notifikasi } = await muatPortal('qiroah')
  if (gagal || !dashboard.student) return <PortalGagal pesan={gagal || 'Data siswa belum bisa dimuat.'} />

  return (
    <PortalKerangka nama={dashboard.student.name} inisial={dashboard.student.initials} unit={dashboard.student.unit} aktif="/qiroah" notifikasi={notifikasi}>
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
