import { PublicClientApplication, Configuration } from "@azure/msal-browser";

// Helper function to get the correct redirect URI based on environment
const getRedirectUri = () => {
  // For localhost development
  if (typeof window !== 'undefined' && window.location.origin.includes('localhost')) {
    console.log('🏠 Using localhost redirect URI');
    return 'http://localhost:3000';
  }
  
  // For production, use environment variable or fallback to current origin
  const prodRedirectUri = (import.meta as any).env.VITE_AZURE_REDIRECT_URI;
  if (prodRedirectUri) {
    console.log('🌐 Using production redirect URI:', prodRedirectUri);
    return prodRedirectUri;
  }
  
  // Fallback to current origin if available
  if (typeof window !== 'undefined') {
    const currentOrigin = `${window.location.origin}/`;
    console.log('🔄 Using current origin as redirect URI:', currentOrigin);
    return currentOrigin;
  }
  
  // Final fallback to localhost
  console.warn('⚠️ No VITE_AZURE_REDIRECT_URI set and no window available. Using localhost.');
  return 'http://localhost:3000';
};

const getPostLogoutRedirectUri = () => {
  // For localhost development
  if (typeof window !== 'undefined' && window.location.origin.includes('localhost')) {
    console.log('🏠 Using localhost post-logout URI');
    return 'http://localhost:3000';
  }
  
  // For production, use environment variable or fallback to current origin
  const prodLogoutUri = (import.meta as any).env.VITE_AZURE_POST_LOGOUT_REDIRECT_URI;
  if (prodLogoutUri) {
    console.log('🌐 Using production post-logout URI:', prodLogoutUri);
    return prodLogoutUri;
  }
  
  // Fallback to current origin if available
  if (typeof window !== 'undefined') {
    const currentOrigin = `${window.location.origin}/`;
    console.log('🔄 Using current origin as post-logout URI:', currentOrigin);
    return currentOrigin;
  }
  
  // Final fallback to localhost
  console.warn('⚠️ No VITE_AZURE_POST_LOGOUT_REDIRECT_URI set and no window available.');
  return 'http://localhost:3000';
};

// Build the authority URL for Azure External ID (CIAM)
const getAuthority = () => {
  const tenantId = (import.meta as any).env.VITE_AZURE_TENANT_ID || '2d664c1c-c510-4764-af80-fe7c49c1e192';
  const subdomain = (import.meta as any).env.VITE_AZURE_SUBDOMAIN || 'dqproddev';
  
  console.log('🔧 Authority Debug:', { tenantId, subdomain });
  
  // Validate required values
  if (!tenantId) {
    console.error('❌ VITE_AZURE_TENANT_ID is missing!');
    throw new Error('VITE_AZURE_TENANT_ID environment variable is required');
  }
  
  // For Azure External ID, use the subdomain format
  if (subdomain) {
    const authority = `https://${subdomain}.ciamlogin.com/${tenantId}/v2.0`;
    console.log('🔗 Using CIAM authority:', authority);
    return authority;
  }
  
  // Fallback to tenant ID format
  const authority = `https://login.microsoftonline.com/${tenantId}/v2.0`;
  console.log('🔗 Using standard authority:', authority);
  return authority;
};

const msalConfig: Configuration = {
  auth: {
    clientId: (import.meta as any).env.VITE_AZURE_CLIENT_ID || '66ab04e3-a85d-48f1-b7a9-db7fdedd5e9d',
    authority: getAuthority(),
    redirectUri: getRedirectUri(),
    postLogoutRedirectUri: getPostLogoutRedirectUri(),
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

// Debug the final configuration
console.log('🔧 MSAL Configuration:', {
  clientId: msalConfig.auth.clientId,
  authority: msalConfig.auth.authority,
  redirectUri: msalConfig.auth.redirectUri,
  postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri,
});

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: ["openid", "profile", "email"]
};

export const interactiveLoginRequest = {
  scopes: ["openid", "profile", "email"]
};
