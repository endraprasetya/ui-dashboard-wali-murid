'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

function supabaseUrl() {
  const raw = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  return raw.replace(/^https:\/\/https:\/\//, 'https://').replace(/\/$/, '')
}

export function getSupabaseBrowser(): SupabaseClient {
  if (client) return client
  const url = supabaseUrl()
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY belum diset.')
  }
  client = createClient(url, key)
  return client
}
