'use client'

import { Calendar, Link, NotebookPen } from 'lucide-react'
import { useMemo, useState } from 'react'
import { labelMapelGuru, todayIso } from '@/lib/format'
import type { JurnalEntry } from '@/lib/queries'
import { DashboardCard } from './dashboard-card'
import { ModuleMessage } from './module-message'
import { RefreshButton } from './refresh-button'

const WAKTU_JAM: Record<string, string> = {
  '1': '07.00 – 07.35',
  '2': '07.35 – 08.10',
  '3': '08.10 – 08.45',
  '4': '08.45 – 09.20',
  '5': '09.40 – 10.15',
  '6': '10.15 – 10.50',
  '7': '10.50 – 11.25',
  '8': '12.25 – 13.00',
  '9': '13.00 – 13.35',
  '10': '13.35 – 14.10',
  '11': '15.25 – 16.00',
}

function jamPelajaran(jam: string) {
  const nomor = jam.trim()
  const waktu = WAKTU_JAM[nomor]
  if (!waktu) return nomor && nomor !== '-' ? `Jam ke-${nomor}` : '-'
  return `Jam ke-${nomor} · ${waktu}`
}

function sortEntriesByJam(entries: JurnalEntry[]): JurnalEntry[] {
  return [...entries].sort((a, b) => {
    const jamA = parseInt(a.jam || '0', 10)
    const jamB = parseInt(b.jam || '0', 10)
    return jamA - jamB
  })
}

export function JurnalCard({
  className,
  classLabel,
  entries,
  error,
}: {
  className?: string
  classLabel: string
  entries: JurnalEntry[]
  error: string | null
}) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const hariIni = todayIso()

  const filteredEntries = useMemo(() => {
    const filtered = selectedDate ? entries.filter((item) => item.iso === selectedDate) : entries
    return selectedDate ? sortEntriesByJam(filtered) : filtered
  }, [entries, selectedDate])

  return (
    <DashboardCard
      title="Jurnal Pembelajaran"
      subtitle={`Catatan kegiatan ${classLabel}`}
      icon={NotebookPen}
      className={className}
      action={<RefreshButton label="Muat ulang" className="text-xs font-semibold text-primary hover:underline disabled:opacity-60" />}
    >
      {error ? (
        <ModuleMessage tone="error">{error}</ModuleMessage>
      ) : entries.length === 0 ? (
        <ModuleMessage>Belum ada jurnal untuk kelas ini.</ModuleMessage>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[860px] text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">Tanggal</th>
                  <th className="px-3 py-2.5">Jam</th>
                  <th className="px-3 py-2.5">Mata pelajaran</th>
                  <th className="px-3 py-2.5">Materi pokok</th>
                  <th className="px-3 py-2.5">Kegiatan</th>
                  <th className="px-3 py-2.5">Tugas di rumah</th>
                  <th className="px-3 py-2.5">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map((item) => {
                  const mendatang = Boolean(item.iso) && item.iso > hariIni
                  return (
                    <tr key={item.id} className={mendatang ? 'bg-slate-50/70' : 'bg-white'}>
                      <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-slate-700">
                        {item.date}
                        {item.semester ? <span className="mt-0.5 block text-[10px] font-medium text-slate-400">Semester {item.semester}</span> : null}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">{jamPelajaran(item.jam)}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">{labelMapelGuru(item.mapel, item.guru)}</td>
                      <td className="px-3 py-2.5 text-slate-600">{item.materi || '-'}</td>
                      <td className="px-3 py-2.5 text-slate-500">{item.kegiatan || '-'}</td>
                      <td className="px-3 py-2.5">
                        {item.tugas ? (
                          <span className="rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800">{item.tugas}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {item.links && item.links.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.links.map((link, idx) => (
                              <a
                                key={`${item.id}-${idx}`}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 hover:bg-blue-100"
                              >
                                <Link className="size-3" />
                                {link.tipe}
                              </a>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardCard>
  )
}
