'use server'

import { updateTag } from 'next/cache'
import { getDataDiriSiswa } from '@/lib/data-diri'
import { KOLOM_EDIT } from '@/lib/data-diri-shared'
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

  const saatIni = await getDataDiriSiswa(session.idSiswa)
  if (saatIni.error) return { error: saatIni.error }
  if (!saatIni.data) return { error: 'Data buku induk ananda belum tertaut.' }

  const payload: Record<string, string | number | null> = {}
  for (const kunci of KOLOM_EDIT) {
    const hasil = nilaiKolom(kunci, formData.get(kunci))
    if (hasil.error) return { error: hasil.error }
    payload[kunci] = hasil.nilai
  }

  const baris: DataDiri = saatIni.data
  const { data, error } = await getSupabase()
    .from('data_diri_siswa')
    .update(payload)
    .eq('nomor_induk_sekolah', baris.nomor_induk_sekolah)
    .eq('nama_lengkap', baris.nama_lengkap)
    .select('nama_lengkap')

  if (error) return { error: 'Perubahan belum tersimpan. Periksa isian lalu coba lagi.' }
  if (!data?.length) {
    return { error: 'Perubahan ditolak oleh database. Hak ubah tabel buku induk belum dibuka untuk portal wali.' }
  }
  updateTag(`wali:${session.idSiswa}:diri`)
  return { error: null }
}
