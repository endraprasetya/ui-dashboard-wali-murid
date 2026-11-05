import { formatDisplayDate, isoDate, text } from '@/lib/format'

export type StatusAbsenSesi = 'Hadir' | 'Sakit' | 'Izin' | 'Alpha'

export type SesiAbsensiSiswa = {
  id: string
  tanggal: string
  tanggalLabel: string
  jam: number
  waktu: string
  mapel: string
  guru: string
  status: StatusAbsenSesi
  keterangan: string
}

export type RincianHariTidakHadir = {
  tanggal: string
  tanggalLabel: string
  status: Exclude<StatusAbsenSesi, 'Hadir'>
  keterangan: string
}

export type RekapAbsensiJurnal = {
  bulan: string
  bulanLabel: string
  /** Jumlah hari efektif (tanggal unik yang ada jurnal kelas). */
  hariEfektif: number
  /** Jumlah hari hadir (tidak tercatat absen pada hari tersebut). */
  hariHadir: number
  /** Jumlah hari tidak hadir. */
  hariTidakHadir: number
  /** Hari tidak hadir per jenis (satu hari dihitung sekali). */
  sakit: number
  izin: number
  alpha: number
  persenHadir: number | null
  rincianTidakHadir: RincianHariTidakHadir[]
  /** Rincian per sesi jam (untuk keperluan internal / opsional). */
  sesi: SesiAbsensiSiswa[]
  /** @deprecated Gunakan hariEfektif — dipertahankan untuk kompatibilitas ringkas. */
  totalSesi: number
  /** @deprecated Gunakan hariHadir. */
  hadir: number
}

export const JADWAL_JAM_PELAJARAN: { j?: number; w: string; r?: string }[] = [
  { j: 1, w: '07.00 - 07.35' },
  { j: 2, w: '07.35 - 08.10' },
  { j: 3, w: '08.10 - 08.45' },
  { j: 4, w: '08.45 - 09.20' },
  { r: 'ISTIRAHAT I', w: '09.20 - 09.40' },
  { j: 5, w: '09.40 - 10.15' },
  { j: 6, w: '10.15 - 10.50' },
  { j: 7, w: '10.50 - 11.25' },
  { r: 'ISTIRAHAT II', w: '11.25 - 12.25' },
  { j: 8, w: '12.25 - 13.00' },
  { j: 9, w: '13.00 - 13.35' },
  { j: 10, w: '13.35 - 14.10' },
  { r: 'QAILULAH', w: '14.10 - 14.50' },
  { r: 'SHOLAT ASHAR', w: '14.50 - 15.25' },
  { j: 11, w: '15.25 - 16.00' },
]

function labelWaktuJam(jam: number) {
  const item = JADWAL_JAM_PELAJARAN.find((row) => row.j === jam)
  return item?.w || `Jam ke-${jam}`
}

export function monthRange(monthValue: string) {
  const [year, month] = monthValue.split('-').map(Number)
  if (!year || !month) {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth() + 1
    const start = `${y}-${String(m).padStart(2, '0')}-01`
    const last = new Date(y, m, 0).getDate()
    const end = `${y}-${String(m).padStart(2, '0')}-${String(last).padStart(2, '0')}`
    return { start, end }
  }
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const last = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(last).padStart(2, '0')}`
  return { start, end }
}

export function bulanLabelId(monthValue: string) {
  const [year, month] = monthValue.split('-').map(Number)
  if (!year || !month) return monthValue
  return new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

type SiswaTidakHadir = { nama: string; keterangan: string; id_siswa?: string }

export function normalizeSiswaTidakHadir(value: unknown): SiswaTidakHadir[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => ({
        nama: String(item?.nama || '').trim(),
        keterangan: String(item?.keterangan || 'Alpa').trim() || 'Alpa',
        id_siswa: item?.id_siswa ? String(item.id_siswa) : undefined,
      }))
      .filter((item) => item.nama)
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      return normalizeSiswaTidakHadir(JSON.parse(value))
    } catch {
      return []
    }
  }
  return []
}

export function jenisAbsen(value: string): 'sakit' | 'izin' | 'alpa' {
  const key = value.toLowerCase()
  if (key.includes('sakit')) return 'sakit'
  if (key.includes('izin')) return 'izin'
  return 'alpa'
}

function statusDariKeterangan(keterangan: string): StatusAbsenSesi {
  const jenis = jenisAbsen(keterangan)
  if (jenis === 'sakit') return 'Sakit'
  if (jenis === 'izin') return 'Izin'
  return 'Alpha'
}

function cocokSiswa(
  item: SiswaTidakHadir,
  idSiswa: string,
  namaSiswa: string,
) {
  const id = String(item.id_siswa || '').trim()
  if (id && idSiswa && id === idSiswa) return true
  const nama = String(item.nama || '').trim().toLowerCase()
  const target = String(namaSiswa || '').trim().toLowerCase()
  return Boolean(nama && target && nama === target)
}

function statusSiswaDiBarisJurnal(
  row: Record<string, unknown>,
  idSiswa: string,
  namaSiswa: string,
): { status: StatusAbsenSesi; keterangan: string } {
  const daftar = normalizeSiswaTidakHadir(row.siswa_tidak_hadir)
  const absen = daftar.find((item) => cocokSiswa(item, idSiswa, namaSiswa))
  if (!absen) return { status: 'Hadir', keterangan: '' }
  return { status: statusDariKeterangan(absen.keterangan), keterangan: absen.keterangan }
}

const RANK_ABSEN = { alpa: 3, sakit: 2, izin: 1 } as const

function rekapPerHari(sesi: SesiAbsensiSiswa[]) {
  const perTanggal = new Map<string, SesiAbsensiSiswa[]>()
  for (const item of sesi) {
    const list = perTanggal.get(item.tanggal) || []
    list.push(item)
    perTanggal.set(item.tanggal, list)
  }

  const tanggalUrut = Array.from(perTanggal.keys()).sort()
  const rincianTidakHadir: RincianHariTidakHadir[] = []
  let hariHadir = 0
  let sakit = 0
  let izin = 0
  let alpha = 0

  for (const tanggal of tanggalUrut) {
    const baris = perTanggal.get(tanggal) || []
    const absenSesi = baris.filter((s) => s.status !== 'Hadir')
    if (absenSesi.length === 0) {
      hariHadir += 1
      continue
    }

    let rank = 0
    let status: Exclude<StatusAbsenSesi, 'Hadir'> = 'Alpha'
    const alasan = new Set<string>()

    for (const s of absenSesi) {
      if (s.keterangan) alasan.add(s.keterangan)
      const jenis = jenisAbsen(s.keterangan || s.status)
      const r = RANK_ABSEN[jenis]
      if (r >= rank) {
        rank = r
        status = jenis === 'sakit' ? 'Sakit' : jenis === 'izin' ? 'Izin' : 'Alpha'
      }
    }

    if (status === 'Sakit') sakit += 1
    else if (status === 'Izin') izin += 1
    else alpha += 1

    rincianTidakHadir.push({
      tanggal,
      tanggalLabel: baris[0]?.tanggalLabel || tanggal,
      status,
      keterangan:
        Array.from(alasan)
          .filter((teks) => teks && teks.toLowerCase() !== status.toLowerCase())
          .join('; ') || status,
    })
  }

  const hariEfektif = tanggalUrut.length
  const hariTidakHadir = rincianTidakHadir.length
  const persenHadir = hariEfektif > 0 ? Math.round((hariHadir / hariEfektif) * 1000) / 10 : null

  return { hariEfektif, hariHadir, hariTidakHadir, sakit, izin, alpha, persenHadir, rincianTidakHadir }
}

export function buildAbsensiSiswaFromJurnal(
  rows: Record<string, unknown>[],
  opts: { idSiswa: string; namaSiswa: string; bulan: string },
): RekapAbsensiJurnal {
  const { start, end } = monthRange(opts.bulan)
  const sesi: SesiAbsensiSiswa[] = []

  const filtered = rows
    .filter((row) => {
      const tgl = isoDate(row.tanggal)
      return tgl >= start && tgl <= end
    })
    .sort(
      (a, b) =>
        isoDate(a.tanggal).localeCompare(isoDate(b.tanggal)) ||
        Number(a.jam) - Number(b.jam),
    )

  for (const row of filtered) {
    const jam = Number(row.jam)
    if (!Number.isFinite(jam)) continue
    const tanggal = isoDate(row.tanggal)
    if (!tanggal) continue
    const { status, keterangan } = statusSiswaDiBarisJurnal(row, opts.idSiswa, opts.namaSiswa)
    sesi.push({
      id: `${tanggal}-${jam}-${text(row.id) || sesi.length}`,
      tanggal,
      tanggalLabel: formatDisplayDate(row.tanggal),
      jam,
      waktu: labelWaktuJam(jam),
      mapel: text(row.mapel) || 'Pembelajaran',
      guru: text(row.guru) || text(row.nama_guru) || text(row.nama_ustadz) || '-',
      status,
      keterangan,
    })
  }

  const harian = rekapPerHari(sesi)

  return {
    bulan: opts.bulan,
    bulanLabel: bulanLabelId(opts.bulan),
    ...harian,
    sesi,
    totalSesi: sesi.length,
    hadir: harian.hariHadir,
  }
}
