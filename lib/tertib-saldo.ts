export const MODAL_POIN_BULANAN = 200

export type SaldoTertibBulanan = {
  modal: number
  positif: number
  negatif: number
  sisa: number
}

type BarisLog = { sid?: string; month?: string; pts?: number }

export function hitungSaldoTertibBulanan(
  logs: BarisLog[],
  idSiswa: string,
  bulan: string,
  modal = MODAL_POIN_BULANAN,
): SaldoTertibBulanan {
  let positif = 0
  let negatif = 0
  const sid = String(idSiswa)
  for (const row of logs) {
    if (String(row.sid) !== sid || row.month !== bulan) continue
    const pts = Number(row.pts) || 0
    if (pts > 0) positif += pts
    else negatif += Math.abs(pts)
  }
  const sisa = modal + positif - negatif
  return { modal, positif, negatif, sisa }
}

export type BarisPeringkatKelas = {
  id: string
  nama: string
  kelas: string
  sisa: number
  positif: number
  negatif: number
  peringkat: number
}

export function tigaBesarKelas(
  siswaKelas: { id: string; name: string; kelas: string }[],
  logs: BarisLog[],
  bulan: string,
  limit = 3,
): BarisPeringkatKelas[] {
  return [...siswaKelas]
    .map((s) => {
      const saldo = hitungSaldoTertibBulanan(logs, s.id, bulan)
      return {
        id: s.id,
        nama: s.name,
        kelas: s.kelas,
        sisa: saldo.sisa,
        positif: saldo.positif,
        negatif: saldo.negatif,
      }
    })
    .sort((a, b) => b.sisa - a.sisa || b.positif - a.positif || a.nama.localeCompare(b.nama, 'id'))
    .slice(0, limit)
    .map((row, index) => ({ ...row, peringkat: index + 1 }))
}
