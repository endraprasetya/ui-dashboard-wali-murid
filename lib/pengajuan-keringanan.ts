import 'server-only'

import { unstable_noStore as noStore } from 'next/cache'
import {
  JENIS_KEGIATAN_PENGAJUAN,
  STATUS_PENGAJUAN_KERINGANAN,
  rupiahKeringanan,
  type PengajuanKeringanan,
  type StatusPengajuanKeringanan,
} from '@/lib/pengajuan-keringanan-tampilan'
import { unitLogin } from '@/lib/unit-isolasi'
import { getSupabase } from '@/lib/supabase'

export type { PengajuanKeringanan, StatusPengajuanKeringanan } from '@/lib/pengajuan-keringanan-tampilan'

const TABEL = 'tabel_pengajuan_keringanan'

const KOLOM_BALIK_INSERT =
  'id,unit,nis,nama_siswa,kelas,nominal_tunggakan,kesanggupan_bayar,tanggal_rencana_lunas,alasan_pengajuan,status_persetujuan,jenis_kegiatan,mekanisme_pelunasan,nominal_angsuran,dibuat_pada'

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
  const teks = String(nilai || '').trim()
  return (STATUS_PENGAJUAN_KERINGANAN as readonly string[]).includes(teks)
}

function mekanismeDariTeks(nilai: string, nominalAngsuran = 0) {
  const teks = nilai.toLowerCase()
  if (nominalAngsuran > 0 || /angsur/.test(teks)) return 'Mengangsur tiap bulan'
  if (/cash|tunai/.test(teks)) return 'Cash / Tunai'
  return String(nilai || '').trim()
}

function petakan(row: Record<string, unknown>): PengajuanKeringanan | null {
  const statusMentah = String(row.status_persetujuan || 'Pending').trim() || 'Pending'
  const status = statusSah(statusMentah) ? statusMentah : 'Pending'
  const nis = String(row.nis || '').trim()
  if (!nis) return null
  const nominalAngsuran = Number(row.nominal_angsuran) || 0
  const alasanPengajuan = String(row.alasan_pengajuan || '')
  const jenisDariAlasan = /^\[([^\]]+)\]/.exec(alasanPengajuan)?.[1] || ''
  return {
    id: String(row.id || ''),
    nis,
    namaSiswa: String(row.nama_siswa || ''),
    kelas: String(row.kelas || ''),
    unit: String(row.unit || ''),
    nominalTunggakan: Number(row.nominal_tunggakan) || 0,
    kesanggupanBayar: String(row.kesanggupan_bayar || ''),
    alasanPengajuan,
    jenisKegiatan: String(row.jenis_kegiatan || jenisDariAlasan || ''),
    mekanismePelunasan: mekanismeDariTeks(String(row.mekanisme_pelunasan || row.kesanggupan_bayar || alasanPengajuan || ''), nominalAngsuran),
    nominalAngsuran,
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
  noStore()
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
  jenisKegiatan: string
  mekanismePelunasan: string
  nominalAngsuran?: number
  tanggalRencanaLunas: string
  alasanPengajuan: string
}) {
  const nis = nisUntukKeringanan(input.nis)
  const namaSiswa = String(input.namaSiswa || '').trim()
  const unit = unitKeringanan(input.unit)
  const kelas = String(input.kelas || '').trim()
  const tanggalRencanaLunas = isoDariTanggalJakarta(input.tanggalRencanaLunas)
  const rencana = new Date(tanggalRencanaLunas)
  const nominalTunggakan = Math.round(Number(input.nominalTunggakan))
  const jenisKegiatan = String(input.jenisKegiatan || '').trim()
  const mekanismeMentah = String(input.mekanismePelunasan || '').trim()
  const alasan = String(input.alasanPengajuan || '').trim()
  const nominalAngsuran = Math.round(Number(input.nominalAngsuran) || 0)
  const mengangsur = /angsur/i.test(mekanismeMentah)
  const mekanismePelunasan = mengangsur ? 'Mengangsur tiap bulan' : 'Cash / Tunai'

  if (!nis || nis.length < 3) throw new Error('NIS siswa belum terbaca. Lengkapi data siswa terlebih dahulu.')
  if (!namaSiswa) throw new Error('Nama siswa belum terbaca.')
  if (!unit) throw new Error('Unit ananda belum terbaca.')
  if (!(nominalTunggakan > 0)) throw new Error('Pengajuan hanya untuk ananda yang masih memiliki tunggakan.')
  if (!(JENIS_KEGIATAN_PENGAJUAN as readonly string[]).includes(jenisKegiatan)) {
    throw new Error('Jenis kegiatan / keperluan wajib dipilih.')
  }
  if (!alasan) throw new Error('Alasan pengajuan rekomendasi wajib diisi.')
  if (!/cash|tunai|angsur/i.test(mekanismeMentah.replace(/\s/g, ' '))) {
    throw new Error('Mekanisme pelunasan wajib dipilih.')
  }
  if (mengangsur && !(nominalAngsuran > 0)) throw new Error('Nominal angsuran wajib diisi.')
  if (mengangsur && nominalAngsuran > nominalTunggakan) {
    throw new Error('Nominal angsuran tidak boleh melebihi total tunggakan.')
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

  const keteranganMekanisme = mengangsur
    ? `Mengangsur tiap bulan sebesar ${rupiahKeringanan(nominalAngsuran)}`
    : 'Cash / Tunai'

  const barisLengkap = {
    unit,
    nis,
    nama_siswa: namaSiswa,
    kelas,
    nominal_tunggakan: nominalTunggakan,
    jenis_kegiatan: jenisKegiatan,
    mekanisme_pelunasan: keteranganMekanisme,
    nominal_angsuran: mengangsur ? nominalAngsuran : 0,
    kesanggupan_bayar: mengangsur ? String(nominalAngsuran) : String(nominalTunggakan),
    tanggal_rencana_lunas: rencana.toISOString(),
    alasan_pengajuan: alasan.slice(0, 2000),
    status_persetujuan: 'Pending' as const,
  }
  const barisInti = {
    unit,
    nis,
    nama_siswa: namaSiswa,
    kelas,
    nominal_tunggakan: nominalTunggakan,
    kesanggupan_bayar: mengangsur ? String(nominalAngsuran) : String(nominalTunggakan),
    tanggal_rencana_lunas: rencana.toISOString(),
    alasan_pengajuan: `[${jenisKegiatan}] ${keteranganMekanisme}. ${alasan}`.slice(0, 2000),
    status_persetujuan: 'Pending' as const,
  }

  const supabase = getSupabase()
  const lengkap = await supabase.from(TABEL).insert([barisLengkap]).select('*').single()
  let data = lengkap.data
  let error = lengkap.error
  if (error && /column|schema cache|null value|invalid input syntax|numeric/i.test(error.message)) {
    const ulang = await supabase.from(TABEL).insert([barisInti]).select('*').single()
    data = ulang.data
    error = ulang.error
  }

  if (error) throw new Error(error.message)

  const hasil = petakan((data || {}) as Record<string, unknown>)
  if (hasil) {
    return {
      ...hasil,
      jenisKegiatan: hasil.jenisKegiatan || jenisKegiatan,
      mekanismePelunasan: hasil.mekanismePelunasan || mekanismePelunasan,
      nominalAngsuran: hasil.nominalAngsuran || (mengangsur ? nominalAngsuran : 0),
    }
  }
  return {
    id: String((data as { id?: unknown } | null)?.id || ''),
    nis,
    namaSiswa,
    kelas,
    unit,
    nominalTunggakan,
    kesanggupanBayar: mengangsur ? String(nominalAngsuran) : String(nominalTunggakan),
    alasanPengajuan: alasan,
    jenisKegiatan,
    mekanismePelunasan,
    nominalAngsuran: mengangsur ? nominalAngsuran : 0,
    nomorSurat: '-',
    tanggalRencanaLunas: rencana.toISOString(),
    statusPersetujuan: 'Pending',
    nomorSuratRekomendasi: '',
    catatanKeputusan: '',
    suratResmiIsi: '',
    suratResmiDikirimPada: '',
    dibuatPada: new Date().toISOString(),
    diperbaruiPada: '',
    diputuskanPada: '',
  }
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