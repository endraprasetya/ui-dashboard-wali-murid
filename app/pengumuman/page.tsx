import type { Metadata } from 'next'
import { Megaphone } from 'lucide-react'
import { DaftarPengumuman } from '@/components/dashboard/daftar-pengumuman'
import { PortalGagal, PortalKerangka } from '@/components/dashboard/portal-kerangka'
import { educationCalendar } from '@/lib/teacher-data'
import { muatPortal } from '@/lib/muat-portal'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pengumuman | Portal Wali Murid',
}

export default async function PengumumanPage() {
  const { dashboard, gagal, notifikasi } = await muatPortal('pengumuman')
  if (gagal || !dashboard.student) return <PortalGagal pesan={gagal || 'Data siswa belum bisa dimuat.'} />

  return (
    <PortalKerangka
      nama={dashboard.student.name}
      inisial={dashboard.student.initials}
      unit={dashboard.student.unit}
      aktif="/pengumuman"
      notifikasi={notifikasi}
    >
      <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Megaphone className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-foreground">Pengumuman Sekolah</h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Kalender pendidikan dan agenda kegiatan tahun pelajaran 2026/2027 — sumber data sama dengan Portal
              Guru.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{educationCalendar.length} agenda tercatat</p>
          </div>
        </div>
        <div className="mt-6">
          <DaftarPengumuman />
        </div>
      </section>
    </PortalKerangka>
  )
}
