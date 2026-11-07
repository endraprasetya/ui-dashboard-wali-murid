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

async function muatTertib(idSiswa: string, bulan: string): Promise<TertibData> {
  const supabase = getSupabaseBrowser()
  const { data, error } = await supabase
    .from('tertib_point')
    .select(TERTIB_POINT_SELECT)
    .eq('id_siswa', idSiswa)
    .eq('bulan', bulan)
    .order('created_at', { ascending: false })
    .limit(80)

  if (error) throw error
  return buildTertibData((data ?? []) as Record<string, unknown>[], idSiswa, bulan)
}

async function muatPeringkat(kelas: string, bulan: string): Promise<BarisPeringkatKelas[]> {
  if (!kelas.trim()) return []
  const supabase = getSupabaseBrowser()
  const { data: siswaKelas, error: galatSiswa } = await supabase
    .from('siswa')
    .select('id_siswa, nama_siswa, kelas')
    .eq('kelas', kelas)
    .not('kelas', 'ilike', '%Alumni%')
    .order('nama_siswa', { ascending: true })

  if (galatSiswa || !siswaKelas?.length) return []

  const ids = siswaKelas.map((row) => String(row.id_siswa))
  const { data: logs, error: galatLog } = await supabase
    .from('tertib_point')
    .select('id_siswa, bulan, pts')
    .eq('bulan', bulan)
    .in('id_siswa', ids)

  if (galatLog) return []
  return mapPeringkatKelas(siswaKelas, (logs ?? []) as Record<string, unknown>[], bulan)
}

export function TertibPanel({
  idSiswa,
  namaSiswa,
  kelas,
  initialData,
  initialError,
  initialPeringkat = [],
}: {
  idSiswa: string
  namaSiswa: string
  kelas: string
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
      const [next, papan] = await Promise.all([muatTertib(idSiswa, bulan), muatPeringkat(kelas, bulan)])
      setData(next)
      setPeringkat(papan)
      setError(null)
    } catch {
      setError('Catatan ketertiban belum bisa dimuat.')
    } finally {
      setSinkron(false)
    }
  }, [idSiswa, bulan, kelas])

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

            <div className="mt-4 overflow-x-auto rounded-xl border">
              <h3 className="border-b bg-muted/80 px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Riwayat bulan {namaBulan}
              </h3>
              {data.items.length === 0 ? (
                <p className="px-3 py-6 text-sm text-muted-foreground">Belum ada catatan poin pada bulan ini.</p>
              ) : (
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Pelanggaran / prestasi</th>
                      <th className="px-3 py-2 font-semibold">Poin</th>
                      <th className="px-3 py-2 font-semibold">Catatan guru</th>
                      <th className="px-3 py-2 font-semibold">Guru</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item) => (
                      <tr key={item.id} className="border-t align-top">
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
              )}
            </div>
          </>
        )}
      </DashboardCard>
    </>
  )
}
