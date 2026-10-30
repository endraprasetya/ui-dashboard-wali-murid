import { BookHeart } from 'lucide-react'
import { TabelTugasRumah } from '@/components/dashboard/tabel-tugas-rumah'
import { statusClass, surahArabic } from '@/lib/format'
import type { TahfidzData } from '@/lib/queries'
import { adaIsiTugas, dahulukanBelumDikerjakan } from '@/lib/tugas-status'
import { cn } from '@/lib/utils'
import { DashboardCard } from './dashboard-card'
import { ModuleMessage } from './module-message'

export function TahfidzCard({ data, error }: { data: TahfidzData; error: string | null }) {
  const latest = data.latest
  const progress = data.total === 0 ? 0 : Math.round((data.lancar / data.total) * 100)
  const arabic = latest ? surahArabic(latest.surah) : null
  const tugas = dahulukanBelumDikerjakan(
    data.history
      .filter((row) => adaIsiTugas(row.tugas))
      .map((row) => ({
        id: row.id,
        tanggal: row.date,
        tugas: row.tugas,
        status: row.konfirmasi,
      })),
  )

  return (
    <DashboardCard
      title="Capaian Tahfidz"
      subtitle={latest ? `Setoran terakhir · ${latest.date}` : 'Riwayat hafalan'}
      icon={BookHeart}
      action={
        latest ? (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
              statusClass(latest.status),
            )}
          >
            {latest.status}
          </span>
        ) : null
      }
    >
      {error ? (
        <ModuleMessage tone="error">{error}</ModuleMessage>
      ) : !latest ? (
        <ModuleMessage>Belum ada setoran tahfidz untuk siswa ini.</ModuleMessage>
      ) : (
        <>
          <div className="flex items-end justify-between gap-4 rounded-xl bg-muted p-4">
            <div>
              <p className="text-xs text-muted-foreground">Surah terakhir</p>
              <p className="text-xl font-bold text-foreground">{latest.surah}</p>
              <p className="text-xs text-muted-foreground">Ayat {latest.ayat}</p>
            </div>
            {arabic && (
              <p lang="ar" dir="rtl" className="font-arabic text-3xl leading-none text-primary">
                {arabic}
              </p>
            )}
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-3">
              <dt className="text-xs text-muted-foreground">Jenis setoran</dt>
              <dd className="text-lg font-bold text-foreground">{latest.type}</dd>
            </div>
            <div className="rounded-xl border p-3">
              <dt className="text-xs text-muted-foreground">Total setoran</dt>
              <dd className="text-lg font-bold text-foreground">{data.total}</dd>
            </div>
          </dl>

          {latest.note && (
            <p className="mt-4 text-sm leading-relaxed text-foreground">{latest.note}</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Pengajar {latest.ustadz}</p>

          <div className="mt-auto pt-4">
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-muted-foreground">Setoran lancar / selesai</span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Persentase setoran lancar"
              className="h-2 overflow-hidden rounded-full bg-muted"
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </>
      )}

      <div id="tugas-tahfidz" className="scroll-mt-24 mt-5 border-t pt-4">
        <h3 className="text-sm font-bold text-foreground">Tugas rumah</h3>
        {tugas.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Belum ada tugas rumah untuk siswa ini.</p>
        ) : (
          <div className="mt-3">
            <TabelTugasRumah jenis="tahfidz" batas={6} baris={tugas} />
          </div>
        )}
      </div>
    </DashboardCard>
  )
}
