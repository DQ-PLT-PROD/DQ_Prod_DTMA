/**
 * Utility to test Supabase connection and verify database schema
 *
 * Usage (browser dev tools console):
 *   testSupabaseConnection()   — run full connectivity + schema check
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function testSupabaseConnection(): Promise<boolean> {
  console.log('🔍 Testing Supabase connection...');

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials missing from environment');
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('📡 Testing basic connection...');
    const { error } = await supabase.from('users').select('count').limit(1);

    if (error) {
      console.error('❌ Supabase connection error:', error);
      if (error.message.includes('relation "public.users" does not exist')) {
        console.log('📋 Users table does not exist. Run: supabase migration up');
      }
      return false;
    }

    console.log('✅ Supabase connection successful');

    // Check enrollment schema columns
    console.log('🔍 Checking user_enrollments schema...');
    const { error: enrollError } = await supabase
      .from('user_enrollments')
      .select('id, user_id, course_slug, status, enrollment_method, started_at')
      .limit(0);

    if (enrollError) {
      console.error('❌ user_enrollments schema issue:', enrollError.message);
      if (enrollError.message.includes('enrollment_method')) {
        console.log('📋 Missing enrollment_method column — apply migration 028_update_enrollment_schema.sql');
      }
      if (enrollError.message.includes('status')) {
        console.log('📋 Missing status column — apply migration 028_update_enrollment_schema.sql');
      }
      return false;
    }

    console.log('✅ user_enrollments schema looks correct');

    // Check business profiles table
    const { error: profilesError } = await supabase
      .from('user_business_profiles')
      .select('count')
      .limit(1);

    if (profilesError) {
      console.warn('⚠️ user_business_profiles table issue:', profilesError.message);
    } else {
      console.log('✅ user_business_profiles table exists');
    }

    return true;
  } catch (error) {
    console.error('❌ Unexpected error testing Supabase:', error);
    return false;
  }
}

// Expose globally for easy browser console access
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
}
