import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function supabaseUrl() {
  const raw = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  return raw.replace(/^https:\/\/https:\/\//, 'https://').replace(/\/$/, '')
}

export function getSupabase(): SupabaseClient {
  const url = supabaseUrl()
  const key = (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

  if (!url || !key) {
    throw new Error('Supabase environment variables are missing')
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  })
}
