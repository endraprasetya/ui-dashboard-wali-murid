'use client'

import { ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { TertibData } from '@/lib/queries'
import { formatMonthLabel } from '@/lib/format'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import {
  buildTertibData,
  mapPeringkatKelas,
  TERTIB_POINT_SELECT,
} from '@/lib/tertib-data'
import { kolomUnitTidakAda, saringBarisMilikUnit, unitLogin, unitSama } from '@/lib/unit-isolasi'
import type { BarisPeringkatKelas } from '@/lib/tertib-saldo'
import { cn } from '@/lib/utils'
import { DashboardCard } from './dashboard-card'
import { ModuleMessage } from './module-message'
import { SambutanTertibWaliModal } from './sambutan-tertib-wali-modal'
import { TertibPeringkatKelas } from './tertib-peringkat-kelas'
import { TertibSaldoKartu } from './tertib-saldo-kartu'

function bulanSekarang() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

async function muatTertib(idSiswa: string, unit: string, bulan: string): Promise<TertibData> {
  const unitAktif = unitLogin(unit)
  const supabase = getSupabaseBrowser()
  let query = supabase
    .from('tertib_point')
    .select(`${TERTIB_POINT_SELECT}, unit`)
    .eq('id_siswa', idSiswa)
    .eq('bulan', bulan)
    .order('created_at', { ascending: false })
    .limit(80)
  if (unitAktif) query = query.eq('unit', unitAktif)

  let { data, error } = await query
  if (error && kolomUnitTidakAda(error)) {
    const ulang = await supabase
      .from('tertib_point')
      .select(TERTIB_POINT_SELECT)
      .eq('id_siswa', idSiswa)
      .eq('bulan', bulan)
      .order('created_at', { ascending: false })
      .limit(80)
    data = ulang.data
    error = ulang.error
  }

  if (error) throw error
  const rows = saringBarisMilikUnit((data ?? []) as Record<string, unknown>[], unitAktif, { idSiswa })
  return buildTertibData(rows, idSiswa, bulan)
}

async function muatPeringkat(kelas: string, unit: string, bulan: string): Promise<BarisPeringkatKelas[]> {
  const unitBersih = unitLogin(unit)
  if (!kelas.trim() || !unitBersih) return []
  const supabase = getSupabaseBrowser()
  let querySiswa = supabase
    .from('siswa')
    .select('id_siswa, nama_siswa, kelas, unit')
    .eq('kelas', kelas)
    .not('kelas', 'ilike', '%Alumni%')
    .order('nama_siswa', { ascending: true })

  if (unitBersih) querySiswa = querySiswa.eq('unit', unitBersih)

  let { data: siswaKelas, error: galatSiswa } = await querySiswa
  let daftar = (siswaKelas ?? []).filter((row) => unitSama(row.unit, unitBersih))

  if (!galatSiswa && daftar.length === 0) {
    const longgar = await supabase
      .from('siswa')
      .select('id_siswa, nama_siswa, kelas, unit')
      .eq('kelas', kelas)
      .not('kelas', 'ilike', '%Alumni%')
      .order('nama_siswa', { ascending: true })
    daftar = (longgar.data ?? []).filter((row) => unitSama(row.unit, unitBersih))
    galatSiswa = longgar.error
  }

  if (galatSiswa || !daftar.length) return []

  const ids = daftar.map((row) => String(row.id_siswa))
  let queryLog = supabase
    .from('tertib_point')
    .select('id_siswa, bulan, pts, unit')
    .eq('bulan', bulan)
    .in('id_siswa', ids)

  if (unitBersih) queryLog = queryLog.eq('unit', unitBersih)

  let { data: logs, error: galatLog } = await queryLog
  if (galatLog && kolomUnitTidakAda(galatLog)) {
    const ulang = await supabase
      .from('tertib_point')
      .select('id_siswa, bulan, pts')
      .eq('bulan', bulan)
      .in('id_siswa', ids)
    logs = ulang.data
    galatLog = ulang.error
  }

  if (galatLog) return []
  return mapPeringkatKelas(daftar, (logs ?? []) as Record<string, unknown>[], bulan, unitBersih)
}

export function TertibPanel({
  idSiswa,
  namaSiswa,
  kelas,
  unit,
  initialData,
  initialError,
  initialPeringkat = [],
}: {
  idSiswa: string
  namaSiswa: string
  kelas: string
  unit: string
  initialData: TertibData
  initialError: string | null
  initialPeringkat?: BarisPeringkatKelas[]
}) {
  const [bulan, setBulan] = useState(initialData.bulan || bulanSekarang())
  const [data, setData] = useState(initialData)
  const [peringkat, setPeringkat] = useState(initialPeringkat)
  const [error, setError] = useState(initialError)
  const [sinkron, setSinkron] = useState(false)

  const namaBulan = useMemo(() => formatMonthLabel(bulan), [bulan])
  const saldo = useMemo(
    () => ({
      modal: data.modal,
      positif: data.prestasi,
      negatif: data.pelanggaran,
      sisa: data.sisa,
    }),
    [data],
  )

  const refresh = useCallback(async () => {
    try {
      const [next, papan] = await Promise.all([muatTertib(idSiswa, unit, bulan), muatPeringkat(kelas, unit, bulan)])
      setData(next)
      setPeringkat(papan)
      setError(null)
    } catch {
      setError('Catatan ketertiban belum bisa dimuat.')
    } finally {
      setSinkron(false)
    }
  }, [idSiswa, bulan, kelas, unit])

  useEffect(() => {
    setData(initialData)
    setError(initialError)
    setPeringkat(initialPeringkat)
    setBulan(initialData.bulan || bulanSekarang())
  }, [initialData, initialError, initialPeringkat])

  useEffect(() => {
    void refresh()
  }, [bulan, refresh])

  useEffect(() => {
    let supabase: ReturnType<typeof getSupabaseBrowser>
    try {
      supabase = getSupabaseBrowser()
    } catch {
      return
    }

    const channel = supabase
      .channel(`tertib-wali-${idSiswa}-${bulan}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tertib_point', filter: `id_siswa=eq.${idSiswa}` },
        () => {
          setSinkron(true)
          void refresh()
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [idSiswa, bulan, refresh])

  return (
    <>
      <SambutanTertibWaliModal />
      <DashboardCard title="Tertib & Poin" subtitle="Pelanggaran, prestasi, dan catatan guru" icon={ShieldCheck}>
        <label className="block text-xs font-semibold text-muted-foreground">
          Bulan penilaian
          <input
            type="month"
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="mt-1 w-full max-w-xs rounded-xl border bg-background px-3 py-2 text-sm font-semibold"
          />
        </label>

        <p className="mt-3 text-center text-sm font-semibold text-foreground">
          {namaSiswa} <span className="text-muted-foreground">· Kelas {kelas || '-'}</span>
        </p>

        {error ? (
          <ModuleMessage tone="error">{error}</ModuleMessage>
        ) : (
          <>
            <div className="mt-4">
              <TertibSaldoKartu saldo={saldo} namaBulan={namaBulan} />
            </div>
            {sinkron ? <p className="mt-2 text-[11px] text-muted-foreground">Memperbarui…</p> : null}

            <div className="mt-4">
              <TertibPeringkatKelas
                kelas={kelas}
                peringkat={peringkat}
                idAnanda={idSiswa}
                namaBulan={namaBulan}
              />
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border">
              <h3 className="border-b bg-muted/80 px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Riwayat bulan {namaBulan}
              </h3>
              {data.items.length === 0 ? (
                <p className="px-3 py-6 text-sm text-muted-foreground">Belum ada catatan poin pada bulan ini.</p>
              ) : (
                <>
                  <ul className="divide-y sm:hidden">
                    {data.items.map((item) => (
                      <li key={item.id} className="px-3 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <time className="block text-[11px] font-semibold tabular-nums tracking-wide text-muted-foreground">
                              {item.tanggal}
                            </time>
                            <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">{item.label}</p>
                          </div>
                          <span
                            className={cn(
                              'shrink-0 text-sm font-bold tabular-nums',
                              item.points < 0 ? 'text-destructive' : 'text-success-foreground',
                            )}
                          >
                            {item.points > 0 ? `+${item.points}` : item.points}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-foreground/90">
                          {item.keterangan || <span className="italic text-muted-foreground">Tidak ada catatan</span>}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">Guru: {item.teacher}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="hidden overflow-x-auto sm:block">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="whitespace-nowrap px-3 py-2 font-semibold">Tanggal</th>
                          <th className="px-3 py-2 font-semibold">Pelanggaran / prestasi</th>
                          <th className="px-3 py-2 font-semibold">Poin</th>
                          <th className="px-3 py-2 font-semibold">Catatan guru</th>
                          <th className="px-3 py-2 font-semibold">Guru</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.items.map((item) => (
                          <tr key={item.id} className="border-t align-top">
                            <td className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold tabular-nums text-muted-foreground">
                              {item.tanggal}
                            </td>
                            <td className="px-3 py-2.5 font-medium text-foreground">{item.label}</td>
                            <td
                              className={cn(
                                'px-3 py-2.5 font-bold tabular-nums',
                                item.points < 0 ? 'text-destructive' : 'text-success-foreground',
                              )}
                            >
                              {item.points > 0 ? `+${item.points}` : item.points}
                            </td>
                            <td className="px-3 py-2.5 text-foreground/90">
                              {item.keterangan ? (
                                <span className="text-xs leading-relaxed">{item.keterangan}</span>
                              ) : (
                                <span className="text-xs italic text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground">{item.teacher}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </DashboardCard>
    </>
  )
}
