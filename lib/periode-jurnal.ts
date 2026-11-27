export type PeriodeJurnalKhusus = 'asas' | 'libur'

/** Rentang kalender WIB, inklusif. Di luar kedua rentang tidak ada banner khusus. */
export function periodeJurnalKhusus(hariIni: string): PeriodeJurnalKhusus | null {
  if (hariIni >= '2026-11-23' && hariIni <= '2026-12-17') return 'asas'
  if (hariIni >= '2026-12-21' && hariIni <= '2027-01-03') return 'libur'
  return null
}
