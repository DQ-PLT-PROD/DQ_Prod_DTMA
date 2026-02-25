/**
 * Supabase Service Role Client
 * Browser-safe shim.
 * Service role keys must never be used in frontend code.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getSupabase } from './client';

export const isServiceRoleConfigured = () => false;

export function getServiceSupabase(): SupabaseClient<Database> {
    throw new Error('Service role access is disabled in browser runtime.');
}

/**
 * Always returns the normal authenticated client in browser runtime.
 */
export function getSupabaseForEnrollment(): SupabaseClient<Database> {
    return getSupabase();
}
