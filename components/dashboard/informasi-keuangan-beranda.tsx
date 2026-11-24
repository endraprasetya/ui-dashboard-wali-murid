'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Wallet } from 'lucide-react'
import { KotakRingkas } from '@/components/dashboard/kotak-ringkas'
import { ModalAjukanKegiatan } from '@/components/dashboard/pengajuan-keringanan'
import { rupiahKeringanan, type PengajuanKeringanan } from '@/lib/pengajuan-keringanan-tampilan'

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

export function InformasiKeuanganBeranda({
  error,
  belumTerbayar,
  terbayar,
  yatim,
  pengajuan,
}: {
  error: string | null
  belumTerbayar: number
  terbayar: number
  yatim?: boolean
  pengajuan: PengajuanKeringanan | null
}) {
  const router = useRouter()
  const [modal, setModal] = useState(false)
  const [konfirmasi, setKonfirmasi] = useState(false)
  const status = pengajuan?.statusPersetujuan ?? null
  const bolehAjukan = !error && !yatim && belumTerbayar > 0 && (!status || status === 'Ditolak')

  return (
    <>
      <KotakRingkas href="/keuangan" judul="Informasi Keuangan" ikon={Wallet} nada="teal" className="kartu-keuangan" pisahTautan>
        <div className="isi-kartu rounded-2xl p-3 shadow-sm">
          <p className="text-sm font-medium leading-relaxed">
            Informasi administrasi SPP, Daftar Ulang PSB, Ujian, Ekstrakurikuler, Buku Paket dan lainnya
          </p>
          {error ? (
            <p className="mt-2 text-xs leading-relaxed text-amber-800">{error}</p>
          ) : (
            <ul className="mt-2 border-t border-slate-200 pt-1 text-sm">
              {yatim ? (
                <li className="flex items-start justify-between gap-3 border-b border-dashed border-current/25 py-1.5">
                  <span>Status</span>
                  <span className="shrink-0 text-[11px] font-semibold">Yatim - Gratis</span>
                </li>
              ) : null}
              <li className="flex items-start justify-between gap-3 border-b border-dashed border-current/25 py-1.5">
                <span>{yatim ? 'Tagihan aktif' : 'Belum terbayar'}</span>
                <span className="shrink-0 text-[11px] font-semibold">{rupiahKeringanan(belumTerbayar)}</span>
              </li>
              <li className="flex items-start justify-between gap-3 py-1.5">
                <span>Sudah terbayar</span>
                <span className="shrink-0 text-[11px] font-semibold">{rupiahKeringanan(terbayar)}</span>
              </li>
            </ul>
          )}
          {bolehAjukan ? (
            <button
              type="button"
              onClick={() => setModal(true)}
              className="tombol-buka mt-2 inline-flex items-center rounded-xl px-3.5 py-2 text-xs font-bold"
            >
              Ajukan mengikuti kegiatan
            </button>
          ) : null}
        </div>
      </KotakRingkas>

      <ModalAjukanKegiatan
        buka={modal}
        tunggakan={belumTerbayar}
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
