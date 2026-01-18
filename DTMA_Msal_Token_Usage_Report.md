# DTMA MSAL Token Usage Report

## 1) Executive Verdict

**Token sent to backend:** **None** (no MSAL token attached to app backend calls).

**How it is acquired (MSAL):**
- Interactive login via `loginRedirect` with OIDC scopes (`openid`, `profile`, `email`). `src/services/auth/msal.ts`, `src/features/auth/context/AuthContext.tsx`
- Redirect handling via `handleRedirectPromise()` and active account selection. `src/index.tsx`
- Access token acquisition for Microsoft Graph only via `acquireTokenSilent` with `User.Read`. `src/features/auth/context/AuthContext.tsx`

**Where it is attached:**
- **Not attached** to Apollo or custom backend calls (no `Authorization` header). `src/index.tsx`
- **Attached to Microsoft Graph only** (`Authorization: Bearer <accessToken>`). `src/features/auth/services/graphService.ts`

## 2) MSAL Configuration

**clientId:** `VITE_AZURE_CLIENT_ID` (required). `src/services/auth/msal.ts`

**authority/tenant:**
- CIAM: `https://{VITE_AZURE_SUBDOMAIN}.ciamlogin.com/{VITE_AZURE_TENANT_ID}/v2.0`
- Fallback: `https://login.microsoftonline.com/{VITE_AZURE_TENANT_ID}/v2.0`
`src/services/auth/msal.ts`

**redirectUri:**
- Localhost uses current origin; otherwise `VITE_AZURE_REDIRECT_URI` or current origin. `src/services/auth/msal.ts`

**Scopes requested (exact values):**
- Login scopes: `['openid', 'profile', 'email']`. `src/services/auth/msal.ts`
- Graph token scopes: `['User.Read']`. `src/features/auth/context/AuthContext.tsx`

**Account selection:**
- On redirect success, sets active account from the redirect response. `src/index.tsx`
- If no redirect response, uses first account from `getAllAccounts()`. `src/index.tsx`
- AuthContext ensures an active account and syncs user data from `accounts[0]`. `src/features/auth/context/AuthContext.tsx`

**Token storage / refresh:**
- MSAL cache is configured in **localStorage** (`cacheLocation: 'localStorage'`). `src/services/auth/msal.ts`
- Tokens refreshed via `acquireTokenSilent` for Graph calls. `src/features/auth/context/AuthContext.tsx`

## 3) API Call Paths

**Custom backend / external APIs**
- Apollo client to `https://90va0q4bccgp.share.zrok.io/services-api` with **no Authorization header** (only `skip_zrok_interstitial`). `src/index.tsx`
- Contact/partner forms use **static** `Authorization: Bearer enquiry1234` (not MSAL). `src/features/landing/CallToAction.tsx`

**Microsoft Graph**
- Graph `/me` call uses `Authorization: Bearer ${accessToken}` (access token from `acquireTokenSilent('User.Read')`). `src/features/auth/services/graphService.ts`, `src/features/auth/context/AuthContext.tsx`

**Supabase (REST/PostgREST)**
- Supabase client uses anon key from `VITE_SUPABASE_ANON_KEY` (not MSAL). `src/lib/supabase/client.ts`
- Service client uses **service role key** if configured. `src/lib/supabase/serviceClient.ts`
- Supabase calls across services (no MSAL token attached):
  - `src/features/auth/services/userService.ts`
  - `src/features/portal/services/progressService.ts`
  - `src/features/courses/services/enrollmentService.ts`
  - `src/features/learning/services/learningSnapshotService.ts`

## 4) Token Proof

**Code that logs/decodes claims:**
- Claims are logged and validated (including `oid`, `sub`, `aud`, `iss`). `src/utils/claimsValidator.ts`
- Redirect response logs include `idTokenClaims`. `src/index.tsx`

**Safe debug snippet (if needed):**
```ts
// log minimal claim metadata without printing raw tokens
const account = msalInstance.getActiveAccount();
console.log({
  oid: account?.idTokenClaims?.oid,
  sub: account?.idTokenClaims?.sub,
  aud: account?.idTokenClaims?.aud,
  iss: account?.idTokenClaims?.iss,
});
```

## 5) Recommendation for Express Auth

**Current backend status:** auth middleware is a stub (rejects all requests). `DTMA-API/src/middleware/auth.ts`

**Recommendation (based on findings):**
- **Use access tokens** (recommended for APIs), not ID tokens.
- Frontend should request an **API scope** (e.g., `api://<api-app-id>/.default` or a specific scope) and attach it to requests.
- Express should validate **access tokens** against:
  - **Issuer**: matches Entra tenant authority from MSAL config. `src/services/auth/msal.ts`
  - **Audience**: API App ID / `api://<api-app-id>` (not the SPA client ID).
  - **User identifier**: prefer `oid` (fallback `sub`), consistent with `extractUserProfile`. `src/utils/claimsValidator.ts`

If the API must accept the current behavior, it should treat requests as **unauthenticated** until the frontend attaches access tokens (no MSAL tokens are sent today).
