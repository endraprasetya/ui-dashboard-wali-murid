/** Normalisasi & perbandingan unit — isolasi multi-unit (ketat). */

export function unitKanonik(nilai?: string | null) {
  return String(nilai ?? '')
    .trim()
    .replace(/^unit\s+/i, '')
    .toLowerCase()
}

export function unitSama(a?: string | null, b?: string | null) {
  const ka = unitKanonik(a)
  const kb = unitKanonik(b)
  return Boolean(ka && kb && ka === kb)
}

export function unitLogin(nilai?: string | null) {
  const bersih = String(nilai ?? '').trim()
  if (!bersih || /^semua\s*unit$/i.test(bersih) || /^unit belum diisi$/i.test(bersih)) return ''
  return bersih
}

export function kolomUnitTidakAda(error?: { code?: string; message?: string } | null) {
  const pesan = String(error?.message || '').toLowerCase()
  return (
    error?.code === 'PGRST204' ||
    error?.code === '42703' ||
    (pesan.includes('unit') &&
      (pesan.includes('does not exist') ||
        pesan.includes('schema cache') ||
        pesan.includes('could not find') ||
        pesan.includes('column')))
  )
}

/**
 * Buang baris unit lain. Baris tanpa kolom unit tetap lolos hanya jika id_siswa
 * termasuk himpunan siswa unit aktif (bila diberikan).
 */
export function saringBarisMilikUnit(
  rows: Record<string, unknown>[] | null | undefined,
  unit: string,
  opts?: { idSiswa?: string; idsSah?: Set<string> },
) {
  const unitAktif = unitLogin(unit)
  const daftar = rows ?? []
  return daftar.filter((row) => {
    if (opts?.idSiswa) {
      const sid = String(row.id_siswa ?? '').trim()
      if (sid && sid !== opts.idSiswa) return false
    }
    if (opts?.idsSah && opts.idsSah.size > 0) {
      const sid = String(row.id_siswa ?? '').trim()
      if (sid && !opts.idsSah.has(sid)) return false
    }
    const unitBaris = row.unit
    if (unitBaris == null || String(unitBaris).trim() === '') return Boolean(unitAktif || opts?.idSiswa)
    if (!unitAktif) return false
    return unitSama(unitBaris, unitAktif)
  })
}
