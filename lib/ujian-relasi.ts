import { labelPredikatUjian } from '@/lib/ujian-predikat'

export type RekapanRingkas = {
  id_ujian?: string
  id_siswa?: string
  jilid_asal?: string
  jilid_tujuan?: string
  keputusan?: string
  predikat?: string
  nilai_akhir?: number | string | null
  tanggal_ujian?: string
  penguji?: string
  nama?: string
  kelas?: string
  unit?: string
  guru_pengampu?: string
  keterangan?: string
  kelancaran?: number | string | null
  makhraj?: number | string | null
  harakat?: number | string | null
  tajwid?: number | string | null
  adab?: number | string | null
  kelebihan_siswa?: string | null
}

export function catatanPenguji(rekap?: RekapanRingkas | null) {
  const ket = String(rekap?.keterangan || '').trim()
  if (ket && ket !== '-') return ket
  const kelebihan = String(rekap?.kelebihan_siswa || '').trim()
  if (kelebihan && kelebihan !== '-') return kelebihan
  return ''
}

export function ringkasHasil(rekap?: RekapanRingkas | null) {
  if (!rekap) return ''
  const keputusan = String(rekap.keputusan || 'Selesai').trim()
  const predikat = labelPredikatUjian(rekap.predikat)
  const nilai = rekap.nilai_akhir != null && String(rekap.nilai_akhir).trim() !== '' ? `nilai ${rekap.nilai_akhir}` : ''
  return [keputusan, predikat, nilai].filter(Boolean).join(' · ')
}
