import type { Metadata } from 'next'
import { Wallet } from 'lucide-react'
import { PortalGagal, PortalKerangka } from '@/components/dashboard/portal-kerangka'
import { ambilKeuanganAmpss } from '@/lib/ampss'
import type { TagihanAmpss } from '@/lib/ampss-parse'
import { muatPortal } from '@/lib/muat-portal'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Keuangan | Portal Wali Murid',
}

const KELOMPOK = ['SPP', 'Buku', 'Ekstrakurikuler', 'Ujian', 'Daftar ulang', 'Lainnya'] as const

function rupiah(nilai: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(nilai)
}

function kelompok(keterangan: string) {
  const teks = keterangan.toLowerCase()
  if (teks.includes('syahriah') || teks.includes('spp')) return 'SPP'
  if (teks.includes('buku')) return 'Buku'
  if (teks.includes('ekstra')) return 'Ekstrakurikuler'
  if (/ujian|asts|asas|asat|penilaian/.test(teks)) return 'Ujian'
  if (teks.includes('daftar ulang') || teks.includes('psb')) return 'Daftar ulang'
  return 'Lainnya'
}

function KartuKelompok({ judul, item }: { judul: string; item: TagihanAmpss[] }) {
  const total = item.reduce((jumlah, baris) => jumlah + baris.jumlah, 0)
  return (
    <li className="rounded-2xl border bg-muted/40 p-4">
      <p className="text-sm font-bold text-foreground">{judul}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {item.length === 0 ? 'Tidak ada tagihan terbuka.' : item.map((baris) => baris.keterangan).join(', ')}
      </p>
      <p className={`mt-3 text-[11px] font-semibold uppercase tracking-wide ${item.length ? 'text-destructive' : 'text-primary'}`}>
        {item.length ? `Belum terbayar · ${rupiah(total)}` : 'Tidak ada tagihan'}
      </p>
    </li>
  )
}

export default async function KeuanganPage() {
  const { dashboard, gagal, notifikasi } = await muatPortal('keuangan')
  if (gagal || !dashboard.student) return <PortalGagal pesan={gagal || 'Data siswa belum bisa dimuat.'} />

  const keuangan = await ambilKeuanganAmpss(dashboard.student.idSiswa, dashboard.student.nis)

  return (
    <PortalKerangka nama={dashboard.student.name} inisial={dashboard.student.initials} unit={dashboard.student.unit} aktif="/keuangan" notifikasi={notifikasi}>
      <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Wallet className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-foreground">Keuangan</h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Tagihan dan riwayat pembayaran ditarik dari AMPSS untuk siswa yang sedang masuk.
            </p>
          </div>
        </div>

        {keuangan.error ? (
          <p className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">{keuangan.error}</p>
        ) : (
          <>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border p-4">
                <dt className="text-xs text-muted-foreground">Belum terbayar</dt>
                <dd className="mt-1 text-2xl font-bold text-foreground">{rupiah(keuangan.ringkas.belumTerbayar)}</dd>
              </div>
              <div className="rounded-2xl border p-4">
                <dt className="text-xs text-muted-foreground">Sudah terbayar</dt>
                <dd className="mt-1 text-2xl font-bold text-foreground">{rupiah(keuangan.ringkas.terbayar)}</dd>
              </div>
            </dl>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {KELOMPOK.map((judul) => (
                <KartuKelompok key={judul} judul={judul} item={keuangan.tagihan.filter((baris) => kelompok(baris.keterangan) === judul)} />
              ))}
            </ul>

            <div className="mt-6 overflow-x-auto">
              <h2 className="text-sm font-bold text-foreground">Tagihan belum terbayar</h2>
              {keuangan.tagihan.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Tidak ada tagihan terbuka.</p>
              ) : (
                <table className="mt-2 w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground">
                      <th className="border-b px-2 py-2 font-semibold">Tapel</th>
                      <th className="border-b px-2 py-2 font-semibold">Keterangan</th>
                      <th className="border-b px-2 py-2 text-right font-semibold">Jumlah</th>
                      <th className="border-b px-2 py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keuangan.tagihan.map((baris, indeks) => (
                      <tr key={`${baris.tapel}-${baris.keterangan}-${indeks}`}>
                        <td className="border-b px-2 py-2">{baris.tapel || '-'}</td>
                        <td className="border-b px-2 py-2">{baris.keterangan}</td>
                        <td className="border-b px-2 py-2 text-right tabular-nums">{rupiah(baris.jumlah)}</td>
                        <td className="border-b px-2 py-2 text-xs font-semibold text-destructive">{baris.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-6 overflow-x-auto">
              <h2 className="text-sm font-bold text-foreground">Riwayat pembayaran</h2>
              {keuangan.riwayat.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Belum ada pembayaran tercatat.</p>
              ) : (
                <table className="mt-2 w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground">
                      <th className="border-b px-2 py-2 font-semibold">Tanggal</th>
                      <th className="border-b px-2 py-2 font-semibold">Keterangan</th>
                      <th className="border-b px-2 py-2 text-right font-semibold">Jumlah</th>
                      <th className="border-b px-2 py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keuangan.riwayat.map((baris, indeks) => (
                      <tr key={`${baris.tanggal}-${baris.keterangan}-${indeks}`}>
                        <td className="border-b px-2 py-2">{baris.tanggal || '-'}</td>
                        <td className="border-b px-2 py-2">
                          {baris.keterangan}
                          {baris.tapel ? <span className="mt-0.5 block text-[11px] text-muted-foreground">Tapel {baris.tapel}</span> : null}
                        </td>
                        <td className="border-b px-2 py-2 text-right tabular-nums">{rupiah(baris.jumlah)}</td>
                        <td className="border-b px-2 py-2 text-xs font-semibold text-primary">{baris.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </section>
    </PortalKerangka>
  )
}
