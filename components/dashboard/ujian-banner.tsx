import { CalendarClock, ScrollText } from 'lucide-react'
import { formatDisplayDate } from '@/lib/format'
import type { HasilUjianJilid, JadwalUjian } from '@/lib/queries'

function lulusUjian(keputusan: string) {
  const teks = keputusan.toLowerCase()
  return teks.includes('lulus') && !teks.includes('tidak')
}

function KartuHasil({ hasil }: { hasil: HasilUjianJilid }) {
  const lulus = lulusUjian(hasil.keputusan)
  return (
    <section className={`rounded-2xl border px-5 py-4 shadow-sm ${lulus ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}>
      <div className="flex items-start gap-3">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${lulus ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          <ScrollText className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">Hasil ujian kenaikan jilid</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            Ujian {hasil.jilidAsal}
            {hasil.jilidTujuan ? ` menuju ${hasil.jilidTujuan}` : ''} dinyatakan <strong>{hasil.keputusan}</strong>
            {hasil.predikat ? ` dengan predikat ${hasil.predikat}` : ''}
            {hasil.nilai ? ` (nilai ${hasil.nilai})` : ''}.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {hasil.tanggal ? formatDisplayDate(hasil.tanggal) : 'Tanggal ujian tercatat'}
            {hasil.penguji ? ` · Penguji: ${hasil.penguji}` : ''}
          </p>
          {hasil.catatanPenguji ? (
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              <span className="font-semibold">Catatan Penguji:</span> {hasil.catatanPenguji}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function KartuJadwal({ jadwal }: { jadwal: JadwalUjian }) {
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
            Ananda dijadwalkan mengikuti ujian {jadwal.jilid} pada <strong>{formatDisplayDate(jadwal.tanggal)}</strong>
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

/** Hanya jadwal / antrean ujian. Hasil lengkap ada di beranda (5 hari) dan menu Qiroah. */
export function UjianBanner({ jadwal }: { jadwal: JadwalUjian | null; hasil?: HasilUjianJilid[] }) {
  if (!jadwal) return null
  return (
    <div className="space-y-3">
      <KartuJadwal jadwal={jadwal} />
    </div>
  )
}
