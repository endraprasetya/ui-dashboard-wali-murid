import type { Metadata } from 'next'
import { AbsensiPanel } from '@/components/dashboard/absensi-panel'
import { PortalGagal, PortalKerangka } from '@/components/dashboard/portal-kerangka'
import { getAbsensiJurnalSiswa } from '@/lib/absensi-jurnal-wali'
import { currentMonthKey } from '@/lib/format'
import { muatPortal } from '@/lib/muat-portal'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Absensi | Portal Wali Murid',
}

export default async function AbsensiPage() {
  const { dashboard, gagal, notifikasi } = await muatPortal('absensi')
  if (gagal || !dashboard.student) {
    return <PortalGagal pesan={gagal || 'Data siswa belum bisa dimuat.'} />
  }

  const student = dashboard.student
  const bulan = currentMonthKey()
  const { data: rekap, error } = await getAbsensiJurnalSiswa({
    idSiswa: student.idSiswa,
    namaSiswa: student.name,
    kelas: student.kelas,
    bulan,
  })

  return (
    <PortalKerangka
      nama={student.name}
      inisial={student.initials}
      unit={student.unit}
      aktif="/absensi"
      notifikasi={notifikasi}
    >
      <AbsensiPanel
        idSiswa={student.idSiswa}
        namaSiswa={student.name}
        kelas={student.kelas}
        initialRekap={rekap}
        initialError={error}
      />
    </PortalKerangka>
  )
}
