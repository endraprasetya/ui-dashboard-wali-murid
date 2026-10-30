import type { ReactNode } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const NADA = {
  emerald: 'border-emerald-700/30 bg-emerald-600 text-white shadow-emerald-950/10',
  blue: 'border-blue-700/30 bg-blue-600 text-white shadow-blue-950/10',
  amber: 'border-amber-600/40 bg-amber-500 text-amber-950 shadow-amber-950/10',
  slate: 'border-slate-700 bg-slate-800 text-white shadow-slate-950/20',
  rose: 'border-rose-800/30 bg-rose-700 text-white shadow-rose-950/10',
  teal: 'border-teal-800/30 bg-teal-700 text-white shadow-teal-950/10',
  indigo: 'border-indigo-700/30 bg-indigo-600 text-white shadow-indigo-950/10',
} as const

export type NadaKartu = keyof typeof NADA

const NADA_HOVER: Record<NadaKartu, string> = {
  emerald: 'hover:bg-emerald-700',
  blue: 'hover:bg-blue-700',
  amber: 'hover:bg-amber-400',
  slate: 'hover:bg-slate-700',
  rose: 'hover:bg-rose-800',
  teal: 'hover:bg-teal-800',
  indigo: 'hover:bg-indigo-700',
}

export function KotakRingkas({
  href,
  judul,
  ikon: Ikon,
  nada,
  children,
  className,
  pisahTautan = false,
}: {
  href?: string
  judul: string
  ikon: LucideIcon
  nada: NadaKartu
  children: ReactNode
  className?: string
  pisahTautan?: boolean
}) {
  const kelas = cn(
    'flex min-w-0 flex-col rounded-3xl border p-5 shadow-sm transition',
    href && !pisahTautan && 'group hover:-translate-y-0.5 hover:shadow-md',
    href && !pisahTautan && NADA_HOVER[nada],
    NADA[nada],
    className,
  )
  const kepala = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-xl',
            nada === 'amber' ? 'bg-amber-950/10' : 'bg-white/20',
          )}
        >
          <Ikon className="size-4" aria-hidden="true" />
        </span>
        <h2 className="text-sm font-bold">{judul}</h2>
      </div>
      {href ? (
        <ChevronRight className="size-4 opacity-80 transition group-hover:translate-x-0.5" aria-hidden="true" />
      ) : null}
    </div>
  )
  const tubuh = <div className="mt-3 flex-1 text-sm">{children}</div>

  if (href && pisahTautan) {
    return (
      <article className={kelas}>
        <Link href={href} className="group block rounded-2xl text-inherit outline-offset-4">
          {kepala}
        </Link>
        {tubuh}
      </article>
    )
  }

  if (!href) {
    return (
      <article className={kelas}>
        {kepala}
        {tubuh}
      </article>
    )
  }

  return (
    <article className={kelas}>
      <Link href={href} className="group block rounded-2xl text-inherit outline-offset-4">
        {kepala}
        {tubuh}
      </Link>
    </article>
  )
}
