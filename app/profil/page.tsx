import type { Metadata } from 'next'
import { DataBelumLengkap } from '@/components/dashboard/data-belum-lengkap'
import { PortalGagal, PortalKerangka } from '@/components/dashboard/portal-kerangka'
import { ProfilSiswa } from '@/components/dashboard/profil-siswa'
import { muatPortal } from '@/lib/muat-portal'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Profil Anak | Portal Wali Murid',
}

export default async function ProfilPage() {
  const { dashboard, diri, gagal, notifikasi } = await muatPortal('profil')
  if (gagal || !dashboard.student) return <PortalGagal pesan={gagal || 'Data siswa belum bisa dimuat.'} />

  return (
    <PortalKerangka nama={dashboard.student.name} inisial={dashboard.student.initials} unit={dashboard.student.unit} aktif="/profil" notifikasi={notifikasi}>
      <DataBelumLengkap
        kurang={diri.kurang}
        belumTertaut={!diri.data && !diri.error}
        pesan={diri.error}
        tautan="#profil"
      />
      <ProfilSiswa data={diri.data} error={diri.error} />
    </PortalKerangka>
  )
}
