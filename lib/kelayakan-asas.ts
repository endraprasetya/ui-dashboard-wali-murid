import type { TagihanAmpss } from '@/lib/ampss-parse'
import { periodeBulanTagihan } from '@/lib/ampss-tagihan-aktif'
import { jenjangDariKelas } from '@/lib/jadwal-asas'

/** Teks banner tetap “minimal 60%”. Kelolosan kelas 1 dihitung dari sisa tunggakan. */
export const BATAS_BULAN_SYARAT_ASAS = '2026-11'
export const BATAS_TUNGGAKAN_PSB_KELAS_1_PUTRI = 2_400_000
export const BATAS_TUNGGAKAN_PSB_KELAS_1_PUTRA = 2_312_000

export type JenisKelaminAsas = 'Putra' | 'Putri'

function teks(nilai: string) {
  return nilai
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Jenis kelamin dari data diri. Jika kosong, rombel C/D dibaca Putri dan A/B dibaca Putra. */
export function jenisKelaminAsas(jenisKelamin: string | undefined, kelas: string): JenisKelaminAsas {
  const mentah = teks(String(jenisKelamin || ''))
  if (/\b(perempuan|putri|wanita)\b/.test(mentah) || mentah === 'p') return 'Putri'
  if (/\b(laki laki|pria|putra)\b/.test(mentah) || mentah === 'l') return 'Putra'
  const rapat = String(kelas || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
  if (rapat.includes('putri') || /[cd]$/.test(rapat)) return 'Putri'
  return 'Putra'
}

function dikecualikan(keterangan: string) {
  const nama = teks(keterangan)
  if (/\bbuku\b/.test(nama)) return true
  if (/\btka\b/.test(nama)) return true
  if (nama.includes('test kemampuan akademik') || nama.includes('tes kemampuan akademik')) return true
  return false
}

function adalahSpp(keterangan: string) {
  return /\b(syahriah|syahriyah|spp)\b/.test(teks(keterangan))
}

function adalahCatering(keterangan: string) {
  return /\b(katering|catering)\b/.test(teks(keterangan))
}

function adalahAsasI(keterangan: string) {
  const nama = teks(keterangan)
  if (/\basts\b/.test(nama) || nama.includes('tengah semester')) return false
  if (/\basat\b/.test(nama) || nama.includes('akhir tahun')) return false
  if (/\basas ii\b|\basas 2\b/.test(nama)) return false
  if (/\basas\b/.test(nama)) return true
  if (nama.includes('penilaian akhir semester 1') || nama.includes('penilaian akhir semester gasal')) return true
  if (nama.includes('akhir semester 1') || nama.includes('akhir semester gasal')) return true
  return false
}

function adalahEkskul(keterangan: string) {
  return /\b(ekskul|ekstrakurikuler|ekstra kurikuler)\b/.test(teks(keterangan))
}

function adalahPsb(keterangan: string) {
  return /\b(psb|daftar ulang|pendaftaran siswa baru)\b/.test(teks(keterangan))
}

function dalamBatasNovember(baris: TagihanAmpss) {
  const periode = periodeBulanTagihan(baris.tapel, '', baris.keterangan)
  if (!periode) return true
  return periode.kunci <= BATAS_BULAN_SYARAT_ASAS
}

export function batasTunggakanPsbKelas1(jenis: JenisKelaminAsas) {
  return jenis === 'Putri' ? BATAS_TUNGGAKAN_PSB_KELAS_1_PUTRI : BATAS_TUNGGAKAN_PSB_KELAS_1_PUTRA
}

/**
 * true bila SPP, biaya ASAS I, catering, ekstrakurikuler, dan PSB memenuhi syarat.
 * Kelas 1 lolos PSB selama sisa tunggakan di bawah batas Putra/Putri.
 * Kelas 2–6 lolos PSB hanya jika sisa tunggakan PSB habis.
 */
export function memenuhiSyaratAdministrasiAsas(input: {
  kelas: string
  jenisKelamin?: string
  tagihan: TagihanAmpss[]
}) {
  const aktif = input.tagihan.filter((item) => item.jumlah > 0 && !dikecualikan(item.keterangan))
  const spp = aktif.some((item) => adalahSpp(item.keterangan) && dalamBatasNovember(item))
  const asas = aktif.some((item) => adalahAsasI(item.keterangan))
  const catering = aktif.some((item) => adalahCatering(item.keterangan) && dalamBatasNovember(item))
  const ekskul = aktif.some((item) => adalahEkskul(item.keterangan))
  const sisaPsb = aktif.filter((item) => adalahPsb(item.keterangan)).reduce((jumlah, item) => jumlah + item.jumlah, 0)
  const jenjang = jenjangDariKelas(input.kelas)
  const jenis = jenisKelaminAsas(input.jenisKelamin, input.kelas)
  const psbLolos = jenjang === 1 ? sisaPsb < batasTunggakanPsbKelas1(jenis) : sisaPsb <= 0
  return !spp && !asas && !catering && !ekskul && psbLolos
}

/** Kotak pengajuan tampil bila masih ada tunggakan di luar sisa PSB kelas 1 yang sudah di bawah batas. */
export function perluPengajuanKarenaTagihan(input: {
  kelas: string
  jenisKelamin?: string
  tagihan: TagihanAmpss[]
  yatim?: boolean
}) {
  if (input.yatim) return false
  const aktif = input.tagihan.filter((item) => item.jumlah > 0)
  if (aktif.length === 0) return false
  if (!memenuhiSyaratAdministrasiAsas(input)) return true
  const jenjang = jenjangDariKelas(input.kelas)
  const jenis = jenisKelaminAsas(input.jenisKelamin, input.kelas)
  const sisaPsb = aktif.filter((item) => adalahPsb(item.keterangan)).reduce((jumlah, item) => jumlah + item.jumlah, 0)
  const psbAman = jenjang === 1 && sisaPsb < batasTunggakanPsbKelas1(jenis)
  return aktif.some((item) => !(psbAman && adalahPsb(item.keterangan)))
}
