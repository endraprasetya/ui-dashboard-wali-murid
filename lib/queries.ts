import 'server-only'

import {
  currentMonthKey,
  currentMonthLabel,
  dateValue,
  displayValue,
  formatDisplayDate,
  formatMonthLabel,
  isoDate,
  text,
  todayIso,
} from '@/lib/format'
import { isStudentId } from '@/lib/student-id'
import { buildTertibData, emptyTertibData, mapPeringkatKelas, TERTIB_POINT_SELECT } from '@/lib/tertib-data'
import type { BarisPeringkatKelas } from '@/lib/tertib-saldo'
import { getAbsensiJurnalSiswa } from '@/lib/absensi-jurnal-wali'
import { normalKelasJurnal } from '@/lib/kelas-jurnal'
import { getSupabase } from '@/lib/supabase'

export type QueryResult<T> = {
  data: T
  error: string | null
}

export type StudentProfile = {
  idSiswa: string
  name: string
  shortName: string
  initials: string
  classLabel: string
  nis: string
  unit: string
  kelas: string
}

export type TahfidzEntry = {
  id: string
  date: string
  surah: string
  ayat: string
  type: string
  status: string
  note: string
  ustadz: string
  tugas: string
  konfirmasi: string
}

export type TahfidzData = {
  latest: TahfidzEntry | null
  total: number
  lancar: number
  history: TahfidzEntry[]
}

export type QiroahEntry = {
  id: string
  date: string
  jilid: string
  halaman: string
  status: string
  note: string
  ustadz: string
  nilai: string
  tugas: string
  statusSetoran: string
}

export type QiroahData = {
  latest: QiroahEntry | null
  total: number
  recent: QiroahEntry[]
}

export type JurnalEntry = {
  id: string
  date: string
  iso: string
  mapel: string
  materi: string
  kegiatan: string
  jam: string
  guru: string
  semester: string
  hadir: string
  tidakHadir: string
  links: Array<{ tipe: string; url: string }>
  tugas: string
}

export type AttendanceEntry = {
  id: string
  date: string
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha'
}

export type AttendanceData = {
  unavailable: boolean
  monthLabel: string
  present: number
  sick: number
  permission: number
  absent: number
  totalDays: number
  history: AttendanceEntry[]
}

export type TertibEntry = {
  id: string
  label: string
  points: number
  teacher: string
  month: string
  keterangan: string
}

export type TertibData = {
  modal: number
  sisa: number
  /** Sisa saldo bulanan (alias `sisa`, modal 200 + kebaikan − pelanggaran). */
  total: number
  prestasi: number
  pelanggaran: number
  bulan: string
  bulanLabel: string
  items: TertibEntry[]
}

export type JadwalUjian = {
  id: string
  jilid: string
  tanggal: string
  waktu: string
  penguji: string
  status: 'menunggu_jadwal' | 'terjadwal'
}

export type HasilUjianJilid = {
  id: string
  jilidAsal: string
  jilidTujuan: string
  tanggal: string
  penguji: string
  predikat: string
  keputusan: string
  nilai: string
  catatanPenguji: string
}

export type InfoUjian = {
  berlangsung: JadwalUjian | null
  hasil: HasilUjianJilid[]
}

export type DashboardData = {
  student: StudentProfile | null
  studentError: string | null
  tahfidz: QueryResult<TahfidzData>
  qiroah: QueryResult<QiroahData>
  jurnal: QueryResult<JurnalEntry[]>
  absensi: QueryResult<AttendanceData>
  tertib: QueryResult<TertibData>
  jadwalUjian: JadwalUjian | null
  hasilUjian: HasilUjianJilid[]
}

const emptyTahfidz: TahfidzData = { latest: null, total: 0, lancar: 0, history: [] }
const emptyQiroah: QiroahData = { latest: null, total: 0, recent: [] }
const emptyAttendance: AttendanceData = {
  unavailable: false,
  monthLabel: currentMonthLabel(),
  present: 0,
  sick: 0,
  permission: 0,
  absent: 0,
  totalDays: 0,
  history: [],
}
const emptyTertib: TertibData = emptyTertibData()

function assertStudentId(idSiswa: string) {
  if (!isStudentId(idSiswa)) {
    throw new Error('Invalid student session')
  }
}

function logQueryError(scope: string, error: { code?: string; message?: string }) {
  console.error(`${scope} query failed`, error.code ?? '', error.message ?? '')
}

function isMissingTable(error: { code?: string; message?: string }) {
  return error.code === 'PGRST205' || (error.message ?? '').toLowerCase().includes('schema cache')
}

function kolomGuruTidakAda(error?: { code?: string; message?: string } | null) {
  const pesan = (error?.message ?? '').toLowerCase()
  return (
    error?.code === 'PGRST204' ||
    error?.code === '42703' ||
    (pesan.includes('guru') && pesan.includes('does not exist'))
  )
}

function sortedRows<T extends { tanggal?: unknown }>(rows: T[]) {
  return rows
    .map((row, index) => ({ row, index, time: dateValue(row.tanggal) }))
    .sort((left, right) => right.time - left.time || left.index - right.index)
    .map((item) => item.row)
}

function initialsFrom(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
  return letters.join('') || 'WM'
}

function toStudent(row: {
  id_siswa: unknown
  nama_siswa: unknown
  kelas: unknown
  unit: unknown
  nis: unknown
}): StudentProfile {
  const name = text(row.nama_siswa) || 'Siswa'
  const kelas = text(row.kelas)
  const idSiswa = text(row.id_siswa)

  return {
    idSiswa,
    name,
    shortName: name.split(/\s+/)[0] || name,
    initials: initialsFrom(name),
    classLabel: kelas ? `Kelas ${kelas}` : 'Kelas belum diisi',
    nis: text(row.nis) || idSiswa,
    unit: text(row.unit) || 'Unit belum diisi',
    kelas,
  }
}

function shortStatus(status: string, note: string) {
  if (status && status.length <= 24) return status
  const combined = `${status} ${note}`.toLowerCase()
  if (combined.includes('lancar')) return 'Lancar'
  if (combined.includes('selesai')) return 'Selesai'
  if (combined.includes('ulang')) return 'Perlu Mengulang'
  return status ? 'Catatan' : '-'
}

function bacaanTahfidz(row: Record<string, unknown>) {
  const ziyadah = text(row.hafalan_baru) || text(row.surah) || text(row.surah_ziyadah)
  const murojaah = text(row.murojaah) || [text(row.surah_murojaah), text(row.ayat_murojaah)].filter(Boolean).join(' ')
  if (ziyadah && murojaah) return `${ziyadah} · murojaah ${murojaah}`
  return ziyadah || murojaah || '-'
}

function ayatTahfidz(row: Record<string, unknown>) {
  const mulai = text(row.ayat_mulai) || text(row.ayat_ziyadah)
  const selesai = text(row.ayat_selesai)
  if (mulai || selesai) return `${mulai || '…'} – ${selesai || mulai}`
  return text(row.ayat_murojaah) || '-'
}

function jenisTahfidz(row: Record<string, unknown>) {
  const tipe = text(row.tipe_tugas)
  if (tipe) return tipe
  const ziyadah = Boolean(text(row.hafalan_baru) || text(row.surah) || text(row.surah_ziyadah))
  const murojaah = Boolean(text(row.murojaah) || text(row.surah_murojaah))
  if (ziyadah && murojaah) return 'Ziyadah & Murojaah'
  if (murojaah) return 'Murojaah'
  if (ziyadah) return 'Ziyadah'
  return '-'
}

function tugasTahfidz(row: Record<string, unknown>) {
  const rumah = text(row.tugas_rumah)
  if (rumah) {
    const ziyadah = /ziyadah aktif/i.test(rumah)
    const murojaah = /murojaah aktif/i.test(rumah)
    if (ziyadah || murojaah) {
      const bagian = [ziyadah ? 'Ziyadah' : '', murojaah ? 'Murojaah' : ''].filter(Boolean).join(' & ')
      const sisa = rumah.replace(/\[?\s*(ziyadah|murojaah)\s+aktif\s*\]?/gi, ' ').replace(/\s+/g, ' ').trim()
      return sisa ? `${bagian} · ${sisa}` : bagian
    }
    return rumah
  }
  const surah = text(row.surah_tugas)
  const mulai = text(row.ayat_mulai_tugas)
  const selesai = text(row.ayat_selesai_tugas)
  if (!surah && !mulai && !selesai) return ''
  const rentang = mulai && selesai ? `${mulai}–${selesai}` : mulai || selesai
  return [surah, rentang].filter(Boolean).join(' ')
}

function toTahfidz(row: Record<string, unknown>, index: number): TahfidzEntry {
  const note = text(row.keterangan_pesan_hafalan) || text(row.keterangan)
  const status = shortStatus(text(row.status), note)

  return {
    id: text(row.id_setoran) || `tahfidz-${index}`,
    date: formatDisplayDate(row.tanggal),
    surah: bacaanTahfidz(row),
    ayat: ayatTahfidz(row),
    type: jenisTahfidz(row),
    status,
    note,
    ustadz: text(row.nama_ustadz) || '-',
    tugas: tugasTahfidz(row),
    konfirmasi: text(row.konfirmasi_ortu),
  }
}

function toQiroah(row: Record<string, unknown>, index: number): QiroahEntry {
  return {
    id: text(row.id_qiroah) || `qiroah-${index}`,
    date: formatDisplayDate(row.tanggal),
    jilid: text(row.jilid) || '-',
    halaman: text(row.halaman) || '-',
    status: text(row.status) || '-',
    note: text(row.catatan) || 'Belum ada catatan pengajar.',
    ustadz: text(row.ustadz) || '-',
    nilai: text(row.nilai),
    tugas: text(row.tugas_rumah),
    statusSetoran: text(row.status_setoran),
  }
}

export { normalKelasJurnal } from '@/lib/kelas-jurnal'

function jurnalBerisi(row: Record<string, unknown>) {
  return Boolean(
    text(row.mapel) ||
      text(row.materi) ||
      text(row.kegiatan) ||
      text(row.tugas) ||
      parseLinks(row.links).length > 0,
  )
}

function toJurnal(row: Record<string, unknown>, index: number): JurnalEntry {
  return {
    id: text(row.id) || `jurnal-${index}`,
    date: formatDisplayDate(row.tanggal),
    iso: isoDate(row.tanggal),
    mapel: text(row.mapel) || 'Pembelajaran',
    materi: text(row.materi),
    kegiatan: text(row.kegiatan),
    jam: text(row.jam) || '-',
    guru: text(row.guru) || text(row.nama_guru) || text(row.nama_ustadz),
    semester: text(row.semester),
    hadir: displayValue(row.hadir),
    tidakHadir: displayValue(row.tidak_hadir),
    links: parseLinks(row.links),
    tugas: text(row.tugas),
  }
}

function parseLinks(value: unknown): Array<{ tipe: string; url: string }> {
  if (Array.isArray(value)) {
    return value
      .map((item) => ({
        tipe: String(item?.tipe || 'video'),
        url: String(item?.url || '').trim(),
      }))
      .filter((item) => item.url)
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      return parseLinks(JSON.parse(value))
    } catch {
      return []
    }
  }

  return []
}

function classifyAttendance(row: Record<string, unknown>): AttendanceEntry['status'] | null {
  const raw = [row.status, row.keterangan, row.kehadiran, row.status_kehadiran, row.ket]
    .map((value) => text(value))
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (!raw) {
    if (row.alpha === true || row.alpa === true || row.alpha === 1 || row.alpa === 1) return 'Alpha'
    if (row.sakit === true || row.sakit === 1) return 'Sakit'
    if (row.izin === true || row.izin === 1) return 'Izin'
    if (row.hadir === true || row.hadir === 1) return 'Hadir'
    return null
  }

  if (raw.includes('alpha') || raw.includes('alpa') || raw.includes('tanpa keterangan')) return 'Alpha'
  if (raw.includes('sakit')) return 'Sakit'
  if (raw.includes('izin')) return 'Izin'
  if (raw.includes('hadir')) return 'Hadir'
  return null
}

function monthKeyFromRow(row: Record<string, unknown>) {
  const time = dateValue(row.tanggal ?? row.tgl ?? row.date ?? row.created_at)
  if (!time) return ''
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date(time))
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  return `${year}-${month}`
}

export async function getStudent(idSiswa: string): Promise<QueryResult<StudentProfile | null>> {
  assertStudentId(idSiswa)

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('siswa')
    .select('id_siswa, nama_siswa, kelas, unit, nis')
    .eq('id_siswa', idSiswa)
    .maybeSingle()

  if (error) {
    logQueryError('siswa', error)
    return { data: null, error: 'Data siswa belum bisa dimuat.' }
  }

  return { data: data ? toStudent(data) : null, error: null }
}

export async function getTahfidz(idSiswa: string): Promise<QueryResult<TahfidzData>> {
  assertStudentId(idSiswa)

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('setoran_tahfidz')
    .select(
      'id_setoran, tanggal, id_siswa, hafalan_baru, murojaah, keterangan_pesan_hafalan, keterangan, tugas_rumah, nama_ustadz, surah, ayat_mulai, ayat_selesai, status, tipe_tugas, konfirmasi_ortu, surah_ziyadah, ayat_ziyadah, surah_murojaah, ayat_murojaah, surah_tugas, ayat_mulai_tugas, ayat_selesai_tugas',
    )
    .eq('id_siswa', idSiswa)
    .order('tanggal', { ascending: false })
    .limit(200)

  if (error) {
    logQueryError('tahfidz', error)
    return { data: emptyTahfidz, error: 'Riwayat tahfidz belum bisa dimuat.' }
  }

  const history = sortedRows((data ?? []) as Record<string, unknown>[]).map(toTahfidz)
  const lancar = history.filter((entry) => /(lancar|selesai)/i.test(entry.status)).length

  return {
    data: {
      latest: history[0] ?? null,
      total: history.length,
      lancar,
      history,
    },
    error: null,
  }
}

export async function getQiroah(idSiswa: string): Promise<QueryResult<QiroahData>> {
  assertStudentId(idSiswa)

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('setoran_qiroah')
    .select('id_qiroah, tanggal, id_siswa, ustadz, jilid, halaman, status, catatan, tugas_rumah, status_setoran, nilai')
    .eq('id_siswa', idSiswa)
    .order('tanggal', { ascending: false })
    .limit(200)

  if (error) {
    logQueryError('qiroah', error)
    return { data: emptyQiroah, error: 'Progres qiroah belum bisa dimuat.' }
  }

  const recent = sortedRows((data ?? []) as Record<string, unknown>[]).map(toQiroah)

  return {
    data: {
      latest: recent[0] ?? null,
      total: recent.length,
      recent,
    },
    error: null,
  }
}

export async function getJurnal(kelas: string): Promise<QueryResult<JurnalEntry[]>> {
  const className = kelas.trim()
  if (!className) return { data: [], error: null }

  const kunci = normalKelasJurnal(className)
  const variasi = Array.from(
    new Set(
      [className, className.replace(/\s+/g, ''), className.replace(/\s+/g, ' ').trim(), `Kelas ${className}`].filter(
        Boolean,
      ),
    ),
  )
  const kolomDenganGuru = 'id, tanggal, kelas, mapel, materi, kegiatan, jam, semester, hadir, tidak_hadir, links, tugas, guru'
  const kolomTanpaGuru = 'id, tanggal, kelas, mapel, materi, kegiatan, jam, semester, hadir, tidak_hadir, links, tugas'
  const supabase = getSupabase()
  const cocokKelas = (daftar: Record<string, unknown>[]) =>
    daftar.filter((row) => normalKelasJurnal(text(row.kelas)) === kunci)

  async function ambil(kolom: string) {
    const pertama = await supabase
      .from('jurnal_pembelajaran')
      .select(kolom)
      .or(variasi.map((nama) => `kelas.eq.${nama}`).join(','))
      .order('tanggal', { ascending: false })
      .limit(400)

    let rows = ((pertama.data ?? []) as Record<string, unknown>[])
    if (pertama.error && !kolomGuruTidakAda(pertama.error)) logQueryError('jurnal', pertama.error)

    if ((pertama.error && !kolomGuruTidakAda(pertama.error)) || cocokKelas(rows).length === 0) {
      const cadangan = await supabase
        .from('jurnal_pembelajaran')
        .select(kolom)
        .order('tanggal', { ascending: false })
        .limit(800)
      if (cadangan.error) {
        if (!kolomGuruTidakAda(cadangan.error)) logQueryError('jurnal', cadangan.error)
        if (pertama.error && !kolomGuruTidakAda(pertama.error)) {
          return { rows: [] as Record<string, unknown>[], error: cadangan.error || pertama.error }
        }
      } else {
        rows = (cadangan.data ?? []) as Record<string, unknown>[]
      }
    }

    return { rows, error: kolomGuruTidakAda(pertama.error) ? pertama.error : null }
  }

  let hasil = await ambil(kolomDenganGuru)
  if (hasil.error && kolomGuruTidakAda(hasil.error)) {
    hasil = await ambil(kolomTanpaGuru)
  }
  if (hasil.error && !kolomGuruTidakAda(hasil.error) && hasil.rows.length === 0) {
    return { data: [], error: 'Jurnal pembelajaran belum bisa dimuat.' }
  }
  const rows = hasil.rows

  const entries = sortedRows(cocokKelas(rows).filter(jurnalBerisi)).map(toJurnal)
  return { data: entries, error: null }
}

export async function getAbsensi(idSiswa: string): Promise<QueryResult<AttendanceData>> {
  assertStudentId(idSiswa)

  const profil = await getStudent(idSiswa)
  if (!profil.data) {
    return { data: emptyAttendance, error: profil.error || 'Data siswa belum bisa dimuat.' }
  }

  const { data: rekap, error } = await getAbsensiJurnalSiswa({
    idSiswa,
    namaSiswa: profil.data.name,
    kelas: profil.data.kelas,
  })

  if (error) {
    return { data: emptyAttendance, error }
  }

  const history: AttendanceEntry[] = rekap.rincianTidakHadir.slice(0, 8).map((item) => ({
    id: item.tanggal,
    date: item.tanggalLabel,
    status: item.status === 'Alpha' ? 'Alpha' : item.status,
  }))

  const totalDays = rekap.hariEfektif

  return {
    data: {
      unavailable: false,
      monthLabel: rekap.bulanLabel,
      present: rekap.hariHadir,
      sick: rekap.sakit,
      permission: rekap.izin,
      absent: rekap.alpha,
      totalDays,
      history,
    },
    error: null,
  }
}

export async function getTertib(idSiswa: string): Promise<QueryResult<TertibData>> {
  assertStudentId(idSiswa)

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('tertib_point')
    .select(TERTIB_POINT_SELECT)
    .eq('id_siswa', idSiswa)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    logQueryError('tertib', error)
    return { data: emptyTertib, error: 'Catatan ketertiban belum bisa dimuat.' }
  }

  const bulan = currentMonthKey()
  return {
    data: buildTertibData((data ?? []) as Record<string, unknown>[], idSiswa, bulan),
    error: null,
  }
}

export async function getTertibPeringkatKelas(
  kelas: string,
  idSiswa: string,
  bulan = currentMonthKey(),
): Promise<BarisPeringkatKelas[]> {
  const className = kelas.trim()
  if (!className || !isStudentId(idSiswa)) return []

  const supabase = getSupabase()
  const { data: siswaKelas, error: galatSiswa } = await supabase
    .from('siswa')
    .select('id_siswa, nama_siswa, kelas')
    .eq('kelas', className)
    .not('kelas', 'ilike', '%Alumni%')
    .order('nama_siswa', { ascending: true })

  if (galatSiswa || !siswaKelas?.length) {
    if (galatSiswa) logQueryError('siswa-kelas-tertib', galatSiswa)
    return []
  }

  const ids = siswaKelas.map((row) => String(row.id_siswa)).filter(Boolean)
  const { data: logs, error: galatLog } = await supabase
    .from('tertib_point')
    .select('id_siswa, bulan, pts')
    .eq('bulan', bulan)
    .in('id_siswa', ids)

  if (galatLog) {
    logQueryError('tertib-peringkat', galatLog)
    return []
  }

  return mapPeringkatKelas(siswaKelas, (logs ?? []) as Record<string, unknown>[], bulan)
}

export function dashboardKosong(student: StudentProfile | null, studentError: string | null = null): DashboardData {
  return {
    student,
    studentError,
    tahfidz: { data: emptyTahfidz, error: null },
    qiroah: { data: emptyQiroah, error: null },
    jurnal: { data: [], error: null },
    absensi: { data: emptyAttendance, error: null },
    tertib: { data: emptyTertib, error: null },
    jadwalUjian: null,
    hasilUjian: [],
  }
}

export async function getDashboard(idSiswa: string): Promise<DashboardData> {
  const studentResult = await getStudent(idSiswa)
  if (!studentResult.data) {
    return {
      student: null,
      studentError: studentResult.error,
      tahfidz: { data: emptyTahfidz, error: null },
      qiroah: { data: emptyQiroah, error: null },
      jurnal: { data: [], error: null },
      absensi: { data: emptyAttendance, error: null },
      tertib: { data: emptyTertib, error: null },
      jadwalUjian: null,
      hasilUjian: [],
    }
  }

  const [tahfidz, qiroah, jurnal, absensi, tertib, infoUjian] = await Promise.all([
    getTahfidz(idSiswa),
    getQiroah(idSiswa),
    getJurnal(studentResult.data.kelas),
    getAbsensi(idSiswa),
    getTertib(idSiswa),
    getInfoUjian(idSiswa),
  ])

  return {
    student: studentResult.data,
    studentError: null,
    tahfidz,
    qiroah,
    jurnal,
    absensi,
    tertib,
    jadwalUjian: infoUjian.berlangsung,
    hasilUjian: infoUjian.hasil,
  }
}

function pecahStatusUjian(status: unknown) {
  const raw = text(status)
  const [inti, jam] = raw.split('|')
  const kunci = inti.toLowerCase()
  const waktu = jam && /^\d{2}:\d{2}/.test(jam.trim()) ? jam.trim().slice(0, 5) : ''
  if (kunci === 'terjadwal') return { status: 'terjadwal' as const, waktu }
  if (kunci === 'menunggu_jadwal' || kunci === 'menunggu ujian' || kunci.includes('menunggu') || kunci.includes('pengajuan') || kunci.includes('antr')) {
    return { status: 'menunggu_jadwal' as const, waktu: '' }
  }
  return null
}

function kunciJilid(value: unknown) {
  const teks = text(value).toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!teks) return ''
  if (teks.includes('quran') || teks.includes('qur') || teks.includes('talaqqi')) return 'quran'
  const jilid = teks.match(/jilid(\d)/)
  if (jilid) return `jilid${jilid[1]}`
  return teks
}

export async function getInfoUjian(idSiswa: string): Promise<InfoUjian> {
  const supabase = getSupabase()
  const [pengajuan, rekapan] = await Promise.all([
    supabase
      .from('pengajuan')
      .select('id_pengajuan, jilid_diujikan, tanggal_pelaksanaan, tanggal_diajukan, nama_penguji, status, id_siswa')
      .eq('id_siswa', idSiswa),
    supabase
      .from('rekapan')
      .select(
        'id_ujian, id_siswa, jilid_asal, jilid_tujuan, tanggal_ujian, penguji, predikat, keputusan, nilai_akhir, keterangan',
      )
      .eq('id_siswa', idSiswa),
  ])

  if (pengajuan.error) logQueryError('jadwal ujian', pengajuan.error)
  if (rekapan.error) logQueryError('rekapan ujian', rekapan.error)

  const daftarRekap = (rekapan.error ? [] : rekapan.data || []) as Record<string, unknown>[]
  const jilidSelesai = new Set(daftarRekap.map((row) => kunciJilid(row.jilid_asal)).filter(Boolean))
  const hasil = [...daftarRekap]
    .sort((a, b) => text(b.tanggal_ujian).localeCompare(text(a.tanggal_ujian)))
    .map((row) => ({
      id: text(row.id_ujian),
      jilidAsal: text(row.jilid_asal) || 'kenaikan jilid',
      jilidTujuan: text(row.jilid_tujuan),
      tanggal: text(row.tanggal_ujian).slice(0, 10),
      penguji: text(row.penguji),
      predikat: text(row.predikat),
      keputusan: text(row.keputusan) || 'Selesai',
      nilai: text(row.nilai_akhir),
      catatanPenguji: text(row.keterangan),
    }))

  const hariIni = todayIso()
  const daftar = (pengajuan.error ? [] : pengajuan.data || [])
    .map((row) => {
      if (jilidSelesai.has(kunciJilid(row.jilid_diujikan))) return null
      const status = pecahStatusUjian(row.status)
      if (!status) return null
      return {
        id: text(row.id_pengajuan),
        jilid: text(row.jilid_diujikan) || 'kenaikan jilid',
        tanggal: text(row.tanggal_pelaksanaan),
        waktu: status.waktu,
        penguji: text(row.nama_penguji),
        status: status.status,
        urutan: text(row.tanggal_pelaksanaan) || text(row.tanggal_diajukan),
      }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const terjadwal = daftar.filter((item) => item.status === 'terjadwal').sort((a, b) => a.urutan.localeCompare(b.urutan))
  const berlangsung =
    terjadwal.find((item) => item.tanggal >= hariIni) ||
    terjadwal[terjadwal.length - 1] ||
    daftar.find((item) => item.status === 'menunggu_jadwal') ||
    null

  return { berlangsung, hasil }
}

export async function getJadwalUjian(idSiswa: string): Promise<JadwalUjian | null> {
  const info = await getInfoUjian(idSiswa)
  return info.berlangsung
}
