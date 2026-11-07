'use server'

import { updateTag } from 'next/cache'
import { getDataDiriSiswa } from '@/lib/data-diri'
import { KOLOM_EDIT } from '@/lib/data-diri-shared'
import { muatSiswaUnit } from '@/lib/isolasi-kueri'
import { getSession } from '@/lib/session'
import { getSupabase } from '@/lib/supabase'
import type { DataDiri } from '@/lib/data-diri-shared'

const ANGKA = new Set(['nik', 'nisn', 'nik_ibu', 'anak_ke'])
const PANJANG: Record<string, number> = {
  nik: 16,
  nisn: 10,
  nik_ibu: 16,
  anak_ke: 2,
  telepon: 20,
}

function nilaiKolom(kunci: (typeof KOLOM_EDIT)[number], mentah: FormDataEntryValue | null) {
  const teks = String(mentah ?? '').trim().replace(/\s+/g, ' ')
  const batas = PANJANG[kunci] || 120
  const nama = kunci.replace(/_/g, ' ')
  if (teks.length > batas) return { error: `${nama} terlalu panjang.`, nilai: null }
  if (ANGKA.has(kunci) && teks && !/^\d+$/.test(teks)) return { error: `${nama} hanya boleh berisi angka.`, nilai: null }
  if (kunci === 'jenis_kelamin' && teks && teks !== 'Laki-laki' && teks !== 'Perempuan') {
    return { error: 'Jenis kelamin belum sesuai pilihan.', nilai: null }
  }
  if (kunci === 'anak_ke') return { error: null, nilai: teks ? Number(teks) : null }
  return { error: null, nilai: teks }
}

export async function updateDataDiri(formData: FormData): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session) return { error: 'Sesi berakhir. Silakan masuk lagi.' }

  const siswa = await muatSiswaUnit(session.idSiswa)
  if (!siswa) return { error: 'Data siswa belum bisa dimuat.' }

  const saatIni = await getDataDiriSiswa(session.idSiswa)
  if (saatIni.error) return { error: saatIni.error }
  if (!saatIni.data) return { error: 'Data buku induk ananda belum tertaut.' }

  const namaBaru = String(formData.get('nama_lengkap') ?? '')
    .trim()
    .replace(/\s+/g, ' ')
  if (!namaBaru) return { error: 'Nama lengkap anak wajib diisi.' }
  if (namaBaru.length > 120) return { error: 'Nama lengkap terlalu panjang.' }

  const payload: Record<string, string | number | null> = {}
  for (const kunci of KOLOM_EDIT) {
    const hasil = nilaiKolom(kunci, formData.get(kunci))
    if (hasil.error) return { error: hasil.error }
    payload[kunci] = hasil.nilai
  }

  const baris: DataDiri = saatIni.data
  const namaLama = baris.nama_lengkap
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('data_diri_siswa')
    .update({ ...payload, nama_lengkap: namaBaru })
    .eq('nomor_induk_sekolah', baris.nomor_induk_sekolah)
    .eq('nama_lengkap', namaLama)
    .select('nama_lengkap')

  if (error) return { error: 'Perubahan belum tersimpan. Periksa isian lalu coba lagi.' }
  if (!data?.length) {
    return { error: 'Perubahan ditolak oleh database. Hak ubah tabel buku induk belum dibuka untuk portal wali.' }
  }

  if (namaBaru !== namaLama) {
    let ubahSiswa = supabase.from('siswa').update({ nama_siswa: namaBaru }).eq('id_siswa', session.idSiswa)
    if (siswa.unit) ubahSiswa = ubahSiswa.eq('unit', siswa.unit)
    const { error: errSiswa } = await ubahSiswa
    if (errSiswa) {
      return { error: 'Nama di buku induk tersimpan, tetapi gagal memperbarui data siswa. Hubungi sekolah.' }
    }
  }

  updateTag(`wali:${session.idSiswa}:diri`)
  return { error: null }
}
