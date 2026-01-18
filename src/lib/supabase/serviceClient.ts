/**
 * Supabase Service Role Client
 * Used for server-side operations that bypass RLS
 * Required for Azure AD authentication integration
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getSupabase } from './client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

let _serviceClient: SupabaseClient<Database> | null = null;

export const isServiceRoleConfigured = () =>
    Boolean(SUPABASE_URL && /^https?:\/\//i.test(SUPABASE_URL) && SUPABASE_SERVICE_ROLE_KEY);

export function getServiceSupabase(): SupabaseClient<Database> {
    if (_serviceClient) {
        return _serviceClient;
    }
    
    if (!isServiceRoleConfigured()) {
        throw new Error(
            'Supabase service role not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY environment variables.'
        );
    }

    _serviceClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    return _serviceClient;
}

/**
 * Check if service role is available, with fallback to regular client
 */
export function getSupabaseForEnrollment(): SupabaseClient<Database> {
    try {
        if (isServiceRoleConfigured()) {
            return getServiceSupabase();
        }
    } catch (error) {
        console.warn('Service role not available, falling back to regular client:', error);
    }
    
    console.warn('Falling back to regular client - RLS policies may block operations');
    return getSupabase();
}
