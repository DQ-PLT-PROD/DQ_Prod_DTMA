# Authentication Setup Guide

## Overview
This project uses **Azure MSAL (Microsoft Authentication Library)** for authentication via Azure AD B2C or Azure External ID (CIAM).

## Required Configuration

### 1. Create `.env` File
Copy the example file and fill in your Azure credentials:

```bash
cp .env.example .env
```

### 2. Required Environment Variables

You **must** set these three variables in your `.env` file:

```env
VITE_AZURE_CLIENT_ID=your-client-id-here
VITE_B2C_TENANT_NAME=your-tenant-name
VITE_B2C_POLICY_SIGNUP_SIGNIN=your-policy-name
```

### 3. Get Your Azure Credentials

#### Azure AD B2C Setup:
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure AD B2C**
3. Create or select your B2C tenant
4. Register an application:
   - Go to **App registrations** → **New registration**
   - Name: Your app name
   - Redirect URI: `http://localhost:3000` (for development)
   - Click **Register**
5. Copy the **Application (client) ID** → This is your `VITE_AZURE_CLIENT_ID`
6. Note your **Tenant name** (e.g., "yourcompany" from yourcompany.b2clogin.com) → This is your `VITE_B2C_TENANT_NAME`
7. Create a User Flow:
   - Go to **User flows** → **New user flow**
   - Select **Sign up and sign in**
   - Name it (e.g., "B2C_1_signupsignin") → This is your `VITE_B2C_POLICY_SIGNUP_SIGNIN`

#### Azure External ID (CIAM) Setup:
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Microsoft Entra External ID**
3. Register an application
4. Copy the **Application (client) ID**
5. Set additional variables:
   ```env
   VITE_AZURE_SUBDOMAIN=your-subdomain
   VITE_IDENTITY_HOST=yourtenant.ciamlogin.com
   ```

### 4. Example `.env` File

```env
# Azure B2C Configuration
VITE_AZURE_CLIENT_ID=f996140d-d79b-419d-a64c-f211d23a38ad
VITE_B2C_TENANT_NAME=dqproj
VITE_B2C_POLICY_SIGNUP_SIGNIN=B2C_1_signupsignin

# Optional: Custom redirect (defaults to current origin)
VITE_AZURE_REDIRECT_URI=http://localhost:3000

# Supabase (for CMS only)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Running the Application

### Development
```bash
npm run dev
```

The app will fail to start if required environment variables are missing.

### Production
Make sure to set the environment variables in your deployment platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Azure: Configuration → Application Settings

## Testing Authentication

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000
3. Click the **"Sign In"** button in the header
4. You'll be redirected to Azure B2C/CIAM login page
5. After successful login, you'll be redirected back to the app
6. Your profile will appear in the header dropdown

## Troubleshooting

### Error: "VITE_AZURE_CLIENT_ID is required"
- Create a `.env` file in the project root
- Add the required environment variables
- Restart the dev server

### Error: "endpoints_resolution_error"
- Check that your tenant name is correct
- Verify the policy name matches your Azure B2C user flow
- Ensure the policy name includes the prefix (e.g., "B2C_1_signupsignin")

### Sign-in button does nothing
- Open browser console (F12)
- Check for error messages
- Verify all required environment variables are set
- Restart the dev server after changing `.env`

### 404 on Azure endpoint
- Your policy name might be incorrect
- Check Azure Portal → B2C → User flows for the exact name
- Policy names are case-sensitive

## Security Notes

- ✅ `.env` is in `.gitignore` - never commit credentials
- ✅ Use different credentials for development and production
- ✅ Rotate client secrets regularly (if using client secrets)
- ✅ Set appropriate redirect URIs in Azure for each environment

## Architecture

- **MSAL Provider**: Wraps the entire app in `src/index.tsx`
- **Auth Context**: Provides auth state via `src/components/Header/context/AuthContext.tsx`
- **Protected Routes**: Use `<ProtectedRoute>` component for authenticated pages
- **Configuration**: `src/services/auth/msal.ts`

## Support

For Azure B2C documentation: https://learn.microsoft.com/en-us/azure/active-directory-b2c/
For MSAL.js documentation: https://github.com/AzureAD/microsoft-authentication-library-for-js
