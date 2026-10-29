'use client'

import { useState } from 'react'
import { TombolKonfirmasiTugas } from '@/components/dashboard/tombol-konfirmasi-tugas'
import { sudahDikonfirmasi } from '@/lib/tugas-status'

export function TabelTugasRumah({
  baris,
  jenis,
  batas,
}: {
  baris: { id: string; tanggal: string; tugas: string; status: string }[]
  jenis: 'qiroah' | 'tahfidz'
  batas?: number
}) {
  const [semua, setSemua] = useState(false)
  const [dikonfirmasi, setDikonfirmasi] = useState<Record<string, true>>({})
  const adaLebih = typeof batas === 'number' && baris.length > batas
  const tampil = adaLebih && !semua ? baris.slice(0, batas) : baris

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="hidden grid-cols-[5.75rem_minmax(0,1fr)_11rem] gap-3 bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:grid">
          <span>Tanggal</span>
          <span>Tugas</span>
          <span>Status</span>
        </div>
        <ul>
          {tampil.map((row) => {
            const selesai = sudahDikonfirmasi(row.status) || dikonfirmasi[row.id] === true
            return (
              <li
                key={`${jenis}-${row.id}`}
                className="grid gap-2 border-t border-slate-100 px-3 py-3 first:border-t-0 sm:grid-cols-[5.75rem_minmax(0,1fr)_11rem] sm:items-center"
              >
                <span className="text-[11px] font-semibold text-slate-500">{row.tanggal}</span>
                <span className="min-w-0 text-sm leading-snug text-slate-900">{row.tugas}</span>
                <div className="flex flex-col items-start gap-2">
                  <span className={selesai ? 'text-xs font-bold text-green-700' : 'text-xs font-bold text-slate-600'}>
                    {selesai ? 'Sudah Dikerjakan' : 'Belum'}
                  </span>
                  <TombolKonfirmasiTugas
                    id={row.id}
                    selesai={selesai}
                    jenis={jenis}
                    onBerhasil={() => setDikonfirmasi((sekarang) => ({ ...sekarang, [row.id]: true }))}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      {adaLebih ? (
        <button type="button" onClick={() => setSemua((buka) => !buka)} className="mt-3 text-sm font-bold text-blue-700">
          {semua ? 'Tampilkan lebih sedikit' : 'Lihat Selengkapnya'}
        </button>
      ) : null}
    </div>
  )
}
