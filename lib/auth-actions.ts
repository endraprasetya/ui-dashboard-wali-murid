'use server'

import { redirect } from 'next/navigation'
import { isStudentId } from '@/lib/student-id'
import { safeEqual } from '@/lib/safe-equal'
import { clearSession, createSession } from '@/lib/session'
import { getSupabase } from '@/lib/supabase'

export type LoginState = { error: string } | null

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const idSiswa = String(formData.get('id_siswa') ?? '').trim()
  const password = String(formData.get('password') ?? '').trim()

  if (!isStudentId(idSiswa) || !password) {
    return { error: 'ID siswa atau kata sandi tidak sesuai.' }
  }

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('siswa')
      .select('id_siswa, password_ortu')
      .eq('id_siswa', idSiswa)
      .maybeSingle()

    if (error) {
      console.error('Login query failed', error.code)
      return { error: 'Tidak dapat terhubung ke server. Silakan coba lagi.' }
    }

    const stored = data?.password_ortu == null ? '' : String(data.password_ortu).trim()
    if (!data || !safeEqual(stored, password)) {
      return { error: 'ID siswa atau kata sandi tidak sesuai.' }
    }

    await createSession(String(data.id_siswa))
  } catch (error) {
    console.error('Login session failed')
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error
    return { error: 'Sesi login belum bisa dibuat. Silakan coba lagi.' }
  }

  redirect('/')
}

export async function logout() {
  await clearSession()
  redirect('/login')
}
