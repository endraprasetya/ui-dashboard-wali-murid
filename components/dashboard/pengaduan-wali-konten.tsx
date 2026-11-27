'use client'

import { useCallback, useState } from 'react'
import { FormPengaduanWali } from '@/components/dashboard/form-pengaduan-wali'
import { RiwayatPengaduanWali } from '@/components/dashboard/riwayat-pengaduan-wali'
import { muatRiwayatPengaduanWaliAksi } from '@/lib/pengaduan-wali-actions'
import type { PengaduanWaliRiwayatItem } from '@/lib/pengaduan-wali-shared'

export function PengaduanWaliKonten({
  riwayatAwal,
  riwayatGalatAwal,
  idSiswa,
  namaAnak,
  kelasAnak,
  namaWaliAwal,
  waliDariDataDiri,
  noWaAwal,
}: {
  riwayatAwal: PengaduanWaliRiwayatItem[]
  riwayatGalatAwal: string
  idSiswa: string
  namaAnak: string
  kelasAnak: string
  namaWaliAwal: string
  waliDariDataDiri: boolean
  noWaAwal: string
}) {
  const [riwayat, setRiwayat] = useState(riwayatAwal)
  const [galatRiwayat, setGalatRiwayat] = useState(riwayatGalatAwal)
  const [memuatRiwayat, setMemuatRiwayat] = useState(false)
  const [versiRiwayat, setVersiRiwayat] = useState(0)

  const segarkanRiwayat = useCallback(async () => {
    setMemuatRiwayat(true)
    setGalatRiwayat('')
    try {
      const hasil = await muatRiwayatPengaduanWaliAksi()
      if (hasil.error) {
        setGalatRiwayat(hasil.error)
      } else {
        setRiwayat(hasil.data)
        setVersiRiwayat((n) => n + 1)
      }
    } finally {
      setMemuatRiwayat(false)
    }
  }, [])

  return (
    <div className="space-y-4">
      <RiwayatPengaduanWali data={riwayat} galat={galatRiwayat} memuat={memuatRiwayat} versi={versiRiwayat} />
      <FormPengaduanWali
        idSiswa={idSiswa}
        namaAnak={namaAnak}
        kelasAnak={kelasAnak}
        namaWaliAwal={namaWaliAwal}
        waliDariDataDiri={waliDariDataDiri}
        noWaAwal={noWaAwal}
        onBerhasilKirim={() => void segarkanRiwayat()}
      />
    </div>
  )
}