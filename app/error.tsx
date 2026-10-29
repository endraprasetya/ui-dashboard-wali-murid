'use client'

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-bold text-foreground">Halaman belum bisa dimuat</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Terjadi kendala saat mengambil data portal. Silakan coba lagi.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        Coba lagi
      </button>
    </main>
  )
}
