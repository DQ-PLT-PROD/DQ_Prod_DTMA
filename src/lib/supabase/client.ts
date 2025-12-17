import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Runtime env (Kubernetes / Docker entrypoint)
const runtimeEnv = (window as any)?._env_

// Build-time env (Vite)
const buildEnv = import.meta.env

// Resolve env vars exactly like the working file
const rawUrl =
  runtimeEnv?.VITE_SUPABASE_URL ||
  buildEnv?.VITE_SUPABASE_URL

const rawKey =
  runtimeEnv?.VITE_SUPABASE_ANON_KEY ||
  buildEnv?.VITE_SUPABASE_ANON_KEY

const SUPABASE_URL =
  typeof rawUrl === 'string' ? rawUrl.trim() : undefined

const SUPABASE_ANON_KEY =
  typeof rawKey === 'string' ? rawKey.trim() : undefined

let _client: SupabaseClient<Database> | null = null

export const isSupabaseConfigured = () =>
  Boolean(
    SUPABASE_URL &&
    /^https?:\/\//i.test(SUPABASE_URL) &&
    SUPABASE_ANON_KEY
  )

export function getSupabase(): SupabaseClient<Database> {
  if (_client) return _client

  if (!isSupabaseConfigured()) {
    console.warn(
      'Supabase not configured. ' +
      'Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      {
        VITE_SUPABASE_URL: SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? 'exists' : 'missing'
      }
    )

    // Preserve original behavior:
    // return a non-crashing placeholder client
    try {
      _client = createClient<Database>(
        SUPABASE_URL || 'https://placeholder.supabase.co',
        SUPABASE_ANON_KEY || 'placeholder'
      )
    } catch (e) {
      throw new Error('Failed to initialize Supabase client: ' + e)
    }

    return _client
  }

  _client = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )

  return _client
}
