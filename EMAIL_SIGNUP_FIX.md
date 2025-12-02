# Email Signup Issue - Fix Guide

## Problem

Accounts created with email/password are not working immediately because **email confirmation is enabled** in Supabase.

## What's Happening

When a user signs up:
1. Account is created in Supabase
2. Supabase sends a confirmation email
3. User must click the link in the email to activate their account
4. Until confirmed, they cannot sign in

## Solution: Disable Email Confirmation (Recommended for Development)

### Step 1: Go to Supabase Dashboard

1. Open https://app.supabase.com/
2. Select your project
3. Go to **Authentication** → **Providers**
4. Click on **Email** provider

### Step 2: Disable Email Confirmation

1. Find the setting **"Confirm email"**
2. Toggle it to **OFF** (disabled)
3. Click **Save**

### Step 3: Test

1. Try signing up with a new email
2. You should be logged in immediately
3. No email confirmation required

## Alternative: Keep Email Confirmation Enabled

If you want to keep email confirmation for security:

### Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Find **"Confirm signup"** template
3. Verify the template is configured
4. Test by signing up and checking your email

### Update Your App Flow

The code has been updated to show a message when email confirmation is required:

```
"Account created! Please check your email to confirm your account before signing in."
```

Users will see this message and know to check their email.

## Current Code Updates

✅ **AuthModal.tsx**: Now detects if email confirmation is required
✅ **LearningAuthContext.tsx**: Returns signup result to check session
✅ Shows success message when confirmation email is sent

## Testing Checklist

After disabling email confirmation:

- [ ] Sign up with new email
- [ ] Should be logged in immediately
- [ ] Should redirect to `/learning`
- [ ] Profile should be created in database
- [ ] User info should appear in navbar

## Production Recommendation

**For Development:**
- Disable email confirmation for faster testing

**For Production:**
- Enable email confirmation for security
- Configure email templates properly
- Test the full confirmation flow
- Ensure SMTP is configured (not just Supabase default)

## Common Issues

### "User already registered"
- Email is already in the system
- Try a different email or sign in instead

### "Invalid email or password"
- Email not confirmed yet (if confirmation is enabled)
- Check spam folder for confirmation email
- Or disable email confirmation

### Profile not created
- Check browser console for errors
- Verify `learner_profiles` table exists
- Check Supabase logs for database errors

## Quick Test

1. **Disable email confirmation** in Supabase
2. Sign up with: `test@example.com` / `password123`
3. Should work immediately
4. Check Supabase Dashboard → Authentication → Users to see the new user

## Email Configuration Status

If you see errors about sending emails:

1. **Go to**: Project Settings → Authentication → SMTP Settings
2. **Either**:
   - Turn OFF "Enable Custom SMTP" (use Supabase default)
   - OR configure your own SMTP provider

## Next Steps

1. Disable email confirmation in Supabase
2. Test signup flow
3. Verify user can access `/learning` page
4. Check profile is created in database

---

**Quick Link**: [Supabase Dashboard](https://app.supabase.com/)
