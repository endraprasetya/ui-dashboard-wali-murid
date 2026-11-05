'use client'

import { CalendarDays, Table2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { buildAbsensiSiswaFromJurnal, monthRange, type RekapAbsensiJurnal } from '@/lib/absensi-siswa-logic'
import { currentMonthKey, todayIso } from '@/lib/format'
import { normalKelasJurnal } from '@/lib/kelas-jurnal'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { cn } from '@/lib/utils'
import { AbsensiChart } from './absensi-chart'
import { DashboardCard } from './dashboard-card'
import { ModuleMessage } from './module-message'

async function muatJurnalBulan(kelas: string, bulan: string) {
  const { start, end } = monthRange(bulan)
  const supabase = getSupabaseBrowser()
  const kunci = normalKelasJurnal(kelas)
  const kolom =
    'id, tanggal, kelas, mapel, jam, siswa_tidak_hadir, guru, nama_guru, nama_ustadz'

  const { data, error } = await supabase
    .from('jurnal_pembelajaran')
    .select(kolom)
    .gte('tanggal', start)
    .lte('tanggal', end)
    .order('tanggal', { ascending: true })
    .limit(2000)

  if (error) throw error
  return ((data ?? []) as Record<string, unknown>[]).filter(
    (row) => normalKelasJurnal(String(row.kelas || '')) === kunci,
  )
}

function tanggalDefaultFilter(rekap: RekapAbsensiJurnal, bulan: string) {
  const tanggalUnik = Array.from(new Set(rekap.sesi.map((s) => s.tanggal))).sort()
  if (tanggalUnik.length === 0) return ''

  const hariIni = todayIso()
  const { start, end } = monthRange(bulan)
  if (hariIni >= start && hariIni <= end && tanggalUnik.includes(hariIni)) {
    return hariIni
  }
  return tanggalUnik[0]
}

function labelTanggalOpsi(iso: string, rekap: RekapAbsensiJurnal) {
  const contoh = rekap.sesi.find((s) => s.tanggal === iso)
  return contoh?.tanggalLabel || iso
}

function warnaStatus(status: string) {
  if (status === 'Hadir') return 'bg-emerald-50 text-emerald-800 ring-emerald-200'
  if (status === 'Sakit') return 'bg-amber-50 text-amber-900 ring-amber-200'
  if (status === 'Izin') return 'bg-sky-50 text-sky-900 ring-sky-200'
  return 'bg-red-50 text-red-800 ring-red-200'
}

export function AbsensiPanel({
  idSiswa,
  namaSiswa,
  kelas,
  initialRekap,
  initialError,
}: {
  idSiswa: string
  namaSiswa: string
  kelas: string
  initialRekap: RekapAbsensiJurnal
  initialError: string | null
}) {
  const [bulan, setBulan] = useState(initialRekap.bulan || currentMonthKey())
  const [rekap, setRekap] = useState(initialRekap)
  const [error, setError] = useState(initialError)
  const [loading, setLoading] = useState(false)
  const [tanggalPilih, setTanggalPilih] = useState(() => tanggalDefaultFilter(initialRekap, initialRekap.bulan))

  const opsiTanggal = useMemo(() => {
    const tanggalUnik = Array.from(new Set(rekap.sesi.map((s) => s.tanggal))).sort()
    return tanggalUnik.map((iso) => ({
      iso,
      label: labelTanggalOpsi(iso, rekap),
      jumlah: rekap.sesi.filter((s) => s.tanggal === iso).length,
    }))
  }, [rekap])

  const sesiTerpilih = useMemo(
    () => rekap.sesi.filter((s) => s.tanggal === tanggalPilih),
    [rekap.sesi, tanggalPilih],
  )

  useEffect(() => {
    setTanggalPilih(tanggalDefaultFilter(rekap, bulan))
  }, [rekap, bulan])

  const refresh = useCallback(
    async (monthValue: string) => {
      setLoading(true)
      setError(null)
      try {
        const rows = await muatJurnalBulan(kelas, monthValue)
        setRekap(
          buildAbsensiSiswaFromJurnal(rows, {
            idSiswa,
            namaSiswa,
            bulan: monthValue,
          }),
        )
      } catch {
        setError('Rekap absensi belum bisa dimuat.')
      } finally {
        setLoading(false)
      }
    },
    [idSiswa, namaSiswa, kelas],
  )

  const onBulanChange = (value: string) => {
    setBulan(value)
    void refresh(value)
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b bg-slate-800 px-5 py-4 text-white">
          <h2 className="text-lg font-black">Rekap Absensi Bulanan</h2>
          <p className="text-xs text-slate-300">
            Kehadiran per hari efektif (satu tanggal = satu hari) · kelas {kelas || '—'} ·{' '}
            <span className="font-semibold text-white">{namaSiswa}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3 border-b px-5 py-4">
          <label className="text-xs font-bold text-muted-foreground">
            Bulan
            <input
              type="month"
              value={bulan}
              onChange={(e) => onBulanChange(e.target.value)}
              className="mt-1 block rounded-lg border bg-background px-3 py-2 text-sm font-semibold"
            />
          </label>
          {loading ? <p className="text-xs text-muted-foreground">Memuat…</p> : null}
        </div>

        <div className="space-y-4 p-5">
          {error ? <ModuleMessage tone="error">{error}</ModuleMessage> : null}

          {!error && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-[11px] font-bold uppercase text-muted-foreground">Hari efektif</p>
                  <p className="text-2xl font-black">{rekap.hariEfektif}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Tanggal ada jurnal kelas</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
                  <p className="text-[11px] font-bold uppercase text-emerald-700">Hari hadir</p>
                  <p className="text-2xl font-black text-emerald-800">{rekap.hariHadir}</p>
                </div>
                <div className="rounded-xl bg-red-50 p-3">
                  <p className="text-[11px] font-bold uppercase text-red-700">Hari tidak hadir</p>
                  <p className="text-2xl font-black text-red-800">{rekap.hariTidakHadir}</p>
                  <p className="mt-1 text-[11px] text-red-700/80">
                    Sakit {rekap.sakit} · Izin {rekap.izin} · Alpha {rekap.alpha}
                  </p>
                </div>
                <div className="rounded-xl bg-sky-50 p-3">
                  <p className="text-[11px] font-bold uppercase text-sky-700">Persentase hadir</p>
                  <p className="text-2xl font-black text-sky-800">
                    {rekap.persenHadir == null ? '—' : `${rekap.persenHadir}%`}
                  </p>
                </div>
              </div>

              <DashboardCard title="Grafik Kehadiran Bulanan" subtitle={rekap.bulanLabel} icon={CalendarDays}>
                {rekap.hariEfektif === 0 ? (
                  <ModuleMessage>
                    Belum ada jurnal pembelajaran pada {rekap.bulanLabel.toLowerCase()}. Rekap akan muncul setelah guru
                    mengisi presensi di jurnal kelas.
                  </ModuleMessage>
                ) : (
                  <>
                    <AbsensiChart rekap={rekap} />
                    <p className="mt-4 text-xs text-muted-foreground">
                      {rekap.hariHadir} hari hadir dari {rekap.hariEfektif} hari efektif pada{' '}
                      {rekap.bulanLabel.toLowerCase()}.
                    </p>
                  </>
                )}
              </DashboardCard>

              <div className="rounded-xl border">
                <div className="flex items-start gap-2 border-b bg-muted/60 px-4 py-3">
                  <Table2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Rincian absensi per sesi / jam pelajaran</h3>
                    <p className="text-xs text-muted-foreground">
                      Riwayat kehadiran {rekap.bulanLabel.toLowerCase()} · {namaSiswa}
                    </p>
                  </div>
                </div>
                {rekap.sesi.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Belum ada jurnal pembelajaran pada bulan ini.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap items-end gap-3 border-b px-4 py-3">
                      <label className="text-xs font-bold text-muted-foreground">
                        Pilih tanggal
                        <select
                          value={tanggalPilih}
                          onChange={(e) => setTanggalPilih(e.target.value)}
                          className="mt-1 block min-w-[220px] rounded-lg border bg-background px-3 py-2 text-sm font-semibold"
                        >
                          {opsiTanggal.map((item) => (
                            <option key={item.iso} value={item.iso}>
                              {item.label} ({item.jumlah} sesi)
                            </option>
                          ))}
                        </select>
                      </label>
                      {tanggalPilih ? (
                        <p className="pb-2 text-xs text-muted-foreground">
                          Menampilkan {sesiTerpilih.length} sesi pada{' '}
                          <span className="font-semibold text-foreground">
                            {labelTanggalOpsi(tanggalPilih, rekap)}
                          </span>
                        </p>
                      ) : null}
                    </div>
                    {sesiTerpilih.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                        Tidak ada catatan sesi pada tanggal ini.
                      </p>
                    ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead className="bg-muted/40 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        <tr className="border-b">
                          <th className="px-3 py-2.5">Sesi / jam pelajaran</th>
                          <th className="px-3 py-2.5">Mata pelajaran</th>
                          <th className="px-3 py-2.5 text-center">Status kehadiran</th>
                          <th className="px-3 py-2.5">Keterangan guru</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-xs">
                        {sesiTerpilih.map((row) => (
                          <tr key={row.id} className="hover:bg-muted/30">
                            <td className="px-3 py-2.5 text-muted-foreground">
                              <span className="font-bold tabular-nums text-foreground">Jam {row.jam}</span>
                              <span className="mt-0.5 block text-[11px]">{row.waktu}</span>
                            </td>
                            <td className="px-3 py-2.5 font-medium text-foreground">{row.mapel}</td>
                            <td className="px-3 py-2.5 text-center">
                              <span
                                className={cn(
                                  'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset',
                                  warnaStatus(row.status),
                                )}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="max-w-[240px] px-3 py-2.5 leading-relaxed text-muted-foreground">
                              {row.status === 'Hadir' ? (
                                <span className="text-[11px]">Hadir · {row.guru}</span>
                              ) : (
                                <>
                                  {row.keterangan || row.status}
                                  <span className="mt-0.5 block text-[11px] text-muted-foreground/80">
                                    Guru: {row.guru}
                                  </span>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
