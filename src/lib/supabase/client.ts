import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Setup for usage in Vite (import.meta.env)
const rawUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || "https://ugmybskacomcdgdngolz.supabase.co"
const rawKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbXlic2thY29tY2RnZG5nb2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NTM0MDEsImV4cCI6MjA4MDIyOTQwMX0.iwNLBgOsE1k8Eb3noMhJ4kCZX6b5oLdq-0B5S7CcPpo"

const SUPABASE_URL = typeof rawUrl === 'string' ? rawUrl.trim() : ''
const SUPABASE_ANON_KEY = typeof rawKey === 'string' ? rawKey.trim() : ''

let _client: SupabaseClient<Database> | null = null

export const isSupabaseConfigured = () =>
    Boolean(SUPABASE_URL && /^https?:\/\//i.test(SUPABASE_URL) && SUPABASE_ANON_KEY)

export function getSupabase(): SupabaseClient<Database> {
    if (_client) return _client
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
    }
    _client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    })
    return _client
}


