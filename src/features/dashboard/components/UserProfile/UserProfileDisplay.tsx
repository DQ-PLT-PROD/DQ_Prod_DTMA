/**
 * Component to display user profile information and database sync status
 */
import React from 'react';
import { useUserSync } from '../../../../hooks/useUserSync';

export function UserProfileDisplay() {
  const {
    user,
    databaseUser,
    businessProfiles,
    primaryProfile,
    isLoading,
    error,
    customerId,
    isUserSynced,
    hasBusinessProfiles
  } = useUserSync();

  if (!user) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No user authenticated</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-600">Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Azure AD User Info */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Azure AD User</h3>
        <div className="space-y-1 text-sm">
          <p><span className="font-medium">ID:</span> {user.id}</p>
          <p><span className="font-medium">Name:</span> {user.name}</p>
          <p><span className="font-medium">Email:</span> {user.email}</p>
          {user.jobTitle && <p><span className="font-medium">Job Title:</span> {user.jobTitle}</p>}
          {user.department && <p><span className="font-medium">Department:</span> {user.department}</p>}
        </div>
      </div>

      {/* Database Sync Status */}
      <div className={`p-4 rounded-lg ${isUserSynced ? 'bg-green-50' : 'bg-yellow-50'}`}>
        <h3 className={`font-semibold mb-2 ${isUserSynced ? 'text-green-900' : 'text-yellow-900'}`}>
          Database Sync Status
        </h3>
        {isUserSynced ? (
          <div className="space-y-1 text-sm text-green-800">
            <p>✅ User synced with database</p>
            <p><span className="font-medium">Customer ID:</span> {customerId}</p>
            <p><span className="font-medium">Last Login:</span> {databaseUser?.last_login ? new Date(databaseUser.last_login).toLocaleString() : 'N/A'}</p>
            <p><span className="font-medium">Created:</span> {databaseUser?.created_at ? new Date(databaseUser.created_at).toLocaleString() : 'N/A'}</p>
          </div>
        ) : (
          <p className="text-yellow-800">⚠️ User not yet synced with database</p>
        )}
      </div>

      {/* Business Profiles */}
      <div className="p-4 bg-purple-50 rounded-lg">
        <h3 className="font-semibold text-purple-900 mb-2">Business Profiles</h3>
        {hasBusinessProfiles ? (
          <div className="space-y-2">
            <p className="text-sm text-purple-800">
              Found {businessProfiles.length} business profile(s)
            </p>
            {primaryProfile && (
              <div className="p-2 bg-purple-100 rounded text-sm">
                <p className="font-medium">Primary Profile: {primaryProfile.profile_name}</p>
                <p className="text-xs text-purple-600">
                  Created: {new Date(primaryProfile.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
            {businessProfiles.map((profile) => (
              <div key={profile.id} className="p-2 bg-white rounded text-sm border">
                <p className="font-medium">{profile.profile_name}</p>
                <p className="text-xs text-gray-600">
                  {profile.is_primary ? '👑 Primary' : 'Secondary'} •
                  Created: {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-purple-800">No business profiles found</p>
        )}
      </div>

      {/* Integration Status Summary */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Integration Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Entra Auth:</p>
            <p className={user ? 'text-green-600' : 'text-red-600'}>
              {user ? '✅ Connected' : '❌ Not Connected'}
            </p>
          </div>
          <div>
            <p className="font-medium">Database Sync:</p>
            <p className={isUserSynced ? 'text-green-600' : 'text-red-600'}>
              {isUserSynced ? '✅ Synced' : '❌ Not Synced'}
            </p>
          </div>
          <div>
            <p className="font-medium">Customer ID:</p>
            <p className={customerId ? 'text-green-600' : 'text-gray-600'}>
              {customerId || 'Not assigned'}
            </p>
          </div>
          <div>
            <p className="font-medium">Business Profiles:</p>
            <p className={hasBusinessProfiles ? 'text-green-600' : 'text-gray-600'}>
              {hasBusinessProfiles ? `${businessProfiles.length} linked` : 'None linked'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfileDisplay;