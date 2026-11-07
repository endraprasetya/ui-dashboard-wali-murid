import type { Metadata } from 'next'
import { PortalGagal, PortalKerangka } from '@/components/dashboard/portal-kerangka'
import { TertibPanel } from '@/components/dashboard/tertib-panel'
import { getTertibPeringkatKelas } from '@/lib/queries'
import { muatPortal } from '@/lib/muat-portal'
import { currentMonthKey } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tertib Point | Portal Wali Murid',
}

export default async function TertibPage() {
  const { dashboard, gagal, notifikasi } = await muatPortal('tertib')
  if (gagal || !dashboard.student) return <PortalGagal pesan={gagal || 'Data siswa belum bisa dimuat.'} />

  const bulan = dashboard.tertib.data.bulan || currentMonthKey()
  const peringkat = await getTertibPeringkatKelas(dashboard.student.kelas, dashboard.student.idSiswa, bulan)

  return (
    <PortalKerangka nama={dashboard.student.name} inisial={dashboard.student.initials} unit={dashboard.student.unit} aktif="/tertib" notifikasi={notifikasi}>
      <TertibPanel
        idSiswa={dashboard.student.idSiswa}
        namaSiswa={dashboard.student.name}
        kelas={dashboard.student.kelas}
        initialData={dashboard.tertib.data}
        initialError={dashboard.tertib.error}
        initialPeringkat={peringkat}
      />
    </PortalKerangka>
  )
}
