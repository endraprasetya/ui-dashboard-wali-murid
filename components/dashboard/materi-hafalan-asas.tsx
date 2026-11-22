import { BookOpen } from 'lucide-react'
import { PESAN_MATERI_HAFALAN_KOSONG, type MateriHafalanAsas } from '@/lib/materi-hafalan-asas'

export function MateriHafalanAsasWali({ materi, galat }: { materi: MateriHafalanAsas | null; galat?: string }) {
  const kosong = !materi || materi.surah.length === 0

  return (
    <section aria-label="Materi ujian hafalan Al-Qur'an ASAS" className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <BookOpen className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">ASAS</p>
          <h2 className="text-sm font-extrabold text-foreground">Materi Ujian Tahfidzul Qur&apos;an (ASAS)</h2>
        </div>
      </div>

      {kosong ? (
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{galat || PESAN_MATERI_HAFALAN_KOSONG}</p>
      ) : (
        <dl className="mt-4 space-y-3 text-xs leading-relaxed">
          <div>
            <dt className="font-bold text-foreground">Daftar surah yang diujikan</dt>
            <dd className="mt-1 text-muted-foreground">{materi.surah.join(', ')}</dd>
          </div>
          <div>
            <dt className="font-bold text-foreground">Indikator penilaian</dt>
            <dd className="mt-1 text-muted-foreground">{materi.indikator || 'Indikator penilaian belum diisi guru pembimbing.'}</dd>
          </div>
          {materi.guru ? (
            <div>
              <dt className="font-bold text-foreground">Guru pembimbing / pengampu</dt>
              <dd className="mt-1 font-semibold text-foreground">{materi.guru}</dd>
            </div>
          ) : null}
        </dl>
      )}
    </section>
  )
}
