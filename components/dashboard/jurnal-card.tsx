import { Clock, NotebookPen } from 'lucide-react'
import type { JurnalEntry } from '@/lib/queries'
import { DashboardCard } from './dashboard-card'
import { ModuleMessage } from './module-message'

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
          {entries.map((item) => (
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
          ))}
        </ol>
      )}
    </DashboardCard>
  )
}
