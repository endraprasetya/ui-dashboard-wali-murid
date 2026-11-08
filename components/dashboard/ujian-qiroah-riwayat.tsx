'use client'

import { BookOpenCheck } from 'lucide-react'
import { formatDisplayDate } from '@/lib/format'
import type { RekapanRingkas as RekapanLengkap } from '@/lib/ujian-relasi'
import { catatanPenguji } from '@/lib/ujian-relasi'
import { rekapKeTampilanNilai } from '@/lib/ujian-nilai-tampilan'
import { labelPredikatUjian } from '@/lib/ujian-predikat'
import { TombolLihatNilaiUjian } from '@/components/dashboard/qiroah-lihat-nilai'

export function UjianQiroahRiwayat({
  baris,
  profil,
  varian = 'penuh',
}: {
  baris: RekapanLengkap[]
  profil: { nama: string; kelas: string; unit: string; idSiswa: string }
  varian?: 'beranda' | 'penuh'
}) {
  if (baris.length === 0) return null

  const judul = varian === 'beranda' ? 'Hasil ujian kenaikan jilid' : 'Riwayat ujian kenaikan jilid'
  const keterangan =
    varian === 'beranda'
      ? 'Ditampilkan 5 hari terakhir sejak tanggal ujian.'
      : 'Nilai komponen, predikat, keputusan, dan catatan penguji.'

  return (
    <section
      className={
        varian === 'beranda'
          ? 'rounded-2xl border border-violet-200 bg-card p-4 shadow-sm'
          : 'space-y-3 rounded-3xl border bg-card p-5 shadow-sm sm:p-6'
      }
    >
      <div className="flex items-start gap-2 text-violet-900">
        <BookOpenCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <div>
          {varian === 'penuh' ? (
            <p className="text-[10px] font-bold uppercase tracking-wide text-violet-700">Qiroah</p>
          ) : null}
          <h2 className="text-sm font-extrabold text-foreground sm:text-lg">{judul}</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">{keterangan}</p>
        </div>
      </div>
      <DaftarUjian baris={baris} profil={profil} />
    </section>
  )
}

function DaftarUjian({
  baris,
  profil,
}: {
  baris: RekapanLengkap[]
  profil: { nama: string; kelas: string; unit: string; idSiswa: string }
}) {
  return (
    <ul className="mt-3 space-y-3">
      {baris.map((row) => {
        const tampilan = rekapKeTampilanNilai(row, {
          nama: profil.nama,
          kelas: profil.kelas,
          unit: profil.unit,
          id_siswa: profil.idSiswa,
        })
        const catatan = catatanPenguji(row)
        const tanggal = String(row.tanggal_ujian || '').slice(0, 10)
        return (
          <li
            key={row.id_ujian || `${row.id_siswa}-${tanggal}-${row.jilid_asal}`}
            className="rounded-xl border border-border bg-muted/30 p-3 sm:p-4"
          >
            <p className="text-xs font-bold text-foreground">
              {tampilan.jilidAsal}
              {tampilan.jilidTujuan ? ` → ${tampilan.jilidTujuan}` : ''}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {tanggal ? formatDisplayDate(tanggal) : '—'}
              {row.penguji ? ` · Penguji: ${row.penguji}` : ''}
            </p>
            <p className="mt-1 text-[11px] sm:text-xs">
              <span className="font-semibold text-emerald-800">{labelPredikatUjian(row.predikat)}</span>
              {row.nilai_akhir != null && String(row.nilai_akhir).trim() !== '' ? (
                <span className="text-muted-foreground"> · nilai {row.nilai_akhir}</span>
              ) : null}
              <span className="text-muted-foreground"> · {row.keputusan || '—'}</span>
            </p>
            {catatan ? (
              <p className="mt-2 text-xs leading-relaxed text-foreground/90">
                <span className="font-semibold text-muted-foreground">Catatan penguji:</span> {catatan}
              </p>
            ) : null}
            <div className="mt-2.5">
              <TombolLihatNilaiUjian data={tampilan} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
