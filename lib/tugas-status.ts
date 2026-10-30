export function adaIsiTugas(nilai: string) {
  const teks = nilai.trim()
  if (!teks || teks === '-') return false
  const isi = teks
    .replace(/[ZzMm]\s*:/g, ' ')
    .replace(/[|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return isi.length > 0
}

export function sudahDikonfirmasi(status: string) {
  const nilai = status.trim().toLowerCase()
  return nilai === 'sudah dikerjakan' || nilai === 'sudah dikonfirmasi'
}

export function labelStatusTugas(status: string) {
  return sudahDikonfirmasi(status) ? 'Sudah Dikerjakan' : 'Belum'
}

export function dahulukanBelumDikerjakan<T extends { status: string }>(baris: T[]) {
  const belum: T[] = []
  const sudah: T[] = []
  for (const row of baris) {
    if (sudahDikonfirmasi(row.status)) sudah.push(row)
    else belum.push(row)
  }
  return [...belum, ...sudah]
}
