import type { ReactNode } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/dashboard/site-header'
import type { ButirNotifikasi } from '@/lib/notifikasi-tipe'

export function PortalGagal({ pesan }: { pesan: string }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-xl font-bold text-foreground">Data siswa belum bisa dimuat</h1>
      <p className="text-sm text-muted-foreground">{pesan}</p>
    </main>
  )
}

export function PortalKerangka({
  nama,
  inisial,
  unit,
  aktif,
  notifikasi = [],
  children,
}: {
  nama: string
  inisial: string
  unit: string
  aktif: string
  notifikasi?: ButirNotifikasi[]
  children: ReactNode
}) {
  return (
    <div className="min-h-dvh">
      <SiteHeader name={nama} initials={inisial} unit={unit} aktif={aktif} notifikasi={notifikasi} />
      <main className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {aktif !== '/' && (
          <Link href="/" className="text-xs font-bold text-primary">
            Kembali ke beranda
          </Link>
        )}
        {children}
        <footer className="py-4 text-center text-xs text-muted-foreground">© 2026 SD Islam Terpadu Al Madinah · Portal Wali Murid</footer>
      </main>
    </div>
  )
}
