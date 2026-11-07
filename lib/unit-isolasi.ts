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
  if (!bersih || /^semua\s*unit$/i.test(bersih)) return ''
  return bersih
}
