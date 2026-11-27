'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, FileText } from 'lucide-react'
import { ModalAjukanKegiatan } from '@/components/dashboard/pengajuan-keringanan'
import { PratinjauSuratRekomendasi } from '@/components/dashboard/pratinjau-surat-keringanan'
import {
  judulPengajuanKegiatan,
  kelasToneKeringanan,
  ringkasanStatusKeringanan,
  type PengajuanKeringanan,
} from '@/lib/pengajuan-keringanan-tampilan'

function ModalKonfirmasi({ onTutup }: { onTutup: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle2 className="size-6" aria-hidden="true" />
          <h2 className="text-base font-bold text-foreground">Pengajuan berhasil dikirim</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Pengajuan mengikuti kegiatan telah terkirim dan sedang menunggu pemeriksaan/persetujuan Kepala Sekolah.
        </p>
        <button type="button" onClick={onTutup} className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground">
          Mengerti
        </button>
      </div>
    </div>
  )
}

export function BannerKeringananWali({
  pengajuan,
  bolehAjukan = false,
  tunggakan = 0,
}: {
  pengajuan: PengajuanKeringanan | null
  bolehAjukan?: boolean
  tunggakan?: number
}) {
  const router = useRouter()
  const [surat, setSurat] = useState(false)
  const [modal, setModal] = useState(false)
  const [konfirmasi, setKonfirmasi] = useState(false)
  if (!pengajuan && !bolehAjukan) return null

  const ringkas = pengajuan ? ringkasanStatusKeringanan(pengajuan) : null
  const judul = judulPengajuanKegiatan(pengajuan?.jenisKegiatan)
  const disetujui = pengajuan?.statusPersetujuan === 'Disetujui'
  const tone = ringkas?.tone ?? 'sky'

  return (
    <>
      <section
        aria-label="Status pengajuan mengikuti kegiatan"
        className={`rounded-2xl border p-4 shadow-sm ${kelasToneKeringanan(tone)}`}
      >
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-current shadow-sm">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-extrabold">{judul}</h2>
            {ringkas ? (
              <>
                <p className="mt-2 text-sm font-bold leading-relaxed">{ringkas.labelStatus}</p>
                <p className="mt-2 text-xs font-medium leading-relaxed opacity-95">{ringkas.deskripsi}</p>
              </>
            ) : (
              <p className="mt-2 text-xs font-medium leading-relaxed opacity-95">
                Ajukan rekomendasi agar ananda dapat mengikuti kegiatan, ujian, atau pengambilan rapor.
              </p>
            )}
            {bolehAjukan ? (
              <button
                type="button"
                onClick={() => setModal(true)}
                className="mt-3 inline-flex rounded-xl bg-sky-800 px-3.5 py-2 text-[11px] font-bold text-white hover:bg-sky-900"
              >
                Ajukan mengikuti kegiatan
              </button>
            ) : null}
            {disetujui && pengajuan ? (
              <button
                type="button"
                onClick={() => setSurat(true)}
                className="mt-3 inline-flex rounded-xl border border-emerald-700 bg-white px-3.5 py-2 text-[11px] font-bold text-emerald-950 hover:bg-emerald-50"
              >
                Lihat Surat Rekomendasi
              </button>
            ) : pengajuan && !disetujui ? (
              <Link
                href="/keuangan#keringanan"
                className="mt-3 inline-flex rounded-xl border border-current/25 bg-white/70 px-3.5 py-2 text-[11px] font-bold hover:bg-white"
              >
                Buka halaman Keuangan
              </Link>
            ) : null}
          </div>
        </div>
      </section>
      {surat && pengajuan ? <PratinjauSuratRekomendasi pengajuan={pengajuan} onTutup={() => setSurat(false)} /> : null}
      <ModalAjukanKegiatan
        buka={modal}
        tunggakan={tunggakan}
        onTutup={() => setModal(false)}
        onSukses={() => {
          setModal(false)
          setKonfirmasi(true)
        }}
      />
      {konfirmasi ? (
        <ModalKonfirmasi
          onTutup={() => {
            setKonfirmasi(false)
            router.refresh()
          }}
        />
      ) : null}
    </>
  )
}
