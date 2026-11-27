import { Wallet } from 'lucide-react'
import { KotakRingkas } from '@/components/dashboard/kotak-ringkas'
import { rupiahKeringanan } from '@/lib/pengajuan-keringanan-tampilan'

export function InformasiKeuanganBeranda({
  error,
  belumTerbayar,
  terbayar,
  yatim,
}: {
  error: string | null
  belumTerbayar: number
  terbayar: number
  yatim?: boolean
}) {
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
        </div>
      </KotakRingkas>
    </>
  )
}
