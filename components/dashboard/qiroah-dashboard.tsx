'use client'

import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { TabelTugasRumah } from '@/components/dashboard/tabel-tugas-rumah'
import { STANDAR_TARGET_QIROAH, progresTargetQiroah } from '@/lib/qiroah-target'
import { adaIsiTugas } from '@/lib/tugas-status'
import type { QiroahData } from '@/lib/queries'
import { ModuleMessage } from './module-message'

const HIJAU = '#28a745'
const MERAH = '#dc3545'

export function QiroahDashboard({
  nama,
  kelas,
  unit,
  data,
  error,
}: {
  nama: string
  kelas: string
  unit: string
  data: QiroahData
  error: string | null
}) {
  const [standarTerbuka, setStandarTerbuka] = useState(false)
  const [semuaRiwayat, setSemuaRiwayat] = useState(false)
  const capaian = data.latest ? `${data.latest.jilid} ${data.latest.halaman}` : ''
  const progres = progresTargetQiroah(kelas, capaian)
  const riwayat = semuaRiwayat ? data.recent : data.recent.slice(0, 5)
  const tugas = data.recent.filter((row) => adaIsiTugas(row.tugas))

  return (
    <section id="qiroah" className="scroll-mt-20 space-y-4">
      <article className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Qiroatul Qur&apos;an</p>
        <div className="mt-3 flex items-start gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
            <GraduationCap className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-foreground">{nama}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Kelas {kelas || '-'} · Unit {unit || '-'}</p>
          </div>
        </div>
      </article>

      <article className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
        <button
          type="button"
          aria-expanded={standarTerbuka}
          onClick={() => setStandarTerbuka((buka) => !buka)}
          className="text-sm font-bold text-primary underline decoration-primary/30 underline-offset-4"
        >
          Lihat Standar Target Qiroah
        </button>
        {standarTerbuka && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[280px] border-collapse text-left text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="border-b px-2 py-2">Kelas</th>
                  <th className="border-b px-2 py-2">Target</th>
                </tr>
              </thead>
              <tbody>
                {STANDAR_TARGET_QIROAH.map((baris) => (
                  <tr key={baris.kelas}>
                    <td className="border-b px-2 py-2 font-semibold">{baris.kelas}</td>
                    <td className="border-b px-2 py-2">{baris.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5">
          <div className="mb-2 flex items-end justify-between gap-3 text-sm">
            <p className="font-semibold text-foreground">Progres capaian target</p>
            <p className="text-xs text-muted-foreground">{progres.persen}%</p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted" role="meter" aria-valuenow={progres.persen} aria-valuemin={0} aria-valuemax={100} aria-label="Progres target qiroah">
            <div className="h-full rounded-full" style={{ width: `${Math.max(progres.persen, progres.persen > 0 ? 4 : 0)}%`, background: progres.tercapai ? HIJAU : MERAH }} />
          </div>
          <p className="mt-2 text-xs font-semibold" style={{ color: progres.tercapai ? HIJAU : MERAH }}>
            {progres.tercapai ? 'Sudah mencapai target' : 'Belum mencapai target'} · target {progres.target}
            {data.latest ? ` · capaian ${data.latest.jilid}` : ''}
          </p>
        </div>
      </article>

      <article className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
        <h3 className="text-sm font-bold text-foreground">Riwayat perkembangan qiroah</h3>
        {error ? (
          <div className="mt-4"><ModuleMessage tone="error">{error}</ModuleMessage></div>
        ) : data.recent.length === 0 ? (
          <div className="mt-4"><ModuleMessage>Belum ada setoran qiroah untuk siswa ini.</ModuleMessage></div>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground">
                    <th className="border-b px-2 py-2">Tanggal</th>
                    <th className="border-b px-2 py-2">Capaian / Jilid &amp; Hal</th>
                    <th className="border-b px-2 py-2">Catatan Guru</th>
                    <th className="border-b px-2 py-2">Status</th>
                    <th className="border-b px-2 py-2">Nilai &amp; Catatan Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {riwayat.map((row) => (
                    <tr key={row.id}>
                      <td className="border-b px-2 py-2 whitespace-nowrap">{row.date}</td>
                      <td className="border-b px-2 py-2">{row.jilid} · {row.halaman}</td>
                      <td className="border-b px-2 py-2">{row.note}</td>
                      <td className="border-b px-2 py-2">{row.status}</td>
                      <td className="border-b px-2 py-2">{row.nilai || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.recent.length > 5 && (
              <button type="button" onClick={() => setSemuaRiwayat((buka) => !buka)} className="mt-3 text-sm font-bold text-primary">
                {semuaRiwayat ? 'Tampilkan lebih sedikit' : 'Lihat Selengkapnya'}
              </button>
            )}
          </>
        )}
      </article>

      <article id="tugas-rumah" className="scroll-mt-24 rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
        <h3 className="text-sm font-bold text-foreground">Tugas rumah</h3>
        {tugas.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Belum ada tugas rumah untuk siswa ini.</p>
        ) : (
          <div className="mt-4">
            <TabelTugasRumah
              jenis="qiroah"
              batas={6}
              baris={tugas.map((row) => ({
                id: row.id,
                tanggal: row.date,
                tugas: row.tugas,
                status: row.statusSetoran,
              }))}
            />
          </div>
        )}
      </article>
    </section>
  )
}
