import { formatDisplayDate, formatMonthLabel, text } from '@/lib/format'
import type { TertibData, TertibEntry } from '@/lib/queries'

export const TERTIB_POINT_SELECT =
  'id_tertib_point, id_siswa, label, pts, guru, bulan, keterangan, created_at'

export function buildTertibData(rows: Record<string, unknown>[] | null | undefined): TertibData {
  const items: TertibEntry[] = (rows ?? []).map((row, index) => ({
    id: text(row.id_tertib_point) || `tertib-${index}`,
    label: text(row.label) || 'Catatan ketertiban',
    points: Number(row.pts) || 0,
    teacher: text(row.guru) || '-',
    month:
      formatMonthLabel(row.bulan) !== '-' ? formatMonthLabel(row.bulan) : formatDisplayDate(row.created_at),
    keterangan: text(row.keterangan),
  }))

  const total = items.reduce((sum, item) => sum + item.points, 0)
  const prestasi = items.reduce((sum, item) => sum + (item.points > 0 ? item.points : 0), 0)
  const pelanggaran = items.reduce((sum, item) => sum + (item.points < 0 ? Math.abs(item.points) : 0), 0)

  return { total, prestasi, pelanggaran, items }
}
