import { PublicClientApplication, Configuration, BrowserCacheLocation } from "@azure/msal-browser";

const CLIENT_ID = import.meta.env.VITE_AZURE_CLIENT_ID;
const TENANT_ID = import.meta.env.VITE_AZURE_TENANT_ID;
const REDIRECT_URI = import.meta.env.VITE_AZURE_REDIRECT_URI;
const POST_LOGOUT_REDIRECT_URI = import.meta.env.VITE_AZURE_POST_LOGOUT_REDIRECT_URI;

console.log('🔍 MSAL Config Loading...');
console.log('CLIENT_ID from env:', CLIENT_ID);
console.log('TENANT_ID from env:', TENANT_ID);
console.log('REDIRECT_URI from env:', REDIRECT_URI);
console.log('All env vars:', import.meta.env);

if (!CLIENT_ID) {
  console.error('❌ Missing Azure Client ID in .env file.');
  throw new Error('Missing Azure Client ID in .env file.');
}

// Debug: Log the actual values being used
console.log('✅ Environment variables loaded:', {
  CLIENT_ID: CLIENT_ID ? 'SET' : 'MISSING',
  TENANT_ID: TENANT_ID ? 'SET' : 'MISSING',
  REDIRECT_URI: REDIRECT_URI ? 'SET' : 'MISSING'
});

// MSAL configuration for Azure External ID (CIAM)
// Using specific tenant and configured redirect URIs
export const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: TENANT_ID ? `https://login.microsoftonline.com/${TENANT_ID}` : "https://login.microsoftonline.com/common",
    redirectUri: REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: ["User.Read"], // Standard scope for Microsoft Graph API
  // This allows reading basic user profile information
};
