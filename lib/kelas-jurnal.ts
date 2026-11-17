const PEMISAH_KELAS_UNIT = '::'

/** Nama kelas di layar. Awalan `Unit::` hanya ada di penyimpanan jurnal guru. */
export function kelasJurnalTampil(kelas?: string) {
  const teks = String(kelas || '').trim()
  const batas = teks.indexOf(PEMISAH_KELAS_UNIT)
  if (batas <= 0) return teks
  return teks.slice(batas + PEMISAH_KELAS_UNIT.length).trim()
}

export function unitDariKelasJurnal(kelas?: string) {
  const teks = String(kelas || '').trim()
  const batas = teks.indexOf(PEMISAH_KELAS_UNIT)
  if (batas <= 0) return ''
  return teks.slice(0, batas).trim()
}

/** Normalisasi nama kelas untuk mencocokkan baris jurnal, termasuk `Nogosari::1B`. */
export function normalKelasJurnal(kelas?: string) {
  return kelasJurnalTampil(kelas)
    .toUpperCase()
    .replace(/KELAS/g, '')
    .replace(/[^A-Z0-9]/g, '')
}

function unitPenyimpananJurnal(unit: string) {
  const k = unit.toLowerCase()
  if (k.includes('kartasura')) return 'Kartasura'
  if (k.includes('cepogo')) return 'Cepogo'
  if (k.includes('nogosari')) return 'Nogosari'
  return unit.trim()
}

/** Varian nama kelas yang mungkin tersimpan: 1B, Kelas 1B, dan Unit::1B. */
export function variasiKelasJurnal(kelas: string, unit = '') {
  const tampil = kelasJurnalTampil(kelas).replace(/\s+/g, ' ').trim()
  if (!tampil) return []
  const rapat = tampil.replace(/\s+/g, '')
  const dasar = [tampil, rapat, `Kelas ${tampil}`]
  const mentah = unitDariKelasJurnal(kelas) || unit.trim()
  const namaUnit = Array.from(new Set([mentah, unitPenyimpananJurnal(mentah)].filter(Boolean)))
  const denganUnit = namaUnit.flatMap((unitNama) => dasar.map((nama) => `${unitNama}${PEMISAH_KELAS_UNIT}${nama}`))
  return Array.from(new Set([...dasar, ...denganUnit].filter(Boolean)))
}

export function unitJurnalSama(a?: string | null, b?: string | null) {
  const ka = String(a ?? '').trim().toLowerCase()
  const kb = String(b ?? '').trim().toLowerCase()
  if (!ka || !kb) return false
  if (ka === kb) return true
  return ['kartasura', 'cepogo', 'nogosari'].some((nama) => ka.includes(nama) && kb.includes(nama))
}

export function filterOrKelasJurnal(nama: string[]) {
  return nama
    .map((item) => {
      const aman = item.replace(/"/g, '')
      return /[^A-Za-z0-9]/.test(aman) ? `kelas.eq."${aman}"` : `kelas.eq.${aman}`
    })
    .join(',')
}
