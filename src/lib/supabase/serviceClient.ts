/**
 * Supabase Service Role Client
 * Used for server-side operations that bypass RLS
 * Required for Azure AD authentication integration
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getSupabase } from './client';

// Get environment variables with multiple fallback methods
const getEnvVar = (key: string): string => {
    // Try different ways to access environment variables
    const methods = [
        () => (import.meta as any)?.env?.[key],
        () => (window as any)?.[key],
        () => process?.env?.[key],
        () => (globalThis as any)?.[key]
    ];
    
    for (const method of methods) {
        try {
            const value = method();
            if (typeof value === 'string' && value.trim()) {
                return value.trim();
            }
        } catch (e) {
            // Continue to next method
        }
    }
    return '';
};

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY');

const isBrowser = typeof window !== 'undefined';
if (isBrowser && SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️ Service role key should not be exposed in the browser. Move this to a server-side environment.');
}

let _serviceClient: SupabaseClient<Database> | null = null;

export const isServiceRoleConfigured = () =>
    Boolean(SUPABASE_URL && /^https?:\/\//i.test(SUPABASE_URL) && SUPABASE_SERVICE_ROLE_KEY);

export function getServiceSupabase(): SupabaseClient<Database> {
    if (_serviceClient) return _serviceClient;
    
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
        console.warn('❌ Service role not available, falling back to regular client:', error);
    }
    
    console.warn('⚠️ Falling back to regular client - RLS policies may block operations');
    // Fallback to regular client (will require RLS to be disabled)
    return getSupabase();
}
