/**
 * Database Client Wrapper for Instructor Portal
 *
 * This provides a compatibility layer that matches the DWS Admin App's
 * getSupabaseClient() interface while using DTMA's Supabase client.
 */

import { getSupabase } from '@/lib/supabase/client';
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

export default getSupabaseClient;
