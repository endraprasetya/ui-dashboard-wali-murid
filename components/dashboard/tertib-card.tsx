import { ShieldCheck } from 'lucide-react'
import type { TertibData } from '@/lib/queries'
import { cn } from '@/lib/utils'
import { DashboardCard } from './dashboard-card'
import { ModuleMessage } from './module-message'

export function TertibCard({ data, error }: { data: TertibData; error: string | null }) {
  return (
    <DashboardCard title="Tertib & Poin" subtitle="Pelanggaran dan prestasi" icon={ShieldCheck}>
      {error ? (
        <ModuleMessage tone="error">{error}</ModuleMessage>
      ) : data.items.length === 0 ? (
        <ModuleMessage>Belum ada catatan poin ketertiban untuk siswa ini.</ModuleMessage>
      ) : (
        <>
          <div className="rounded-xl bg-muted p-4">
            <p className="text-xs text-muted-foreground">Saldo poin</p>
            <p
              className={cn(
                'text-3xl font-bold tabular-nums',
                data.total < 0 ? 'text-destructive' : 'text-foreground',
              )}
            >
              {data.total > 0 ? `+${data.total}` : data.total}
            </p>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-3">
              <dt className="text-xs text-muted-foreground">Prestasi</dt>
              <dd className="text-lg font-bold text-success-foreground">+{data.prestasi}</dd>
            </div>
            <div className="rounded-xl border p-3">
              <dt className="text-xs text-muted-foreground">Pelanggaran</dt>
              <dd className="text-lg font-bold text-destructive">{data.pelanggaran}</dd>
            </div>
          </dl>
          <ul className="mt-4 flex max-h-48 flex-col gap-2 overflow-y-auto">
            {data.items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 rounded-xl border px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.month} · {item.teacher}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 text-sm font-bold tabular-nums',
                    item.points < 0 ? 'text-destructive' : 'text-success-foreground',
                  )}
                >
                  {item.points > 0 ? `+${item.points}` : item.points}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </DashboardCard>
  )
}
