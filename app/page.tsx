import { DataBelumLengkap } from '@/components/dashboard/data-belum-lengkap'
import { BerandaRingkas } from '@/components/dashboard/beranda-ringkas'
import { GreetingHero } from '@/components/dashboard/greeting-hero'
import { BannerKeringananWali } from '@/components/dashboard/banner-keringanan-wali'
import { SegarkanPengajuan } from '@/components/dashboard/segarkan-pengajuan'
import { JadwalAsasWali } from '@/components/dashboard/jadwal-asas-wali'
import { MateriHafalanAsasWali } from '@/components/dashboard/materi-hafalan-asas'
import { InformasiKeuanganBeranda } from '@/components/dashboard/informasi-keuangan-beranda'
import { PengingatAsasWali } from '@/components/dashboard/pengingat-asas-wali'
import { PortalGagal, PortalKerangka } from '@/components/dashboard/portal-kerangka'
import { UjianBanner } from '@/components/dashboard/ujian-banner'
import { UjianQiroahRiwayat } from '@/components/dashboard/ujian-qiroah-riwayat'
import { ambilKeuanganAmpss } from '@/lib/ampss'
import { muatPengajuanUntukNis, pengajuanTerbaru } from '@/lib/pengajuan-keringanan'
import { muatMateriHafalanAsas } from '@/lib/materi-hafalan-asas'
import { perluPengajuanKarenaTagihan } from '@/lib/kelayakan-asas'
import { muatPortal } from '@/lib/muat-portal'
import { dalamLimaHariSejakUjian } from '@/lib/ujian-rentang'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export default async function DashboardPage() {
  const { dashboard, diri, gagal, notifikasi } = await muatPortal('beranda')
  if (gagal || !dashboard.student) return <PortalGagal pesan={gagal || 'Data siswa belum bisa dimuat.'} />

  const keuangan = await ambilKeuanganAmpss(dashboard.student.idSiswa, dashboard.student.nis)
  const keringanan =
    pengajuanTerbaru(
      await muatPengajuanUntukNis([dashboard.student.nis, dashboard.student.idSiswa]),
      dashboard.student.nis,
      dashboard.student.idSiswa,
    ) ?? null
  const materiHafalan = await muatMateriHafalanAsas(dashboard.student.idSiswa, dashboard.student.nis)
  const jenisKelamin = diri.data?.jenis_kelamin
  const konteksSyarat = {
    kelas: dashboard.student.kelas,
    jenisKelamin,
    tagihan: keuangan.tagihan,
    yatim: keuangan.yatim,
  }
  const statusPengajuan = keringanan?.statusPersetujuan ?? null
  const bolehAjukan =
    !keuangan.error &&
    keuangan.ringkas.belumTerbayar > 0 &&
    (!statusPengajuan || statusPengajuan === 'Ditolak') &&
    perluPengajuanKarenaTagihan(konteksSyarat)
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
      <PengingatAsasWali />
      <BannerKeringananWali pengajuan={keringanan} bolehAjukan={bolehAjukan} tunggakan={keuangan.ringkas.belumTerbayar} />
      <InformasiKeuanganBeranda
        error={keuangan.error}
        belumTerbayar={keuangan.ringkas.belumTerbayar}
        terbayar={keuangan.ringkas.terbayar}
        yatim={keuangan.yatim}
      />
      <JadwalAsasWali kelas={dashboard.student.kelas} />
      <MateriHafalanAsasWali materi={materiHafalan.materi} galat={materiHafalan.galat} />
      <SegarkanPengajuan />
      {hasilTerbaru.length > 0 ? <UjianQiroahRiwayat baris={hasilTerbaru} profil={profil} varian="beranda" /> : null}
      <UjianBanner jadwal={dashboard.jadwalUjian} />
      <BerandaRingkas data={dashboard} diri={diri} />
    </PortalKerangka>
  )
}
