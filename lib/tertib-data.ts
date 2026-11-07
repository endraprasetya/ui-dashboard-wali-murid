import { currentMonthKey, formatDisplayDate, formatMonthLabel, text } from '@/lib/format'
import type { TertibData, TertibEntry } from '@/lib/queries'
import { hitungSaldoTertibBulanan, MODAL_POIN_BULANAN, tigaBesarKelas, type BarisPeringkatKelas } from '@/lib/tertib-saldo'

export const TERTIB_POINT_SELECT =
  'id_tertib_point, id_siswa, label, pts, guru, bulan, keterangan, created_at'

function barisKeEntry(row: Record<string, unknown>, index: number): TertibEntry {
  return {
    id: text(row.id_tertib_point) || `tertib-${index}`,
    label: text(row.label) || 'Catatan ketertiban',
    points: Number(row.pts) || 0,
    teacher: text(row.guru) || '-',
    month:
      formatMonthLabel(row.bulan) !== '-' ? formatMonthLabel(row.bulan) : formatDisplayDate(row.created_at),
    keterangan: text(row.keterangan),
  }
}

export function buildTertibData(
  rows: Record<string, unknown>[] | null | undefined,
  idSiswa: string,
  bulan = currentMonthKey(),
): TertibData {
  const bulanLabel = formatMonthLabel(bulan)
  const bulanRows = (rows ?? []).filter((row) => text(row.bulan) === bulan)
  const items = bulanRows.map(barisKeEntry)

  const logs = bulanRows.map((row) => ({
    sid: text(row.id_siswa) || idSiswa,
    month: text(row.bulan) || bulan,
    pts: Number(row.pts) || 0,
  }))

  const saldo = hitungSaldoTertibBulanan(logs, idSiswa, bulan)

  return {
    modal: saldo.modal,
    sisa: saldo.sisa,
    total: saldo.sisa,
    prestasi: saldo.positif,
    pelanggaran: saldo.negatif,
    bulan,
    bulanLabel,
    items,
  }
}

export function emptyTertibData(bulan = currentMonthKey()): TertibData {
  const saldo = hitungSaldoTertibBulanan([], '', bulan)
  return {
    modal: saldo.modal,
    sisa: saldo.sisa,
    total: saldo.sisa,
    prestasi: 0,
    pelanggaran: 0,
    bulan,
    bulanLabel: formatMonthLabel(bulan),
    items: [],
  }
}

export function mapPeringkatKelas(
  siswaKelas: { id_siswa: unknown; nama_siswa: unknown; kelas: unknown }[],
  logs: Record<string, unknown>[],
  bulan: string,
): BarisPeringkatKelas[] {
  const daftar = siswaKelas.map((row) => ({
    id: text(row.id_siswa),
    name: text(row.nama_siswa) || '-',
    kelas: text(row.kelas),
  }))
  const barisLog = logs.map((row) => ({
    sid: text(row.id_siswa),
    month: text(row.bulan) || bulan,
    pts: Number(row.pts) || 0,
  }))
  return tigaBesarKelas(daftar, barisLog, bulan, 3)
}

export { MODAL_POIN_BULANAN }
