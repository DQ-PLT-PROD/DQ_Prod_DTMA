import { PublicClientApplication, Configuration } from "@azure/msal-browser";

// Helper function to get the correct redirect URI based on environment
const getRedirectUri = () => {
  // For localhost development - always use localhost regardless of env var
  if (typeof window !== 'undefined' && window.location.origin.includes('localhost')) {
    const currentOrigin = `${window.location.origin}/`;
    console.log('🏠 Using localhost redirect URI:', currentOrigin);
    return currentOrigin;
  }
  
  // For production, use environment variable or auto-detect current origin
  const envRedirectUri = (import.meta as any).env.VITE_AZURE_REDIRECT_URI;
  if (envRedirectUri) {
    console.log('🌐 Using environment redirect URI:', envRedirectUri);
    return envRedirectUri;
  }
  
  // Fallback to current origin if no environment variable is set
  const currentOrigin = typeof window !== 'undefined' ? `${window.location.origin}/` : '/';
  console.log('🌐 Using auto-detected redirect URI:', currentOrigin);
  return currentOrigin;
};

const getPostLogoutRedirectUri = () => {
  // For localhost development - always use localhost regardless of env var
  if (typeof window !== 'undefined' && window.location.origin.includes('localhost')) {
    const currentOrigin = `${window.location.origin}/`;
    console.log('🏠 Using localhost post-logout URI:', currentOrigin);
    return currentOrigin;
  }
  
  // For production, use environment variable or auto-detect current origin
  const envPostLogoutUri = (import.meta as any).env.VITE_AZURE_POST_LOGOUT_REDIRECT_URI;
  if (envPostLogoutUri) {
    console.log('🌐 Using environment post-logout URI:', envPostLogoutUri);
    return envPostLogoutUri;
  }
  
  // Fallback to current origin if no environment variable is set
  const currentOrigin = typeof window !== 'undefined' ? `${window.location.origin}/` : '/';
  console.log('🌐 Using auto-detected post-logout URI:', currentOrigin);
  return currentOrigin;
};

// Build the authority URL for Azure External ID (CIAM)
const getAuthority = () => {
  const tenantId = (import.meta as any).env.VITE_AZURE_TENANT_ID;
  const subdomain = (import.meta as any).env.VITE_AZURE_SUBDOMAIN;
  
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
    clientId: (import.meta as any).env.VITE_AZURE_CLIENT_ID || (() => {
      console.error('❌ VITE_AZURE_CLIENT_ID is missing!');
      throw new Error('VITE_AZURE_CLIENT_ID environment variable is required');
    })(),
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
