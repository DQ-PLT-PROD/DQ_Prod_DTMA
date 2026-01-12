/**
 * Custom hook for user synchronization and database operations
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import {
  DatabaseUser,
  getUserByAzureId,
  syncUserWithDatabase
} from '../features/auth/services/userService';
import {
  BusinessProfile,
  getUserBusinessProfiles,
  getPrimaryBusinessProfile,
  saveBusinessProfile
} from '../features/dashboard/services/businessProfileService';

export function useUserSync() {
  const { user, databaseUser } = useAuth();
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [primaryProfile, setPrimaryProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load business profiles when user changes
  useEffect(() => {
    if (user?.id && databaseUser) {
      loadBusinessProfiles();
    }
  }, [user?.id, databaseUser]);

  const loadBusinessProfiles = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const [profiles, primary] = await Promise.all([
        getUserBusinessProfiles(user.id),
        getPrimaryBusinessProfile(user.id)
      ]);

      setBusinessProfiles(profiles);
      setPrimaryProfile(primary);
    } catch (err) {
      setError('Failed to load business profiles');
      console.error('Error loading business profiles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createBusinessProfile = async (
    profileName: string,
    profileData: any,
    isPrimary: boolean = false
  ) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const newProfile = await saveBusinessProfile(
        user.id,
        profileName,
        profileData,
        isPrimary
      );

      if (newProfile) {
        await loadBusinessProfiles(); // Refresh the list
        return newProfile;
      } else {
        throw new Error('Failed to create business profile');
      }
    } catch (err) {
      setError('Failed to create business profile');
      console.error('Error creating business profile:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (!user?.id) return null;

    setIsLoading(true);
    setError(null);

    try {
      const dbUser = await getUserByAzureId(user.id);
      await loadBusinessProfiles();
      return dbUser;
    } catch (err) {
      setError('Failed to refresh user data');
      console.error('Error refreshing user data:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Data
    user,
    databaseUser,
    businessProfiles,
    primaryProfile,

    // State
    isLoading,
    error,

    // Actions
    loadBusinessProfiles,
    createBusinessProfile,
    refreshUserData,

    // Computed values
    hasBusinessProfiles: businessProfiles.length > 0,
    customerId: databaseUser?.customer_id,
    isUserSynced: !!databaseUser
  };
}

export default useUserSync;