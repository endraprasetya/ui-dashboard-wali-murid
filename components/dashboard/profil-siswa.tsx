'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { KOLOM_EDIT, LABEL_DATA_DIRI, type DataDiri } from '@/lib/data-diri-shared'
import { updateDataDiri } from '@/lib/data-diri-actions'

const LABEL = LABEL_DATA_DIRI

export function ProfilSiswa({ data, error }: { data: DataDiri | null; error: string | null }) {
  const router = useRouter()
  const [ubah, setUbah] = useState(false)
  const [pesan, setPesan] = useState('')
  const [gagal, setGagal] = useState(false)
  const [pending, startTransition] = useTransition()

  const simpan = (formData: FormData) => {
    setPesan('')
    startTransition(async () => {
      const hasil = await updateDataDiri(formData)
      if (hasil.error) {
        setGagal(true)
        setPesan(hasil.error)
        return
      }
      setGagal(false)
      setPesan('Data diri berhasil disimpan.')
      setUbah(false)
      router.refresh()
    })
  }

  return (
    <section id="profil" className="scroll-mt-20 rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Profil anak</h2>
          <p className="mt-1 text-sm text-muted-foreground">Data diri dari buku induk sekolah.</p>
        </div>
        {data && !ubah && (
          <button type="button" onClick={() => { setUbah(true); setPesan('') }} className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">
            Lengkapi data
          </button>
        )}
      </div>

      {!data ? (
        <p className="mt-4 text-sm text-muted-foreground">{error || 'Data buku induk ananda belum ditemukan.'}</p>
      ) : ubah ? (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            simpan(new FormData(event.currentTarget))
          }}
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <Identitas data={data} />
          {KOLOM_EDIT.map((kunci) => (
            <label key={kunci} className="text-xs font-semibold text-muted-foreground">
              {LABEL[kunci]}
              {kunci === 'jenis_kelamin' ? (
                <select name={kunci} defaultValue={data.jenis_kelamin} className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="">Pilih</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              ) : (
                <input name={kunci} defaultValue={data[kunci]} className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground" />
              )}
            </label>
          ))}
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
            <button type="submit" disabled={pending} className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60">
              {pending ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button type="button" onClick={() => { setUbah(false); setPesan('') }} className="rounded-xl border px-3 py-2 text-xs font-bold">
              Batal
            </button>
          </div>
        </form>
      ) : (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Info label="Nama lengkap" nilai={data.nama_lengkap} />
          <Info label="Kelas" nilai={data.kelas} />
          <Info label="Nomor induk sekolah" nilai={String(data.nomor_induk_sekolah || '-')} />
          {KOLOM_EDIT.map((kunci) => (
            <Info key={kunci} label={LABEL[kunci]} nilai={data[kunci] || 'Belum diisi'} kosong={!data[kunci]} />
          ))}
        </dl>
      )}
      {pesan && <p className={`mt-3 text-sm ${gagal ? 'text-destructive' : 'text-primary'}`}>{pesan}</p>}
    </section>
  )
}

function Identitas({ data }: { data: DataDiri }) {
  return (
    <div className="rounded-2xl bg-muted px-3 py-2 text-sm sm:col-span-2">
      <p className="font-bold text-foreground">{data.nama_lengkap}</p>
      <p className="text-xs text-muted-foreground">Kelas {data.kelas} · Nomor induk {data.nomor_induk_sekolah}</p>
    </div>
  )
}

function Info({ label, nilai, kosong }: { label: string; nilai: string; kosong?: boolean }) {
  return (
    <div className="rounded-2xl border px-3 py-2">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={`mt-1 text-sm ${kosong ? 'text-amber-700' : 'font-medium text-foreground'}`}>{nilai}</dd>
    </div>
  )
}
