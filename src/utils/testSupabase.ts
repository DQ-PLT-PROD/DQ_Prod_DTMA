/**
 * Utility to test Supabase connection and database setup
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase connection...');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials missing');
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection
    console.log('🔗 Testing basic connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      
      // Check if it's a table not found error
      if (error.message.includes('relation "public.users" does not exist')) {
        console.log('📋 Users table does not exist. You need to run the migration:');
        console.log('   supabase migration up');
        console.log('   Or manually create the tables from: supabase/migrations/006_add_users_table.sql');
      }
      
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📊 Connection test result:', data);
    
    // Test table structure
    console.log('🔍 Testing table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(0);
    
    if (tableError) {
      console.error('❌ Table structure error:', tableError);
      return false;
    }
    
    console.log('✅ Users table structure is accessible');
    
    // Test business profiles table
    const { data: profilesInfo, error: profilesError } = await supabase
      .from('user_business_profiles')
      .select('*')
      .limit(0);
    
    if (profilesError) {
      console.error('❌ Business profiles table error:', profilesError);
      console.log('⚠️ Business profiles table may not exist');
    } else {
      console.log('✅ Business profiles table is accessible');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error testing Supabase:', error);
    return false;
  }
}

export async function testUserCreation() {
  console.log('🧪 Testing user creation...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test data
  const testUser = {
    azure_user_id: 'test-user-' + Date.now(),
    customer_id: `CUST_${Date.now()}_TEST`,
    email: 'test@example.com',
    name: 'Test User',
    last_login: new Date().toISOString()
  };
  
  try {
    // Try to create a test user
    const { data, error } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single();
    
    if (error) {
      console.error('❌ User creation test failed:', error);
      return false;
    }
    
    console.log('✅ Test user created successfully:', data);
    
    // Clean up - delete the test user
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', data.id);
    
    if (deleteError) {
      console.warn('⚠️ Could not clean up test user:', deleteError);
    } else {
      console.log('🧹 Test user cleaned up successfully');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error in user creation test:', error);
    return false;
  }
}