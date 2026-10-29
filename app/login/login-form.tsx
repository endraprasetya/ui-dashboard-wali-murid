'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { login, type LoginState } from '@/lib/auth-actions'

const initialState: LoginState = null

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState)

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="id_siswa" className="text-sm font-medium text-foreground">
          ID Siswa
        </label>
        <input
          id="id_siswa"
          name="id_siswa"
          type="text"
          autoComplete="username"
          inputMode="text"
          required
          maxLength={64}
          placeholder="Masukkan ID siswa"
          className="h-11 rounded-xl border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Kata sandi
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Kata sandi wali murid"
          className="h-11 rounded-xl border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {state?.error && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {pending ? 'Memeriksa…' : 'Masuk'}
      </button>
    </form>
  )
}
