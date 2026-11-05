/** Normalisasi nama kelas untuk mencocokkan baris jurnal. */
export function normalKelasJurnal(kelas?: string) {
  return String(kelas || '')
    .toUpperCase()
    .replace(/KELAS/g, '')
    .replace(/[^A-Z0-9]/g, '')
}
