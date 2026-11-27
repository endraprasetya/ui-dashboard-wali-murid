'use client'

import { type FormEvent, useState } from 'react'
import { CheckCircle2, MessageSquareWarning, Paperclip, Send } from 'lucide-react'
import { kirimPengaduanWali } from '@/lib/pengaduan-wali-actions'
import {
  KATEGORI_PENGADUAN_WALI,
  normalisasiNoWa,
  PANDUAN_LAMPIRAN_PENGADUAN,
  validasiNoWa,
} from '@/lib/pengaduan-wali-shared'
import {
  galatStorageBolehLanjutTanpaLampiran,
  pesanGalatStoragePengaduan,
  unggahLampiranPengaduan,
  validasiLampiranPengaduan,
} from '@/lib/pengaduan-wali-storage'

export function FormPengaduanWali({
  idSiswa,
  namaAnak,
  kelasAnak,
  namaWaliAwal,
  waliDariDataDiri,
  noWaAwal,
  onBerhasilKirim,
}: {
  idSiswa: string
  namaAnak: string
  kelasAnak: string
  namaWaliAwal: string
  waliDariDataDiri: boolean
  noWaAwal: string
  onBerhasilKirim?: () => void
}) {
  const [namaWali, setNamaWali] = useState(namaWaliAwal)
  const [noWa, setNoWa] = useState(noWaAwal)
  const [kategori, setKategori] = useState('')
  const [isi, setIsi] = useState('')
  const [berkas, setBerkas] = useState<File | null>(null)
  const [menyimpan, setMenyimpan] = useState(false)
  const [galat, setGalat] = useState('')
  const [sukses, setSukses] = useState(false)
  const [peringatanLampiran, setPeringatanLampiran] = useState('')

  const kirim = async (event: FormEvent) => {
    event.preventDefault()
    setGalat('')
    setPeringatanLampiran('')
    setMenyimpan(true)
    try {
      const galatWa = validasiNoWa(noWa)
      if (galatWa) throw new Error(galatWa)
      const noWaBersih = normalisasiNoWa(noWa)
      let lampiranUrl: string | null = null
      let lampiranTipe: 'image' | 'video' | 'document' | null = null
      if (berkas) {
        const cek = validasiLampiranPengaduan(berkas)
        if (cek) throw new Error(cek)
        try {
          const hasil = await unggahLampiranPengaduan(idSiswa, berkas)
          lampiranUrl = hasil.url
          lampiranTipe = hasil.tipe
        } catch (uploadError) {
          const pesan = uploadError instanceof Error ? uploadError.message : ''
          if (galatStorageBolehLanjutTanpaLampiran(pesan)) {
            setPeringatanLampiran(pesanGalatStoragePengaduan(pesan) || pesan)
          } else {
            throw uploadError
          }
        }
      }
      const hasil = await kirimPengaduanWali({
        namaWaliMurid: namaWali,
        noWa: noWaBersih,
        kategori,
        isiPengaduan: isi,
        lampiranUrl,
        lampiranTipe,
      })
      if (hasil.error) throw new Error(hasil.error)
      setSukses(true)
      setIsi('')
      setKategori('')
      setBerkas(null)
      onBerhasilKirim?.()
    } catch (cause) {
      setGalat(cause instanceof Error ? cause.message : 'Pengaduan belum dapat dikirim.')
    } finally {
      setMenyimpan(false)
    }
  }

  if (sukses) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-10 text-emerald-600" aria-hidden="true" />
        <h2 className="mt-3 text-lg font-bold text-emerald-950">Pengaduan berhasil dikirim</h2>
        <p className="mt-2 text-sm leading-relaxed text-emerald-900">
          Terima kasih. Pengaduan Anda telah kami terima dan akan ditinjau Kepala Sekolah. Untuk urusan mendesak, Anda
          dapat menghubungi pihak sekolah melalui nomor resmi unit.
        </p>
        {peringatanLampiran ? (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950">
            {peringatanLampiran}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setSukses(false)
            setPeringatanLampiran('')
          }}
          className="mt-4 rounded-xl bg-emerald-800 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-900"
        >
          Kirim pengaduan lain
        </button>
      </div>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm">
      <header className="bg-gradient-to-br from-[#143d32] via-[#1a5042] to-[#0f2e26] px-5 py-6 text-white sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100/90">Layanan Pengaduan Wali Murid</p>
        <h1 className="mt-2 text-lg font-extrabold leading-snug sm:text-xl">SD Islam Terpadu Al Madinah Nogosari</h1>
        <p className="mt-1 text-sm font-bold text-emerald-50">Kami Siap Mendengar dan Melayani</p>
        <p className="mt-2 text-xs font-medium leading-relaxed text-emerald-100/95">
          Sampaikan keluhan, masukan, atau laporan terkait pelayanan dan kegiatan sekolah.
        </p>
      </header>

      <form onSubmit={(e) => void kirim(e)} className="space-y-4 px-5 py-6 sm:px-6">
        {!waliDariDataDiri ? (
          <p className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950">
            <MessageSquareWarning className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Nama wali murid belum tercatat di data diri. Mohon isi nama lengkap Anda secara manual.
          </p>
        ) : null}

        <label className="block text-xs font-semibold text-foreground">
          Nama wali murid
          <input
            type="text"
            required
            value={namaWali}
            onChange={(e) => setNamaWali(e.target.value)}
            readOnly={waliDariDataDiri && Boolean(namaWaliAwal)}
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm read-only:bg-muted/50"
            placeholder="Nama lengkap wali murid"
          />
        </label>

        <label className="block text-xs font-semibold text-foreground">
          No. WhatsApp
          <input
            type="tel"
            required
            autoComplete="tel"
            value={noWa}
            onChange={(e) => setNoWa(e.target.value)}
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
            placeholder="+62 851-2937-1560 atau 08xxxxxxxxxx"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-foreground">
            Nama anak
            <input
              type="text"
              readOnly
              value={namaAnak}
              className="mt-1 w-full rounded-xl border border-input bg-muted/40 px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-xs font-semibold text-foreground">
            Kelas
            <input
              type="text"
              readOnly
              value={kelasAnak || '—'}
              className="mt-1 w-full rounded-xl border border-input bg-muted/40 px-3 py-2.5 text-sm"
            />
          </label>
        </div>

        <label className="block text-xs font-semibold text-foreground">
          Kategori pengaduan
          <select
            required
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
          >
            <option value="">Pilih kategori</option>
            {KATEGORI_PENGADUAN_WALI.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-semibold text-foreground">
          Isi pengaduan
          <textarea
            required
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            rows={6}
            maxLength={5000}
            placeholder="Tuliskan keluhan atau masukan secara jelas..."
            className="mt-1 w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm leading-relaxed"
          />
        </label>

        <label className="block text-xs font-semibold text-foreground">
          Lampiran foto / dokumen / video (opsional)
          <p className="mt-1 text-[11px] font-normal leading-relaxed text-muted-foreground">{PANDUAN_LAMPIRAN_PENGADUAN}</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,application/pdf"
            onChange={(e) => setBerkas(e.target.files?.[0] ?? null)}
            className="mt-2 w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold"
          />
          {berkas ? (
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Paperclip className="size-3.5 shrink-0" aria-hidden="true" />
              Dipilih: {berkas.name}
            </p>
          ) : null}
        </label>

        {galat ? <p className="text-xs text-destructive">{galat}</p> : null}

        <button
          type="submit"
          disabled={menyimpan}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#143d32] py-3 text-sm font-bold text-white hover:bg-[#0f2e26] disabled:opacity-60 sm:w-auto sm:px-8"
        >
          <Send className="size-4" aria-hidden="true" />
          {menyimpan ? 'Mengirim...' : 'Kirim Pengaduan'}
        </button>
      </form>
    </section>
  )
}