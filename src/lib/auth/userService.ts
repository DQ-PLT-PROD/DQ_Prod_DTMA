/**
 * User Service for managing user data synchronization between Azure AD and database
 */
import { getSupabase, isSupabaseConfigured } from "../supabase/client";

// Initialize Supabase client with validation/guard to avoid runtime errors when env vars are missing/invalid
let supabase: ReturnType<typeof getSupabase> | null = null;
try {
    if (isSupabaseConfigured()) {
        supabase = getSupabase();
    } else {
        console.warn("Supabase not configured; skipping user service client initialization.");
    }
} catch (err) {
    console.warn("Failed to initialize Supabase client (check VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY):", err);
    supabase = null;
}

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
    if (!supabase) {
        console.warn("Supabase not configured; skipping user sync.");
        return null;
    }

    try {
        console.log('🔄 Syncing user with database:', {
            azureUserId,
            email: azureUserProfile.email,
            name: azureUserProfile.name,
            supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...',
            hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
        });

        // Check if user already exists first
        const existingUser = await getUserByAzureId(azureUserId);

        if (existingUser) {
            console.log('👤 User already exists:', {
                currentEmail: existingUser.email,
                newEmail: azureUserProfile.email,
                emailChanged: existingUser.email !== azureUserProfile.email
            });

            console.log('🔄 Updating profile and last login...');
            const updateSuccess = await updateUserProfile(azureUserId, azureUserProfile, additionalData);
            if (updateSuccess) {
                // Fetch updated user data
                const updatedUser = await getUserByAzureId(azureUserId);
                console.log('✅ Existing user profile updated:', {
                    id: updatedUser?.id,
                    oldEmail: existingUser.email,
                    newEmail: updatedUser?.email,
                    name: updatedUser?.name
                });
                return updatedUser;
            } else {
                console.log('⚠️ Failed to update user profile, returning existing user');
                return existingUser;
            }
        }

        // Generate a customer ID for new user
        const customerId = `CUST_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const userData = {
            azure_user_id: azureUserId,
            customer_id: customerId,
            email: azureUserProfile.email,
            name: azureUserProfile.name,
            given_name: additionalData?.givenName || additionalData?.given_name || null,
            surname: additionalData?.surname || additionalData?.family_name || null,
            job_title: azureUserProfile.jobTitle || additionalData?.jobTitle || null,
            department: azureUserProfile.department || additionalData?.department || null,
            office_location: azureUserProfile.officeLocation || additionalData?.officeLocation || null,
            profile_data: additionalData || null,
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('📝 Creating new user with data:', {
            ...userData,
            profile_data: userData.profile_data ? 'present' : 'null'
        });

        // Insert new user
        const { data, error } = await supabase
            .from('users')
            .insert(userData)
            .select()
            .single();

        if (error) {
            console.error('❌ Error creating user in database:', {
                error,
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            });

            // Check for specific error types
            if (error.code === '42501') {
                console.error('🔒 RLS Policy Error: The database policies are blocking user creation');
                console.error('💡 Suggestion: Check RLS policies on users table');
            } else if (error.code === '23505') {
                console.error('🔄 Unique Constraint Error: User might already exist');
                // Try to fetch existing user
                return await getUserByAzureId(azureUserId);
            }

            return null;
        }

        console.log('✅ New user created successfully:', {
            id: data.id,
            customerId: data.customer_id,
            email: data.email,
            createdAt: data.created_at
        });

        return data as DatabaseUser;
    } catch (error) {
        console.error('❌ Unexpected error syncing user:', {
            error,
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return null;
    }
}

/**
 * Gets a user from the database by Azure user ID
 */
export async function getUserByAzureId(azureUserId: string): Promise<DatabaseUser | null> {
    if (!supabase) {
        console.warn("Supabase not configured; cannot fetch user by Azure ID.");
        return null;
    }
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
 * Updates user's last login timestamp and profile data
 */
export async function updateUserLastLogin(azureUserId: string): Promise<boolean> {
    if (!supabase) {
        console.warn("Supabase not configured; cannot update user last login.");
        return false;
    }
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
 * Updates existing user's profile data including email
 */
export async function updateUserProfile(
    azureUserId: string,
    userProfile: UserProfile,
    additionalData?: any
): Promise<boolean> {
    if (!supabase) {
        console.warn("Supabase not configured; cannot update user profile.");
        return false;
    }
    try {
        const updateData = {
            email: userProfile.email,
            name: userProfile.name,
            given_name: additionalData?.givenName || additionalData?.given_name || null,
            surname: additionalData?.surname || additionalData?.family_name || null,
            job_title: userProfile.jobTitle || additionalData?.jobTitle || null,
            department: userProfile.department || additionalData?.department || null,
            office_location: userProfile.officeLocation || additionalData?.officeLocation || null,
            profile_data: additionalData || null,
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('📝 Updating existing user profile:', {
            azureUserId,
            email: updateData.email,
            name: updateData.name
        });

        const { error } = await supabase!
            .from('users')
            .update(updateData)
            .eq('azure_user_id', azureUserId);

        if (error) {
            console.error('❌ Error updating user profile:', error);
            return false;
        }

        console.log('✅ User profile updated successfully');
        return true;
    } catch (error) {
        console.error('❌ Unexpected error updating user profile:', error);
        return false;
    }
}
