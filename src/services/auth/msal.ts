import { PublicClientApplication, Configuration } from "@azure/msal-browser";

const msalConfig: Configuration = {
  auth: {
    clientId: (import.meta as any).env.VITE_AZURE_CLIENT_ID,
    authority: `https://${(import.meta as any).env.VITE_AZURE_CIAM_DOMAIN}`, // <-- CIAM domain here
    redirectUri: (import.meta as any).env.VITE_AZURE_REDIRECT_URI,
    postLogoutRedirectUri: (import.meta as any).env.VITE_AZURE_POST_LOGOUT_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: ["User.Read"]
};

export const interactiveLoginRequest = {
  scopes: ["User.Read"]
};
