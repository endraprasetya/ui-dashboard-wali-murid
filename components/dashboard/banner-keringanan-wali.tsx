'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { PratinjauSuratRekomendasi } from '@/components/dashboard/pratinjau-surat-keringanan'
import {
  judulPengajuanKegiatan,
  kelasToneKeringanan,
  ringkasanStatusKeringanan,
  type PengajuanKeringanan,
} from '@/lib/pengajuan-keringanan-tampilan'

export function BannerKeringananWali({ pengajuan }: { pengajuan: PengajuanKeringanan | null }) {
  const [surat, setSurat] = useState(false)
  if (!pengajuan) return null

  const { tone, deskripsi, labelStatus } = ringkasanStatusKeringanan(pengajuan)
  const judul = judulPengajuanKegiatan(pengajuan.jenisKegiatan)
  const disetujui = pengajuan.statusPersetujuan === 'Disetujui'

  return (
    <>
      <section
        aria-label="Status pengajuan mengikuti kegiatan"
        className={`mt-4 rounded-2xl border p-4 shadow-sm ${kelasToneKeringanan(tone)}`}
      >
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-current shadow-sm">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-extrabold">{judul}</h2>
            <p className="mt-2 text-sm font-bold leading-relaxed">{labelStatus}</p>
            <p className="mt-2 text-xs font-medium leading-relaxed opacity-95">{deskripsi}</p>
            {disetujui ? (
              <button
                type="button"
                onClick={() => setSurat(true)}
                className="mt-3 inline-flex rounded-xl border border-emerald-700 bg-white px-3.5 py-2 text-[11px] font-bold text-emerald-950 hover:bg-emerald-50"
              >
                Lihat Surat Rekomendasi
              </button>
            ) : (
              <Link
                href="/keuangan#keringanan"
                className="mt-3 inline-flex rounded-xl border border-current/25 bg-white/70 px-3.5 py-2 text-[11px] font-bold hover:bg-white"
              >
                Buka halaman Keuangan
              </Link>
            )}
          </div>
        </div>
      </section>
      {surat ? <PratinjauSuratRekomendasi pengajuan={pengajuan} onTutup={() => setSurat(false)} /> : null}
    </>
  )
}
