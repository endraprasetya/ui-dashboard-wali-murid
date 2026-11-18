import 'server-only'

import {
  STATUS_PENGAJUAN_KERINGANAN,
  type PengajuanKeringanan,
  type StatusPengajuanKeringanan,
} from '@/lib/pengajuan-keringanan-tampilan'
import { unitLogin } from '@/lib/unit-isolasi'
import { getSupabase } from '@/lib/supabase'

export type { PengajuanKeringanan, StatusPengajuanKeringanan } from '@/lib/pengajuan-keringanan-tampilan'

const TABEL = 'tabel_pengajuan_keringanan'

const KOLOM_BALIK_INSERT =
  'id,unit,nis,nama_siswa,kelas,nominal_tunggakan,kesanggupan_bayar,tanggal_rencana_lunas,alasan_pengajuan,status_persetujuan,dibuat_pada'

const KOLOM_SURAT =
  'id,unit,nis,nama_siswa,kelas,nominal_tunggakan,kesanggupan_bayar,tanggal_rencana_lunas,alasan_pengajuan,status_persetujuan,surat_resmi_isi,surat_resmi_dikirim_pada,dibuat_pada'

function angkaNis(nilai: string) {
  return String(nilai || '').replace(/\D/g, '')
}

export function unitKeringanan(unit?: string | null) {
  const mentah = unitLogin(unit) || String(unit ?? '').trim()
  if (!mentah) return ''
  const k = mentah.toLowerCase()
  if (k.includes('kartasura')) return 'Kartasura'
  if (k.includes('cepogo')) return 'Cepogo'
  if (k.includes('nogosari')) return 'Nogosari'
  return mentah
}

export function nisUntukKeringanan(nis?: string, idSiswa?: string) {
  const dariNis = angkaNis(String(nis || ''))
  if (dariNis.length >= 3) return dariNis
  const dariId = angkaNis(String(idSiswa || ''))
  if (dariId.length >= 3) return dariId
  return String(nis || idSiswa || '').trim()
}

function statusSah(nilai: unknown): nilai is StatusPengajuanKeringanan {
  return (STATUS_PENGAJUAN_KERINGANAN as readonly string[]).includes(String(nilai || ''))
}

function petakan(row: Record<string, unknown>): PengajuanKeringanan | null {
  const status = row.status_persetujuan
  if (!statusSah(status)) return null
  const nis = String(row.nis || '').trim()
  if (!nis) return null
  return {
    id: String(row.id || ''),
    nis,
    namaSiswa: String(row.nama_siswa || ''),
    kelas: String(row.kelas || ''),
    unit: String(row.unit || ''),
    nominalTunggakan: Number(row.nominal_tunggakan) || 0,
    kesanggupanBayar: String(row.kesanggupan_bayar || ''),
    alasanPengajuan: String(row.alasan_pengajuan || ''),
    nomorSurat: String(row.nomor_surat || ''),
    tanggalRencanaLunas: String(row.tanggal_rencana_lunas || ''),
    statusPersetujuan: status,
    nomorSuratRekomendasi: String(row.nomor_surat_rekomendasi || ''),
    catatanKeputusan: String(row.catatan_kepsek || row.catatan_keputusan || ''),
    suratResmiIsi: String(row.surat_resmi_isi || ''),
    suratResmiDikirimPada: String(row.surat_resmi_dikirim_pada || ''),
    dibuatPada: String(row.dibuat_pada || ''),
    diperbaruiPada: String(row.diperbarui_pada || ''),
    diputuskanPada: String(row.tanggal_persetujuan || row.diputuskan_pada || ''),
  }
}

function isoDariTanggalJakarta(tanggal: string) {
  const cocok = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(tanggal || '').trim())
  if (!cocok) return ''
  const iso = `${cocok[1]}-${cocok[2]}-${cocok[3]}T23:59:00+07:00`
  const ms = Date.parse(iso)
  return Number.isFinite(ms) ? new Date(ms).toISOString() : ''
}

function nisSama(kiri: string, kanan: string) {
  const a = angkaNis(kiri)
  const b = angkaNis(kanan)
  return Boolean(a && b && a === b)
}

export function pengajuanTerbaru(daftar: PengajuanKeringanan[], ...kunci: string[]) {
  if (daftar.length === 0) return undefined
  const cocok = daftar.filter((item) => kunci.some((nilai) => nisSama(item.nis, nilai)))
  const sumber = cocok.length > 0 ? cocok : daftar
  return [...sumber].sort((a, b) => b.dibuatPada.localeCompare(a.dibuatPada))[0]
}

export async function muatPengajuanUntukNis(nis: string[]): Promise<PengajuanKeringanan[]> {
  const unik = [...new Set(nis.flatMap((nilai) => [String(nilai || '').trim(), angkaNis(nilai)]).filter(Boolean))]
  if (unik.length === 0) return []

  const supabase = getSupabase()
  let { data, error } = await supabase
    .from(TABEL)
    .select('*')
    .in('nis', unik)
    .order('dibuat_pada', { ascending: false })
    .limit(50)

  if (error) {
    console.error('pengajuan keringanan muat', error.message)
    const ulang = await supabase.from(TABEL).select('*').in('nis', unik).limit(50)
    data = ulang.data
    error = ulang.error
  }

  if (error) {
    console.error('pengajuan keringanan muat ulang', error.message)
    return []
  }

  return (data || []).map((row) => petakan(row as Record<string, unknown>)).filter((row): row is PengajuanKeringanan => Boolean(row))
}

export async function ajukanKeringanan(input: {
  nis: string
  namaSiswa: string
  kelas: string
  unit: string
  nominalTunggakan: number
  nominalKesanggupan: number
  tanggalRencanaLunas: string
  alasanPengajuan?: string
}) {
  const nis = nisUntukKeringanan(input.nis)
  const namaSiswa = String(input.namaSiswa || '').trim()
  const unit = unitKeringanan(input.unit)
  const kelas = String(input.kelas || '').trim()
  const tanggalRencanaLunas = isoDariTanggalJakarta(input.tanggalRencanaLunas)
  const rencana = new Date(tanggalRencanaLunas)
  const nominalKesanggupan = Math.round(Number(input.nominalKesanggupan))
  const nominalTunggakan = Math.round(Number(input.nominalTunggakan))

  if (!nis || nis.length < 3) throw new Error('NIS siswa belum terbaca. Lengkapi data siswa terlebih dahulu.')
  if (!namaSiswa) throw new Error('Nama siswa belum terbaca.')
  if (!unit) throw new Error('Unit ananda belum terbaca.')
  if (!(nominalTunggakan > 0)) throw new Error('Pengajuan hanya untuk ananda yang masih memiliki tunggakan.')
  if (!(nominalKesanggupan > 0)) throw new Error('Nominal kesanggupan bayar wajib diisi.')
  if (nominalKesanggupan > nominalTunggakan) {
    throw new Error('Nominal kesanggupan tidak boleh melebihi total tunggakan.')
  }
  if (!tanggalRencanaLunas || Number.isNaN(rencana.getTime())) {
    throw new Error('Tanggal rencana pelunasan tidak valid.')
  }

  const sudah = await muatPengajuanUntukNis([nis])
  const aktif = pengajuanTerbaru(sudah, nis)
  if (aktif?.statusPersetujuan === 'Pending') {
    throw new Error('Pengajuan sebelumnya masih menunggu persetujuan Kepala Sekolah.')
  }
  if (aktif?.statusPersetujuan === 'Disetujui') {
    throw new Error('Pengajuan ananda ini sudah disetujui.')
  }

  const alasan =
    String(input.alasanPengajuan || '').trim() ||
    'Permohonan keringanan atau penundaan pembayaran tagihan sekolah.'

  const baris = {
    unit,
    nis,
    nama_siswa: namaSiswa,
    kelas,
    nominal_tunggakan: nominalTunggakan,
    kesanggupan_bayar: String(nominalKesanggupan),
    tanggal_rencana_lunas: rencana.toISOString(),
    alasan_pengajuan: alasan.slice(0, 2000),
    status_persetujuan: 'Pending' as const,
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.from(TABEL).insert([baris]).select(KOLOM_BALIK_INSERT).single()

  if (error) throw new Error(error.message)

  const hasil = petakan(data as Record<string, unknown>)
  if (!hasil) throw new Error('Pengajuan tersimpan, tetapi balasan database belum dapat dibaca.')
  return hasil
}

export async function simpanSuratResmiKeringanan(
  idPengajuan: string,
  nis: string,
  isiSurat: string,
): Promise<PengajuanKeringanan> {
  const id = String(idPengajuan || '').trim()
  const nisSimpan = nisUntukKeringanan(nis)
  if (!id || !nisSimpan) throw new Error('Pengajuan tidak dikenali.')

  const supabase = getSupabase()
  const { data: ada, error: galatBaca } = await supabase.from(TABEL).select(KOLOM_SURAT).eq('id', id).maybeSingle()
  if (galatBaca) throw new Error(galatBaca.message)
  const baris = ada as Record<string, unknown> | null
  if (!baris) throw new Error('Pengajuan tidak ditemukan.')
  if (!nisSama(String(baris.nis || ''), nisSimpan)) throw new Error('Pengajuan tidak dikenali.')
  if (baris.status_persetujuan !== 'Disetujui') {
    throw new Error('Surat resmi hanya dapat dilengkapi setelah pengajuan disetujui Kepala Sekolah.')
  }
  if (String(baris.surat_resmi_dikirim_pada || '').trim()) {
    throw new Error('Surat resmi untuk pengajuan ini sudah dikirim.')
  }

  const teks = String(isiSurat || '').trim()
  if (teks.length < 40) throw new Error('Isi surat resmi belum lengkap.')

  const { data, error } = await supabase
    .from(TABEL)
    .update({
      surat_resmi_isi: teks.slice(0, 8000),
      surat_resmi_dikirim_pada: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status_persetujuan', 'Disetujui')
    .select(KOLOM_SURAT)
    .single()

  if (error) throw new Error(error.message)
  const hasil = petakan(data as Record<string, unknown>)
  if (!hasil) throw new Error('Surat resmi tersimpan, tetapi balasan database belum dapat dibaca.')
  return hasil
}