export const BUCKET_PENGADUAN_WALI = 'pengaduan-wali-murid'

export const KATEGORI_PENGADUAN_WALI = [
  'Pembelajaran dan perkembangan anak',
  'Pelayanan ustadz/ustadzah',
  'Tahfidz dan Al-Qur\'an',
  'Sarana dan prasarana',
  'Administrasi dan keuangan',
  'Kebersihan dan keamanan',
  'Lain-lain',
] as const

export type KategoriPengaduanWali = (typeof KATEGORI_PENGADUAN_WALI)[number]

export const STATUS_ALUR_PENGADUAN = ['masuk', 'ditangani_ks', 'diteruskan', 'selesai'] as const
export type StatusAlurPengaduan = (typeof STATUS_ALUR_PENGADUAN)[number]

export const KLASIFIKASI_PENGADUAN = ['ditangani_ks', 'diteruskan'] as const
export type KlasifikasiPengaduan = (typeof KLASIFIKASI_PENGADUAN)[number]

export type TipeLampiranPengaduan = 'image' | 'video' | 'document'

/** Batas file setelah kompresi (gambar) atau langsung diunggah (video/PDF). */
export const BATAS_LAMPIRAN = {
  image: 8 * 1024 * 1024,
  video: 15 * 1024 * 1024,
  document: 5 * 1024 * 1024,
} as const

/** Batas sumber gambar sebelum kompresi di perangkat. */
export const BATAS_GAMBAR_SEBELUM_KOMPRES = 25 * 1024 * 1024

export const SISI_MAKS_KOMPRES_GAMBAR = 1600

export const PANDUAN_LAMPIRAN_PENGADUAN =
  'Foto dikompresi otomatis agar hemat penyimpanan. Video maks. 15 MB, PDF maks. 5 MB. Untuk video panjang, kirim cuplikan singkat atau sertakan tautan Google Drive / YouTube di isi pengaduan.'

/** Samakan penamaan unit dengan Portal Guru (filter Dashboard Kepala Sekolah). */
export function kanonUnitSekolah(nilai?: string | null) {
  const mentah = String(nilai ?? '').trim().replace(/^unit\s+/i, '')
  const k = mentah.toLowerCase()
  if (!k || k.includes('belum diisi')) return ''
  if (k.includes('kartasura')) return 'Kartasura'
  if (k.includes('cepogo')) return 'Cepogo'
  if (k.includes('nogosari')) return 'Nogosari'
  return mentah
}

/** Hanya digit; nomor lokal 08… diubah menjadi 62… agar konsisten di database. */
export function normalisasiNoWa(mentah: string) {
  let digit = String(mentah || '').replace(/\D/g, '')
  if (digit.startsWith('0')) digit = `62${digit.slice(1)}`
  return digit
}

export function validasiNoWa(mentah: string): string | null {
  const digit = normalisasiNoWa(mentah)
  if (!digit) return 'Nomor WhatsApp wajib diisi.'
  if (digit.length < 8 || digit.length > 15) {
    return 'Nomor WhatsApp wajib berisi 8–15 digit angka (contoh: +62 851-2937-1560).'
  }
  return null
}

export function labelStatusAlurPengaduan(status: StatusAlurPengaduan) {
  switch (status) {
    case 'masuk':
      return 'Pengaduan masuk'
    case 'ditangani_ks':
      return 'Ditangani Kepala Sekolah'
    case 'diteruskan':
      return 'Diteruskan'
    case 'selesai':
      return 'Selesai'
  }
}