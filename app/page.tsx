import { DataBelumLengkap } from '@/components/dashboard/data-belum-lengkap'
import { BerandaRingkas } from '@/components/dashboard/beranda-ringkas'
import { GreetingHero } from '@/components/dashboard/greeting-hero'
import { PortalGagal, PortalKerangka } from '@/components/dashboard/portal-kerangka'
import { UjianBanner } from '@/components/dashboard/ujian-banner'
import { UjianQiroahRiwayat } from '@/components/dashboard/ujian-qiroah-riwayat'
import { ambilKeuanganAmpss } from '@/lib/ampss'
import { muatPortal } from '@/lib/muat-portal'
import { dalamLimaHariSejakUjian } from '@/lib/ujian-rentang'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { dashboard, diri, gagal, notifikasi } = await muatPortal('beranda')
  if (gagal || !dashboard.student) return <PortalGagal pesan={gagal || 'Data siswa belum bisa dimuat.'} />

  const keuangan = await ambilKeuanganAmpss(dashboard.student.idSiswa, dashboard.student.nis)
  const hasilTerbaru = dashboard.rekapanUjian.filter((row) => dalamLimaHariSejakUjian(row.tanggal_ujian)).slice(0, 3)
  const profil = {
    nama: dashboard.student.name,
    kelas: dashboard.student.kelas,
    unit: dashboard.student.unit,
    idSiswa: dashboard.student.idSiswa,
  }

  return (
    <PortalKerangka nama={dashboard.student.name} inisial={dashboard.student.initials} unit={dashboard.student.unit} aktif="/" notifikasi={notifikasi}>
      <DataBelumLengkap kurang={diri.kurang} belumTertaut={!diri.data && !diri.error} pesan={diri.error} />
      <GreetingHero student={dashboard.student} />
      {hasilTerbaru.length > 0 ? <UjianQiroahRiwayat baris={hasilTerbaru} profil={profil} varian="beranda" /> : null}
      <UjianBanner jadwal={dashboard.jadwalUjian} />
      <BerandaRingkas data={dashboard} diri={diri} keuangan={keuangan} />
    </PortalKerangka>
  )
}
