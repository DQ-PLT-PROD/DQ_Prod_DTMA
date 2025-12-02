# 🚀 Authentication Setup - Quick Guide

## ✅ Your Supabase Project

**Project URL**: `https://ugmybskacomcdgdngolz.supabase.co`
**Anon Key**: Already configured in code ✓

---

## Step 1: Create Database Table (5 minutes)

1. Go to: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the SQL from: `migrations/create_learner_profiles.sql`
6. Paste it in the editor
7. Click **Run** (bottom right)
8. You should see: "Success. No rows returned"

---

## Step 2: Enable Email Authentication (2 minutes)

1. In Supabase Dashboard, go to **Authentication → Providers**
2. Find **Email** in the list
3. Toggle it **ON**
4. **Disable "Confirm email"** (for easier testing)
5. Click **Save**

---

## Step 3: Test It! (2 minutes)

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open: `http://localhost:5173`

3. Click **"Sign In"** button in navbar

4. Click **"Don't have an account? Sign up"**

5. Fill in:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `test123456`

6. Click **"Create Account"**

7. ✅ You should see:
   - Modal closes
   - Navbar shows your profile
   - "Test User" displayed
   - "Stage 0 • 0 pts"

---

## Step 4: Verify in Supabase (1 minute)

1. Go to **Authentication → Users**
   - You should see your test user

2. Go to **Table Editor → learner_profiles**
   - You should see a row with your data

---

## 🎉 Done! Your Auth is Working!

### What's Working Now:

✅ Email/Password Sign Up
✅ Email/Password Sign In  
✅ Profile Auto-Creation
✅ Progress Tracking (stages, scores, badges)
✅ Session Persistence
✅ Sign Out

---

## 🔐 Optional: Enable Social Login

### For Google Sign In:

1. **Get OAuth Credentials**:
   - Go to: https://console.cloud.google.com/
   - Create OAuth Client ID
   - Add redirect URI: `https://ugmybskacomcdgdngolz.supabase.co/auth/v1/callback`
   - Copy Client ID & Secret

2. **Configure in Supabase**:
   - Go to: Authentication → Providers → Google
   - Toggle ON
   - Paste Client ID & Secret
   - Save

### For Facebook Sign In:

1. **Get App Credentials**:
   - Go to: https://developers.facebook.com/
   - Create app
   - Add redirect URI: `https://ugmybskacomcdgdngolz.supabase.co/auth/v1/callback`
   - Copy App ID & Secret

2. **Configure in Supabase**:
   - Go to: Authentication → Providers → Facebook
   - Toggle ON
   - Paste App ID & Secret
   - Save

### For GitHub Sign In:

1. **Get OAuth App**:
   - Go to: https://github.com/settings/developers
   - Create OAuth App
   - Add callback: `https://ugmybskacomcdgdngolz.supabase.co/auth/v1/callback`
   - Copy Client ID & Secret

2. **Configure in Supabase**:
   - Go to: Authentication → Providers → GitHub
   - Toggle ON
   - Paste Client ID & Secret
   - Save

---

## 🐛 Troubleshooting

### "Invalid login credentials"
- Make sure you signed up first
- Password must be at least 6 characters

### "Profile not loading"
- Run the SQL migration
- Check if `learner_profiles` table exists in Table Editor

### "Email not confirmed"
- Go to Authentication → Providers → Email
- Disable "Confirm email"
- Save

### Social login not working
- Make sure provider is enabled in Supabase
- Check callback URL matches exactly
- Verify credentials are correct

---

## 📚 Documentation

- **Main Guide**: `README_AUTH.md`
- **Social Auth**: `SOCIAL_AUTH_QUICKSTART.md`
- **Setup Checklist**: `SETUP_CHECKLIST.md`

---

## 🎯 Next Steps

1. ✅ Run the SQL migration
2. ✅ Enable email auth
3. ✅ Test sign up/sign in
4. 🎨 Customize the learning page
5. 🚀 Deploy to production

---

**Need help?** Check the browser console for errors or Supabase logs in the dashboard.
