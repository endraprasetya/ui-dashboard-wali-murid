/** Pengingat syarat ujian ASAS di beranda Portal Wali: tampil s.d. 2 Desember 2026 23.59 WIB. */
export const BATAS_PENGINGAT_ASAS_WIB = '2026-12-02T23:59:59+07:00'

export const SYARAT_UJIAN_ASAS = [
  'Lunas SPP s.d. bulan November 2026',
  'Lunas biaya ASAS I sebesar Rp. 50.000,-',
  'Lunas biaya catering s.d. bulan November 2026',
  'Lunas biaya Ekstrakurikuler',
  'Pembayaran daftar ulang PSB minimal 60% (khusus siswa kelas 1)',
  'Lunas Biaya PSB (khusus siswa kelas 2 sampai kelas 6)',
] as const

export function pengingatAsasAktif(sekarang = new Date()) {
  return sekarang.getTime() <= Date.parse(BATAS_PENGINGAT_ASAS_WIB)
}