export type TagihanAmpss = {
  tapel: string
  keterangan: string
  jumlah: number
  status: 'Belum terbayar'
}

export type RiwayatAmpss = {
  tanggal: string
  tapel: string
  keterangan: string
  jumlah: number
  status: 'Lunas'
}

export type RingkasAmpss = {
  terbayar: number
  belumTerbayar: number
}

export type HasilParseAmpss = {
  tagihan: TagihanAmpss[]
  riwayat: RiwayatAmpss[]
  ringkas: RingkasAmpss
}

function entitas(nilai: string) {
  return nilai
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
}

export function teksHtml(nilai: string) {
  return entitas(nilai.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

export function angkaRupiah(nilai: string) {
  const bersih = nilai.replace(/[^\d,.-]/g, '')
  if (!bersih) return 0
  const normal = bersih.includes(',') ? bersih.replace(/\./g, '').replace(',', '.') : bersih.replace(/\./g, '')
  const hasil = Number(normal)
  return Number.isFinite(hasil) ? hasil : 0
}

function tabelBerikutnya(html: string, judul: string) {
  const indeks = html.toLowerCase().indexOf(judul.toLowerCase())
  if (indeks < 0) return ''
  const mulai = html.toLowerCase().indexOf('<table', indeks)
  const akhir = mulai < 0 ? -1 : html.toLowerCase().indexOf('</table>', mulai)
  if (mulai < 0 || akhir < 0) return ''
  return html.slice(mulai, akhir + '</table>'.length)
}

function tabelYangMemuat(html: string, judul: string) {
  const indeks = html.toLowerCase().indexOf(judul.toLowerCase())
  if (indeks < 0) return ''
  const mulai = html.lastIndexOf('<table', indeks)
  const akhir = html.toLowerCase().indexOf('</table>', indeks)
  if (mulai < 0 || akhir < 0) return ''
  return html.slice(mulai, akhir + '</table>'.length)
}

function baris(html: string) {
  return [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((cocok) => [...cocok[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((sel) => sel[1]))
    .filter((sel) => sel.length > 0)
}

export function parseAmpss(html: string): HasilParseAmpss | null {
  if (!html || /name="password"/i.test(html)) return null

  const tagihanHtml = tabelBerikutnya(html, '>Belum Terbayar<')
  const riwayatHtml = tabelBerikutnya(html, 'Riwayat Pembayaran')
  const tagihan = baris(tagihanHtml).flatMap((sel) => {
    if (sel.length < 3) return []
    const keterangan = teksHtml(sel[1])
    if (!keterangan || /jumlah total/i.test(keterangan) || /jumlah total/i.test(teksHtml(sel[0]))) return []
    return [{ tapel: teksHtml(sel[0]), keterangan, jumlah: angkaRupiah(teksHtml(sel[2])), status: 'Belum terbayar' as const }]
  })
  const riwayat = baris(riwayatHtml).flatMap((sel) => {
    if (sel.length < 3) return []
    const keterangan = teksHtml(sel[1].replace(/<div[\s\S]*$/i, ''))
    if (!keterangan) return []
    const tapel = sel[1].match(/Tapel\s*:\s*([^<]+)/i)?.[1]?.trim() || ''
    return [{
      tanggal: teksHtml(sel[0]),
      tapel,
      keterangan,
      jumlah: angkaRupiah(teksHtml(sel[2])),
      status: 'Lunas' as const,
    }]
  })

  if (!tagihanHtml && !riwayatHtml) return null

  const ringkas: RingkasAmpss = { terbayar: 0, belumTerbayar: 0 }
  const ringkasHtml = tabelYangMemuat(html, 'Tagihan Terbayar')
  for (const sel of baris(ringkasHtml)) {
    const label = teksHtml(sel[0] || '')
    const jumlah = angkaRupiah(teksHtml(sel[1] || ''))
    if (/tagihan terbayar/i.test(label)) ringkas.terbayar = jumlah
    if (/belum terbayar/i.test(label)) ringkas.belumTerbayar = jumlah
  }
  if (!ringkas.belumTerbayar) ringkas.belumTerbayar = tagihan.reduce((total, item) => total + item.jumlah, 0)

  return { tagihan, riwayat, ringkas }
}
