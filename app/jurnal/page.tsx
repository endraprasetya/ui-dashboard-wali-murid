import type { Metadata } from 'next'
import { JurnalCard } from '@/components/dashboard/jurnal-card'
import { PortalGagal, PortalKerangka } from '@/components/dashboard/portal-kerangka'
import { muatPortal } from '@/lib/muat-portal'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Jurnal Pembelajaran | Portal Wali Murid',
}

export default async function JurnalPage() {
  const { dashboard, gagal, notifikasi } = await muatPortal('jurnal')
  if (gagal || !dashboard.student) return <PortalGagal pesan={gagal || 'Data siswa belum bisa dimuat.'} />

  return (
    <PortalKerangka nama={dashboard.student.name} inisial={dashboard.student.initials} unit={dashboard.student.unit} aktif="/jurnal" notifikasi={notifikasi}>
      <JurnalCard
        classLabel={dashboard.student.classLabel}
        entries={dashboard.jurnal.data}
        error={dashboard.jurnal.error}
      />
    </PortalKerangka>
  )
}
