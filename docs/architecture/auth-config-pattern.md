# Auth Config Pattern (MSAL + Entra External Identities/B2C)

This project implements a flexible, environment-driven authentication pattern using MSAL for browser apps. It supports Entra External Identities (CIAM), Azure AD B2C with SUSI or dedicated sign-up flows, and can be adapted to Azure AD tenants.

## Context

| Item | Detail |
| --- | --- |
| Tag | Horizontal Pattern — Identity & Access |
| Contributors | Project Team |
| Version Control | V1.0 |
| Application Use Case | Configure MSAL-based authentication for SPAs (React), supporting Entra External Identities (CIAM) and Azure AD B2C with a unified, environment-driven setup, redirect handling, and onboarding gating. |
| Reference Usage | MSAL auth in React SPA with onboarding |

## Story Behind The Pattern

| Item | Detail |
| --- | --- |
| The Problem | Modern SPAs must integrate with Microsoft identity across CIAM/B2C/AAD while avoiding redirect loops, misconfigured authorities, and inconsistent env handling. Teams also need a reliable way to identify new users and route them to onboarding, and to resolve a real email claim versus UPN. |
| The Solution | Centralize MSAL config and env mapping, initialize and handle the redirect before rendering, set an active account, expose a small AuthContext with login/signup/logout, tag sign-up flows for onboarding redirection, and optionally use Microsoft Graph to resolve a real email. |

### Dependencies

- `@azure/msal-browser`, `@azure/msal-react`
- Microsoft Entra External Identities or Azure AD B2C tenant (policies/user flows)
- Optional: Microsoft Graph API (`User.Read`)
- React 18, Vite
- Env variables (`.env`) for client ID, redirect URIs, identity host, policies, and scopes

## Environment Variables

The config supports both `NEXT_PUBLIC_*` and `VITE_*` names for convenience. Prefer `VITE_*` in Vite.

Required (set either `NEXT_PUBLIC_*` or `VITE_*`):
- Client ID: `NEXT_PUBLIC_AAD_CLIENT_ID` or `VITE_AZURE_CLIENT_ID`
- Redirect URI: `NEXT_PUBLIC_REDIRECT_URI` or `VITE_AZURE_REDIRECT_URI`
- Post-logout redirect: `NEXT_PUBLIC_POST_LOGOUT_REDIRECT_URI` or `VITE_AZURE_POST_LOGOUT_REDIRECT_URI`
- Scopes (API/extra): `NEXT_PUBLIC_API_SCOPES` or `VITE_AZURE_SCOPES` (OIDC defaults are always added)

Identity host (pick one):
- CIAM subdomain: `NEXT_PUBLIC_CIAM_SUBDOMAIN` or `VITE_AZURE_SUBDOMAIN` — uses `https://<sub>.ciamlogin.com`
- Explicit host override: `NEXT_PUBLIC_IDENTITY_HOST` or `VITE_IDENTITY_HOST` (e.g. `login.example.com`, `<sub>.ciamlogin.com`)
- B2C tenant name: `NEXT_PUBLIC_B2C_TENANT_NAME` or `VITE_B2C_TENANT_NAME` — fallback to `https://<tenant>.b2clogin.com`

Policies (B2C/CIAM):
- Combined SUSI: `NEXT_PUBLIC_B2C_POLICY_SIGNUP_SIGNIN` or `VITE_B2C_POLICY_SIGNUP_SIGNIN`
- Optional dedicated Sign-Up policy: `NEXT_PUBLIC_B2C_POLICY_SIGNUP` or `VITE_B2C_POLICY_SIGNUP`

Optional features:
- Graph fallback to resolve real email: `VITE_MSAL_ENABLE_GRAPH_FALLBACK=true` (adds `User.Read` during login)

Example (.env; use your real values):

```
# CIAM (preferred)
VITE_AZURE_SUBDOMAIN=your-subdomain
VITE_IDENTITY_HOST=your-subdomain.ciamlogin.com
VITE_AZURE_CLIENT_ID=00000000-0000-0000-0000-000000000000
VITE_AZURE_REDIRECT_URI=http://localhost:3000/dashboard
VITE_AZURE_POST_LOGOUT_REDIRECT_URI=http://localhost:3000/
VITE_AZURE_SCOPES="openid profile offline_access"

# B2C (SUSI or separate sign-up)
VITE_B2C_TENANT_NAME=yourtenant
VITE_B2C_POLICY_SIGNUP_SIGNIN=B2C_1_SUSI
# VITE_B2C_POLICY_SIGNUP=B2C_1_SignUp

# Optional: improve email accuracy with Graph
VITE_MSAL_ENABLE_GRAPH_FALLBACK=false
```

## How It Works

1) MSAL Configuration (authority, knownAuthorities, scopes)
- File: `src/services/auth/msal.ts:1`
- Creates the `PublicClientApplication` from CIAM/B2C inputs and sets `knownAuthorities` to the login host.
- Always includes OIDC defaults: `openid profile email offline_access`.
- Adds API scopes from env and optionally `User.Read` if Graph fallback is enabled.
- Exports requests used at login time: `defaultLoginRequest`, `signupRequest`.

2) App Initialization and Redirect Handling
- File: `src/index.tsx:1`
- Calls `msalInstance.initialize()` then `handleRedirectPromise()` before rendering.
- Sets the active account from the redirect result or the sole cached account.
- Routes to onboarding if the redirect state contains `ej-signup` or if an ID token claim indicates `newUser`.

3) Auth Context Provider
- File: `src/components/Header/context/AuthContext.tsx:1`
- Ensures active account is set on login/token events.
- Exposes `login()` and `signup()` via `loginRedirect` using exported requests from `msal.ts`.
- Adds `state: 'ej-signup'` for explicit Sign Up to enable onboarding redirect logic.
- Exposes `logout()` via `logoutRedirect`.
- Computes a user profile from ID token claims; optionally resolves a better email via Graph if enabled.

4) Provider Wiring
- Files: `src/index.tsx:1`, `src/AppRouter.tsx:1`
- Wraps the app with `<MsalProvider instance={msalInstance}>` and within it `<AuthProvider>` to make auth state and actions available throughout the tree.

5) Onboarding Routing (Example)
- File: `src/pages/dashboard/DashboardRouter.tsx:1`
- Demonstrates gating dashboard sections until onboarding completes. Combined with step (2), sign-ups land on onboarding right after auth.

## Switching Identity Modes

- CIAM (External Identities): set `VITE_AZURE_SUBDOMAIN` or `VITE_IDENTITY_HOST` to use `<sub>.ciamlogin.com`.
- B2C: set `VITE_B2C_TENANT_NAME` and either a combined `VITE_B2C_POLICY_SIGNUP_SIGNIN` or a dedicated `VITE_B2C_POLICY_SIGNUP`.
- Azure AD tenant: adapt `authority`/`knownAuthorities` to `login.microsoftonline.com/<tenantId>`; the file contains commented guidance to enable this path if needed.

## Rationale and Notes

- `navigateToLoginRequestUrl: false` keeps the app on the declared redirect URI, simplifying post-login routing.
- `BrowserCacheLocation.LocalStorage` is used for predictable session caching in SPAs.
- `knownAuthorities` must include your exact login host to avoid authority validation errors.
- When enabling Graph fallback, consent prompts may include `User.Read`; disable in production if not needed.

## Reuse Checklist

1) Copy `src/services/auth/msal.ts` and update env values.
2) Wrap your root in `MsalProvider` and render only after `handleRedirectPromise()`.
3) Add an `AuthContext` (or reuse this one) exposing `login/signup/logout`.
4) Decide onboarding/new user routing and tag sign-up with a unique `state`.
5) Configure CIAM/B2C/AAD mode purely via env and verify `knownAuthorities`.

