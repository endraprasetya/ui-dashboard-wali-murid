'use client'

import type { RekapAbsensiJurnal } from '@/lib/absensi-siswa-logic'

const SEGMENTS = [
  { key: 'hariHadir' as const, label: 'Hadir', color: '#16a34a' },
  { key: 'sakit' as const, label: 'Sakit', color: '#d97706' },
  { key: 'izin' as const, label: 'Izin', color: '#0284c7' },
  { key: 'alpha' as const, label: 'Alpha', color: '#dc2626' },
]

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function AbsensiChart({ rekap }: { rekap: RekapAbsensiJurnal }) {
  const total = rekap.hariEfektif
  const persen = rekap.persenHadir ?? 0
  let offset = 0

  const arcs = SEGMENTS.map((segment) => {
    const value = rekap[segment.key]
    const length = total === 0 ? 0 : (value / total) * CIRCUMFERENCE
    const arc = { ...segment, value, length, offset }
    offset += length
    return arc
  })

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative size-40 shrink-0">
        <svg viewBox="0 0 128 128" className="size-full -rotate-90" role="img" aria-label={`Kehadiran ${persen} persen`}>
          <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="var(--muted)" strokeWidth="14" />
          {arcs
            .filter((arc) => arc.value > 0)
            .map((arc) => (
              <circle
                key={arc.key}
                cx="64"
                cy="64"
                r={RADIUS}
                fill="none"
                stroke={arc.color}
                strokeWidth="14"
                strokeDasharray={`${arc.length} ${CIRCUMFERENCE - arc.length}`}
                strokeDashoffset={-arc.offset}
              />
            ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{total === 0 ? '—' : `${persen}%`}</span>
          <span className="text-xs text-muted-foreground">Kehadiran</span>
        </div>
      </div>

      <ul className="grid w-full grid-cols-2 gap-2 sm:max-w-xs">
        {arcs.map((arc) => (
          <li key={arc.key} className="flex items-center justify-between rounded-lg border px-3 py-2">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: arc.color }} aria-hidden="true" />
              {arc.label}
            </span>
            <span className="text-sm font-bold tabular-nums text-foreground">
              {arc.value} hari
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
