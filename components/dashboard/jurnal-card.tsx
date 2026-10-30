import { Clock, NotebookPen } from 'lucide-react'
import { todayIso } from '@/lib/format'
import type { JurnalEntry } from '@/lib/queries'
import { DashboardCard } from './dashboard-card'
import { ModuleMessage } from './module-message'

const WAKTU_JAM: Record<string, string> = {
  '1': '07.00 – 07.35',
  '2': '07.35 – 08.10',
  '3': '08.10 – 08.45',
  '4': '08.45 – 09.20',
  '5': '09.40 – 10.15',
  '6': '10.15 – 10.50',
  '7': '10.50 – 11.25',
  '8': '12.25 – 13.00',
  '9': '13.00 – 13.35',
  '10': '13.35 – 14.10',
  '11': '15.25 – 16.00',
}

function jamPelajaran(jam: string) {
  const nomor = jam.trim()
  const waktu = WAKTU_JAM[nomor]
  if (!waktu) return nomor && nomor !== '-' ? `Jam ke-${nomor}` : '-'
  return `Jam ke-${nomor} · ${waktu}`
}

export function JurnalCard({
  className,
  classLabel,
  entries,
  error,
}: {
  className?: string
  classLabel: string
  entries: JurnalEntry[]
  error: string | null
}) {
  const hariIni = todayIso()

  return (
    <DashboardCard
      title="Jurnal Pembelajaran"
      subtitle={`Catatan kegiatan ${classLabel}`}
      icon={NotebookPen}
      className={className}
    >
      {error ? (
        <ModuleMessage tone="error">{error}</ModuleMessage>
      ) : entries.length === 0 ? (
        <ModuleMessage>Belum ada jurnal untuk kelas ini.</ModuleMessage>
      ) : (
        <ol className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1">
          {entries.map((item) => {
            const mendatang = Boolean(item.iso) && item.iso > hariIni
            if (mendatang) {
              return (
                <li key={item.id} className="rounded-xl border border-dashed px-3 py-2.5">
                  <p className="text-[11px] font-medium text-muted-foreground">{item.date}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{item.mapel}</p>
                  <p className="mt-0.5 text-xs text-foreground">Jam pelajaran {jamPelajaran(item.jam)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Guru {item.guru || 'belum tercatat'}</p>
                </li>
              )
            }
            return (
              <li key={item.id} className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-start sm:gap-4">
                <span className="flex w-28 shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {item.jam}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{item.mapel}</p>
                  {item.materi && <p className="mt-0.5 text-xs text-foreground">{item.materi}</p>}
                  {item.kegiatan && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.kegiatan}</p>}
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {item.date}
                    {item.semester ? ` · Semester ${item.semester}` : ''}
                    {' · '}Hadir kelas {item.hadir} · Tidak hadir {item.tidakHadir}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </DashboardCard>
  )
}
