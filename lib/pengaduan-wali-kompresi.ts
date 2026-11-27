'use client'

const KUALITAS_WEBP = 0.82
const KUALITAS_JPEG = 0.85

function blobKeFile(blob: Blob, nama: string, tipe: string) {
  return new File([blob], nama, { type: tipe, lastModified: Date.now() })
}

function muatGambarDariFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Gambar tidak dapat dibaca.'))
    }
    img.src = url
  })
}

/** Kompresi gambar di klien (WebP/JPEG, sisi terpanjang ≤ sisiMaks). GIF tidak diubah. */
export async function kompresGambarPengaduan(file: File, sisiMaks: number): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file

  const img = await muatGambarDariFile(file)
  const terpanjang = Math.max(img.width, img.height, 1)
  const skala = Math.min(1, sisiMaks / terpanjang)
  const lebar = Math.max(1, Math.round(img.width * skala))
  const tinggi = Math.max(1, Math.round(img.height * skala))

  const canvas = document.createElement('canvas')
  canvas.width = lebar
  canvas.height = tinggi
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(img, 0, 0, lebar, tinggi)

  const dasar = file.name.replace(/\.[^.]+$/, '') || 'lampiran'

  const webp = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', KUALITAS_WEBP))
  if (webp && webp.size > 0 && webp.size < file.size) {
    return blobKeFile(webp, `${dasar}.webp`, 'image/webp')
  }

  const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', KUALITAS_JPEG))
  if (jpeg && jpeg.size > 0) {
    return blobKeFile(jpeg, `${dasar}.jpg`, 'image/jpeg')
  }

  return file
}