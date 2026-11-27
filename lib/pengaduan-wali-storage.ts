'use client'

import { kompresGambarPengaduan } from '@/lib/pengaduan-wali-kompresi'
import {
  BUCKET_PENGADUAN_WALI,
  BATAS_GAMBAR_SEBELUM_KOMPRES,
  BATAS_LAMPIRAN,
  SISI_MAKS_KOMPRES_GAMBAR,
  type TipeLampiranPengaduan,
} from '@/lib/pengaduan-wali-shared'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

const IZIN_GAMBAR = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const IZIN_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime']
const IZIN_DOKUMEN = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

export function tipeLampiranDariBerkas(file: File): TipeLampiranPengaduan | null {
  if (IZIN_GAMBAR.includes(file.type)) return 'image'
  if (IZIN_VIDEO.includes(file.type)) return 'video'
  if (IZIN_DOKUMEN.includes(file.type)) return 'document'
  return null
}

export function validasiLampiranPengaduan(file: File): string | null {
  const tipe = tipeLampiranDariBerkas(file)
  if (!tipe) {
    return 'Lampiran harus berupa gambar (JPG/PNG/WebP), video (MP4/WebM), atau PDF.'
  }
  const batas = tipe === 'image' ? BATAS_GAMBAR_SEBELUM_KOMPRES : BATAS_LAMPIRAN[tipe]
  if (file.size > batas) {
    const mb = Math.round(batas / (1024 * 1024))
    return tipe === 'image'
      ? `Ukuran foto asli melebihi ${mb} MB. Pilih foto lain atau kirim tanpa lampiran.`
      : `Ukuran lampiran melebihi ${mb} MB.`
  }
  return null
}

export function pesanGalatStoragePengaduan(pesan: string) {
  if (/bucket not found|404/i.test(pesan)) {
    return 'Penyimpanan lampiran sekolah belum siap. Pengaduan tetap bisa dikirim tanpa lampiran, atau coba lagi nanti.'
  }
  if (/row-level security|policy|403|not authorized/i.test(pesan)) {
    return 'Unggah lampiran ditolak pengaturan server. Pengaduan tetap bisa dikirim tanpa lampiran.'
  }
  if (/storage|upload|failed|network|fetch/i.test(pesan)) {
    return 'Lampiran belum dapat diunggah. Pengaduan tetap bisa dikirim tanpa lampiran.'
  }
  return ''
}

export function galatStorageBolehLanjutTanpaLampiran(pesan: string) {
  return Boolean(pesanGalatStoragePengaduan(pesan))
}

function ekstensiAman(nama: string, fallback: string) {
  const potong = nama.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '')
  return potong && potong.length <= 8 ? potong : fallback
}

export async function unggahLampiranPengaduan(idSiswa: string, file: File): Promise<{ url: string; tipe: TipeLampiranPengaduan }> {
  const galat = validasiLampiranPengaduan(file)
  if (galat) throw new Error(galat)
  const tipe = tipeLampiranDariBerkas(file)
  if (!tipe) throw new Error('Tipe lampiran tidak dikenali.')

  let siap = file
  if (tipe === 'image') {
    siap = await kompresGambarPengaduan(file, SISI_MAKS_KOMPRES_GAMBAR)
    if (siap.size > BATAS_LAMPIRAN.image) {
      throw new Error('Foto masih terlalu besar setelah kompresi. Pilih gambar lain atau kirim tanpa lampiran.')
    }
  } else if (siap.size > BATAS_LAMPIRAN[tipe]) {
    const mb = Math.round(BATAS_LAMPIRAN[tipe] / (1024 * 1024))
    throw new Error(`Ukuran lampiran melebihi ${mb} MB.`)
  }

  const supabase = getSupabaseBrowser()
  const ext = ekstensiAman(
    siap.name,
    tipe === 'document' ? 'pdf' : tipe === 'video' ? 'mp4' : siap.type === 'image/webp' ? 'webp' : 'jpg',
  )
  const path = `${idSiswa.replace(/[^\w-]/g, '_')}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(BUCKET_PENGADUAN_WALI).upload(path, siap, {
    contentType: siap.type || undefined,
    upsert: false,
  })
  if (error) {
    throw new Error(error.message || 'Lampiran belum dapat diunggah.')
  }

  const { data } = supabase.storage.from(BUCKET_PENGADUAN_WALI).getPublicUrl(path)
  return { url: data.publicUrl, tipe }
}