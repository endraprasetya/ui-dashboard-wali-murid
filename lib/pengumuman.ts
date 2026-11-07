import { educationCalendar } from '@/lib/teacher-data'

const BULAN: Record<string, number> = {
  januari: 0,
  jan: 0,
  februari: 1,
  feb: 1,
  maret: 2,
  mar: 2,
  april: 3,
  apr: 3,
  mei: 4,
  juni: 5,
  jun: 5,
  juli: 6,
  jul: 6,
  agustus: 7,
  agu: 7,
  agt: 7,
  september: 8,
  sep: 8,
  oktober: 9,
  okt: 9,
  november: 10,
  nov: 10,
  desember: 11,
  des: 11,
}

export type AgendaPengumuman = (typeof educationCalendar)[number] & { mulai: Date | null }

function awalHari(waktu = new Date()) {
  return new Date(waktu.getFullYear(), waktu.getMonth(), waktu.getDate())
}

export function tanggalMulaiAgenda(detail: string): Date | null {
  const pola = /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/
  const cocok = detail.match(pola)
  if (!cocok) return null
  const bulan = BULAN[cocok[2].toLowerCase()]
  if (bulan == null) return null
  const tanggal = new Date(Number(cocok[3]), bulan, Number(cocok[1]))
  return Number.isNaN(tanggal.getTime()) ? null : tanggal
}

export function agendaDenganTanggal(): AgendaPengumuman[] {
  return educationCalendar.map((item) => ({
    ...item,
    mulai: tanggalMulaiAgenda(item.detail),
  }))
}

export function agendaTerurut(): AgendaPengumuman[] {
  return [...agendaDenganTanggal()].sort(
    (kiri, kanan) => (kiri.mulai?.getTime() ?? Number.MAX_SAFE_INTEGER) - (kanan.mulai?.getTime() ?? Number.MAX_SAFE_INTEGER),
  )
}

/** Agenda mulai hari ini atau setelahnya, diurutkan paling dekat dulu. */
export function agendaMendatang(batas = 2, sekarang = new Date()): AgendaPengumuman[] {
  const hariIni = awalHari(sekarang)
  return agendaDenganTanggal()
    .filter((item) => item.mulai && item.mulai.getTime() >= hariIni.getTime())
    .sort((kiri, kanan) => kiri.mulai!.getTime() - kanan.mulai!.getTime())
    .slice(0, batas)
}
