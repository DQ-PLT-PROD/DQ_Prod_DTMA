import { PublicClientApplication, Configuration } from "@azure/msal-browser";

// Helper function to get the correct redirect URI based on environment
const getRedirectUri = () => {
  // If we're on localhost, use localhost
  if (typeof window !== 'undefined' && window.location.origin.includes('localhost')) {
    return 'http://localhost:3000';
  }
  
  // For any Vercel deployment, use the current origin
  if (typeof window !== 'undefined' && window.location.origin.includes('vercel.app')) {
    return window.location.origin + '/';
  }
  
  // Fallback to environment variable or current origin
  return (import.meta as any).env.VITE_AZURE_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin : 'https://dq-prod-dtma-git-develop-digitalqatalysts-projects.vercel.app/');
};

const getPostLogoutRedirectUri = () => {
  // If we're on localhost, use localhost
  if (typeof window !== 'undefined' && window.location.origin.includes('localhost')) {
    return 'http://localhost:3000';
  }
  
  // For any Vercel deployment, use the current origin
  if (typeof window !== 'undefined' && window.location.origin.includes('vercel.app')) {
    return window.location.origin + '/';
  }
  
  // Fallback to environment variable or current origin
  return (import.meta as any).env.VITE_AZURE_POST_LOGOUT_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin : 'https://dq-prod-dtma-git-develop-digitalqatalysts-projects.vercel.app/');
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
