# Setup Checklist ✓

Use this checklist to set up and test your authentication system.

## 📋 Pre-Setup

- [x] Supabase client installed (`@supabase/supabase-js`)
- [x] Auth components created
- [x] Context provider implemented
- [x] Routes configured
- [x] UI integrated in navbar

## 🗄️ Database Setup

### Step 1: Run Migration
- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Create new query
- [ ] Copy contents from `migrations/create_learner_profiles.sql`
- [ ] Click "Run"
- [ ] Verify success message

### Step 2: Verify Table
- [ ] Go to Table Editor in Supabase
- [ ] Find `learner_profiles` table
- [ ] Verify columns exist:
  - [ ] id (uuid)
  - [ ] email (text)
  - [ ] full_name (text)
  - [ ] current_stage (int4)
  - [ ] completed_stages (int4[])
  - [ ] total_score (int4)
  - [ ] badges (text[])
  - [ ] created_at (timestamptz)
  - [ ] updated_at (timestamptz)

### Step 3: Check RLS Policies
- [ ] Go to Authentication → Policies
- [ ] Verify 3 policies exist for `learner_profiles`:
  - [ ] "Users can view own profile" (SELECT)
  - [ ] "Users can update own profile" (UPDATE)
  - [ ] "Users can insert own profile" (INSERT)

## 🔐 Authentication Setup

### Step 1: Enable Email Provider
- [ ] Go to Authentication → Providers
- [ ] Find "Email" provider
- [ ] Toggle to enable
- [ ] Click "Save"

### Step 2: Configure Email Settings (Optional)
- [ ] Go to Authentication → Email Templates
- [ ] Customize confirmation email (optional)
- [ ] Customize password reset email (optional)

### Step 3: Verify Environment Variables
- [ ] Check `src/lib/supabase/auth.ts`
- [ ] Verify Supabase URL is correct
- [ ] Verify Anon Key is correct
- [ ] Or create `.env` file with your own values:
  ```
  VITE_SUPABASE_URL=your_url
  VITE_SUPABASE_ANON_KEY=your_key
  ```

## 🧪 Testing

### Test 1: Sign Up Flow
- [ ] Start dev server: `npm run dev`
- [ ] Open browser to `http://localhost:5173`
- [ ] Look for "Sign In" button in navbar (top right)
- [ ] Click "Sign In" button
- [ ] Modal should open
- [ ] Click "Don't have an account? Sign up"
- [ ] Fill in form:
  - [ ] Full Name: "Test User"
  - [ ] Email: "test@example.com"
  - [ ] Password: "test123" (min 6 chars)
- [ ] Click "Create Account"
- [ ] Should see success (modal closes)
- [ ] Navbar should now show profile dropdown

### Test 2: Verify Profile Created
- [ ] Go to Supabase Dashboard
- [ ] Open Table Editor
- [ ] Select `learner_profiles` table
- [ ] Should see new row with:
  - [ ] Your test email
  - [ ] Full name
  - [ ] current_stage: 0
  - [ ] total_score: 0
  - [ ] Empty arrays for completed_stages and badges

### Test 3: Profile Dropdown
- [ ] Click on profile in navbar
- [ ] Dropdown should show:
  - [ ] User name
  - [ ] Email
  - [ ] Current Stage: Stage 0
  - [ ] Total Score: 0 points
  - [ ] Badges: 0
  - [ ] Progress bar
  - [ ] Sign Out button

### Test 4: Protected Route
- [ ] Sign out (click Sign Out in dropdown)
- [ ] Try to visit: `http://localhost:5173/learning`
- [ ] Should see "Sign In Required" message
- [ ] Should NOT see learning content
- [ ] Click "Sign In to Continue"
- [ ] Sign in with test account
- [ ] Should now see learning page

### Test 5: Learning Page Access
- [ ] While signed in, go to `/learning`
- [ ] Should see:
  - [ ] Welcome message with your name
  - [ ] Progress stats (Stage, Score, Badges)
  - [ ] Learning content
  - [ ] "Complete Lesson" button
  - [ ] "Claim Badge" button

### Test 6: Progress Tracking
- [ ] On learning page, click "Complete Lesson (+10 points)"
- [ ] Should see alert: "Great job! You earned 10 points!"
- [ ] Check navbar profile dropdown
- [ ] Total Score should now be: 10 points
- [ ] Go to Supabase Dashboard
- [ ] Check `learner_profiles` table
- [ ] Verify total_score is 10
- [ ] Verify completed_stages includes [2]

### Test 7: Badge System
- [ ] On learning page, click "Claim Badge"
- [ ] Should see alert: "Congratulations! You earned a badge!"
- [ ] Check navbar profile dropdown
- [ ] Badges count should be: 1
- [ ] Dropdown should show badge name
- [ ] Go to Supabase Dashboard
- [ ] Check `learner_profiles` table
- [ ] Verify badges array contains "First Lesson Complete"

### Test 8: Session Persistence
- [ ] While signed in, close browser completely
- [ ] Reopen browser
- [ ] Go to `http://localhost:5173`
- [ ] Should still be signed in
- [ ] Profile should show in navbar
- [ ] Progress should be preserved

### Test 9: Sign Out
- [ ] Click profile dropdown
- [ ] Click "Sign Out"
- [ ] Should be signed out
- [ ] Navbar should show "Sign In" button again
- [ ] Try to access `/learning`
- [ ] Should be blocked (sign-in required)

### Test 10: Sign In Flow
- [ ] Click "Sign In" button
- [ ] Enter test account credentials
- [ ] Click "Sign In"
- [ ] Should sign in successfully
- [ ] Profile should appear in navbar
- [ ] Progress should be loaded from database

## 🐛 Troubleshooting

### Issue: "Sign In" button not showing
- [ ] Check browser console for errors
- [ ] Verify `LearningAuthProvider` wraps app in `AppRouter.tsx`
- [ ] Verify `LearningAuthButton` is imported in `Header.tsx`

### Issue: Sign up fails
- [ ] Check browser console for error message
- [ ] Verify email provider is enabled in Supabase
- [ ] Check Supabase logs in dashboard
- [ ] Verify password is at least 6 characters

### Issue: Profile not loading
- [ ] Check browser console for errors
- [ ] Verify migration ran successfully
- [ ] Check RLS policies are enabled
- [ ] Verify user exists in `auth.users` table
- [ ] Check if profile exists in `learner_profiles` table

### Issue: Can't access /learning page
- [ ] Verify you're signed in
- [ ] Check browser console for errors
- [ ] Verify route is configured in `AppRouter.tsx`
- [ ] Check `LearningProtectedRoute` is wrapping the page

### Issue: Progress not saving
- [ ] Check browser console for errors
- [ ] Verify RLS policies allow UPDATE
- [ ] Check Supabase logs
- [ ] Verify user ID matches in both tables

## ✅ Success Criteria

You've successfully set up authentication when:

- [x] Database table created
- [x] Email auth enabled
- [x] Sign up creates new accounts
- [x] Sign in works with existing accounts
- [x] Profile shows in navbar
- [x] Protected routes work
- [x] Progress tracking saves to database
- [x] Badges can be awarded
- [x] Session persists across browser restarts
- [x] Sign out works correctly

## 📚 Next Steps

Once everything is working:

1. **Customize Learning Content**
   - Edit `src/pages/LearningPage.tsx`
   - Add your actual course content
   - Create more lessons and activities

2. **Add More Stages**
   - Create Stage 3, 4, 5... pages
   - Protect them with `LearningProtectedRoute`
   - Update progress as users complete them

3. **Enhance Badge System**
   - Define badge criteria
   - Create badge images/icons
   - Add badge showcase page

4. **Add Features**
   - Password reset flow
   - Email verification
   - Profile editing
   - Leaderboard
   - Certificates

## 📖 Documentation

- **Quick Start**: `QUICK_START_AUTH.md`
- **Detailed Setup**: `docs/LEARNING_AUTH_SETUP.md`
- **Flow Diagrams**: `docs/AUTH_FLOW_DIAGRAM.md`
- **Summary**: `AUTH_IMPLEMENTATION_SUMMARY.md`

---

**Need Help?**
- Check browser console for errors
- Check Supabase dashboard logs
- Review documentation files
- Verify each checklist item above
