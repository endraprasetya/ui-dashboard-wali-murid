'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import type { ButirNotifikasi } from '@/lib/notifikasi-tipe'

const KUNCI = 'portal-wali-notifikasi-dibaca'

function bacaTersimpan() {
  try {
    const raw = JSON.parse(localStorage.getItem(KUNCI) || '[]')
    return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function LoncengNotifikasi({ item }: { item: ButirNotifikasi[] }) {
  const judulId = useId()
  const bungkus = useRef<HTMLDivElement>(null)
  const [buka, setBuka] = useState(false)
  const [siap, setSiap] = useState(false)
  const [dibaca, setDibaca] = useState<string[]>([])

  useEffect(() => {
    setDibaca(bacaTersimpan())
    setSiap(true)
  }, [item])

  useEffect(() => {
    if (!buka) return
    const tutup = (event: MouseEvent) => {
      if (!bungkus.current?.contains(event.target as Node)) setBuka(false)
    }
    const lewatPapan = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setBuka(false)
    }
    document.addEventListener('mousedown', tutup)
    document.addEventListener('keydown', lewatPapan)
    return () => {
      document.removeEventListener('mousedown', tutup)
      document.removeEventListener('keydown', lewatPapan)
    }
  }, [buka])

  const baru = item.filter((baris) => !dibaca.includes(baris.id))
  const jumlah = siap ? baru.length : 0

  const tandaiDibaca = () => {
    const ids = Array.from(new Set([...dibaca, ...item.map((baris) => baris.id)])).slice(-200)
    localStorage.setItem(KUNCI, JSON.stringify(ids))
    setDibaca(ids)
  }

  return (
    <div ref={bungkus} className="relative">
      <button
        type="button"
        aria-label={jumlah > 0 ? `Notifikasi, ${jumlah} baru` : 'Notifikasi'}
        aria-expanded={buka}
        aria-controls={judulId}
        onClick={() => {
          setBuka((terbuka) => {
            if (!terbuka) tandaiDibaca()
            return !terbuka
          })
        }}
        className="relative inline-flex size-9 items-center justify-center overflow-visible rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {jumlah > 0 ? (
          <span className="lonceng-denyut pointer-events-none absolute right-1 top-1 size-3 rounded-full bg-red-500" aria-hidden="true" />
        ) : null}
        <Bell className={jumlah > 0 ? 'lonceng-goyang size-4' : 'size-4'} aria-hidden="true" />
        {jumlah > 0 ? (
          <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-4 text-white">
            {jumlah > 9 ? '9+' : jumlah}
          </span>
        ) : null}
      </button>
      {buka ? (
        <div
          id={judulId}
          role="dialog"
          aria-label="Notifikasi"
          className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-card text-foreground shadow-lg"
        >
          <p className="border-b px-4 py-3 text-sm font-bold">Notifikasi</p>
          {item.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Belum ada tugas baru atau pengumuman.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {item.map((baris) => (
                <li key={baris.id} className="border-b last:border-0">
                  <Link href={baris.href} onClick={() => setBuka(false)} className="block px-4 py-3 transition-colors hover:bg-muted">
                    <span className="block text-sm font-semibold">{baris.judul}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{baris.detail}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
