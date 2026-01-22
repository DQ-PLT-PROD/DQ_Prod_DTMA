import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

let _client: SupabaseClient | null = null;

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
    return Boolean(
        SUPABASE_URL &&
        SUPABASE_ANON_KEY &&
        !SUPABASE_URL.includes('placeholder')
    );
}

/**
 * Get the Supabase client instance (singleton pattern)
 */
export function getSupabase(): SupabaseClient {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
    }

    if (!_client) {
        _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    return _client;
}
