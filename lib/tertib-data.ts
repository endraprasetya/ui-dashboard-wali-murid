import { currentMonthKey, dateValue, formatDisplayDate, formatMonthLabel, formatTanggalRingkas, text } from '@/lib/format'
import { unitLogin, unitSama } from '@/lib/unit-isolasi'
import type { TertibData, TertibEntry } from '@/lib/queries'
import { hitungSaldoTertibBulanan, MODAL_POIN_BULANAN, tigaBesarKelas, type BarisPeringkatKelas } from '@/lib/tertib-saldo'

export const TERTIB_POINT_SELECT =
  'id_tertib_point, id_siswa, label, pts, guru, bulan, keterangan, created_at'

function nilaiTanggalPencatatan(row: Record<string, unknown>) {
  return row.tanggal ?? row.tgl ?? row.created_at
}

function barisKeEntry(row: Record<string, unknown>, index: number): TertibEntry {
  const waktuCatat = nilaiTanggalPencatatan(row)
  return {
    id: text(row.id_tertib_point) || `tertib-${index}`,
    label: text(row.label) || 'Catatan ketertiban',
    points: Number(row.pts) || 0,
    teacher: text(row.guru) || '-',
    month:
      formatMonthLabel(row.bulan) !== '-' ? formatMonthLabel(row.bulan) : formatDisplayDate(row.created_at),
    keterangan: text(row.keterangan),
    tanggal: formatTanggalRingkas(waktuCatat),
  }
}

export function buildTertibData(
  rows: Record<string, unknown>[] | null | undefined,
  idSiswa: string,
  bulan = currentMonthKey(),
): TertibData {
  const bulanLabel = formatMonthLabel(bulan)
  const bulanRows = (rows ?? [])
    .filter((row) => text(row.bulan) === bulan)
    .slice()
    .sort((a, b) => dateValue(nilaiTanggalPencatatan(b)) - dateValue(nilaiTanggalPencatatan(a)))
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
  siswaKelas: { id_siswa: unknown; nama_siswa: unknown; kelas: unknown; unit?: unknown }[],
  logs: Record<string, unknown>[],
  bulan: string,
  unit?: string,
): BarisPeringkatKelas[] {
  const unitAktif = unitLogin(unit)
  const siswaTerfilter = unitAktif
    ? siswaKelas.filter((row) => unitSama(row.unit, unitAktif))
    : siswaKelas

  const daftar = siswaTerfilter.map((row) => ({
    id: text(row.id_siswa),
    name: text(row.nama_siswa) || '-',
    kelas: text(row.kelas),
  }))
  const idsValid = new Set(daftar.map((row) => row.id))
  const barisLog = logs
    .filter((row) => {
      const sid = text(row.id_siswa)
      if (!idsValid.has(sid)) return false
      if (unitAktif && row.unit != null && !unitSama(row.unit, unitAktif)) return false
      return true
    })
    .map((row) => ({
      sid: text(row.id_siswa),
      month: text(row.bulan) || bulan,
      pts: Number(row.pts) || 0,
    }))
  return tigaBesarKelas(daftar, barisLog, bulan, 3)
}

export { MODAL_POIN_BULANAN }
