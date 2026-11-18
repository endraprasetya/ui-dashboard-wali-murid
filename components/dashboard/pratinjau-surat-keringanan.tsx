'use client'

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import {
  formatTanggalKeringanan,
  KLAUSUL_SURAT_KERINGANAN_WAJIB,
  rupiahKeringanan,
  type PengajuanKeringanan,
} from '@/lib/pengajuan-keringanan-tampilan'
import { formatKesanggupanBayar } from '@/lib/surat-resmi-keringanan'

const KEPALA_SEKOLAH = {
  nama: 'Sri Sunarko Utomo, S.Pd',
  niy: '197805202013 0208',
}

function tanggalSurat(iso: string) {
  return formatTanggalKeringanan(iso) || formatTanggalKeringanan(new Date().toISOString())
}

function tempatSurat(unit: string) {
  return unit && !/nogosari/i.test(unit) ? unit : 'Nogosari'
}

function ModalSurat({
  judul,
  onTutup,
  children,
}: {
  judul: string
  onTutup: () => void
  children: ReactNode
}) {
  useEffect(() => {
    const tutup = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onTutup()
    }
    window.addEventListener('keydown', tutup)
    const sebelumnya = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', tutup)
      document.body.style.overflow = sebelumnya
    }
  }, [onTutup])

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-3 sm:items-center" role="dialog" aria-modal="true" aria-label={judul}>
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-slate-100 shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b bg-white px-4 py-3">
          <h2 className="text-sm font-extrabold text-slate-900">{judul}</h2>
          <button type="button" onClick={onTutup} className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white" aria-label="Tutup pratinjau">
            <X className="size-3.5" /> Tutup
          </button>
        </div>
        <div className="overflow-auto p-3 sm:p-5">{children}</div>
      </div>
    </div>
  )
}

function Kertas({ children }: { children: ReactNode }) {
  return (
    <article className="mx-auto max-w-[210mm] bg-white px-5 py-6 text-[13px] leading-relaxed text-slate-950 shadow-sm sm:px-8 sm:py-8" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      <img src="/surat/kop-surat.jpg" alt="Kop surat SD Islam Terpadu Al Madinah" className="mx-auto mb-5 block w-full" />
      {children}
    </article>
  )
}

export function PratinjauSuratRekomendasi({
  pengajuan,
  onTutup,
}: {
  pengajuan: PengajuanKeringanan
  onTutup: () => void
}) {
  const tempat = tempatSurat(pengajuan.unit)
  return (
    <ModalSurat judul="Surat Rekomendasi Kepala Sekolah" onTutup={onTutup}>
      <Kertas>
        <table className="w-full">
          <tbody>
            <tr>
              <td className="w-24 align-top">Nomor</td>
              <td className="w-3 align-top">:</td>
              <td>{pengajuan.nomorSuratRekomendasi || '—'}</td>
            </tr>
            <tr>
              <td className="align-top">Lampiran</td>
              <td>:</td>
              <td>-</td>
            </tr>
            <tr>
              <td className="align-top">Perihal</td>
              <td>:</td>
              <td className="font-bold underline">Persetujuan Keringanan / Penundaan Pembayaran</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-5">
          <p>Kepada</p>
          <p>Yth. Wali Murid dari Ananda {pengajuan.namaSiswa}</p>
          <p>
            (Kelas {pengajuan.kelas || '—'}, NIS {pengajuan.nis})
          </p>
          <p>di tempat</p>
        </div>
        <p className="mt-4">Assalamu&apos;alaikum Warahmatullahi Wabarakatuh.</p>
        <p className="mt-3 text-justify">Dengan hormat,</p>
        <p className="mt-3 text-justify">
          Menindaklanjuti permohonan yang diajukan wali murid, Kepala Sekolah memberikan persetujuan keringanan / penundaan pelunasan bagi Ananda <strong>{pengajuan.namaSiswa}</strong> (Kelas {pengajuan.kelas || '—'}, NIS {pengajuan.nis}).
        </p>
        <table className="my-3 ml-4">
          <tbody>
            <tr>
              <td className="w-40 align-top">Akumulasi tunggakan</td>
              <td className="w-3 align-top">:</td>
              <td>{rupiahKeringanan(pengajuan.nominalTunggakan)}</td>
            </tr>
            <tr>
              <td className="align-top">Kesanggupan pelunasan</td>
              <td>:</td>
              <td>{formatKesanggupanBayar(pengajuan.kesanggupanBayar)}</td>
            </tr>
            <tr>
              <td className="align-top">Target pelunasan</td>
              <td>:</td>
              <td>{formatTanggalKeringanan(pengajuan.tanggalRencanaLunas) || '—'}</td>
            </tr>
          </tbody>
        </table>
        <p className="text-justify">
          Persetujuan ini berlaku sepanjang komitmen di atas dipenuhi pada target waktu tersebut. Apabila sampai batas waktu itu pelunasan belum diterima, administrasi keuangan kembali mengikuti ketentuan sekolah.
        </p>
        <p className="mt-3 text-justify">
          Demikian surat rekomendasi ini dibuat untuk dipergunakan sebagaimana mestinya. Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.
        </p>
        <p className="mt-3">Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh.</p>
        <div className="mt-8 ml-auto w-56 text-center">
          <p>
            {tempat}, {tanggalSurat(pengajuan.diputuskanPada)}
          </p>
          <p>Kepala Sekolah</p>
          <div className="relative mx-auto h-24">
            <img src="/surat/stempel.png" alt="" className="absolute bottom-0 left-2 h-16 w-auto mix-blend-multiply" />
            <img src="/surat/tanda-tangan.png" alt="Tanda tangan Kepala Sekolah" className="absolute bottom-0 left-1/2 h-20 w-auto -translate-x-1/2 mix-blend-multiply" />
          </div>
          <p className="font-bold underline">{KEPALA_SEKOLAH.nama}</p>
          <p>NIY. {KEPALA_SEKOLAH.niy}</p>
        </div>
      </Kertas>
    </ModalSurat>
  )
}

export function PratinjauSuratResmiWali({
  pengajuan,
  onTutup,
}: {
  pengajuan: PengajuanKeringanan
  onTutup: () => void
}) {
  const isi = pengajuan.suratResmiIsi.trim()
  const tempat = tempatSurat(pengajuan.unit)
  return (
    <ModalSurat judul="Surat Resmi Wali Murid" onTutup={onTutup}>
      <Kertas>
        <div className="text-center">
          <h3 className="text-base font-bold uppercase underline">Surat Pernyataan Wali Murid</h3>
          <p className="mt-1 font-semibold">Permohonan Keringanan / Penundaan Pembayaran</p>
        </div>
        <p className="mt-5 text-justify">
          Yang bertanda tangan di bawah ini, wali murid dari ananda berikut, menyatakan kesanggupan pembayaran sesuai permohonan keringanan yang telah disetujui.
        </p>
        <table className="mt-4">
          <tbody>
            <tr>
              <td className="w-40 align-top font-semibold">Nama siswa</td>
              <td className="w-3 align-top">:</td>
              <td className="font-bold">{pengajuan.namaSiswa}</td>
            </tr>
            <tr>
              <td className="align-top font-semibold">NIS / Kelas</td>
              <td>:</td>
              <td>
                {pengajuan.nis}
                {pengajuan.kelas ? ` · Kelas ${pengajuan.kelas}` : ''}
              </td>
            </tr>
            <tr>
              <td className="align-top font-semibold">Kesanggupan</td>
              <td>:</td>
              <td>{formatKesanggupanBayar(pengajuan.kesanggupanBayar)}</td>
            </tr>
            <tr>
              <td className="align-top font-semibold">Batas pelunasan</td>
              <td>:</td>
              <td>{formatTanggalKeringanan(pengajuan.tanggalRencanaLunas) || '—'}</td>
            </tr>
            <tr>
              <td className="align-top font-semibold">Surat dikirim</td>
              <td>:</td>
              <td>{formatTanggalKeringanan(pengajuan.suratResmiDikirimPada) || '—'}</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-5">
          <p className="font-bold">Isi pernyataan:</p>
          <p className="mt-2 whitespace-pre-wrap text-justify">
            {isi || 'Isi surat resmi belum terbaca dari database. Muat ulang halaman Keuangan jika surat baru saja dikirim.'}
          </p>
        </div>
        {isi.includes(KLAUSUL_SURAT_KERINGANAN_WAJIB) ? null : (
          <p className="mt-4 border border-slate-800 px-3 py-2 text-justify italic">{KLAUSUL_SURAT_KERINGANAN_WAJIB}</p>
        )}
        <p className="mt-10 ml-auto w-48 text-center">
          {tempat}, {tanggalSurat(pengajuan.suratResmiDikirimPada)}
          <span className="mt-8 block">Wali Murid,</span>
        </p>
      </Kertas>
    </ModalSurat>
  )
}
