import 'server-only'

import {
  currentMonthKey,
  currentMonthLabel,
  dateValue,
  displayValue,
  formatDisplayDate,
  formatMonthLabel,
  text,
  todayIso,
} from '@/lib/format'
import { isStudentId } from '@/lib/student-id'
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
  mapel: string
  materi: string
  kegiatan: string
  jam: string
  semester: string
  hadir: string
  tidakHadir: string
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
}

export type TertibData = {
  total: number
  prestasi: number
  pelanggaran: number
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

export type DashboardData = {
  student: StudentProfile | null
  studentError: string | null
  tahfidz: QueryResult<TahfidzData>
  qiroah: QueryResult<QiroahData>
  jurnal: QueryResult<JurnalEntry[]>
  absensi: QueryResult<AttendanceData>
  tertib: QueryResult<TertibData>
  jadwalUjian: JadwalUjian | null
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
const emptyTertib: TertibData = { total: 0, prestasi: 0, pelanggaran: 0, items: [] }

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

function toTahfidz(row: Record<string, unknown>, index: number): TahfidzEntry {
  const start = text(row.ayat_mulai)
  const end = text(row.ayat_selesai)
  const ayat = start || end ? `${start || '…'} – ${end || '…'}` : '-'
  const note = text(row.keterangan_pesan_hafalan) || text(row.keterangan)
  const status = shortStatus(text(row.status), note)
  const review = text(row["muroja'ah"])

  return {
    id: text(row.id_setoran) || `tahfidz-${index}`,
    date: formatDisplayDate(row.tanggal),
    surah: text(row.surah) || text(row.hafalan_baru) || review || '-',
    ayat,
    type: text(row.tipe_tugas) || '-',
    status,
    note,
    ustadz: text(row.nama_ustadz) || '-',
    tugas: text(row.tugas_rumah),
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

function toJurnal(row: Record<string, unknown>, index: number): JurnalEntry {
  return {
    id: text(row.id) || `jurnal-${index}`,
    date: formatDisplayDate(row.tanggal),
    mapel: text(row.mapel) || 'Pembelajaran',
    materi: text(row.materi),
    kegiatan: text(row.kegiatan),
    jam: text(row.jam) || '-',
    semester: text(row.semester),
    hadir: displayValue(row.hadir),
    tidakHadir: displayValue(row.tidak_hadir),
  }
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
      'id_setoran, tanggal, id_siswa, hafalan_baru, "muroja\'ah", keterangan_pesan_hafalan, keterangan, tugas_rumah, nama_ustadz, surah, ayat_mulai, ayat_selesai, status, tipe_tugas, konfirmasi_ortu',
    )
    .eq('id_siswa', idSiswa)
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

  const supabase = getSupabase()
  // jurnal_pembelajaran mencatat kegiatan per kelas, bukan per id_siswa.
  // Filter kelas diambil dari siswa yang sedang login agar kelas lain tidak tampil.
  const { data, error } = await supabase
    .from('jurnal_pembelajaran')
    .select('id, tanggal, kelas, mapel, materi, kegiatan, jam, semester, hadir, tidak_hadir')
    .eq('kelas', className)
    .limit(40)

  if (error) {
    logQueryError('jurnal', error)
    return { data: [], error: 'Jurnal pembelajaran belum bisa dimuat.' }
  }

  const entries = sortedRows((data ?? []) as Record<string, unknown>[]).map(toJurnal)
  return { data: entries, error: null }
}

export async function getAbsensi(idSiswa: string): Promise<QueryResult<AttendanceData>> {
  assertStudentId(idSiswa)

  const supabase = getSupabase()
  const { data, error } = await supabase.from('absensi').select('*').eq('id_siswa', idSiswa).limit(200)

  if (error) {
    if (isMissingTable(error)) {
      return { data: { ...emptyAttendance, unavailable: true }, error: null }
    }
    logQueryError('absensi', error)
    return { data: emptyAttendance, error: 'Rekap absensi belum bisa dimuat.' }
  }

  const monthKey = currentMonthKey()
  const rows = sortedRows(
    ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      ...row,
      tanggal: row.tanggal ?? row.tgl ?? row.date ?? row.created_at,
    })),
  )

  const history: AttendanceEntry[] = []
  const counts = { Hadir: 0, Izin: 0, Sakit: 0, Alpha: 0 }
  let datedRows = 0

  rows.forEach((row, index) => {
    const status = classifyAttendance(row)
    if (!status) return

    if (history.length < 8) {
      history.push({
        id: text(row.id) || text(row.id_absensi) || `absensi-${index}`,
        date: formatDisplayDate(row.tanggal),
        status,
      })
    }

    const rowMonth = monthKeyFromRow(row)
    if (rowMonth) datedRows += 1
    if (!rowMonth || rowMonth === monthKey) counts[status] += 1
  })

  const totalDays = counts.Hadir + counts.Izin + counts.Sakit + counts.Alpha

  return {
    data: {
      unavailable: false,
      monthLabel: datedRows ? currentMonthLabel() : 'Semua catatan',
      present: counts.Hadir,
      sick: counts.Sakit,
      permission: counts.Izin,
      absent: counts.Alpha,
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
    .select('id_tertib_point, id_siswa, label, pts, guru, bulan, created_at')
    .eq('id_siswa', idSiswa)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    logQueryError('tertib', error)
    return { data: emptyTertib, error: 'Catatan ketertiban belum bisa dimuat.' }
  }

  const items = ((data ?? []) as Record<string, unknown>[]).map((row, index) => ({
    id: text(row.id_tertib_point) || `tertib-${index}`,
    label: text(row.label) || 'Catatan ketertiban',
    points: Number(row.pts) || 0,
    teacher: text(row.guru) || '-',
    month: formatMonthLabel(row.bulan) !== '-' ? formatMonthLabel(row.bulan) : formatDisplayDate(row.created_at),
  }))

  const total = items.reduce((sum, item) => sum + item.points, 0)
  const prestasi = items.reduce((sum, item) => sum + (item.points > 0 ? item.points : 0), 0)
  const pelanggaran = items.reduce((sum, item) => sum + (item.points < 0 ? Math.abs(item.points) : 0), 0)

  return { data: { total, prestasi, pelanggaran, items }, error: null }
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
    }
  }

  const [tahfidz, qiroah, jurnal, absensi, tertib, jadwalUjian] = await Promise.all([
    getTahfidz(idSiswa),
    getQiroah(idSiswa),
    getJurnal(studentResult.data.kelas),
    getAbsensi(idSiswa),
    getTertib(idSiswa),
    getJadwalUjian(idSiswa),
  ])

  return {
    student: studentResult.data,
    studentError: null,
    tahfidz,
    qiroah,
    jurnal,
    absensi,
    tertib,
    jadwalUjian,
  }
}

function pecahStatusUjian(status: unknown) {
  const raw = text(status)
  const [inti, jam] = raw.split('|')
  const kunci = inti.toLowerCase()
  const waktu = jam && /^\d{2}:\d{2}/.test(jam.trim()) ? jam.trim().slice(0, 5) : ''
  if (kunci === 'terjadwal') return { status: 'terjadwal' as const, waktu }
  if (kunci === 'menunggu_jadwal' || kunci === 'menunggu ujian') return { status: 'menunggu_jadwal' as const, waktu: '' }
  return null
}

export async function getJadwalUjian(idSiswa: string): Promise<JadwalUjian | null> {
  const { data, error } = await getSupabase()
    .from('pengajuan')
    .select('id_pengajuan, jilid_diujikan, tanggal_pelaksanaan, tanggal_diajukan, nama_penguji, status')
    .eq('id_siswa', idSiswa)

  if (error) {
    logQueryError('jadwal ujian', error)
    return null
  }

  const hariIni = todayIso()
  const daftar = (data || [])
    .map((row) => {
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

  const terjadwal = daftar
    .filter((item) => item.status === 'terjadwal')
    .sort((a, b) => a.urutan.localeCompare(b.urutan))
  if (terjadwal.length > 0) {
    return terjadwal.find((item) => item.tanggal >= hariIni) || terjadwal[terjadwal.length - 1]
  }

  return daftar.find((item) => item.status === 'menunggu_jadwal') || null
}
