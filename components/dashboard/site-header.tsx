import Link from 'next/link'
import { BookOpenText, LogOut } from 'lucide-react'
import { LoncengNotifikasi } from '@/components/dashboard/lonceng-notifikasi'
import { logout } from '@/lib/auth-actions'
import type { ButirNotifikasi } from '@/lib/notifikasi-tipe'

const navItems = [
  { label: 'Beranda', href: '/' },
  { label: 'Profil Anak', href: '/profil' },
  { label: 'Tahfidz', href: '/tahfidz' },
  { label: 'Qiroah', href: '/qiroah' },
  { label: 'Jurnal', href: '/jurnal' },
  { label: 'Absensi', href: '/absensi' },
  { label: 'Tertib', href: '/tertib' },
  { label: 'Keuangan', href: '/keuangan' },
  { label: 'Pengumuman', href: '/pengumuman' },
]

function labelUnit(unit: string) {
  const bersih = unit.trim()
  if (!bersih || bersih.toLowerCase() === 'unit belum diisi') return 'Unit belum diisi'
  if (/^unit\b/i.test(bersih)) return bersih.replace(/^unit\b/i, 'Unit')
  return `Unit ${bersih}`
}

export function SiteHeader({
  name,
  initials,
  unit,
  aktif = '/',
  notifikasi = [],
}: {
  name: string
  initials: string
  unit: string
  aktif?: string
  notifikasi?: ButirNotifikasi[]
}) {
  return (
    <header className="sticky top-0 z-30 border-b bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/70">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpenText className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="text-xs font-bold text-foreground sm:text-sm">SD Islam Terpadu Al Madinah</p>
            <p className="truncate text-[11px] text-muted-foreground">{labelUnit(unit)}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <LoncengNotifikasi item={notifikasi} />
          <div className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-gold text-xs font-bold text-gold-foreground">
              {initials}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block max-w-36 truncate text-xs font-semibold text-foreground">{name}</span>
              <span className="block text-[11px] text-muted-foreground">Wali Santri</span>
            </span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              Keluar
            </button>
          </form>
        </div>
      </div>
      <nav aria-label="Navigasi utama" className="border-t">
        <ul className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          {navItems.map((item) => {
            const aktifItem = item.href === aktif
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={aktifItem ? 'page' : undefined}
                  className={
                    aktifItem
                      ? 'inline-flex rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-primary sm:text-sm'
                      : 'inline-flex rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:text-sm'
                  }
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
