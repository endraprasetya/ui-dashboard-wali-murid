'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { konfirmasiTugasQiroah } from '@/lib/qiroah-actions'
import { konfirmasiTugasTahfidz } from '@/lib/tahfidz-actions'
import { cn } from '@/lib/utils'

export function TombolKonfirmasiTugas({
  id,
  selesai,
  jenis,
  onBerhasil,
  nonaktif = false,
}: {
  id: string
  selesai: boolean
  jenis: 'qiroah' | 'tahfidz'
  onBerhasil?: () => void
  nonaktif?: boolean
}) {
  const router = useRouter()
  const [beres, setBeres] = useState(selesai)
  const [pesan, setPesan] = useState('')
  const [pending, startTransition] = useTransition()
  const palsu = id.startsWith('qiroah-') || id.startsWith('tahfidz-')
  const terkunci = beres || pending || palsu || nonaktif
  const labelAwal = jenis === 'qiroah' ? 'Konfirmasi Tugas Dikerjakan' : 'Konfirmasi Selesai Dikerjakan'
  const halaman = jenis === 'qiroah' ? 'Qiroah' : 'Tahfidz'

  const konfirmasi = () => {
    if (nonaktif) return
    setPesan('')
    startTransition(async () => {
      const hasil = jenis === 'qiroah' ? await konfirmasiTugasQiroah(id) : await konfirmasiTugasTahfidz(id)
      if (hasil.error) {
        setPesan(hasil.error)
        return
      }
      setBeres(true)
      onBerhasil?.()
      router.refresh()
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={konfirmasi}
        disabled={terkunci}
        title={nonaktif ? `Konfirmasi hanya bisa dilakukan di halaman ${halaman}` : undefined}
        className={cn(
          'rounded-xl px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed',
          beres ? 'bg-green-600' : nonaktif ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700',
          pending && !beres && 'opacity-60',
        )}
      >
        {beres ? '✓ Sudah Dikerjakan' : pending ? 'Menyimpan...' : labelAwal}
      </button>
      {pesan ? <p className="mt-2 text-xs text-red-700">{pesan}</p> : null}
    </div>
  )
}
