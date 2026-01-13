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

// Debug logging
console.log('🔍 Service Client Environment Check:');
console.log('SUPABASE_URL:', SUPABASE_URL ? 'Found' : 'Missing');
console.log('SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing');

if (SUPABASE_SERVICE_ROLE_KEY) {
    console.log('✅ Service role key detected, length:', SUPABASE_SERVICE_ROLE_KEY.length);
} else {
    console.log('❌ Service role key missing - will fall back to regular client');
}

let _serviceClient: SupabaseClient<Database> | null = null;

export const isServiceRoleConfigured = () =>
    Boolean(SUPABASE_URL && /^https?:\/\//i.test(SUPABASE_URL) && SUPABASE_SERVICE_ROLE_KEY);

export function getServiceSupabase(): SupabaseClient<Database> {
    if (_serviceClient) {
        console.log('🔄 Reusing existing service client');
        return _serviceClient;
    }
    
    if (!isServiceRoleConfigured()) {
        console.error('❌ Service role not configured:', {
            hasUrl: Boolean(SUPABASE_URL),
            hasKey: Boolean(SUPABASE_SERVICE_ROLE_KEY),
            urlValid: SUPABASE_URL && /^https?:\/\//i.test(SUPABASE_URL)
        });
        throw new Error(
            'Supabase service role not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY environment variables.'
        );
    }

    console.log('🚀 Creating new service client');
    _serviceClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    console.log('✅ Service client created successfully');
    return _serviceClient;
}

/**
 * Check if service role is available, with fallback to regular client
 */
export function getSupabaseForEnrollment(): SupabaseClient<Database> {
    console.log('🎯 Getting Supabase client for enrollment...');
    
    try {
        if (isServiceRoleConfigured()) {
            console.log('✅ Service role configured, using service client');
            return getServiceSupabase();
        } else {
            console.log('❌ Service role not configured:', {
                hasUrl: Boolean(SUPABASE_URL),
                hasKey: Boolean(SUPABASE_SERVICE_ROLE_KEY),
                urlValid: SUPABASE_URL && /^https?:\/\//i.test(SUPABASE_URL)
            });
        }
    } catch (error) {
        console.warn('❌ Service role not available, falling back to regular client:', error);
    }
    
    console.warn('⚠️ Falling back to regular client - RLS policies may block operations');
    // Fallback to regular client (will require RLS to be disabled)
    return getSupabase();
}
