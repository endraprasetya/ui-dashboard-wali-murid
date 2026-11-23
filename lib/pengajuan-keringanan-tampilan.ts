export const STATUS_PENGAJUAN_KERINGANAN = ['Pending', 'Disetujui', 'Ditolak'] as const
export type StatusPengajuanKeringanan = (typeof STATUS_PENGAJUAN_KERINGANAN)[number]

export type PengajuanKeringanan = {
  id: string
  nis: string
  namaSiswa: string
  kelas: string
  unit: string
  nominalTunggakan: number
  kesanggupanBayar: string
  alasanPengajuan: string
  jenisKegiatan: string
  mekanismePelunasan: string
  nominalAngsuran: number
  nomorSurat: string
  tanggalRencanaLunas: string
  statusPersetujuan: StatusPengajuanKeringanan
  nomorSuratRekomendasi: string
  catatanKeputusan: string
  dibuatPada: string
  diperbaruiPada: string
  diputuskanPada: string
  suratResmiIsi: string
  suratResmiDikirimPada: string
}

export const JENIS_KEGIATAN_PENGAJUAN = [
  'ASTS I',
  'Pengambilan rapor ASTS I',
  'ASAS',
  'Pengambilan rapor ASAS',
  'ASTS II',
  'Pengambilan rapor ASTS II',
  'ASAT',
  'Pengambilan rapor ASAT',
] as const

export const MEKANISME_PELUNASAN = ['Cash / Tunai', 'Mengangsur tiap bulan'] as const

export type JenisKegiatanPengajuan = (typeof JENIS_KEGIATAN_PENGAJUAN)[number]
export type MekanismePelunasan = (typeof MEKANISME_PELUNASAN)[number]

export function judulPengajuanKegiatan(jenis?: string) {
  const nama = String(jenis || '').trim()
  return nama ? `Pengajuan mengikuti kegiatan ${nama}` : 'Pengajuan mengikuti kegiatan'
}

export function labelMekanismePelunasan(pengajuan: Pick<PengajuanKeringanan, 'mekanismePelunasan' | 'nominalAngsuran' | 'kesanggupanBayar'>) {
  const teks = `${pengajuan.mekanismePelunasan} ${pengajuan.kesanggupanBayar}`.toLowerCase()
  if (pengajuan.nominalAngsuran > 0 || /angsur/.test(teks)) {
    return pengajuan.nominalAngsuran > 0
      ? `Mengangsur tiap bulan · ${rupiahKeringanan(pengajuan.nominalAngsuran)}`
      : 'Mengangsur tiap bulan'
  }
  return 'Cash / Tunai'
}

export function tanggalLokalJakarta(offsetHari = 0) {
  const hariIni = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  if (offsetHari === 0) return hariIni
  const [tahun, bulan, tanggal] = hariIni.split('-').map(Number)
  return new Date(Date.UTC(tahun, bulan - 1, tanggal + offsetHari)).toISOString().slice(0, 10)
}

export function statusDisetujuiKegiatan(jenis?: string) {
  const nama = String(jenis || '').trim() || 'kegiatan'
  return `Pengajuan mengikuti ${nama} telah disetujui oleh Kepala Sekolah`
}

export function keteranganPelunasanPengajuan(pengajuan: Pick<PengajuanKeringanan, 'nominalTunggakan' | 'nominalAngsuran' | 'mekanismePelunasan' | 'tanggalRencanaLunas'>) {
  const tunggakan = rupiahKeringanan(pengajuan.nominalTunggakan)
  const mengangsur = pengajuan.nominalAngsuran > 0 || /angsur/i.test(pengajuan.mekanismePelunasan)
  if (mengangsur && pengajuan.nominalAngsuran > 0) {
    return `Sesuai dengan pernyataan yang dibuat, tunggakan sebesar ${tunggakan} akan diangsur setiap bulan sebesar ${rupiahKeringanan(pengajuan.nominalAngsuran)}`
  }
  const tanggal = formatTanggalKeringanan(pengajuan.tanggalRencanaLunas) || 'tanggal yang direncanakan'
  return `Sesuai dengan pernyataan yang dibuat, tunggakan sebesar ${tunggakan} akan dilunasi secara tunai pada tanggal ${tanggal}`
}

export const KLAUSUL_SURAT_KERINGANAN_WAJIB =
  'Surat pernyataan ini dibuat dalam keadaan sadar dan tanpa paksaan dari pihak mana pun.'

export function rupiahKeringanan(nilai: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(nilai)
}

export function formatTanggalKeringanan(iso?: string) {
  if (!iso) return ''
  const saat = new Date(iso)
  if (Number.isNaN(saat.getTime())) return ''
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(saat)
}

export type ToneStatusKeringanan = 'amber' | 'emerald' | 'sky' | 'rose'

export type RingkasanStatusKeringanan = {
  tone: ToneStatusKeringanan
  judul: string
  deskripsi: string
  labelStatus: string
}

/** Teks notice/banner status pengajuan keringanan (Keuangan & Beranda). */
export function ringkasanStatusKeringanan(pengajuan: PengajuanKeringanan): RingkasanStatusKeringanan {
  const judul = judulPengajuanKegiatan(pengajuan.jenisKegiatan)

  if (pengajuan.statusPersetujuan === 'Pending') {
    return {
      tone: 'amber',
      labelStatus: 'Menunggu persetujuan Kepala Sekolah',
      judul,
      deskripsi: 'Pengajuan telah dikirim dan sedang menunggu persetujuan Kepala Sekolah.',
    }
  }

  if (pengajuan.statusPersetujuan === 'Ditolak') {
    return {
      tone: 'rose',
      labelStatus: 'Pengajuan ditolak',
      judul,
      deskripsi:
        pengajuan.catatanKeputusan?.trim() ||
        'Pengajuan tidak disetujui. Anda dapat mengajukan permohonan kembali dari halaman Keuangan jika diperlukan.',
    }
  }

  return {
    tone: 'emerald',
    labelStatus: statusDisetujuiKegiatan(pengajuan.jenisKegiatan),
    judul,
    deskripsi: keteranganPelunasanPengajuan(pengajuan),
  }
}

export function kelasToneKeringanan(tone: ToneStatusKeringanan) {
  switch (tone) {
    case 'emerald':
      return 'border-emerald-300 bg-emerald-50 text-emerald-950'
    case 'sky':
      return 'border-sky-300 bg-sky-50 text-sky-950'
    case 'rose':
      return 'border-rose-300 bg-rose-50 text-rose-950'
    default:
      return 'border-amber-300 bg-amber-50 text-amber-950'
  }
}