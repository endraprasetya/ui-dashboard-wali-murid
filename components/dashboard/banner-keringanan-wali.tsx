import Link from 'next/link'
import { FileText } from 'lucide-react'
import {
  formatTanggalKeringanan,
  kelasToneKeringanan,
  ringkasanStatusKeringanan,
  rupiahKeringanan,
  type PengajuanKeringanan,
} from '@/lib/pengajuan-keringanan-tampilan'

export function BannerKeringananWali({
  pengajuan,
  sisaTunggakan,
}: {
  pengajuan: PengajuanKeringanan | null
  sisaTunggakan: number
}) {
  if (!pengajuan) return null

  const { tone, judul, deskripsi, labelStatus } = ringkasanStatusKeringanan(pengajuan)
  const suratTerkirim = Boolean(pengajuan.suratResmiDikirimPada?.trim())
  const pelunasanSelesai = sisaTunggakan <= 0
  const tampilkanRingkasanKeuangan = !pelunasanSelesai && pengajuan.statusPersetujuan !== 'Ditolak'

  return (
    <section
      aria-label="Status pengajuan keringanan pembayaran"
      className={`mt-4 rounded-2xl border p-4 shadow-sm ${kelasToneKeringanan(tone)}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-current shadow-sm">
          <FileText className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide opacity-90">Pengajuan keringanan pembayaran</p>
          <h2 className="mt-1 text-sm font-extrabold">Status: {labelStatus}</h2>
          {judul !== labelStatus ? <p className="mt-1 text-xs font-bold">{judul}</p> : null}
          <p className="mt-2 text-xs font-medium leading-relaxed opacity-95">{deskripsi}</p>

          {tampilkanRingkasanKeuangan ? (
            <dl className="mt-3 space-y-1.5 rounded-xl border border-current/15 bg-white/50 px-3 py-2.5 text-xs">
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-0.5">
                <dt className="font-semibold opacity-90">Sisa tunggakan (AMPSS)</dt>
                <dd className="font-black tabular-nums">{rupiahKeringanan(sisaTunggakan)}</dd>
              </div>
              <div>
                <dt className="font-semibold opacity-90">Komitmen kesanggupan</dt>
                <dd className="mt-0.5 font-bold tabular-nums">
                  {/^\d+$/.test(pengajuan.kesanggupanBayar.trim())
                    ? rupiahKeringanan(Number(pengajuan.kesanggupanBayar))
                    : pengajuan.kesanggupanBayar}
                </dd>
              </div>
              <div>
                <dt className="font-semibold opacity-90">Target rencana pelunasan</dt>
                <dd className="mt-0.5 font-medium">{formatTanggalKeringanan(pengajuan.tanggalRencanaLunas)}</dd>
              </div>
            </dl>
          ) : null}

          <Link
            href="/keuangan#keringanan"
            className="mt-3 inline-flex rounded-xl border border-current/25 bg-white/70 px-3.5 py-2 text-[11px] font-bold hover:bg-white"
          >
            {pengajuan.statusPersetujuan === 'Disetujui' && !suratTerkirim
              ? 'Lengkapi surat resmi di Keuangan'
              : 'Buka halaman Keuangan'}
          </Link>
        </div>
      </div>
    </section>
  )
}