# Social Authentication Testing Guide

## Current Status

✅ **Code Implementation**: Complete
✅ **UI Components**: All social buttons present
✅ **Profile Creation**: Auto-creates on social login
✅ **Redirect Flow**: Configured to `/learning`

## What You Need to Test

### 1. Check Supabase Configuration

Go to your Supabase Dashboard:
1. **Authentication** → **Providers**
2. Verify which providers are enabled:
   - [ ] Google
   - [ ] Facebook
   - [ ] GitHub

### 2. Test Each Provider

#### Google Sign-In Test
1. Open your app in browser
2. Click "Sign In" button
3. Click "Continue with Google"
4. **Expected**: Redirects to Google login
5. **Expected**: After login, redirects to `/learning`
6. **Expected**: Profile auto-created in database

**If it fails:**
- Check browser console for errors
- Verify Google OAuth is enabled in Supabase
- Verify redirect URI matches: `https://ugmybskacomcdgdngolz.supabase.co/auth/v1/callback`

#### Facebook Sign-In Test
1. Click "Continue with Facebook"
2. **Expected**: Redirects to Facebook login
3. **Expected**: After login, redirects to `/learning`

**If it fails:**
- Check if Facebook provider is enabled in Supabase
- Verify Facebook App ID and Secret are configured

#### GitHub Sign-In Test
1. Click "Continue with GitHub"
2. **Expected**: Redirects to GitHub login
3. **Expected**: After login, redirects to `/learning`

**If it fails:**
- Check if GitHub provider is enabled in Supabase
- Verify GitHub OAuth App is configured

## Common Issues & Solutions

### Issue: "Invalid redirect URI"
**Cause**: Redirect URL not added to provider settings
**Solution**: 
- For Google: Add `https://ugmybskacomcdgdngolz.supabase.co/auth/v1/callback` to authorized redirect URIs
- For Facebook: Add same URL to Valid OAuth Redirect URIs
- For GitHub: Add same URL to Authorization callback URL

### Issue: Button clicks but nothing happens
**Cause**: Provider not enabled in Supabase
**Solution**: 
1. Go to Supabase Dashboard
2. Authentication → Providers
3. Enable the provider
4. Add Client ID and Secret
5. Save

### Issue: "Failed to sign in with [provider]"
**Cause**: Missing or incorrect credentials
**Solution**:
1. Check browser console for detailed error
2. Verify Client ID and Secret are correct
3. Verify provider app is not in development mode (for production)

### Issue: Redirects but profile not created
**Cause**: Database permissions or profile creation error
**Solution**:
1. Check browser console for errors
2. Verify `learner_profiles` table exists
3. Check Supabase logs for database errors
4. Verify RLS policies allow inserts

## Quick Test Commands

Open browser console and run:

```javascript
// Check if user is logged in
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)

// Check if profile exists
const { data: profile } = await supabase
  .from('learner_profiles')
  .select('*')
  .eq('id', session?.user?.id)
  .single()
console.log('Profile:', profile)
```

## Setup Checklist

Before testing, ensure:

- [ ] Supabase project is created
- [ ] `learner_profiles` table exists (run migration)
- [ ] At least one provider is enabled in Supabase
- [ ] Provider credentials (Client ID/Secret) are configured
- [ ] Redirect URLs are added to provider settings
- [ ] App is running (`npm run dev`)

## Expected User Flow

```
1. User clicks "Continue with Google"
   ↓
2. Popup/redirect to Google login page
   ↓
3. User enters Google credentials
   ↓
4. Google asks for permission to share info
   ↓
5. User clicks "Allow"
   ↓
6. Redirected back to your app at /learning
   ↓
7. Profile auto-created in database
   ↓
8. User sees learning page with their info
```

## Debugging Tips

### Enable Verbose Logging

The code already has console logs. Check browser console for:
- "getOrCreateProfile called for: [user-id]"
- "Profile not found, creating new profile..."
- "Profile created: [profile-data]"

### Check Network Tab

1. Open browser DevTools → Network tab
2. Click social login button
3. Look for:
   - Request to Supabase auth endpoint
   - Redirect to provider
   - Callback from provider
   - Profile creation request

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Click "Logs" in sidebar
3. Filter by "Auth" or "Database"
4. Look for errors during login/profile creation

## Test Results Template

Copy this and fill in your results:

```
Date: ___________
Tester: ___________

Google Sign-In:
- [ ] Button visible
- [ ] Redirects to Google
- [ ] Returns to app
- [ ] Profile created
- [ ] User info displayed
- Issues: ___________

Facebook Sign-In:
- [ ] Button visible
- [ ] Redirects to Facebook
- [ ] Returns to app
- [ ] Profile created
- [ ] User info displayed
- Issues: ___________

GitHub Sign-In:
- [ ] Button visible
- [ ] Redirects to GitHub
- [ ] Returns to app
- [ ] Profile created
- [ ] User info displayed
- Issues: ___________
```

## Next Steps

Once testing is complete:

1. **If all working**: Deploy to production
2. **If issues found**: Check the solutions above
3. **Need help**: Share console errors and Supabase logs

## Production Checklist

Before going live:

- [ ] Test all providers in production environment
- [ ] Update redirect URLs to production domain
- [ ] Verify provider apps are in production mode
- [ ] Test profile creation with real accounts
- [ ] Test sign-out functionality
- [ ] Test returning user login
- [ ] Monitor Supabase logs for errors

---

**Need Help?**
- Check browser console for errors
- Check Supabase logs
- Review `SOCIAL_AUTH_QUICKSTART.md` for setup
- Review `docs/SOCIAL_AUTH_SETUP.md` for detailed config
