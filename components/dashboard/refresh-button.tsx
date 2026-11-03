'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RefreshButton({ label = 'Coba lagi', className = 'mt-3 text-xs font-semibold text-primary hover:underline disabled:opacity-60' }: { label?: string; className?: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true)
        router.refresh()
        window.setTimeout(() => setPending(false), 800)
      }}
      className={className}
    >
      {pending ? 'Memuat…' : label}
    </button>
  )
}
