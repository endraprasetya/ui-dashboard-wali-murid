import type { Metadata } from 'next'
import { BookOpenText } from 'lucide-react'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Masuk | Portal Wali Murid',
  description: 'Masuk ke Portal Wali Murid dengan ID siswa dan kata sandi.',
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }}
      />
      <section className="relative w-full max-w-md rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpenText className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">SD Islam Terpadu Al Madinah</p>
            <p className="text-xs text-muted-foreground">Portal Wali Murid</p>
          </div>
        </div>

        <p lang="ar" dir="rtl" className="mt-6 text-left font-arabic text-2xl text-primary">
          السَّلَامُ عَلَيْكُمْ
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Masuk ke portal</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Gunakan ID siswa dan kata sandi yang diberikan sekolah. Satu akun menampilkan data satu siswa.
        </p>

        <LoginForm />
      </section>
    </main>
  )
}
