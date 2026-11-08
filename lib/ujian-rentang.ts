import { todayIso } from '@/lib/format'

/** ISO tanggal (YYYY-MM-DD) ≥ hari ini − N hari (zona Jakarta). */
export function batasHariLalu(isoHariIni: string, hari = 5) {
  const [y, m, d] = isoHariIni.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d))
  t.setUTCDate(t.getUTCDate() - hari)
  return t.toISOString().slice(0, 10)
}

export function dalamLimaHariSejakUjian(tanggalUjian?: string, hari = 5) {
  const t = String(tanggalUjian || '').slice(0, 10)
  if (!t) return false
  const hariIni = todayIso()
  const batas = batasHariLalu(hariIni, hari)
  return t >= batas && t <= hariIni
}
