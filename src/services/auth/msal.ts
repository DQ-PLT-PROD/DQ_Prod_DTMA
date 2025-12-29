import { PublicClientApplication, Configuration } from "@azure/msal-browser";

// Helper function to get the correct redirect URI based on environment
const getRedirectUri = () => {
  // For localhost development - always use localhost regardless of env var
  if (typeof window !== 'undefined' && window.location.origin.includes('localhost')) {
    const currentOrigin = `${window.location.origin}/`;
    console.log('🏠 Using localhost redirect URI:', currentOrigin);
    return currentOrigin;
  }
  
  // For production, use environment variable first, then fallback to current origin
  const prodRedirectUri = (import.meta as any).env.VITE_AZURE_REDIRECT_URI;
  if (prodRedirectUri && !prodRedirectUri.includes('localhost')) {
    console.log('🌐 Using production redirect URI from env:', prodRedirectUri);
    return prodRedirectUri;
  }
  
  // Fallback to current origin if available (for production without env var)
  if (typeof window !== 'undefined') {
    const currentOrigin = `${window.location.origin}/`;
    console.log('🔄 Using current origin as redirect URI:', currentOrigin);
    return currentOrigin;
  }
  
  // Final fallback
  console.warn('⚠️ No redirect URI available, using localhost fallback.');
  return 'http://localhost:3000/';
};

const getPostLogoutRedirectUri = () => {
  // For localhost development - always use localhost regardless of env var
  if (typeof window !== 'undefined' && window.location.origin.includes('localhost')) {
    const currentOrigin = `${window.location.origin}/`;
    console.log('🏠 Using localhost post-logout URI:', currentOrigin);
    return currentOrigin;
  }
  
  // For production, use environment variable first, then fallback to current origin
  const prodLogoutUri = (import.meta as any).env.VITE_AZURE_POST_LOGOUT_REDIRECT_URI;
  if (prodLogoutUri && !prodLogoutUri.includes('localhost')) {
    console.log('🌐 Using production post-logout URI from env:', prodLogoutUri);
    return prodLogoutUri;
  }
  
  // Fallback to current origin if available (for production without env var)
  if (typeof window !== 'undefined') {
    const currentOrigin = `${window.location.origin}/`;
    console.log('🔄 Using current origin as post-logout URI:', currentOrigin);
    return currentOrigin;
  }
  
  // Final fallback
  console.warn('⚠️ No post-logout URI available, using localhost fallback.');
  return 'http://localhost:3000/';
};

// Build the authority URL for Azure External ID (CIAM)
const getAuthority = () => {
  const tenantId = (import.meta as any).env.VITE_AZURE_TENANT_ID || '2d664c1c-c510-4764-af80-fe7c49c1e192';
  const subdomain = (import.meta as any).env.VITE_AZURE_SUBDOMAIN || 'dqproddev';
  
  console.log('🔧 Authority Debug:', { 
    tenantId: tenantId ? `${tenantId.substring(0, 8)}...` : 'undefined',
    subdomain,
    envVars: {
      VITE_AZURE_TENANT_ID: (import.meta as any).env.VITE_AZURE_TENANT_ID ? 'set' : 'missing',
      VITE_AZURE_SUBDOMAIN: (import.meta as any).env.VITE_AZURE_SUBDOMAIN ? 'set' : 'missing'
    }
  });
  
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
