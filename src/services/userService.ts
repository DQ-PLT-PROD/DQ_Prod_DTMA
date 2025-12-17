/**
 * User Service for managing user data synchronization between Azure AD and database
 */
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface DatabaseUser {
  id: string;
  azure_user_id: string;
  customer_id: string;
  email: string;
  name: string;
  given_name?: string;
  surname?: string;
  job_title?: string;
  department?: string;
  office_location?: string;
  profile_data?: any;
  last_login: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
}

/**
 * Creates or updates a user in the database when they authenticate
 */
export async function syncUserWithDatabase(
  azureUserProfile: UserProfile,
  azureUserId: string,
  additionalData?: any
): Promise<DatabaseUser | null> {
  try {
    console.log('🔄 Syncing user with database:', { azureUserId, email: azureUserProfile.email });

    // Generate a customer ID if this is a new user
    const customerId = `CUST_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const userData = {
      azure_user_id: azureUserId,
      customer_id: customerId,
      email: azureUserProfile.email,
      name: azureUserProfile.name,
      given_name: additionalData?.givenName || null,
      surname: additionalData?.surname || null,
      job_title: azureUserProfile.jobTitle || additionalData?.jobTitle || null,
      department: azureUserProfile.department || additionalData?.department || null,
      office_location: azureUserProfile.officeLocation || additionalData?.officeLocation || null,
      profile_data: additionalData || null,
      last_login: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Try to upsert the user (insert or update if exists)
    const { data, error } = await supabase
      .from('users')
      .upsert(
        userData,
        { 
          onConflict: 'azure_user_id',
          ignoreDuplicates: false 
        }
      )
      .select()
      .single();

    if (error) {
      console.error('❌ Error syncing user with database:', error);
      return null;
    }

    console.log('✅ User synced successfully:', data);
    return data as DatabaseUser;
  } catch (error) {
    console.error('❌ Unexpected error syncing user:', error);
    return null;
  }
}

/**
 * Gets a user from the database by Azure user ID
 */
export async function getUserByAzureId(azureUserId: string): Promise<DatabaseUser | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('azure_user_id', azureUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - user doesn't exist yet
        return null;
      }
      console.error('❌ Error fetching user by Azure ID:', error);
      return null;
    }

    return data as DatabaseUser;
  } catch (error) {
    console.error('❌ Unexpected error fetching user:', error);
    return null;
  }
}

/**
 * Gets a user from the database by customer ID
 */
export async function getUserByCustomerId(customerId: string): Promise<DatabaseUser | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('❌ Error fetching user by customer ID:', error);
      return null;
    }

    return data as DatabaseUser;
  } catch (error) {
    console.error('❌ Unexpected error fetching user:', error);
    return null;
  }
}

/**
 * Updates user's last login timestamp
 */
export async function updateUserLastLogin(azureUserId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('azure_user_id', azureUserId);

    if (error) {
      console.error('❌ Error updating last login:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Unexpected error updating last login:', error);
    return false;
  }
}

/**
 * Links business profile data to a user
 */
export async function linkBusinessProfileToUser(
  azureUserId: string, 
  profileData: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        profile_data: profileData,
        updated_at: new Date().toISOString()
      })
      .eq('azure_user_id', azureUserId);

    if (error) {
      console.error('❌ Error linking business profile:', error);
      return false;
    }

    console.log('✅ Business profile linked to user');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error linking business profile:', error);
    return false;
  }
}

/**
 * Gets all users (admin function)
 */
export async function getAllUsers(): Promise<DatabaseUser[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching all users:', error);
      return [];
    }

    return data as DatabaseUser[];
  } catch (error) {
    console.error('❌ Unexpected error fetching users:', error);
    return [];
  }
}

/**
 * Deletes a user from the database (admin function)
 */
export async function deleteUser(azureUserId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('azure_user_id', azureUserId);

    if (error) {
      console.error('❌ Error deleting user:', error);
      return false;
    }

    console.log('✅ User deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error deleting user:', error);
    return false;
  }
}