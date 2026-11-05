'use client'

import { ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { TertibData } from '@/lib/queries'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { buildTertibData, TERTIB_POINT_SELECT } from '@/lib/tertib-data'
import { cn } from '@/lib/utils'
import { DashboardCard } from './dashboard-card'
import { ModuleMessage } from './module-message'
import { SambutanTertibWaliModal } from './sambutan-tertib-wali-modal'

async function muatTertib(idSiswa: string): Promise<TertibData> {
  const supabase = getSupabaseBrowser()
  const { data, error } = await supabase
    .from('tertib_point')
    .select(TERTIB_POINT_SELECT)
    .eq('id_siswa', idSiswa)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return buildTertibData((data ?? []) as Record<string, unknown>[])
}

export function TertibPanel({
  idSiswa,
  initialData,
  initialError,
}: {
  idSiswa: string
  initialData: TertibData
  initialError: string | null
}) {
  const [data, setData] = useState(initialData)
  const [error, setError] = useState(initialError)
  const [sinkron, setSinkron] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const next = await muatTertib(idSiswa)
      setData(next)
      setError(null)
    } catch {
      setError('Catatan ketertiban belum bisa dimuat.')
    } finally {
      setSinkron(false)
    }
  }, [idSiswa])

  useEffect(() => {
    setData(initialData)
    setError(initialError)
  }, [initialData, initialError])

  useEffect(() => {
    let supabase: ReturnType<typeof getSupabaseBrowser>
    try {
      supabase = getSupabaseBrowser()
    } catch {
      return
    }

    const channel = supabase
      .channel(`tertib-wali-${idSiswa}`)
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
  }, [idSiswa, refresh])

  return (
    <>
    <SambutanTertibWaliModal />
    <DashboardCard title="Tertib & Poin" subtitle="Pelanggaran, prestasi, dan catatan guru" icon={ShieldCheck}>
      {error ? (
        <ModuleMessage tone="error">{error}</ModuleMessage>
      ) : data.items.length === 0 ? (
        <ModuleMessage>Belum ada catatan poin ketertiban untuk siswa ini.</ModuleMessage>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div className="rounded-xl bg-muted p-4">
              <p className="text-xs text-muted-foreground">Saldo poin</p>
              <p
                className={cn(
                  'text-3xl font-bold tabular-nums',
                  data.total < 0 ? 'text-destructive' : 'text-foreground',
                )}
              >
                {data.total > 0 ? `+${data.total}` : data.total}
              </p>
            </div>
            {sinkron ? <p className="text-[11px] text-muted-foreground">Memperbarui…</p> : null}
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-3">
              <dt className="text-xs text-muted-foreground">Prestasi</dt>
              <dd className="text-lg font-bold text-success-foreground">+{data.prestasi}</dd>
            </div>
            <div className="rounded-xl border p-3">
              <dt className="text-xs text-muted-foreground">Pelanggaran</dt>
              <dd className="text-lg font-bold text-destructive">{data.pelanggaran}</dd>
            </div>
          </dl>

          <div className="mt-4 overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-muted/80 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">Pelanggaran / prestasi</th>
                  <th className="px-3 py-2 font-semibold">Poin</th>
                  <th className="px-3 py-2 font-semibold">Catatan / tindakan guru</th>
                  <th className="px-3 py-2 font-semibold">Bulan · guru</th>
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
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {item.month}
                      <br />
                      {item.teacher}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardCard>
    </>
  )
}
