'use client'

import { useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import {
  CATATAN_KEPULANGAN_ASAS,
  jadwalAsasRingkas,
  jadwalAsasUntukJenjang,
  jenjangDariKelas,
  statusHariAsas,
  type StatusHariAsas,
} from '@/lib/jadwal-asas'

function kelasBadge(status: StatusHariAsas) {
  if (status === 'Hari Ini') return 'bg-sky-700 text-white'
  if (status === 'Besok') return 'bg-emerald-100 text-emerald-900'
  if (status === 'Kemarin') return 'bg-slate-200 text-slate-700'
  return 'bg-amber-100 text-amber-950'
}

export function JadwalAsasWali({ kelas }: { kelas: string }) {
  const [showAll, setShowAll] = useState(false)
  const jenjang = jenjangDariKelas(kelas)
  const jadwal = useMemo(() => (jenjang ? jadwalAsasUntukJenjang(jenjang) : []), [jenjang])
  const ringkas = useMemo(() => jadwalAsasRingkas(jadwal), [jadwal])
  const tampil = showAll ? jadwal : ringkas.items

  return (
    <section aria-label="Jadwal ASAS I" className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800">
          <CalendarDays className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-sky-800">Tahun pelajaran 2026/2027</p>
              <h2 className="text-sm font-extrabold leading-snug text-foreground">Jadwal ASAS I Tahun Pelajaran 2026/2027</h2>
            </div>
            {jenjang && jadwal.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowAll((nilai) => !nilai)}
                className="shrink-0 rounded-xl border bg-white px-2.5 py-1.5 text-[11px] font-bold text-sky-900 hover:bg-sky-50"
              >
                {showAll ? 'Ringkas (3 Hari)' : 'Tampilkan Semua'}
              </button>
            ) : null}
          </div>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {jenjang ? `Kelas ${jenjang}${kelas ? ` · ${kelas}` : ''}` : 'Kelas ananda belum terbaca'}
          </p>
        </div>
      </div>

      {jenjang ? (
        <>
          {!showAll && ringkas.cadangan ? (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-medium leading-relaxed text-amber-950">
              Tidak ada jadwal ujian pada hari ini/besok. Menampilkan jadwal ujian terdekat berikutnya.
            </p>
          ) : null}
          {!showAll && ringkas.selesai ? (
            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-medium leading-relaxed text-slate-700">
              Tidak ada jadwal ujian pada hari ini/besok. Jadwal ASAS I untuk kelas ananda sudah selesai.
            </p>
          ) : null}

          {tampil.length > 0 ? (
            <ol className="mt-3 space-y-2.5">
              {tampil.map((hari) => {
                const status = statusHariAsas(hari.iso, ringkas.acuan) ?? (!showAll && ringkas.cadangan ? 'Berikutnya' : null)
                return (
                  <li key={hari.iso} className="rounded-xl border bg-muted/30 px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-extrabold text-foreground">{hari.tanggal}</p>
                      {status ? (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${kelasBadge(status)}`}>{status}</span>
                      ) : null}
                    </div>
                    <ul className="mt-1.5 space-y-1">
                      {hari.sesi.map((item) => (
                        <li key={`${hari.iso}-${item.waktu}-${item.kegiatan}`} className="flex gap-2 text-xs leading-relaxed">
                          <span className="w-[6.4rem] shrink-0 font-semibold tabular-nums text-sky-900">{item.waktu}</span>
                          <span className="min-w-0 font-medium text-foreground">{item.kegiatan}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              })}
            </ol>
          ) : null}
        </>
      ) : (
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Jadwal belum dapat disaring karena data kelas belum lengkap.</p>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">{CATATAN_KEPULANGAN_ASAS}</p>
    </section>
  )
}
