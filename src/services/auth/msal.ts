import {
  PublicClientApplication,
  Configuration,
  BrowserCacheLocation,
  LogLevel,
} from "@azure/msal-browser";

// Support both NEXT_PUBLIC_* and VITE_* envs
const env = (import.meta as any).env as Record<string, string | undefined>;

// Required environment variables - no fallbacks
const CLIENT_ID = env.VITE_AZURE_CLIENT_ID || env.NEXT_PUBLIC_AAD_CLIENT_ID;
const TENANT_NAME = env.VITE_B2C_TENANT_NAME || env.NEXT_PUBLIC_B2C_TENANT_NAME;
const POLICY_SIGNUP_SIGNIN = env.VITE_B2C_POLICY_SIGNUP_SIGNIN || env.NEXT_PUBLIC_B2C_POLICY_SIGNUP_SIGNIN;

// Optional environment variables with sensible defaults
const REDIRECT_URI = env.VITE_AZURE_REDIRECT_URI || env.NEXT_PUBLIC_REDIRECT_URI || window.location.origin;
const POST_LOGOUT_REDIRECT_URI = env.VITE_AZURE_POST_LOGOUT_REDIRECT_URI || env.NEXT_PUBLIC_POST_LOGOUT_REDIRECT_URI || REDIRECT_URI;
const POLICY_SIGNUP = env.VITE_B2C_POLICY_SIGNUP || env.NEXT_PUBLIC_B2C_POLICY_SIGNUP;

// Validate required configuration
if (!CLIENT_ID) {
  throw new Error('VITE_AZURE_CLIENT_ID is required in environment variables');
}
if (!TENANT_NAME) {
  throw new Error('VITE_B2C_TENANT_NAME is required in environment variables');
}
if (!POLICY_SIGNUP_SIGNIN) {
  throw new Error('VITE_B2C_POLICY_SIGNUP_SIGNIN is required in environment variables');
}

const API_SCOPES = (env.NEXT_PUBLIC_API_SCOPES || env.VITE_AZURE_SCOPES || "")
  .split(/[\s,]+/)
  .map((s) => s.trim())
  .filter(Boolean);

// Always request standard OIDC scopes; include email to avoid UPN-only claims and offline_access for refresh tokens
const DEFAULT_OIDC_SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
] as const;

// Select correct login host. Prefer explicit host; default to B2C (b2clogin.com).
// If you are using Entra External Identities (CIAM), set NEXT_PUBLIC_IDENTITY_HOST or VITE_IDENTITY_HOST
// to e.g. "yourtenant.ciamlogin.com".

// For external Entra ID (Azure AD), prefer tenant ID or domain
// const TENANT_ID = env.NEXT_PUBLIC_TENANT_ID || env.VITE_AZURE_TENANT_ID;
// const CUSTOM_DOMAIN = env.NEXT_PUBLIC_CIAM_CUSTOM_DOMAIN || env.VITE_AZURE_CUSTOM_DOMAIN;
const SUB = env.NEXT_PUBLIC_CIAM_SUBDOMAIN || env.VITE_AZURE_SUBDOMAIN;

const LOGIN_HOST =
  env.NEXT_PUBLIC_IDENTITY_HOST ||
  env.VITE_IDENTITY_HOST ||
  (SUB ? `${SUB}.ciamlogin.com` : `${TENANT_NAME}.b2clogin.com`);
const AUTHORITY_SIGNUP_SIGNIN = `https://${LOGIN_HOST}/${TENANT_NAME}.onmicrosoft.com/${POLICY_SIGNUP_SIGNIN}`;
const AUTHORITY_SIGNUP = POLICY_SIGNUP
  ? `https://${LOGIN_HOST}/${TENANT_NAME}.onmicrosoft.com/${POLICY_SIGNUP}`
  : AUTHORITY_SIGNUP_SIGNIN;

// Compute authority URL:
// Priority:
// 1. Custom domain + tenant ID (e.g. https://login.example.com/{tenantId})
// 2. Azure AD tenant (https://login.microsoftonline.com/{tenantId})
// 3. CIAM subdomain (https://{sub}.ciamlogin.com/)
// 4. Fallback to common
let computedAuthority: string;
// if (CUSTOM_DOMAIN && TENANT_ID) {
//   computedAuthority = `https://${CUSTOM_DOMAIN}/${TENANT_ID}`;
// } else if (TENANT_ID) {
//   computedAuthority = `https://login.microsoftonline.com/${TENANT_ID}`;
// } else if (SUB) {
computedAuthority = `https://${SUB}.ciamlogin.com/`;
// } else {
//   computedAuthority = env.VITE_AZURE_AUTHORITY || "https://login.microsoftonline.com/common";
// }

// Known authorities for MSAL (hostnames only)
// const knownAuthorities: string[] = (() => {
//   if (CUSTOM_DOMAIN) return [CUSTOM_DOMAIN];
//   if (TENANT_ID) {
//     try {
//       const url = new URL(computedAuthority);
//       return [url.host];
//     } catch {
//       return [];
//     }
//   }
//   if (SUB) return [`${SUB}.ciamlogin.com`];
//   try {
//     const url = new URL(computedAuthority);
//     return [url.host];
//   } catch {
//     return [];
//   }
// })();

export const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: AUTHORITY_SIGNUP_SIGNIN,
    knownAuthorities: [LOGIN_HOST],
    redirectUri: REDIRECT_URI,
    postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI,
    // Stay on the redirectUri after login instead of bouncing back
    // to the page where login was initiated.
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      loggerCallback: (level, message) => {
        if (level >= LogLevel.Error) console.error(message);
      },
    },
  },
};

// Debug: Log MSAL configuration
console.log('MSAL Configuration:', {
  clientId: CLIENT_ID,
  authority: AUTHORITY_SIGNUP_SIGNIN,
  redirectUri: REDIRECT_URI,
  loginHost: LOGIN_HOST,
  tenantName: TENANT_NAME,
  policy: POLICY_SIGNUP_SIGNIN,
  subdomain: SUB
});

export const msalInstance = new PublicClientApplication(msalConfig);

// Optionally include Graph User.Read for email resolution fallback (see AuthContext)
const ENABLE_GRAPH_USER_READ =
  (env.VITE_MSAL_ENABLE_GRAPH_FALLBACK ||
    env.NEXT_PUBLIC_MSAL_ENABLE_GRAPH_FALLBACK) === "true";
const GRAPH_SCOPES: string[] = ENABLE_GRAPH_USER_READ ? ["User.Read"] : [];

export const defaultLoginRequest = {
  scopes: Array.from(new Set([...DEFAULT_OIDC_SCOPES, ...GRAPH_SCOPES])),
  authority: AUTHORITY_SIGNUP_SIGNIN,
};

export const signupRequest = {
  scopes: Array.from(new Set([...DEFAULT_OIDC_SCOPES, ...GRAPH_SCOPES])),
  authority: AUTHORITY_SIGNUP,
};
