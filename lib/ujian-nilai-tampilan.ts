import { labelPredikatUjian } from '@/lib/ujian-predikat'
import { catatanPenguji, type RekapanRingkas } from '@/lib/ujian-relasi'

export type HasilUjianCetak = {
  nomor: string
  nama: string
  kelas: string
  unit: string
  idSiswa?: string
  tanggal: string
  penguji: string
  guruPengampu: string
  jilidAsal: string
  jilidTujuan: string
  kelancaran: number
  makhraj: number
  harakat: number
  tajwid: number | null
  adab: number
  nilaiAkhir: number
  predikat: string
  keputusan: string
  catatan: string
}

function jilidTanpaTajwid(jilid?: string) {
  const j = String(jilid || '').toLowerCase()
  return j.includes('jilid 1') || j.includes('jilid 2')
}

export function rekapKeTampilanNilai(
  rekap: RekapanRingkas,
  pengganti?: { nama?: string; kelas?: string; unit?: string; id_siswa?: string },
): HasilUjianCetak {
  const asal = String(rekap.jilid_asal || '')
  return {
    nomor: String(rekap.id_ujian || ''),
    nama: String(rekap.nama || pengganti?.nama || 'Siswa'),
    kelas: String(rekap.kelas || pengganti?.kelas || '-'),
    unit: String(rekap.unit || pengganti?.unit || ''),
    idSiswa: String(rekap.id_siswa || pengganti?.id_siswa || ''),
    tanggal: String(rekap.tanggal_ujian || '').slice(0, 10),
    penguji: String(rekap.penguji || '-'),
    guruPengampu: String(rekap.guru_pengampu || '-'),
    jilidAsal: asal,
    jilidTujuan: String(rekap.jilid_tujuan || ''),
    kelancaran: Number(rekap.kelancaran || 0),
    makhraj: Number(rekap.makhraj || 0),
    harakat: Number(rekap.harakat || 0),
    tajwid: jilidTanpaTajwid(asal) ? null : Number(rekap.tajwid || 0),
    adab: Number(rekap.adab || 0),
    nilaiAkhir: Number(rekap.nilai_akhir || 0),
    predikat: labelPredikatUjian(rekap.predikat) || String(rekap.predikat || '-'),
    keputusan: String(rekap.keputusan || '-'),
    catatan: catatanPenguji(rekap),
  }
}
