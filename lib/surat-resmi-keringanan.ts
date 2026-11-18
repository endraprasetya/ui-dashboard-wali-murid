import { formatTanggalKeringanan, KLAUSUL_SURAT_KERINGANAN_WAJIB, rupiahKeringanan } from '@/lib/pengajuan-keringanan-tampilan'
import type { PengajuanKeringanan } from '@/lib/pengajuan-keringanan-tampilan'

export function formatKesanggupanBayar(nilai: string) {
  const teks = String(nilai || '').trim()
  if (/^\d+$/.test(teks)) return rupiahKeringanan(Number(teks))
  return teks || '—'
}

export function draftSuratResmiKeringanan(
  pengajuan: Pick<PengajuanKeringanan, 'namaSiswa' | 'kelas' | 'nis' | 'nominalTunggakan' | 'kesanggupanBayar' | 'tanggalRencanaLunas' | 'alasanPengajuan'>,
  namaWali: string,
  pernyataanTambahan = '',
) {
  const nama = namaWali.trim() || 'Wali Murid'
  const tambahan = pernyataanTambahan.trim()
  return [
    'SURAT PERNYATAAN KERINGANAN / PENUNDAAN PEMBAYARAN',
    '',
    `Yang bertanda tangan di bawah ini, ${nama}, selaku wali murid dari ananda ${pengajuan.namaSiswa} (Kelas ${pengajuan.kelas}, NIS ${pengajuan.nis}), dengan ini menyatakan hal-hal sebagai berikut:`,
    '',
    `1. Mengajukan keringanan / penundaan pelunasan tagihan sekolah dengan total tunggakan ${rupiahKeringanan(pengajuan.nominalTunggakan)}.`,
    `2. Bersedia melunasi sesuai kesanggupan ${formatKesanggupanBayar(pengajuan.kesanggupanBayar)} paling lambat pada ${formatTanggalKeringanan(pengajuan.tanggalRencanaLunas)}.`,
    `3. Alasan pengajuan: ${pengajuan.alasanPengajuan || 'Sebagaimana telah diajukan melalui Portal Wali Murid.'}`,
    tambahan ? `4. Pernyataan tambahan: ${tambahan}` : null,
    '',
    'Dengan penuh tanggung jawab, saya berkomitmen memenuhi kesanggupan pembayaran sesuai kesepakatan di atas.',
    '',
    KLAUSUL_SURAT_KERINGANAN_WAJIB,
  ]
    .filter((baris): baris is string => Boolean(baris))
    .join('\n')
}