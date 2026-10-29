import { AlertTriangle } from 'lucide-react'

export function DataBelumLengkap({
  kurang,
  belumTertaut,
  pesan,
  tautan = '/profil',
}: {
  kurang: string[]
  belumTertaut: boolean
  pesan?: string | null
  tautan?: string
}) {
  if (!belumTertaut && kurang.length === 0 && !pesan) return null

  return (
    <a
      href={tautan}
      className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        {pesan
          ? pesan
          : belumTertaut
            ? 'Data buku induk ananda belum tertaut dengan akun ini. Hubungi sekolah agar administrasi siswa valid.'
            : `Data diri ananda belum lengkap: ${kurang.join(', ')}. Lengkapi sekarang agar administrasi sekolah valid.`}
      </span>
    </a>
  )
}
