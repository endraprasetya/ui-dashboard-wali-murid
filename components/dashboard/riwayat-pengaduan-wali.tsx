'use client'

import { useEffect, useMemo, useState } from 'react'
import { Clock3, History, MessageSquareReply } from 'lucide-react'
import {
  labelStatusAlurPengaduan,
  ringkasIsiPengaduan,
  type PengaduanWaliRiwayatItem,
  type StatusAlurPengaduan,
} from '@/lib/pengaduan-wali-shared'

const BATAS_AWAL = 2

function kelasStatus(status: StatusAlurPengaduan) {
  if (status === 'selesai') return 'bg-emerald-100 text-emerald-900'
  if (status === 'masuk') return 'bg-amber-100 text-amber-950'
  if (status === 'diteruskan') return 'bg-sky-100 text-sky-950'
  return 'bg-violet-100 text-violet-950'
}

function KartuRiwayat({ item }: { item: PengaduanWaliRiwayatItem }) {
  return (
    <article className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-violet-800/90">{item.kategori}</p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${kelasStatus(item.statusAlur)}`}
        >
          {labelStatusAlurPengaduan(item.statusAlur)}
        </span>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
        <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
        Dikirim {item.tanggalKirim}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{ringkasIsiPengaduan(item.isiPengaduan)}</p>
      {item.jawabanSekolah ? (
        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-900">
            <MessageSquareReply className="size-3.5 shrink-0" aria-hidden="true" />
            Tindak lanjut sekolah
            {item.tanggalTindakLanjut ? (
              <span className="font-semibold normal-case text-emerald-800/80">· {item.tanggalTindakLanjut}</span>
            ) : null}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-emerald-950">{item.jawabanSekolah}</p>
        </div>
      ) : item.statusAlur === 'masuk' ? (
        <p className="mt-3 text-xs font-medium text-muted-foreground">
          Pengaduan sedang menunggu peninjauan Kepala Sekolah.
        </p>
      ) : null}
    </article>
  )
}

export function RiwayatPengaduanWali({
  data,
  galat,
  memuat,
  versi,
}: {
  data: PengaduanWaliRiwayatItem[]
  galat: string
  memuat?: boolean
  versi?: number
}) {
  const [semua, setSemua] = useState(false)

  useEffect(() => {
    if (versi) setSemua(false)
  }, [versi])

  const tampil = useMemo(() => (semua ? data : data.slice(0, BATAS_AWAL)), [data, semua])

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 via-card to-card shadow-sm">
      <header className="border-b border-violet-100/80 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-800">
            <History className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-extrabold text-foreground">Riwayat Pengaduan</h2>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              Status dan jawaban tindak lanjut untuk ananda yang sedang login.
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-3 px-5 py-4 sm:px-6 sm:py-5">
        {galat ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-950">
            {galat}
          </p>
        ) : null}
        {memuat && data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Memuat riwayat…</p>
        ) : null}
        {!galat && !memuat && data.length === 0 ? (
          <p className="rounded-xl border border-dashed border-violet-200 bg-violet-50/50 px-4 py-5 text-center text-sm leading-relaxed text-violet-950/90">
            Belum ada pengaduan yang pernah Anda kirim. Gunakan formulir di bawah untuk menyampaikan masukan atau
            keluhan kepada pihak sekolah.
          </p>
        ) : null}
        {tampil.map((item) => (
          <KartuRiwayat key={item.id} item={item} />
        ))}
        {data.length > BATAS_AWAL ? (
          <button
            type="button"
            onClick={() => setSemua((buka) => !buka)}
            className="w-full rounded-xl border border-violet-200 bg-violet-50/80 py-2.5 text-sm font-bold text-violet-900 transition hover:bg-violet-100"
          >
            {semua ? 'Tampilkan lebih sedikit' : `Lihat selengkapnya (${data.length} pengaduan)`}
          </button>
        ) : null}
      </div>
    </section>
  )
}