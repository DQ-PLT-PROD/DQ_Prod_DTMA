import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Setup for usage in Vite (import.meta.env)
const rawUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL
const rawKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY

// Provide defaults or read from env.
// Note: In production, these should be properly injected.
const SUPABASE_URL = typeof rawUrl === 'string' ? rawUrl.trim() : 'https://ugmybskacomcdgdngolz.supabase.co'
const SUPABASE_ANON_KEY = typeof rawKey === 'string' ? rawKey.trim() : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbXlic2thY29tY2RnZG5nb2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NTM0MDEsImV4cCI6MjA4MDIyOTQwMX0.iwNLBgOsE1k8Eb3noMhJ4kCZX6b5oLdq-0B5S7CcPpo'

let _client: SupabaseClient<Database> | null = null

export const isSupabaseConfigured = () =>
    Boolean(SUPABASE_URL && /^https?:\/\//i.test(SUPABASE_URL) && SUPABASE_ANON_KEY)

export function getSupabase(): SupabaseClient<Database> {
    if (_client) return _client
    if (!isSupabaseConfigured()) {
        console.warn(`Supabase not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local (current url: "${SUPABASE_URL || 'undefined'}").`)
        // We return a client anyway to prevent crashes, but it won't work for requests requiring auth/valid url if invalid.
        // However, createClient might throw if URL is bad.
        try {
            _client = createClient<Database>(SUPABASE_URL || 'https://placeholder.supabase.co', SUPABASE_ANON_KEY || 'placeholder')
        } catch (e) {
            throw new Error("Failed to initialize Supabase client: " + e)
        }
        return _client
    }
    _client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
    return _client
}
