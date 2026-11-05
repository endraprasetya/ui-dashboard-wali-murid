'use client'

import { useEffect, useState } from 'react'
import { ModalInformasiTeks } from '@/components/dashboard/modal-informasi-teks'

const STORAGE_KEY = 'portal-wali-tertib-sambutan-dibaca'

export function SambutanTertibWaliModal() {
  const [terbuka, setTerbuka] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') return
    } catch {
      /* abaikan */
    }
    setTerbuka(true)
  }, [])

  const tutup = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* abaikan */
    }
    setTerbuka(false)
  }

  return (
    <ModalInformasiTeks
      terbuka={terbuka}
      onTutup={tutup}
      judul="TERTIB POIN SISWA"
      subjudul="SD ISLAM TERPADU AL MADINAH NOGOSARI"
      keterangan="Khusus Siswa Kelas II–VI"
    >
      <p className="font-semibold">Bismillahirrahmanirrahim.</p>
      <p className="mt-3">
        Dalam rangka membentuk siswa yang disiplin, bertanggung jawab, beradab, dan berakhlak mulia, SD Islam Terpadu Al
        Madinah menerapkan program Tertib Poin Siswa sebagai salah satu sarana pembinaan karakter.
      </p>
      <p className="mt-3 font-semibold">Mengapa setiap siswa diberi 200 poin?</p>
      <p className="mt-2">
        Setiap siswa memperoleh 200 poin awal sebagai bentuk kepercayaan dan harapan sekolah bahwa setiap anak mampu
        menaati tata tertib dan berperilaku baik.
      </p>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        <li>Siswa yang menaati tata tertib akan mempertahankan poinnya.</li>
        <li>Siswa yang melakukan pelanggaran akan mendapatkan pengurangan poin.</li>
        <li>Siswa yang menunjukkan kebaikan dan inisiatif positif akan mendapatkan tambahan poin sebagai bentuk apresiasi.</li>
      </ul>
      <p className="mt-3">
        Melalui program ini, diharapkan siswa semakin disiplin, bertanggung jawab, peduli terhadap sesama, serta terbiasa
        memperbaiki diri ketika melakukan kesalahan.
      </p>
      <p className="mt-3">
        Kepada Ayah dan Bunda, kami mohon dukungan dan kerja samanya untuk mendampingi putra-putrinya dalam memahami serta
        menjalankan program ini. Tertib Poin bukan untuk memberikan label baik atau buruk kepada anak, melainkan sebagai
        sarana pembinaan agar mereka terus tumbuh menjadi pribadi yang lebih baik.
      </p>
      <p className="mt-3">
        Semoga Allah Ta&apos;ala memberikan keberkahan dan kemudahan dalam mendidik putra-putri kita.
      </p>
      <p className="mt-3 font-semibold">Jazaakumullahu khairan atas kerja sama Ayah dan Bunda.</p>
    </ModalInformasiTeks>
  )
}
