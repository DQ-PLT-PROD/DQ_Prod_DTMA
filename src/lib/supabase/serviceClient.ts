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

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL') || 'https://ugmybskacomcdgdngolz.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbXlic2thY29tY2RnZG5nb2x6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY1MzQwMSwiZXhwIjoyMDgwMjI5NDAxfQ.VtwgRdManf3CWTfh1_eWAtagE1PJ5qt1xP01pfLcNHU';

// Debug logging
console.log('🔧 Environment variable debug:');
console.log('URL found:', Boolean(SUPABASE_URL));
console.log('Service Key found:', Boolean(SUPABASE_SERVICE_ROLE_KEY));
console.log('Service Key length:', SUPABASE_SERVICE_ROLE_KEY.length);
if (SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Service Key preview:', `${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`);
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
    console.log('🔍 Checking service role configuration...');
    console.log('Service role configured:', isServiceRoleConfigured());
    console.log('Service role key exists:', Boolean(SUPABASE_SERVICE_ROLE_KEY));
    console.log('Service role key length:', SUPABASE_SERVICE_ROLE_KEY?.length || 0);
    
    try {
        if (isServiceRoleConfigured()) {
            console.log('✅ Using service role client for enrollment operations');
            return getServiceSupabase();
        }
    } catch (error) {
        console.warn('❌ Service role not available, falling back to regular client:', error);
    }
    
    console.log('⚠️ Falling back to regular client - RLS policies may block operations');
    // Fallback to regular client (will require RLS to be disabled)
    return getSupabase();
}