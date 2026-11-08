export function labelPredikatUjian(predikat?: string | null) {
  const p = String(predikat ?? '').trim()
  if (!p || p === '-') return '—'
  if (p.toLowerCase() === 'maqbul') return 'Mengulang'
  return p
}

export function lulusUjian(keputusan?: string) {
  return String(keputusan || '')
    .trim()
    .toLowerCase()
    .includes('lulus')
}
