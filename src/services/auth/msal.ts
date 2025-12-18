import { PublicClientApplication, Configuration } from "@azure/msal-browser";

// Azure External ID / CIAM configuration
const subdomain = (import.meta as any).env.VITE_AZURE_SUBDOMAIN;
const tenantId = (import.meta as any).env.VITE_AZURE_TENANT_ID;

// Debug: Log the configuration
console.log('🔧 MSAL Config:', {
  subdomain,
  tenantId,
  clientId: (import.meta as any).env.VITE_AZURE_CLIENT_ID,
});

// For Azure External ID (CIAM), authority format is:
// https://{subdomain}.ciamlogin.com/{tenant-id}
const msalConfig: Configuration = {
  auth: {
    clientId: (import.meta as any).env.VITE_AZURE_CLIENT_ID,
    authority: `https://${subdomain}.ciamlogin.com/${tenantId}`,
    redirectUri: (import.meta as any).env.VITE_AZURE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: (import.meta as any).env.VITE_AZURE_POST_LOGOUT_REDIRECT_URI || window.location.origin,
    knownAuthorities: [`${subdomain}.ciamlogin.com`],
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
