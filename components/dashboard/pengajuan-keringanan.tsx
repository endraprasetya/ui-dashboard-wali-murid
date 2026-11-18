'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, FileText, X } from 'lucide-react'
import { kirimPengajuanKeringanan, kirimSuratResmiKeringanan } from '@/lib/keringanan-actions'
import { draftSuratResmiKeringanan } from '@/lib/surat-resmi-keringanan'
import { NoticeStatusKeringanan } from '@/components/dashboard/notice-status-keringanan'
import { PratinjauSuratRekomendasi, PratinjauSuratResmiWali } from '@/components/dashboard/pratinjau-surat-keringanan'
import {
  formatTanggalKeringanan,
  KLAUSUL_SURAT_KERINGANAN_WAJIB,
  rupiahKeringanan,
  type PengajuanKeringanan,
  type StatusPengajuanKeringanan,
} from '@/lib/pengajuan-keringanan-tampilan'
import { formatKesanggupanBayar } from '@/lib/surat-resmi-keringanan'

function defaultTanggal() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().slice(0, 10)
}

function ModalKonfirmasi({
  judul,
  pesan,
  onTutup,
}: {
  judul: string
  pesan: string
  onTutup: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle2 className="size-6" aria-hidden="true" />
          <h2 className="text-base font-bold text-foreground">{judul}</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pesan}</p>
        <button
          type="button"
          onClick={onTutup}
          className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
        >
          Mengerti
        </button>
      </div>
    </div>
  )
}

function FormSuratResmi({
  pengajuan,
  onSukses,
}: {
  pengajuan: PengajuanKeringanan
  onSukses: () => void
}) {
  const [namaWali, setNamaWali] = useState('')
  const [tambahan, setTambahan] = useState('')
  const [setuju, setSetuju] = useState(false)
  const [menyimpan, setMenyimpan] = useState(false)
  const [galat, setGalat] = useState('')

  const pratinjau = useMemo(
    () => draftSuratResmiKeringanan(pengajuan, namaWali || 'Wali Murid', tambahan),
    [pengajuan, namaWali, tambahan],
  )

  const kirim = async (event: FormEvent) => {
    event.preventDefault()
    if (!setuju) {
      setGalat('Anda harus menyetujui pernyataan wajib.')
      return
    }
    setMenyimpan(true)
    setGalat('')
    const hasil = await kirimSuratResmiKeringanan({
      idPengajuan: pengajuan.id,
      namaWali: namaWali.trim(),
      pernyataanTambahan: tambahan.trim(),
      setujuKlausul: setuju,
    })
    setMenyimpan(false)
    if (hasil.error) {
      setGalat(hasil.error)
      return
    }
    onSukses()
  }

  return (
    <section className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4">
      <h3 className="text-sm font-extrabold text-emerald-950">Draft Surat Resmi Pengajuan Keringanan / Penundaan Pembayaran</h3>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Pengajuan telah disetujui. Lengkapi surat pernyataan resmi berikut. Setelah dikirim, kesanggupan pembayaran langsung berlaku.
      </p>
      <form onSubmit={(e) => void kirim(e)} className="mt-3 space-y-3">
        <label className="block text-xs font-semibold">
          Nama wali murid (penandatangan)
          <input
            required
            value={namaWali}
            onChange={(e) => setNamaWali(e.target.value)}
            className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm"
            placeholder="Nama lengkap wali murid"
          />
        </label>
        <label className="block text-xs font-semibold">
          Pernyataan tambahan (opsional)
          <textarea
            value={tambahan}
            onChange={(e) => setTambahan(e.target.value)}
            rows={2}
            maxLength={1500}
            className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm"
          />
        </label>
        <div className="rounded-xl border border-dashed bg-muted/40 p-3 text-[11px] leading-relaxed whitespace-pre-wrap text-foreground">
          {pratinjau}
        </div>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-950">
          {KLAUSUL_SURAT_KERINGANAN_WAJIB}
        </p>
        <label className="flex items-start gap-2 text-xs font-medium">
          <input type="checkbox" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} className="mt-0.5" />
          <span>Saya menyatakan telah membaca draft surat dan menyetujui pernyataan wajib di atas.</span>
        </label>
        {galat ? <p className="text-xs text-destructive">{galat}</p> : null}
        <button
          type="submit"
          disabled={menyimpan || !namaWali.trim()}
          className="w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-bold text-white disabled:opacity-60 sm:w-auto sm:px-6"
        >
          {menyimpan ? 'Mengirim...' : 'Simpan / Kirim Surat Resmi'}
        </button>
      </form>
    </section>
  )
}

export function TombolAjukanKeringanan({
  tunggakan,
  yatim,
  pengajuan,
}: {
  tunggakan: number
  yatim?: boolean
  pengajuan: PengajuanKeringanan | null
}) {
  const router = useRouter()
  const [modal, setModal] = useState(false)
  const [nominal, setNominal] = useState('')
  const [tanggal, setTanggal] = useState(defaultTanggal)
  const [alasan, setAlasan] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)
  const [galat, setGalat] = useState('')
  const [konfirmasiAwal, setKonfirmasiAwal] = useState(false)
  const [konfirmasiSurat, setKonfirmasiSurat] = useState(false)
  const [suratBaruTerkirim, setSuratBaruTerkirim] = useState(false)
  const [pratinjau, setPratinjau] = useState<'rekomendasi' | 'wali' | null>(null)

  const status: StatusPengajuanKeringanan | null = pengajuan?.statusPersetujuan ?? null
  const suratTerkirim = Boolean(pengajuan?.suratResmiDikirimPada) || suratBaruTerkirim
  const pengajuanTampil = pengajuan
    ? suratBaruTerkirim && !pengajuan.suratResmiDikirimPada
      ? { ...pengajuan, suratResmiDikirimPada: new Date().toISOString() }
      : pengajuan
    : null
  const bolehAjukan = !yatim && tunggakan > 0 && (!status || status === 'Ditolak')

  const kirimPengajuan = async (event: FormEvent) => {
    event.preventDefault()
    setMenyimpan(true)
    setGalat('')
    const angka = Number(String(nominal).replace(/\D/g, ''))
    const hasil = await kirimPengajuanKeringanan({
      nominalKesanggupan: angka,
      tanggalRencanaLunas: tanggal,
      nominalTunggakan: tunggakan,
      alasanPengajuan: alasan.trim(),
    })
    setMenyimpan(false)
    if (hasil.error) {
      setGalat(hasil.error)
      return
    }
    setModal(false)
    setNominal('')
    setAlasan('')
    setKonfirmasiAwal(true)
  }

  const tutupKonfirmasiAwal = () => {
    setKonfirmasiAwal(false)
    router.refresh()
  }

  const tutupKonfirmasiSurat = () => {
    setKonfirmasiSurat(false)
    router.refresh()
  }

  if (!pengajuan && (yatim || tunggakan <= 0)) return null
  const dokumenSiap = status === 'Disetujui' && suratTerkirim && Boolean(pengajuanTampil)
  const sembunyikanPengingat = dokumenSiap && tunggakan <= 0

  return (
    <>
      <div id="keringanan" className="mt-5 scroll-mt-24 rounded-2xl border border-sky-200 bg-sky-50/50 p-4">
        <div className="flex items-start gap-2">
          <FileText className="mt-0.5 size-4 shrink-0 text-sky-800" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">Permohonan keringanan / penundaan</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {dokumenSiap
                ? 'Surat persetujuan Kepala Sekolah dan surat pernyataan wali dapat dibuka kembali di bawah.'
                : 'Ajukan apabila ananda memerlukan keringanan atau penjadwalan ulang pelunasan tagihan.'}
            </p>

            {bolehAjukan ? (
              <button
                type="button"
                onClick={() => setModal(true)}
                className="mt-3 w-full rounded-xl bg-sky-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-sky-900 sm:w-auto"
              >
                {status === 'Ditolak' ? 'Ajukan permohonan kembali' : 'Ajukan Permohonan Keringanan / Penundaan Pembayaran'}
              </button>
            ) : null}

            {pengajuanTampil && !sembunyikanPengingat ? <NoticeStatusKeringanan pengajuan={pengajuanTampil} /> : null}

            {status === 'Disetujui' && !suratTerkirim && pengajuan ? (
              <FormSuratResmi
                pengajuan={pengajuan}
                onSukses={() => {
                  setSuratBaruTerkirim(true)
                  setKonfirmasiSurat(true)
                  router.refresh()
                }}
              />
            ) : null}

            {status === 'Disetujui' && suratTerkirim && pengajuan && tunggakan > 0 ? (
              <div className="mt-2 rounded-xl border border-sky-200 bg-white px-3 py-2 text-[11px] leading-relaxed text-sky-950">
                <p>
                  Kesanggupan {formatKesanggupanBayar(pengajuan.kesanggupanBayar)} · batas pelunasan{' '}
                  {formatTanggalKeringanan(pengajuan.tanggalRencanaLunas)}
                </p>
                <p className="mt-1 font-medium">Sisa tagihan belum terbayar {rupiahKeringanan(tunggakan)}.</p>
              </div>
            ) : null}

            {dokumenSiap && pengajuanTampil ? (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setPratinjau('rekomendasi')}
                  className="rounded-xl border border-emerald-700 bg-white px-3 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-50"
                >
                  Lihat Surat Rekomendasi
                </button>
                <button
                  type="button"
                  onClick={() => setPratinjau('wali')}
                  className="rounded-xl border border-sky-800 bg-white px-3 py-2 text-xs font-bold text-sky-950 hover:bg-sky-50"
                >
                  Lihat Surat Resmi Wali
                </button>
              </div>
            ) : null}

            {galat && !modal ? <p className="mt-2 text-xs text-destructive">{galat}</p> : null}
          </div>
        </div>
      </div>

      {konfirmasiAwal ? (
        <ModalKonfirmasi
          judul="Pengajuan berhasil disimpan"
          pesan="Form pengajuan keringanan telah tersimpan dengan status Pending. Pengajuan Anda sedang menunggu persetujuan Kepala Sekolah."
          onTutup={tutupKonfirmasiAwal}
        />
      ) : null}

      {pratinjau === 'rekomendasi' && pengajuanTampil ? (
        <PratinjauSuratRekomendasi pengajuan={pengajuanTampil} onTutup={() => setPratinjau(null)} />
      ) : null}
      {pratinjau === 'wali' && pengajuanTampil ? (
        <PratinjauSuratResmiWali pengajuan={pengajuanTampil} onTutup={() => setPratinjau(null)} />
      ) : null}

      {konfirmasiSurat ? (
        <ModalKonfirmasi
          judul="Surat resmi berhasil dikirim"
          pesan="Surat resmi telah dikirim. Segera lakukan kesanggupannya sesuai surat tersebut."
          onTutup={tutupKonfirmasiSurat}
        />
      ) : null}

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-bold text-foreground">Form pengajuan keringanan</h2>
              <button type="button" onClick={() => setModal(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted" aria-label="Tutup">
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Total tunggakan saat ini: {rupiahKeringanan(tunggakan)}</p>
            <form onSubmit={(e) => void kirimPengajuan(e)} className="mt-4 space-y-3">
              <label className="block text-xs font-semibold text-foreground">
                Nominal kesanggupan bayar (Rp)
                <input
                  inputMode="numeric"
                  required
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value.replace(/[^\d]/g, ''))}
                  className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold text-foreground">
                Alasan pengajuan (opsional)
                <textarea value={alasan} onChange={(e) => setAlasan(e.target.value)} rows={3} maxLength={2000} className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" />
              </label>
              <label className="block text-xs font-semibold text-foreground">
                Tanggal rencana pelunasan
                <input type="date" required value={tanggal} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setTanggal(e.target.value)} className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" />
              </label>
              {galat ? <p className="text-xs text-destructive">{galat}</p> : null}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setModal(false)} className="flex-1 rounded-xl border py-2.5 text-sm font-semibold">
                  Batal
                </button>
                <button type="submit" disabled={menyimpan} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
                  {menyimpan ? 'Mengirim...' : 'Kirim pengajuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}