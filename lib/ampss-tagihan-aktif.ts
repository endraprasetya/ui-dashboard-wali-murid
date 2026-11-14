import type { TagihanAmpss } from '@/lib/ampss-parse'

const BULAN = ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni']

export function tanggalJakarta(sekarang = new Date()): Date {
  const bagian = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(sekarang)
  const angka = (tipe: Intl.DateTimeFormatPartTypes) => Number(bagian.find((item) => item.type === tipe)?.value)
  return new Date(angka('year'), angka('month') - 1, angka('day'))
}

export function kunciBulanBerjalan(sekarang = new Date()): string {
  const batas = tanggalJakarta(sekarang)
  return `${batas.getFullYear()}-${String(batas.getMonth() + 1).padStart(2, '0')}`
}

function indeksBulanKode(kode: string): number | null {
  const cocok = String(kode || '')
    .trim()
    .toUpperCase()
    .match(/(?:SYA|KTR)(\d{1,3})/)
  if (!cocok) return null
  const nomor = Number(cocok[1])
  if (nomor < 1 || nomor > 12) return null
  return nomor - 1
}

function indeksBulanDariNama(item?: string): number | null {
  const rendah = String(item || '').toLowerCase()
  if (!rendah || !/(syahriah|syahriyah|spp|katering|catering)/.test(rendah)) return null
  const indeks = BULAN.findIndex((nama) => new RegExp(`(^|[^a-z])${nama.toLowerCase()}([^a-z]|$)`, 'i').test(rendah))
  return indeks >= 0 ? indeks : null
}

function tahunMulaiTapel(tapel: string, sekarang = new Date()): number {
  const angka = String(tapel || '').replace(/\D/g, '')
  if (angka.length >= 4) return 2000 + Number(angka.slice(0, 2))
  if (angka.length === 2) return 2000 + Number(angka)
  const batas = tanggalJakarta(sekarang)
  return batas.getMonth() >= 6 ? batas.getFullYear() : batas.getFullYear() - 1
}

function periodeDariIndeks(indeks: number, tapel: string, sekarang = new Date()): { kunci: string; label: string } {
  const tahunMulai = tahunMulaiTapel(tapel, sekarang)
  const tahun = indeks <= 5 ? tahunMulai : tahunMulai + 1
  const bulan = indeks <= 5 ? 6 + indeks : indeks - 6
  return {
    kunci: `${tahun}-${String(bulan + 1).padStart(2, '0')}`,
    label: `${BULAN[indeks]} ${tahun}`,
  }
}

function periodeBulanTagihan(
  tapel: string,
  kode: string,
  item?: string,
  sekarang = new Date(),
): { kunci: string; label: string } | null {
  const indeks = indeksBulanKode(kode) ?? indeksBulanDariNama(item)
  if (indeks == null) return null
  return periodeDariIndeks(indeks, tapel, sekarang)
}

/** Tagihan bulanan (SPP/syahriah & katering) hanya aktif s.d. bulan berjalan (WIB). */
export function tagihanJatuhTempo(
  baris: { tapel: string; kode?: string; keterangan?: string; item?: string },
  sekarang = new Date(),
): boolean {
  const kode = baris.kode || ''
  const item = baris.keterangan || baris.item
  const periode = periodeBulanTagihan(baris.tapel, kode, item, sekarang)
  if (!periode) return true
  return periode.kunci <= kunciBulanBerjalan(sekarang)
}

export function saringTagihanBelumTerbayarWali(daftar: TagihanAmpss[], sekarang = new Date()): TagihanAmpss[] {
  return daftar.filter((baris) => baris.jumlah > 0 && tagihanJatuhTempo(baris, sekarang))
}

export function teksBatasBulanBerjalan(sekarang = new Date()) {
  const batas = tanggalJakarta(sekarang)
  const label = batas.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  return `Tagihan bulanan (SPP/Syahriah & katering) dihitung sampai ${label}. Tagihan bulan mendatang tidak masuk total maupun tabel aktif.`
}