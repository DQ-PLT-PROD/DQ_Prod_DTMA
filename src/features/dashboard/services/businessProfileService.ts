/**
 * Business Profile Service for linking business profiles to authenticated users
 */
import { createClient } from '@supabase/supabase-js';
import { linkBusinessProfileToUser, getUserByAzureId } from '../../auth/services/userService';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface BusinessProfile {
  id: string;
  user_id: string;
  profile_name: string;
  profile_data: any;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Creates or updates a business profile for a user
 */
export async function saveBusinessProfile(
  azureUserId: string,
  profileName: string,
  profileData: any,
  isPrimary: boolean = false
): Promise<BusinessProfile | null> {
  try {
    console.log('💼 Saving business profile for user:', azureUserId);

    // Get the database user first
    const dbUser = await getUserByAzureId(azureUserId);
    if (!dbUser) {
      console.error('❌ User not found in database');
      return null;
    }

    // If this is set as primary, unset other primary profiles
    if (isPrimary) {
      await supabase
        .from('user_business_profiles')
        .update({ is_primary: false })
        .eq('user_id', dbUser.id);
    }

    const profileRecord = {
      user_id: dbUser.id,
      profile_name: profileName,
      profile_data: profileData,
      is_primary: isPrimary
    };

    // Upsert the business profile
    const { data, error } = await supabase
      .from('user_business_profiles')
      .upsert(profileRecord, {
        onConflict: 'user_id,profile_name',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving business profile:', error);
      return null;
    }

    // Also update the user's profile_data field for quick access
    await linkBusinessProfileToUser(azureUserId, profileData);

    console.log('✅ Business profile saved successfully');
    return data as BusinessProfile;
  } catch (error) {
    console.error('❌ Unexpected error saving business profile:', error);
    return null;
  }
}

/**
 * Gets all business profiles for a user
 */
export async function getUserBusinessProfiles(azureUserId: string): Promise<BusinessProfile[]> {
  try {
    const dbUser = await getUserByAzureId(azureUserId);
    if (!dbUser) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_business_profiles')
      .select('*')
      .eq('user_id', dbUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching business profiles:', error);
      return [];
    }

    return data as BusinessProfile[];
  } catch (error) {
    console.error('❌ Unexpected error fetching business profiles:', error);
    return [];
  }
}

/**
 * Gets the primary business profile for a user
 */
export async function getPrimaryBusinessProfile(azureUserId: string): Promise<BusinessProfile | null> {
  try {
    const dbUser = await getUserByAzureId(azureUserId);
    if (!dbUser) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_business_profiles')
      .select('*')
      .eq('user_id', dbUser.id)
      .eq('is_primary', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No primary profile found
      }
      console.error('❌ Error fetching primary business profile:', error);
      return null;
    }

    return data as BusinessProfile;
  } catch (error) {
    console.error('❌ Unexpected error fetching primary business profile:', error);
    return null;
  }
}

/**
 * Deletes a business profile
 */
export async function deleteBusinessProfile(azureUserId: string, profileId: string): Promise<boolean> {
  try {
    const dbUser = await getUserByAzureId(azureUserId);
    if (!dbUser) {
      return false;
    }

    const { error } = await supabase
      .from('user_business_profiles')
      .delete()
      .eq('id', profileId)
      .eq('user_id', dbUser.id); // Ensure user can only delete their own profiles

    if (error) {
      console.error('❌ Error deleting business profile:', error);
      return false;
    }

    console.log('✅ Business profile deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error deleting business profile:', error);
    return false;
  }
}

/**
 * Sets a business profile as primary
 */
export async function setPrimaryBusinessProfile(azureUserId: string, profileId: string): Promise<boolean> {
  try {
    const dbUser = await getUserByAzureId(azureUserId);
    if (!dbUser) {
      return false;
    }

    // First, unset all primary flags for this user
    await supabase
      .from('user_business_profiles')
      .update({ is_primary: false })
      .eq('user_id', dbUser.id);

    // Then set the specified profile as primary
    const { error } = await supabase
      .from('user_business_profiles')
      .update({ is_primary: true })
      .eq('id', profileId)
      .eq('user_id', dbUser.id);

    if (error) {
      console.error('❌ Error setting primary business profile:', error);
      return false;
    }

    console.log('✅ Primary business profile set successfully');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error setting primary business profile:', error);
    return false;
  }
}

/**
 * Links existing Dataverse profile data to the authenticated user
 */
export async function linkDataverseProfile(azureUserId: string, dataverseProfileData: any): Promise<boolean> {
  try {
    console.log('🔗 Linking Dataverse profile to user:', azureUserId);

    const profileName = dataverseProfileData.name || 'Business Profile';
    const result = await saveBusinessProfile(azureUserId, profileName, dataverseProfileData, true);

    if (result) {
      console.log('✅ Dataverse profile linked successfully');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Error linking Dataverse profile:', error);
    return false;
  }
}