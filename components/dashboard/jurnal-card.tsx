'use client'

import { Clock, Calendar, Link, NotebookPen, User } from 'lucide-react'
import { useState, useMemo } from 'react'
import { todayIso } from '@/lib/format'
import type { JurnalEntry } from '@/lib/queries'
import { DashboardCard } from './dashboard-card'
import { ModuleMessage } from './module-message'

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

// Function to sort entries by jam (lesson period)
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

  // Filter entries by selected date
  const filteredEntries = useMemo(() => {
    const filtered = selectedDate
      ? entries.filter((item) => item.iso === selectedDate)
      : entries
    // Sort by jam (ascending) when a date is selected
    return selectedDate ? sortEntriesByJam(filtered) : filtered
  }, [entries, selectedDate])

  return (
    <DashboardCard
      title="Jurnal Pembelajaran"
      subtitle={`Catatan kegiatan ${classLabel}`}
      icon={NotebookPen}
      className={className}
    >
      {error ? (
        <ModuleMessage tone="error">{error}</ModuleMessage>
      ) : entries.length === 0 ? (
        <ModuleMessage>Belum ada jurnal untuk kelas ini.</ModuleMessage>
      ) : (
        <>
          {/* Date Filter with Calendar */}
          <div className="mb-4 flex items-center gap-2">
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

          <ol className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1">
            {filteredEntries.map((item) => {
              const mendatang = Boolean(item.iso) && item.iso > hariIni
              if (mendatang) {
                return (
                  <li key={item.id} className="rounded-xl border border-dashed px-3 py-2.5">
                    <p className="text-[11px] font-medium text-muted-foreground">{item.date}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{item.mapel}</p>
                    <p className="mt-0.5 text-xs text-foreground">Jam pelajaran {jamPelajaran(item.jam)}</p>
                  </li>
                )
              }
              return (
                <li key={item.id} className="flex flex-col gap-2 rounded-xl border p-3">
                  <div className="flex items-start gap-3">
                    <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Clock className="size-3.5" aria-hidden="true" />
                      {item.jam}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{item.mapel}</p>
                      {item.materi && <p className="mt-0.5 text-xs text-foreground">{item.materi}</p>}
                      {item.kegiatan && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.kegiatan}</p>}

                      {/* Guru Info */}
                      {item.guru && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <User className="size-3" />
                          <span>{item.guru}</span>
                        </div>
                      )}

                      {/* Links */}
                      {item.links && item.links.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.links.map((link, idx) => (
                            <a
                              key={idx}
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
                      )}

                      {/* Tugas */}
                      {item.tugas && (
                        <div className="mt-2 rounded-lg bg-amber-50 px-2 py-1.5">
                          <p className="text-[11px] font-medium text-amber-800">
                            Tugas: {item.tugas}
                          </p>
                        </div>
                      )}

                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {item.date}
                        {item.semester ? ` · Semester ${item.semester}` : ''}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </>
      )}
    </DashboardCard>
  )
}
