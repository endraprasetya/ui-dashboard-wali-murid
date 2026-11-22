export const CATATAN_KEPULANGAN_ASAS =
  'Catatan: Mulai hari Senin, 30 November hingga Kamis, 17 Desember 2026 kepulangan siswa pukul 12.30 WIB.'

type Sesi = { waktu: string; kegiatan: string }
type Kelompok = { kelas: number[]; sesi: Sesi[] }
type HariJadwal = { iso: string; tanggal: string; kelompok: Kelompok[] }

export type HariJadwalJenjang = { iso: string; tanggal: string; sesi: Sesi[] }
export type StatusHariAsas = 'Kemarin' | 'Hari Ini' | 'Besok' | 'Berikutnya'

const SEMUA = [1, 2, 3, 4, 5, 6]

function sesi(...pasangan: [string, string][]): Sesi[] {
  return pasangan.map(([waktu, kegiatan]) => ({ waktu, kegiatan }))
}

const JADWAL_ASAS: HariJadwal[] = [
  { iso: '2026-11-23', tanggal: 'Senin, 23/11/2026', kelompok: [{ kelas: SEMUA, sesi: sesi(['07.00–16.00', "Hafalan Al Qur'an"]) }] },
  { iso: '2026-11-24', tanggal: 'Selasa, 24/11/2026', kelompok: [{ kelas: SEMUA, sesi: sesi(['07.00–14.00', "Hafalan Al Qur'an"]) }] },
  { iso: '2026-11-25', tanggal: 'Rabu, 25/11/2026', kelompok: [{ kelas: SEMUA, sesi: sesi(['07.00–16.00', 'Hafalan Hadits']) }] },
  { iso: '2026-11-26', tanggal: 'Kamis, 26/11/2026', kelompok: [{ kelas: SEMUA, sesi: sesi(['07.00–16.00', 'Hafalan Hadits']) }] },
  {
    iso: '2026-11-28',
    tanggal: 'Sabtu, 28/11/2026',
    kelompok: [
      { kelas: [1, 2], sesi: sesi(['07.00–09.00', 'Praktek PJOK'], ['09.30–16.00', "Qiro'atul Qur'an"]) },
      { kelas: [3], sesi: sesi(['07.00–09.00', 'Praktek Bahasa Arab'], ['09.30–16.00', "Qiro'atul Qur'an"]) },
      { kelas: [4], sesi: sesi(['07.00–09.00', 'Praktek Bahasa Arab'], ['09.30–16.00', 'Praktek Coding']) },
      { kelas: [5, 6], sesi: sesi(['07.00–09.00', 'Praktek Bahasa Arab'], ['09.30–16.00', 'Praktek Tajwid']) },
    ],
  },
  {
    iso: '2026-11-30',
    tanggal: 'Senin, 30/11/2026',
    kelompok: [{ kelas: SEMUA, sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–09.00', 'PKN'], ['09.30–11.00', 'AQIDAH']) }],
  },
  {
    iso: '2026-12-01',
    tanggal: 'Selasa, 01/12/2026',
    kelompok: [{ kelas: SEMUA, sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–09.00', 'BAHASA INGGRIS'], ['09.30–11.00', 'FIQH AKHLAK']) }],
  },
  {
    iso: '2026-12-02',
    tanggal: 'Rabu, 02/12/2026',
    kelompok: [{ kelas: SEMUA, sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–09.00', 'BAHASA INDONESIA'], ['09.30–11.00', 'BAHASA ARAB']) }],
  },
  {
    iso: '2026-12-03',
    tanggal: 'Kamis, 03/12/2026',
    kelompok: [
      { kelas: [1, 2, 3], sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–09.00', 'BAHASA JAWA'], ['09.30–11.00', 'MATEMATIKA']) },
      { kelas: [4, 5, 6], sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–09.00', 'BAHASA JAWA'], ['09.30–11.00', 'TAJWID']) },
    ],
  },
  {
    iso: '2026-12-05',
    tanggal: 'Sabtu, 05/12/2026',
    kelompok: [
      { kelas: [1, 2], sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–09.00', 'Praktek Bahasa Arab']) },
      { kelas: [3], sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–09.00', 'IPAS'], ['09.30–11.00', 'Praktek SBdP']) },
      { kelas: [4, 5, 6], sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–09.00', 'IPAS'], ['09.30–11.00', 'HADITS SIROH']) },
    ],
  },
  {
    iso: '2026-12-07',
    tanggal: 'Senin, 07/12/2026',
    kelompok: [
      { kelas: [1, 2], sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–09.00', 'Praktek Fiqh'], ['09.30–11.00', 'Praktek SBdP']) },
      { kelas: [3], sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–09.00', 'Praktek PJOK'], ['09.30–11.00', 'Praktek Fiqh']) },
      { kelas: [4], sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–09.00', 'MATEMATIKA'], ['09.30–11.00', 'Praktek Tajwid']) },
      { kelas: [5, 6], sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–09.00', 'MATEMATIKA'], ['09.30–11.00', 'Praktek Fiqh']) },
    ],
  },
  {
    iso: '2026-12-08',
    tanggal: 'Selasa, 08/12/2026',
    kelompok: [
      { kelas: [1, 2, 3], sesi: sesi(['07.30–09.00', 'REMIDI DAN SUSULAN']) },
      { kelas: [4], sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–09.00', 'Praktek PJOK'], ['09.30–11.00', 'Praktek Fiqh']) },
      { kelas: [5], sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–09.00', 'Praktek SBdP'], ['09.30–11.00', 'Praktek Coding']) },
      { kelas: [6], sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–09.00', 'Praktek PJOK'], ['09.30–11.00', 'Praktek SBdP']) },
    ],
  },
  {
    iso: '2026-12-09',
    tanggal: 'Rabu, 09/12/2026',
    kelompok: [
      { kelas: [1, 2, 3], sesi: sesi(['07.30–11.00', 'REMIDI DAN SUSULAN']) },
      { kelas: [4], sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–11.00', 'Praktek SBdP']) },
      { kelas: [5], sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–11.00', 'Praktek PJOK']) },
      { kelas: [6], sesi: sesi(['07.00–07.30', 'Pembekalan'], ['07.30–11.00', 'Praktek Coding']) },
    ],
  },
  { iso: '2026-12-10', tanggal: 'Kamis, 10/12/2026', kelompok: [{ kelas: SEMUA, sesi: sesi(['07.00–11.00', 'REMIDI DAN SUSULAN']) }] },
]

/** Angka jenjang dari teks kelas, misalnya "4D" atau "Kelas 2B" menjadi 4 atau 2. */
export function jenjangDariKelas(kelas: string) {
  const cocok = String(kelas || '').match(/([1-6])/)
  const angka = cocok ? Number(cocok[1]) : 0
  return angka >= 1 && angka <= 6 ? angka : null
}

export function jadwalAsasUntukJenjang(jenjang: number): HariJadwalJenjang[] {
  return JADWAL_ASAS.flatMap((hari) => {
    const kelompok = hari.kelompok.find((item) => item.kelas.includes(jenjang))
    return kelompok ? [{ iso: hari.iso, tanggal: hari.tanggal, sesi: kelompok.sesi }] : []
  })
}

function geserIso(iso: string, hari: number) {
  const [tahun, bulan, tanggal] = iso.split('-').map(Number)
  return new Date(Date.UTC(tahun, bulan - 1, tanggal + hari)).toISOString().slice(0, 10)
}

export function tanggalLokalJakarta(offsetHari = 0) {
  const hariIni = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  return offsetHari === 0 ? hariIni : geserIso(hariIni, offsetHari)
}

export function statusHariAsas(iso: string, acuan: { kemarin: string; hariIni: string; besok: string }): StatusHariAsas | null {
  if (iso === acuan.kemarin) return 'Kemarin'
  if (iso === acuan.hariIni) return 'Hari Ini'
  if (iso === acuan.besok) return 'Besok'
  return null
}

export function jadwalAsasRingkas(daftar: HariJadwalJenjang[], hariIni = tanggalLokalJakarta()) {
  const kemarin = geserIso(hariIni, -1)
  const besok = geserIso(hariIni, 1)
  const tigaHari = daftar.filter((hari) => hari.iso === kemarin || hari.iso === hariIni || hari.iso === besok)
  if (tigaHari.length > 0) {
    return { items: tigaHari, cadangan: false as const, selesai: false as const, acuan: { kemarin, hariIni, besok } }
  }
  const berikutnya = daftar.find((hari) => hari.iso > hariIni)
  return {
    items: berikutnya ? [berikutnya] : [],
    cadangan: Boolean(berikutnya),
    selesai: !berikutnya,
    acuan: { kemarin, hariIni, besok },
  }
}
