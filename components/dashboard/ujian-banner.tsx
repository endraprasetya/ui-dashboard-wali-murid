import { CalendarClock } from 'lucide-react'
import { formatDisplayDate } from '@/lib/format'
import type { JadwalUjian } from '@/lib/queries'

export function UjianBanner({ jadwal }: { jadwal: JadwalUjian | null }) {
  if (!jadwal) return null

  if (jadwal.status === 'menunggu_jadwal') {
    return (
      <section className="rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground">Pengajuan ujian kenaikan jilid</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Pengajuan ujian {jadwal.jilid} sedang menunggu jadwal dari guru penguji
          {jadwal.penguji ? ` (${jadwal.penguji})` : ''}.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-gold/50 bg-gold/10 px-5 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-gold-foreground">
          <CalendarClock className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">Jadwal ujian kenaikan jilid</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            Ananda dijadwalkan mengikuti ujian {jadwal.jilid} pada{' '}
            <strong>{formatDisplayDate(jadwal.tanggal)}</strong>
            {jadwal.waktu ? (
              <>
                {' '}
                pukul <strong>{jadwal.waktu}</strong>
              </>
            ) : null}
            .
          </p>
          {jadwal.penguji && <p className="mt-1 text-xs text-muted-foreground">Penguji: {jadwal.penguji}</p>}
        </div>
      </div>
    </section>
  )
}
