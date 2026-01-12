/**
 * Utility to test Supabase connection and verify database schema
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials missing');
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection
    console.log('📡 Testing basic connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      
      // Check if it's a table not found error
      if (error.message.includes('relation "public.users" does not exist')) {
        console.log('📋 Users table does not exist. You need to run the migration:');
        console.log('   supabase migration up');
        console.log('   Or manually create the tables using the SQL in supabase/migrations/006_add_users_table.sql');
        return false;
      }
      
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test table structure
    console.log('🔍 Checking table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(0);
    
    if (tableError) {
      console.error('❌ Error checking table structure:', tableError);
      return false;
    }
    
    console.log('✅ Users table exists and is accessible');
    
    // Check for business profiles table
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_business_profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.error('⚠️ Business profiles table issue:', profilesError);
      if (profilesError.message.includes('relation "public.user_business_profiles" does not exist')) {
        console.log('📋 user_business_profiles table does not exist');
        return false;
      }
    } else {
      console.log('✅ Business profiles table exists');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error testing Supabase:', error);
    return false;
  }
}

export async function createTestUser() {
  console.log('🧪 Creating test user...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const testUser = {
    azure_user_id: 'test-user-' + Date.now(),
    customer_id: `CUST_${Date.now()}_TEST`,
    email: 'test@example.com',
    name: 'Test User',
    last_login: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating test user:', error);
      return null;
    }
    
    console.log('✅ Test user created:', data);
    return data;
  } catch (error) {
    console.error('❌ Unexpected error creating test user:', error);
    return null;
  }
}

export async function cleanupTestUser(azureUserId: string) {
  console.log('🧹 Cleaning up test user...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('azure_user_id', azureUserId);
    
    if (error) {
      console.error('❌ Error cleaning up test user:', error);
      return false;
    }
    
    console.log('✅ Test user cleaned up');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error cleaning up test user:', error);
    return false;
  }
}