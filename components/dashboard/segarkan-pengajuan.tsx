'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Muat ulang data server setiap halaman dibuka atau kembali terlihat. */
export function SegarkanPengajuan() {
  const router = useRouter()

  useEffect(() => {
    const segarkan = () => {
      if (document.visibilityState === 'visible') router.refresh()
    }
    segarkan()
    window.addEventListener('focus', segarkan)
    document.addEventListener('visibilitychange', segarkan)
    return () => {
      window.removeEventListener('focus', segarkan)
      document.removeEventListener('visibilitychange', segarkan)
    }
  }, [router])

  return null
}
