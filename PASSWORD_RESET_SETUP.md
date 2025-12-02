# Password Reset Setup Guide

## What I've Done

✅ Password reset page already exists at `/reset-password`
✅ Route is configured in the router
✅ Auth service has `resetPassword()` method
✅ Improved error handling and user feedback in the forgot password flow
✅ Added success message display

## Current Status

The password reset functionality is **fully implemented** in the code. 

**Current Error**: "Error sending recovery email" (500 status)
**Cause**: Email service is not configured in your Supabase project.

## To Complete Setup

### 1. Add Redirect URL to Supabase

**IMPORTANT**: Go to your Supabase Dashboard:
1. Navigate to **Authentication** → **URL Configuration**
2. Find **Redirect URLs** section
3. Add your app URLs:
   - `http://localhost:5173/reset-password` (for local development)
   - `https://yourdomain.com/reset-password` (for production)
4. Click **Save**

### 2. Verify Email Template

Your email template is already correct:
```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

The `{{ .ConfirmationURL }}` automatically includes the token and redirects to your configured URL.

### 3. Configure Email Provider (REQUIRED - This is your issue!)

**This is why you're getting the 500 error!**

In Supabase Dashboard:
1. Go to **Project Settings** → **Authentication** → **SMTP Settings**
2. You have two options:

**Option A: Enable Supabase's Built-in Email (Quick Fix)**
- Supabase provides a default email service
- Limited to 3-4 emails per hour on free tier
- Should work immediately once enabled
- Check if "Enable Custom SMTP" is OFF to use default

**Option B: Configure Custom SMTP (Production Ready)**
- Use your own email provider (Gmail, SendGrid, AWS SES, etc.)
- No rate limits
- More reliable for production
- Example for Gmail:
  - SMTP Host: `smtp.gmail.com`
  - SMTP Port: `587`
  - SMTP User: `your-email@gmail.com`
  - SMTP Password: Use an App Password (not your regular password)
  - Sender Email: `your-email@gmail.com`
  - Sender Name: `Your App Name`

3. Click **Save** and test again

### 4. Test the Flow

1. Click "Sign In" on your app
2. Enter a registered email address
3. Click "Forgot password?"
4. Check your email inbox (and spam folder)
5. Click the reset link in the email
6. You'll be redirected to `/reset-password`
7. Enter your new password
8. Submit and you'll be redirected to home

## Common Issues

### "Error sending recovery email" (500 error) - YOUR CURRENT ISSUE
- **Cause**: SMTP/Email service not configured in Supabase
- **Solution**: Follow step 3 above to configure email provider
- **Quick Fix**: Make sure "Enable Custom SMTP" is OFF to use Supabase's default email

### "Unable to send reset email"
- **Cause**: Email not configured in Supabase or rate limit exceeded
- **Solution**: Configure SMTP settings or wait if rate limited

### "Invalid email"
- **Cause**: Email format is incorrect
- **Solution**: Ensure valid email format

### "Too many requests"
- **Cause**: Rate limit exceeded (3 emails/hour on free tier)
- **Solution**: Wait or upgrade to paid plan with custom SMTP

### Email not received
- **Cause**: Email in spam or SMTP not configured
- **Solution**: Check spam folder, configure custom SMTP provider

## What Happens Now

When a user clicks "Forgot password?":
1. They must enter their email first
2. System sends password reset email via Supabase
3. User receives email with reset link
4. Link redirects to `/reset-password` page
5. User enters new password
6. Password is updated in Supabase
7. User is redirected to home page

## Email Template Example

Your Supabase email template should look like:

```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .SiteURL }}/reset-password?token={{ .Token }}">Reset Password</a></p>
```

The `{{ .SiteURL }}` will be replaced with your app's URL automatically.
