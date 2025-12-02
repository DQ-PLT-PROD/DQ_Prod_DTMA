# Social Authentication Setup Guide

This guide explains how to enable social sign-in (Google, Facebook, GitHub) for your learning platform.

## Overview

Social authentication allows users to sign in with their existing accounts from:
- 🔵 **Google** - Most popular option
- 🔵 **Facebook** - Wide user base
- ⚫ **GitHub** - Great for developer audiences

## Benefits

- **Faster sign-up** - No need to create new passwords
- **Better UX** - One-click authentication
- **Higher conversion** - Reduces friction
- **Auto profile creation** - Gets user info from provider

## Setup Instructions

### 1. Google OAuth Setup

#### A. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Select **Web application**
6. Configure:
   - **Name**: Your App Name
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `https://faqystypjlxqvgkhnbyq.supabase.co/auth/v1/callback`
     - (Replace with your Supabase project URL)
7. Click **Create**
8. Copy **Client ID** and **Client Secret**

#### B. Configure in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication → Providers**
4. Find **Google** and click to expand
5. Toggle **Enable Sign in with Google**
6. Paste your **Client ID** and **Client Secret**
7. Click **Save**

### 2. Facebook OAuth Setup

#### A. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps → Create App**
3. Select **Consumer** as app type
4. Fill in app details and create
5. In dashboard, go to **Settings → Basic**
6. Copy **App ID** and **App Secret**
7. Add **App Domains**: `yourdomain.com`
8. Go to **Facebook Login → Settings**
9. Add **Valid OAuth Redirect URIs**:
   - `https://faqystypjlxqvgkhnbyq.supabase.co/auth/v1/callback`
10. Save changes

#### B. Configure in Supabase

1. Go to Supabase Dashboard → **Authentication → Providers**
2. Find **Facebook** and expand
3. Toggle **Enable Sign in with Facebook**
4. Paste **App ID** as Client ID
5. Paste **App Secret** as Client Secret
6. Click **Save**

### 3. GitHub OAuth Setup

#### A. Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps → New OAuth App**
3. Fill in:
   - **Application name**: Your App Name
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: 
     - `https://faqystypjlxqvgkhnbyq.supabase.co/auth/v1/callback`
4. Click **Register application**
5. Copy **Client ID**
6. Click **Generate a new client secret**
7. Copy **Client Secret**

#### B. Configure in Supabase

1. Go to Supabase Dashboard → **Authentication → Providers**
2. Find **GitHub** and expand
3. Toggle **Enable Sign in with GitHub**
4. Paste **Client ID** and **Client Secret**
5. Click **Save**

## Testing

### Test Each Provider

1. Start your dev server: `npm run dev`
2. Click "Sign In" button
3. Try each social login button:
   - Click "Continue with Google"
   - Click "Continue with Facebook"
   - Click "Continue with GitHub"
4. Complete OAuth flow
5. Verify you're redirected back and signed in
6. Check navbar shows your profile
7. Verify profile created in Supabase

### Verify Profile Creation

1. Go to Supabase Dashboard
2. Open **Table Editor → learner_profiles**
3. Should see new row with:
   - Email from social provider
   - Full name from social provider
   - Default values (stage 0, score 0)

## How It Works

### User Flow

```
1. User clicks "Continue with Google"
   ↓
2. Redirected to Google login
   ↓
3. User authorizes app
   ↓
4. Google redirects back with token
   ↓
5. Supabase creates/updates auth.users
   ↓
6. App checks for learner_profile
   ↓
7. If not exists, creates profile automatically
   ↓
8. User lands on /learning page
   ↓
9. Profile shows in navbar
```

### Profile Auto-Creation

The system automatically creates a learner profile when:
- User signs in with social provider for first time
- Uses email and name from provider
- Sets default values (stage 0, score 0, no badges)

Code in `LearningAuthContext.tsx`:
```tsx
// Automatically creates profile if it doesn't exist
await loadProfile(
  session.user.id, 
  session.user.email, 
  session.user.user_metadata?.full_name || session.user.user_metadata?.name
)
```

## Configuration

### Redirect URL

After social login, users are redirected to `/learning`:

```tsx
// In src/lib/supabase/auth.ts
async signInWithProvider(provider: Provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/learning`,
    }
  })
}
```

To change redirect:
```tsx
redirectTo: `${window.location.origin}/your-page`,
```

### Available Providers

Supabase supports many providers. To add more:

```tsx
// Add to AuthModal.tsx
<button onClick={() => handleSocialLogin('twitter')}>
  Continue with Twitter
</button>

<button onClick={() => handleSocialLogin('linkedin')}>
  Continue with LinkedIn
</button>

<button onClick={() => handleSocialLogin('azure')}>
  Continue with Microsoft
</button>
```

Then enable in Supabase Dashboard.

## Troubleshooting

### "Invalid OAuth callback URL"

**Problem**: Redirect URI mismatch

**Solution**:
1. Check Supabase project URL is correct
2. Verify callback URL in provider settings matches:
   `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
3. Make sure no trailing slashes

### "App not verified" (Google)

**Problem**: Google shows warning for unverified apps

**Solution**:
- For development: Click "Advanced → Go to App (unsafe)"
- For production: Submit app for verification in Google Console

### "This app is in development mode" (Facebook)

**Problem**: Facebook app not live

**Solution**:
1. Go to Facebook App Dashboard
2. Switch app to "Live" mode
3. Complete app review if needed

### Social login works but profile not created

**Problem**: Profile creation failed

**Solution**:
1. Check browser console for errors
2. Verify `learner_profiles` table exists
3. Check RLS policies allow INSERT
4. Verify `getOrCreateProfile` function works

### User signed in but redirected to wrong page

**Problem**: Redirect URL incorrect

**Solution**:
- Check `redirectTo` in `signInWithProvider` function
- Verify URL is absolute (includes domain)

## Security Best Practices

### Production Checklist

- [ ] Use HTTPS for all URLs
- [ ] Keep client secrets secure (never commit to git)
- [ ] Use environment variables for sensitive data
- [ ] Enable only providers you need
- [ ] Review OAuth scopes requested
- [ ] Set up proper redirect URL validation
- [ ] Monitor auth logs in Supabase

### Environment Variables

For production, use environment variables:

```env
# .env
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_FACEBOOK_APP_ID=your_app_id
VITE_GITHUB_CLIENT_ID=your_client_id
```

Configure in Supabase Dashboard, not in code.

## User Experience

### What Users See

1. **Auth Modal Opens**
   - Three social login buttons at top
   - "Or continue with email" divider
   - Email/password form below

2. **Click Social Button**
   - Opens provider's login page in popup/redirect
   - User logs in with existing account
   - Authorizes app access

3. **Return to App**
   - Automatically signed in
   - Profile created if first time
   - Redirected to learning page

### Benefits for Users

- ✅ No password to remember
- ✅ Faster sign-up (one click)
- ✅ Trusted authentication
- ✅ Auto-fill profile info
- ✅ Same account across devices

## Advanced Configuration

### Custom Scopes

Request additional data from providers:

```tsx
async signInWithProvider(provider: Provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/learning`,
      scopes: 'email profile', // Add custom scopes
    }
  })
}
```

### Skip Confirmation

For faster UX, skip email confirmation:

1. Supabase Dashboard → **Authentication → Settings**
2. Disable **Enable email confirmations**
3. Save changes

⚠️ Only for trusted providers and development.

### Custom Redirect Logic

Handle different redirects based on user state:

```tsx
// In LearningAuthContext.tsx
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      const profile = await loadProfile(session.user.id)
      
      // Redirect based on profile state
      if (profile.current_stage === 0) {
        navigate('/onboarding')
      } else {
        navigate('/learning')
      }
    }
  }
)
```

## Testing Checklist

- [ ] Google login works
- [ ] Facebook login works
- [ ] GitHub login works
- [ ] Profile auto-created on first login
- [ ] User info populated correctly
- [ ] Redirect to correct page
- [ ] Navbar shows profile
- [ ] Sign out works
- [ ] Can sign in again
- [ ] Progress persists across sessions

## Next Steps

1. ✅ Enable providers in Supabase
2. ✅ Test each provider
3. ✅ Verify profile creation
4. 🎨 Customize button styles
5. 📱 Test on mobile
6. 🚀 Deploy to production
7. 📊 Monitor usage analytics

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Docs](https://developers.facebook.com/docs/facebook-login)
- [GitHub OAuth Docs](https://docs.github.com/en/developers/apps/building-oauth-apps)

---

**Need Help?**
- Check Supabase auth logs
- Review provider console for errors
- Verify callback URLs match exactly
- Test in incognito mode
