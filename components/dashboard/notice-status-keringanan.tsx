import type { PengajuanKeringanan } from '@/lib/pengajuan-keringanan-tampilan'
import { kelasToneKeringanan, ringkasanStatusKeringanan } from '@/lib/pengajuan-keringanan-tampilan'

/** Banner status permanen pengajuan keringanan (di bawah tombol di halaman Keuangan). */
export function NoticeStatusKeringanan({ pengajuan }: { pengajuan: PengajuanKeringanan }) {
  const { tone, deskripsi, labelStatus } = ringkasanStatusKeringanan(pengajuan)

  return (
    <aside
      className={`mt-3 rounded-xl border px-3 py-3 text-xs leading-relaxed ${kelasToneKeringanan(tone)}`}
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-extrabold">{labelStatus}</p>
      <p className="mt-1 font-medium opacity-95">{deskripsi}</p>
    </aside>
  )
}