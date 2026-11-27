import 'server-only'

import type { DataDiri } from '@/lib/data-diri-shared'
import { formatTanggalRingkas, text } from '@/lib/format'
import {
  kanonUnitSekolah,
  KATEGORI_PENGADUAN_WALI,
  normalisasiNoWa,
  validasiNoWa,
  type KategoriPengaduanWali,
  type PengaduanWaliRiwayatItem,
  type StatusAlurPengaduan,
  type TipeLampiranPengaduan,
} from '@/lib/pengaduan-wali-shared'
import { getSupabase } from '@/lib/supabase'

const TABEL = 'pengaduan_wali_murid'

export function namaWaliDariDataDiri(diri: DataDiri | null | undefined) {
  const wali = String(diri?.nama_wali || '').trim()
  if (wali) return wali
  const ayah = String(diri?.nama_ayah || '').trim()
  return ayah
}

export function noWaDariDataDiri(diri: DataDiri | null | undefined) {
  return String(diri?.telepon || '').trim()
}

export async function kirimPengaduanWaliKeDb(input: {
  idSiswa: string
  nis: string
  unit: string
  namaWaliMurid: string
  noWa: string
  namaAnak: string
  kelasAnak: string
  kategori: string
  isiPengaduan: string
  lampiranUrl?: string | null
  lampiranTipe?: TipeLampiranPengaduan | null
}) {
  const kategori = String(input.kategori || '').trim()
  if (!KATEGORI_PENGADUAN_WALI.includes(kategori as KategoriPengaduanWali)) {
    throw new Error('Kategori pengaduan belum dipilih.')
  }
  const namaWali = input.namaWaliMurid.trim()
  const galatWa = validasiNoWa(input.noWa)
  if (galatWa) throw new Error(galatWa)
  const noWa = normalisasiNoWa(input.noWa)
  const unit = kanonUnitSekolah(input.unit)
  if (!unit) throw new Error('Unit ananda belum terbaca. Pengaduan tidak dapat dikirim.')
  const isi = input.isiPengaduan.trim()
  if (namaWali.length < 3) throw new Error('Nama wali murid wajib diisi (minimal 3 karakter).')
  if (isi.length < 15) throw new Error('Isi pengaduan terlalu singkat. Tuliskan lebih jelas (min. 15 karakter).')
  if (isi.length > 5000) throw new Error('Isi pengaduan melebihi batas 5000 karakter.')

  const supabase = getSupabase()
  const baris = {
    id_siswa: input.idSiswa,
    nis: input.nis,
    unit,
    nama_wali_murid: namaWali.slice(0, 200),
    no_wa: noWa.slice(0, 20),
    nama_anak: input.namaAnak.slice(0, 200),
    kelas_anak: input.kelasAnak.slice(0, 40),
    kategori,
    isi_pengaduan: isi,
    lampiran_url: input.lampiranUrl?.trim() || null,
    lampiran_tipe: input.lampiranTipe || null,
    status_alur: 'masuk' as const,
  }
  const { error } = await supabase.from(TABEL).insert(baris)
  if (error) throw new Error(error.message || 'Pengaduan belum dapat disimpan.')
}

const KOLOM_RIWAYAT =
  'id,created_at,kategori,isi_pengaduan,status_alur,tindak_lanjut_jawaban,respon_penerima,ditindaklanjuti_pada,direspon_pada'

function petakanRiwayat(row: Record<string, unknown>): PengaduanWaliRiwayatItem | null {
  const id = text(row.id)
  if (!id) return null
  const status = text(row.status_alur) as StatusAlurPengaduan
  if (!['masuk', 'ditangani_ks', 'diteruskan', 'selesai'].includes(status)) return null
  const jawaban = text(row.tindak_lanjut_jawaban) || text(row.respon_penerima)
  const tanggalTl = text(row.ditindaklanjuti_pada) || text(row.direspon_pada)
  return {
    id,
    tanggalKirim: formatTanggalRingkas(row.created_at),
    kategori: text(row.kategori) || 'Lain-lain',
    isiPengaduan: text(row.isi_pengaduan),
    statusAlur: status,
    jawabanSekolah: jawaban,
    tanggalTindakLanjut: tanggalTl ? formatTanggalRingkas(tanggalTl) : '',
  }
}

export async function muatRiwayatPengaduanWali(idSiswa: string): Promise<PengaduanWaliRiwayatItem[]> {
  const kunci = String(idSiswa || '').trim()
  if (!kunci) return []
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from(TABEL)
    .select(KOLOM_RIWAYAT)
    .eq('id_siswa', kunci)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw new Error(error.message || 'Riwayat pengaduan belum dapat dimuat.')
  return (data || [])
    .map((row) => petakanRiwayat(row as Record<string, unknown>))
    .filter((item): item is PengaduanWaliRiwayatItem => Boolean(item))
}