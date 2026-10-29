export const STANDAR_TARGET_QIROAH = [
  { kelas: 'Kelas 1', target: 'At-Tartil 1–3' },
  { kelas: 'Kelas 2', target: 'At-Tartil 4–6' },
  { kelas: 'Kelas 3–6', target: "Al-Qur'an" },
] as const

export function bobotCapaianQiroah(teks: string) {
  const nilai = teks.toLowerCase()
  if (
    nilai.includes('al quran') ||
    nilai.includes('al-quran') ||
    nilai.includes("al-qur'an") ||
    nilai.includes("al qur'an") ||
    nilai.includes('alquran') ||
    nilai.includes('talaqqi')
  ) {
    return 7
  }
  const jilid = nilai.match(/jilid\s*(\d)|at[\s-]*tartil\s*(\d)/)
  const angka = Number(jilid?.[1] || jilid?.[2] || 0)
  return angka >= 1 && angka <= 6 ? angka : 0
}

export function progresTargetQiroah(kelas: string, capaian: string) {
  const tingkat = parseInt(String(kelas).replace(/\D/g, ''), 10) || 0
  const standar = tingkat <= 1 ? STANDAR_TARGET_QIROAH[0] : tingkat === 2 ? STANDAR_TARGET_QIROAH[1] : STANDAR_TARGET_QIROAH[2]
  const bobotTarget = tingkat <= 1 ? 3 : tingkat === 2 ? 6 : 7
  const bobot = bobotCapaianQiroah(capaian)
  const persen = Math.min(100, Math.round((bobot / bobotTarget) * 100))
  return {
    target: standar.target,
    persen,
    tercapai: bobot >= bobotTarget,
  }
}
