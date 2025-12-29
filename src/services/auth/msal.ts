import { PublicClientApplication, Configuration } from "@azure/msal-browser";

// Helper function to get the correct redirect URI based on environment
const getRedirectUri = () => {
  // For localhost development
  if (typeof window !== 'undefined' && window.location.origin.includes('localhost')) {
    return 'http://localhost:3000';
  }
  
  // For production deployment, use current origin
  if (typeof window !== 'undefined') {
    return window.location.origin + '/';
  }
  
  // Fallback
  return 'http://localhost:3000';
};

const getPostLogoutRedirectUri = () => {
  // For localhost development
  if (typeof window !== 'undefined' && window.location.origin.includes('localhost')) {
    return 'http://localhost:3000';
  }
  
  // For production deployment, use current origin
  if (typeof window !== 'undefined') {
    return window.location.origin + '/';
  }
  
  // Fallback
  return 'http://localhost:3000';
};

// Build the authority URL for Azure External ID (CIAM)
const getAuthority = () => {
  const tenantId = (import.meta as any).env.VITE_AZURE_TENANT_ID;
  const subdomain = (import.meta as any).env.VITE_AZURE_SUBDOMAIN;
  
  // For Azure External ID, use the subdomain format
  if (subdomain) {
    return `https://${subdomain}.ciamlogin.com/${tenantId}/v2.0`;
  }
  
  // Fallback to tenant ID format
  return `https://login.microsoftonline.com/${tenantId}/v2.0`;
};

const msalConfig: Configuration = {
  auth: {
    clientId: (import.meta as any).env.VITE_AZURE_CLIENT_ID,
    authority: getAuthority(),
    redirectUri: getRedirectUri(),
    postLogoutRedirectUri: getPostLogoutRedirectUri(),
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: ["openid", "profile", "email"]
};

export const interactiveLoginRequest = {
  scopes: ["openid", "profile", "email"]
};
