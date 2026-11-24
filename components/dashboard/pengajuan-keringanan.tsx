'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, FileText, X } from 'lucide-react'
import { kirimPengajuanKeringanan } from '@/lib/keringanan-actions'
import { NoticeStatusKeringanan } from '@/components/dashboard/notice-status-keringanan'
import { PratinjauSuratRekomendasi } from '@/components/dashboard/pratinjau-surat-keringanan'
import {
  formatTanggalKeringanan,
  JENIS_KEGIATAN_PENGAJUAN,
  judulPengajuanKegiatan,
  labelMekanismePelunasan,
  MEKANISME_PELUNASAN,
  rupiahKeringanan,
  tanggalLokalJakarta,
  type PengajuanKeringanan,
  type StatusPengajuanKeringanan,
} from '@/lib/pengajuan-keringanan-tampilan'

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

function kelasStatus(status: StatusPengajuanKeringanan) {
  if (status === 'Disetujui') return 'bg-emerald-100 text-emerald-800'
  if (status === 'Ditolak') return 'bg-rose-100 text-rose-800'
  return 'bg-amber-100 text-amber-900'
}

export function ModalAjukanKegiatan({
  buka,
  tunggakan,
  onTutup,
  onSukses,
}: {
  buka: boolean
  tunggakan: number
  onTutup: () => void
  onSukses: (pengajuan?: PengajuanKeringanan | null) => void
}) {
  const [jenis, setJenis] = useState('')
  const [mekanisme, setMekanisme] = useState('')
  const [angsuran, setAngsuran] = useState('')
  const [tanggal, setTanggal] = useState(() => tanggalLokalJakarta(7))
  const [alasan, setAlasan] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)
  const [galat, setGalat] = useState('')

  if (!buka) return null

  const kirim = async (event: FormEvent) => {
    event.preventDefault()
    setMenyimpan(true)
    setGalat('')
    const angkaAngsuran = Number(String(angsuran).replace(/\D/g, ''))
    const hasil = await kirimPengajuanKeringanan({
      jenisKegiatan: jenis,
      mekanismePelunasan: mekanisme,
      nominalAngsuran: /angsur/i.test(mekanisme) ? angkaAngsuran : 0,
      tanggalRencanaLunas: tanggal,
      nominalTunggakan: tunggakan,
      alasanPengajuan: alasan.trim(),
    })
    setMenyimpan(false)
    if (hasil.error) {
      setGalat(hasil.error)
      return
    }
    setJenis('')
    setMekanisme('')
    setAngsuran('')
    setAlasan('')
    onTutup()
    onSukses(hasil.pengajuan)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-5 shadow-xl">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base font-bold leading-snug text-foreground">Ajukan mengikuti kegiatan</h2>
          <button type="button" onClick={onTutup} className="rounded-lg p-1 text-muted-foreground hover:bg-muted" aria-label="Tutup">
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={(e) => void kirim(e)} className="mt-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Total Tunggakan</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">{rupiahKeringanan(tunggakan)}</p>
          </div>
          <label className="block text-xs font-semibold text-foreground">
            Jenis Kegiatan / Keperluan
            <select required value={jenis} onChange={(e) => setJenis(e.target.value)} className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm">
              <option value="">Pilih jenis kegiatan</option>
              {JENIS_KEGIATAN_PENGAJUAN.map((opsi) => (
                <option key={opsi} value={opsi}>
                  {opsi}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-foreground">
            Alasan Pengajuan Rekomendasi
            <textarea required value={alasan} onChange={(e) => setAlasan(e.target.value)} rows={3} maxLength={2000} className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" />
          </label>
          <label className="block text-xs font-semibold text-foreground">
            Tanggal Rencana Pelunasan
            <input type="date" required value={tanggal} min={tanggalLokalJakarta()} onChange={(e) => setTanggal(e.target.value)} className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" />
          </label>
          <label className="block text-xs font-semibold text-foreground">
            Mekanisme Pelunasan
            <select
              required
              value={mekanisme}
              onChange={(e) => {
                setMekanisme(e.target.value)
                if (e.target.value !== 'Mengangsur tiap bulan') setAngsuran('')
              }}
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm"
            >
              <option value="">Pilih mekanisme pelunasan</option>
              {MEKANISME_PELUNASAN.map((opsi) => (
                <option key={opsi} value={opsi}>
                  {opsi}
                </option>
              ))}
            </select>
          </label>
          {mekanisme === 'Mengangsur tiap bulan' ? (
            <label className="block text-xs font-semibold text-foreground">
              sebesar Rp
              <input
                inputMode="numeric"
                required
                value={angsuran}
                onChange={(e) => setAngsuran(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="Nominal angsuran tiap bulan"
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm"
              />
            </label>
          ) : null}
          {galat ? <p className="text-xs text-destructive">{galat}</p> : null}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onTutup} className="flex-1 rounded-xl border py-2.5 text-sm font-semibold">
              Batal
            </button>
            <button type="submit" disabled={menyimpan} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {menyimpan ? 'Mengirim...' : 'Kirim pengajuan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function TombolAjukanKeringanan({
  tunggakan,
  yatim,
  pengajuan,
  daftar = [],
}: {
  tunggakan: number
  yatim?: boolean
  pengajuan: PengajuanKeringanan | null
  daftar?: PengajuanKeringanan[]
}) {
  const router = useRouter()
  const [modal, setModal] = useState(false)
  const [galat, setGalat] = useState('')
  const [konfirmasiAwal, setKonfirmasiAwal] = useState(false)
  const [pratinjau, setPratinjau] = useState(false)
  const [lokal, setLokal] = useState<PengajuanKeringanan[]>([])

  const riwayat = useMemo(() => {
    const gabung = [...lokal, ...daftar, pengajuan].filter((item): item is PengajuanKeringanan => Boolean(item))
    const unik = new Map<string, PengajuanKeringanan>()
    for (const item of gabung) {
      const kunci = item.id || `${item.jenisKegiatan}-${item.dibuatPada}`
      if (!unik.has(kunci)) unik.set(kunci, item)
    }
    return [...unik.values()].sort((a, b) => b.dibuatPada.localeCompare(a.dibuatPada))
  }, [daftar, lokal, pengajuan])
  const terkini = riwayat[0] ?? pengajuan
  const status: StatusPengajuanKeringanan | null = terkini?.statusPersetujuan ?? null
  const bolehAjukan = !yatim && tunggakan > 0 && (!status || status === 'Ditolak')
  const judulKartu = judulPengajuanKegiatan(terkini?.jenisKegiatan)

  const tutupKonfirmasiAwal = () => {
    setKonfirmasiAwal(false)
    router.refresh()
  }

  if (!terkini && (yatim || tunggakan <= 0)) return null
  const disetujui = status === 'Disetujui' && Boolean(terkini)

  return (
    <>
      <div id="keringanan" className="mt-5 scroll-mt-24 rounded-2xl border border-sky-200 bg-sky-50/50 p-4">
        <div className="flex items-start gap-2">
          <FileText className="mt-0.5 size-4 shrink-0 text-sky-800" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">{judulKartu}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {disetujui
                ? 'Pengajuan telah disetujui. Surat rekomendasi Kepala Sekolah dapat dibuka di bawah.'
                : 'Ajukan rekomendasi agar ananda dapat mengikuti kegiatan, ujian, atau pengambilan rapor.'}
            </p>

            {bolehAjukan ? (
              <button
                type="button"
                onClick={() => setModal(true)}
                className="mt-3 w-full whitespace-normal rounded-xl bg-sky-800 px-4 py-2.5 text-center text-sm font-bold leading-snug text-white transition hover:bg-sky-900 sm:w-auto"
              >
                Ajukan mengikuti kegiatan
              </button>
            ) : null}

            {terkini ? <NoticeStatusKeringanan pengajuan={terkini} /> : null}

            {riwayat.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {riwayat.map((item) => (
                  <li key={item.id || `${item.jenisKegiatan}-${item.dibuatPada}`} className="rounded-xl border bg-white px-3 py-2.5 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-extrabold text-foreground">{judulPengajuanKegiatan(item.jenisKegiatan)}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${kelasStatus(item.statusPersetujuan)}`}>
                        {item.statusPersetujuan}
                      </span>
                    </div>
                    <p className="mt-1 text-muted-foreground">Jenis kegiatan: {item.jenisKegiatan || '—'}</p>
                    <p className="text-muted-foreground">Rencana pelunasan: {formatTanggalKeringanan(item.tanggalRencanaLunas) || '—'}</p>
                    <p className="text-muted-foreground">Mekanisme: {labelMekanismePelunasan(item)}</p>
                  </li>
                ))}
              </ul>
            ) : null}

            {disetujui && terkini ? (
              <button
                type="button"
                onClick={() => setPratinjau(true)}
                className="mt-3 rounded-xl border border-emerald-700 bg-white px-3 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-50"
              >
                Lihat Surat Rekomendasi
              </button>
            ) : null}

            {galat && !modal ? <p className="mt-2 text-xs text-destructive">{galat}</p> : null}
          </div>
        </div>
      </div>

      {konfirmasiAwal ? (
        <ModalKonfirmasi
          judul="Pengajuan berhasil dikirim"
          pesan="Pengajuan mengikuti kegiatan telah terkirim dan sedang menunggu pemeriksaan/persetujuan Kepala Sekolah."
          onTutup={tutupKonfirmasiAwal}
        />
      ) : null}

      {pratinjau && terkini ? <PratinjauSuratRekomendasi pengajuan={terkini} onTutup={() => setPratinjau(false)} /> : null}

      <ModalAjukanKegiatan
        buka={modal}
        tunggakan={tunggakan}
        onTutup={() => setModal(false)}
        onSukses={(hasil) => {
          if (hasil?.id) setLokal((sekarang) => [hasil, ...sekarang])
          setModal(false)
          setKonfirmasiAwal(true)
        }}
      />
    </>
  )
}