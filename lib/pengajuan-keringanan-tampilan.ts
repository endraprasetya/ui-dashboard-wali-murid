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
  const suratTerkirim = Boolean(pengajuan.suratResmiDikirimPada?.trim())

  if (pengajuan.statusPersetujuan === 'Pending') {
    return {
      tone: 'amber',
      labelStatus: 'Menunggu Persetujuan Kepala Sekolah',
      judul: 'Pengajuan keringanan sedang diproses',
      deskripsi:
        'Permohonan keringanan Anda telah dikirim dan sedang menunggu persetujuan Kepala Sekolah. Anda akan mendapat tahu setelah keputusan diterbitkan.',
    }
  }

  if (pengajuan.statusPersetujuan === 'Ditolak') {
    return {
      tone: 'rose',
      labelStatus: 'Ditolak',
      judul: 'Pengajuan keringanan ditolak',
      deskripsi:
        pengajuan.catatanKeputusan?.trim() ||
        'Pengajuan tidak disetujui. Anda dapat mengajukan permohonan kembali dari halaman Keuangan jika diperlukan.',
    }
  }

  if (pengajuan.statusPersetujuan === 'Disetujui' && !suratTerkirim) {
    return {
      tone: 'emerald',
      labelStatus: 'Disetujui',
      judul: 'Pengajuan disetujui, silakan lengkapi surat resmi',
      deskripsi:
        'Keputusan persetujuan telah diterbitkan. Silakan lengkapi dan kirim Surat Resmi Pernyataan Kesanggupan di bagian Keuangan.',
    }
  }

  return {
    tone: 'sky',
    labelStatus: 'Surat resmi telah dikirim.',
    judul: 'Surat resmi telah dikirim.',
    deskripsi: 'Segera lakukan kesanggupannya sesuai surat tersebut.',
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