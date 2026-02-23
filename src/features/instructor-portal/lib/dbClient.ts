/**
 * Database Client Wrapper for Instructor Portal
 *
 * This provides a compatibility layer that matches the DWS Admin App's
 * getSupabaseClient() interface while using DTMA's Supabase client.
 */

import { getSupabase } from '@/lib/supabase/client';
import { getSupabaseForEnrollment, isServiceRoleConfigured } from '@/lib/supabase/serviceClient';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get the Supabase client for instructor portal operations
 * This wraps DTMA's getSupabase() to match DWS Admin App interface
 */
export function getSupabaseClient(): SupabaseClient | null {
    try {
        return getSupabase();
    } catch (error) {
        console.error('Failed to get Supabase client:', error);
        return null;
    }
}

/**
 * Get a Supabase client that bypasses RLS (service role) when configured.
 * Use for operations that may be blocked by RLS (e.g. posting/publishing courses).
 * Requires VITE_SUPABASE_SERVICE_ROLE_KEY in env; otherwise falls back to regular client.
 */
export function getSupabaseClientWithRLSOverride(): SupabaseClient | null {
    try {
        return getSupabaseForEnrollment();
    } catch (error) {
        console.warn('RLS override not available, using regular client:', error);
        return getSupabaseClient();
    }
}

/** True if service role is configured (override will actually bypass RLS). */
export function isRLSOverrideAvailable(): boolean {
    return isServiceRoleConfigured();
}

export default getSupabaseClient;
