import { DataBelumLengkap } from '@/components/dashboard/data-belum-lengkap'
import { BerandaRingkas } from '@/components/dashboard/beranda-ringkas'
import { GreetingHero } from '@/components/dashboard/greeting-hero'
import { PortalGagal, PortalKerangka } from '@/components/dashboard/portal-kerangka'
import { UjianBanner } from '@/components/dashboard/ujian-banner'
import { muatPortal } from '@/lib/muat-portal'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { dashboard, diri, gagal, notifikasi } = await muatPortal('beranda')
  if (gagal || !dashboard.student) return <PortalGagal pesan={gagal || 'Data siswa belum bisa dimuat.'} />

  return (
    <PortalKerangka nama={dashboard.student.name} inisial={dashboard.student.initials} unit={dashboard.student.unit} aktif="/" notifikasi={notifikasi}>
      <DataBelumLengkap kurang={diri.kurang} belumTertaut={!diri.data && !diri.error} pesan={diri.error} />
      <GreetingHero student={dashboard.student} />
      <UjianBanner jadwal={dashboard.jadwalUjian} />
      <BerandaRingkas data={dashboard} diri={diri} />
    </PortalKerangka>
  )
}
