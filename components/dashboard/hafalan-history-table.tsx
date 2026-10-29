'use client'

import { useState } from 'react'
import { History } from 'lucide-react'
import { statusClass } from '@/lib/format'
import type { TahfidzEntry } from '@/lib/queries'
import { cn } from '@/lib/utils'
import { DashboardCard } from './dashboard-card'
import { ModuleMessage } from './module-message'

export function HafalanHistoryTable({
  className,
  rows,
  error,
}: {
  className?: string
  rows: TahfidzEntry[]
  error: string | null
}) {
  const [semua, setSemua] = useState(false)
  const tampil = semua ? rows : rows.slice(0, 6)

  return (
    <DashboardCard
      title="Riwayat Setoran Hafalan"
      subtitle={rows.length ? `${rows.length} setoran terbaru` : 'Riwayat hafalan'}
      icon={History}
      className={cn('scroll-mt-24', className)}
      id="riwayat-hafalan"
    >
      {error ? (
        <ModuleMessage tone="error">{error}</ModuleMessage>
      ) : rows.length === 0 ? (
        <ModuleMessage>Belum ada riwayat setoran hafalan.</ModuleMessage>
      ) : (
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-y bg-muted/60 text-xs text-muted-foreground">
                <th scope="col" className="px-5 py-2.5 font-medium">
                  Tanggal
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Surah
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Ayat
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Jenis
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Pengajar
                </th>
                <th scope="col" className="px-5 py-2.5 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tampil.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-muted/40">
                  <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">{row.date}</td>
                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-foreground">{row.surah}</td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums text-foreground">{row.ayat}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground">{row.type}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{row.ustadz}</td>
                  <td className="px-5 py-3">
                    <span
                      title={row.note || undefined}
                      className={cn(
                        'whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold',
                        statusClass(row.status),
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rows.length > 6 && (
        <button type="button" onClick={() => setSemua((buka) => !buka)} className="mt-3 text-left text-sm font-bold text-primary">
          {semua ? 'Tampilkan lebih sedikit' : 'Lihat Selengkapnya'}
        </button>
      )}
    </DashboardCard>
  )
}
