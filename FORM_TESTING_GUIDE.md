# 🧪 Authentication Form Testing Guide

## ✅ All Features Implemented

1. ✅ Email/Password Sign Up
2. ✅ Email/Password Sign In
3. ✅ Social Login (Google, Facebook, GitHub)
4. ✅ Forgot Password
5. ✅ Password Reset
6. ✅ Auto-redirect to /learning
7. ✅ Progress tracking
8. ✅ Sign Out

---

## 🧪 Test Each Feature

### 1. Test Sign Up

1. Click "Sign In" button
2. Click "Don't have an account? Sign up"
3. Fill in:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `test123456`
4. Click "Create Account"

**Expected:**
- ✅ Modal closes
- ✅ Redirected to `/learning`
- ✅ Navbar shows "Test User"
- ✅ Shows "Stage 0 • 0 pts"

---

### 2. Test Sign In

1. Sign out first (click profile → Sign Out)
2. Click "Sign In" button
3. Enter:
   - Email: `test@example.com`
   - Password: `test123456`
4. Click "Sign In"

**Expected:**
- ✅ Modal closes
- ✅ Redirected to `/learning`
- ✅ Navbar shows your profile
- ✅ Progress is loaded from database

---

### 3. Test Forgot Password

1. Click "Sign In" button
2. Enter your email: `test@example.com`
3. Click "Forgot password?" link
4. Check console for messages

**Expected:**
- ✅ Alert: "Password reset email sent to test@example.com"
- ✅ Email sent to your inbox (check Supabase email settings)

**To complete reset:**
1. Check your email
2. Click reset link
3. Redirected to `/reset-password`
4. Enter new password
5. Click "Reset Password"
6. Redirected to home page
7. Sign in with new password

---

### 4. Test Social Login (If Enabled)

1. Click "Sign In" button
2. Click "Continue with Google" (or Facebook/GitHub)
3. Complete OAuth flow
4. Authorize app

**Expected:**
- ✅ Redirected back to app
- ✅ Lands on `/learning` page
- ✅ Profile auto-created
- ✅ Navbar shows your info

---

### 5. Test Progress Tracking

1. Sign in
2. Go to `/learning`
3. Click "Complete Lesson (+10 points)"

**Expected:**
- ✅ Alert: "Great job! You earned 10 points!"
- ✅ Navbar updates: "Stage 2 • 10 pts"
- ✅ Check Supabase: total_score = 10

4. Click "Claim Badge"

**Expected:**
- ✅ Alert: "Congratulations! You earned a badge!"
- ✅ Navbar shows: 1 badge
- ✅ Check Supabase: badges array has "First Lesson Complete"

---

### 6. Test Session Persistence

1. Sign in
2. Close browser completely
3. Reopen browser
4. Go to your app

**Expected:**
- ✅ Still signed in
- ✅ Navbar shows your profile
- ✅ Progress preserved

---

### 7. Test Sign Out

1. Click profile in navbar
2. Click "Sign Out"

**Expected:**
- ✅ Console: "Signing out..."
- ✅ Dropdown closes
- ✅ Navbar changes to "Sign In" button
- ✅ Redirected to home page (/)
- ✅ Can't access `/learning` anymore

---

### 8. Test Protected Route

1. Sign out
2. Try to visit: `http://localhost:5173/learning`

**Expected:**
- ✅ Blocked with "Sign In Required" message
- ✅ Shows sign-in prompt
- ✅ Can click "Sign In to Continue"

---

### 9. Test Form Validation

**Test empty fields:**
- Try submitting without email → Should show error
- Try submitting without password → Should show error

**Test password length:**
- Enter password less than 6 chars → Should show error

**Test email format:**
- Enter invalid email → Should show error

---

### 10. Test Error Handling

**Test wrong credentials:**
1. Click "Sign In"
2. Enter wrong password
3. Click "Sign In"

**Expected:**
- ✅ Shows error: "Invalid login credentials"
- ✅ Form stays open
- ✅ Can try again

---

## 🐛 Common Issues & Solutions

### Issue: "Please wait..." never ends

**Solution:**
- Check browser console for errors
- Wait 15 seconds (timeout will trigger)
- Check network tab for failed requests

### Issue: Forgot password doesn't send email

**Solution:**
1. Go to Supabase → Authentication → Email Templates
2. Check if SMTP is configured
3. For testing, check Supabase logs for the reset link

### Issue: Profile not loading after sign in

**Solution:**
- Check console: "Loading profile for user: ..."
- Check if profile exists in Supabase
- Wait 10 seconds (timeout will trigger)
- Profile will be null but UI will still work

### Issue: Social login doesn't work

**Solution:**
- Enable provider in Supabase Dashboard
- Configure OAuth credentials
- Check callback URL matches

---

## ✅ Success Checklist

- [ ] Sign up creates account
- [ ] Sign in works with correct credentials
- [ ] Wrong credentials show error
- [ ] Forgot password sends email
- [ ] Password reset works
- [ ] Social login works (if enabled)
- [ ] Redirects to /learning after auth
- [ ] Progress tracking saves to database
- [ ] Badges can be awarded
- [ ] Sign out works
- [ ] Session persists across browser restarts
- [ ] Protected routes block unauthenticated users
- [ ] Mobile auth works
- [ ] Form validation works

---

## 📊 Check in Supabase

After testing, verify in Supabase Dashboard:

**Authentication → Users:**
- Should see your test users
- Check last sign-in time
- Verify email confirmed status

**Table Editor → learner_profiles:**
- Should see matching profiles
- Check current_stage, total_score
- Verify badges array
- Check completed_stages

**Logs → Auth Logs:**
- See all authentication events
- Check for errors
- Verify password resets

---

## 🎯 Everything Should Work!

All features are implemented and ready:
- ✅ Complete authentication flow
- ✅ Password reset functionality
- ✅ Progress tracking
- ✅ Mobile support
- ✅ Error handling
- ✅ Form validation

Test each feature and let me know if anything doesn't work as expected!
