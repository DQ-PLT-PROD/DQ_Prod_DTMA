/**
 * Microsoft Graph API service for retrieving additional user information
 */

export interface GraphUser {
  id?: string;
  displayName?: string;
  givenName?: string;
  surname?: string;
  mail?: string;
  userPrincipalName?: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
}

/**
 * Fetches user information from Microsoft Graph API
 */
export async function fetchUserFromGraph(accessToken: string): Promise<GraphUser | null> {
  try {
    console.log('🔍 Fetching user info from Microsoft Graph...');
    
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ Graph API request failed:', response.status, response.statusText);
      return null;
    }

    const userData: GraphUser = await response.json();
    console.log('✅ User data from Graph API:', userData);
    
    return userData;
  } catch (error) {
    console.error('❌ Error fetching user from Graph API:', error);
    return null;
  }
}

/**
 * Merges Graph API user data with existing user profile
 */
export function mergeGraphUserData(existingProfile: any, graphUser: GraphUser) {
  return {
    id: existingProfile.id || graphUser.id || 'unknown-user',
    name: graphUser.displayName || existingProfile.name || 'User',
    email: graphUser.mail || graphUser.userPrincipalName || existingProfile.email || 'user@domain.com',
    // Additional fields from Graph API
    jobTitle: graphUser.jobTitle,
    department: graphUser.department,
    officeLocation: graphUser.officeLocation
  };
}
