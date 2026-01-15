# 🧪 DTMA Enrollment Testing Guide - Quick & Simple

**Status**: Frontend running ✅  
**Next**: Start API server and test enrollment flow

---

## Step 1: Start the API Server (Required!)

Open a **NEW terminal** and run:

```bash
npm run dev:api
```

**Expected Output**:
```
API listening on http://localhost:3001
Stripe mock endpoints available at /api/stripe/*
```

⚠️ **Important**: Keep this terminal running! The enrollment feature needs the API server for payment processing.

---

## Step 2: Apply Database Migrations

Open **another terminal** and run:

```bash
# If you have Supabase CLI installed:
supabase db push

# OR manually run the SQL files in Supabase dashboard:
# 1. Go to your Supabase project dashboard
# 2. Navigate to SQL Editor
# 3. Run these files in order:
#    - supabase/migrations/029_add_subscriptions_table.sql
#    - supabase/migrations/030_align_enrollment_status.sql
```

**What this does**: Creates the subscriptions table and updates enrollment status fields.

---

## Step 3: Basic Enrollment Test (5 minutes)

### Test 1: View Course Details

1. **Open browser**: http://localhost:5173 (or your dev URL)
2. **Navigate to**: Courses page
3. **Click on any course** to view details

**What to expect**:
- ✅ Course details page loads
- ✅ You see an "Enroll Now" button (or "Sign In to Enroll" if not logged in)

---

### Test 2: Enroll in a Free Course

1. **If not logged in**: Click "Sign In to Enroll" and log in with Azure AD
2. **Click "Enroll Now"** button
3. **Confirm enrollment** in the modal that appears

**What to expect**:
- ✅ Enrollment modal appears with course info
- ✅ Click "Confirm Enrollment"
- ✅ Success toast message: "Successfully enrolled in [Course Name]!"
- ✅ Button changes to "Continue Learning" with green checkmark
- ✅ Page stays on course details

**If you see errors**:
- Check browser console (F12)
- Verify Supabase credentials in `.env`
- Ensure API server is running

---

### Test 3: Access Course Content

1. **Click "Continue Learning"** button (or navigate to learning screen)
2. **You should be redirected** to: `/learning?courseId=your-course-slug`

**What to expect**:
- ✅ Learning screen loads successfully
- ✅ You can see all lessons in the sidebar
- ✅ Video player is accessible (not blurred)
- ✅ You can click and watch any lesson

---

### Test 4: Test Access Gating (Non-Enrolled User)

1. **Open a new incognito/private window**
2. **Navigate directly to**: `http://localhost:5173/learning?courseId=any-course-slug`

**What to expect**:
- ✅ You are **redirected** back to the course details page
- ✅ You see "Enroll Now" button
- ✅ You cannot access the learning screen without enrolling

**This proves route-level guards are working!**

---

## Step 4: Test Payment Flow (Mock Mode)

### Test 5: Plan Selection Modal

1. **Go to a course details page**
2. **Click "Enroll Now"**
3. **If payment is enabled**, you should see a plan selection modal

**What to expect**:
- ✅ Modal shows 3 plans: Free, Premium, Subscription
- ✅ Each plan shows features and pricing
- ✅ You can select a plan (it highlights)
- ✅ "Continue to Enrollment" button is enabled

**Note**: Currently all courses are free by default, so you'll see the simple enrollment modal instead. To test payment:
- The infrastructure is ready
- Mock payment mode is active (no real charges)
- Payment flow will simulate Stripe Checkout

---

### Test 6: Payment Success Flow (When Implemented)

If you select a paid plan:

**What to expect**:
1. ✅ Redirect to payment success page
2. ✅ "Processing payment..." message
3. ✅ "Payment successful!" message
4. ✅ Enrollment is created
5. ✅ Auto-redirect to learning screen

---

## Step 5: Test State Transitions

### Test 7: Check Enrollment Persistence

1. **Enroll in a course**
2. **Close the browser completely**
3. **Open browser again and log in**
4. **Navigate to the same course**

**What to expect**:
- ✅ Button still shows "Continue Learning"
- ✅ You still have access to the learning screen
- ✅ Enrollment persisted across sessions

---

### Test 8: Verify Database Records

Open Supabase dashboard and check:

```sql
-- Check your enrollment
SELECT * FROM user_enrollments 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

**What to expect**:
- ✅ You see your enrollment record
- ✅ `status` = 'active'
- ✅ `course_slug` matches the course you enrolled in
- ✅ `enrollment_method` = 'explicit'
- ✅ `enrolled_at` timestamp is set

---

## Quick Troubleshooting

### Problem: "Enroll Now" button doesn't work

**Check**:
1. Are you logged in? (Check top-right corner)
2. Open browser console (F12) - any errors?
3. Check `.env` file has correct Supabase credentials
4. Verify API server is running on port 3001

**Fix**:
```bash
# Restart API server
npm run api
```

---

### Problem: Redirected away from learning screen

**This is expected!** It means route guards are working.

**To fix**:
1. Go to course details page
2. Click "Enroll Now"
3. Complete enrollment
4. Then access learning screen

---

### Problem: Database errors in console

**Check**:
1. Did you run the migrations?
2. Is `VITE_SUPABASE_SERVICE_ROLE_KEY` set in `.env`?
3. Are RLS policies enabled in Supabase?

**Fix**:
```bash
# Run migrations
supabase db push

# Or manually in Supabase SQL Editor
```

---

### Problem: API server not responding

**Check**:
```bash
# Test API health
curl http://localhost:3001/api/health

# Should return: {"ok":true}
```

**Fix**:
```bash
# Restart API server
npm run api
```

---

## Expected Console Logs

When enrolling, you should see these logs in browser console:

```
🔍 Checking enrollment status for: { userId: "...", courseSlug: "..." }
🚀 Starting enrollment process...
✅ Got Supabase client for enrollment
📝 Creating new enrollment...
✅ Enrollment created successfully
```

---

## Success Checklist ✅

After testing, you should have verified:

- [ ] ✅ Can view course details
- [ ] ✅ Can click "Enroll Now" button
- [ ] ✅ Enrollment modal appears
- [ ] ✅ Enrollment succeeds with success toast
- [ ] ✅ Button changes to "Continue Learning"
- [ ] ✅ Can access learning screen after enrollment
- [ ] ✅ Non-enrolled users are redirected (route guard works)
- [ ] ✅ Enrollment persists across sessions
- [ ] ✅ Database record created correctly

---

## What You're Testing

### ✅ Core Features
1. **Enrollment Creation** - Users can enroll in courses
2. **Access Gating** - Only enrolled users access content
3. **Route Guards** - Direct URL access is blocked
4. **State Persistence** - Enrollments survive logout/login
5. **UI States** - Button shows correct state

### ✅ Technical Implementation
1. **Service Layer** - enrollmentService functions work
2. **Database** - Records created in user_enrollments table
3. **Access Contract** - getAccessContract returns correct data
4. **Route Protection** - EnrollmentGuard component works
5. **Error Handling** - Graceful failures with helpful messages

---

## Next Steps

### If Everything Works ✅
Congratulations! The enrollment feature is working correctly.

**You can now**:
- Enroll in multiple courses
- Test with different users
- Verify cross-device consistency
- Test edge cases (network errors, etc.)

### If You Find Issues ❌
1. Check browser console for errors
2. Check API server terminal for errors
3. Verify `.env` configuration
4. Check Supabase dashboard for data
5. Review error messages carefully

---

## Quick Reference

### URLs
- **Frontend**: http://localhost:5173
- **API Health**: http://localhost:3001/api/health
- **Courses**: http://localhost:5173/courses
- **Learning**: http://localhost:5173/learning?courseId=COURSE_SLUG

### Key Files
- **Enrollment Service**: `src/features/courses/services/enrollmentService.ts`
- **Enrollment Button**: `src/features/courses/components/enrollment/EnrollmentButton.tsx`
- **Route Guard**: `src/features/courses/components/guards/EnrollmentGuard.tsx`
- **API Server**: `api/server.mjs`

### Environment Variables (Check .env)
```bash
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-key  # Important!
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
```

---

## 🎉 You're Ready to Test!

**Start with Test 1** and work your way through. Each test builds on the previous one.

**Estimated time**: 10-15 minutes for complete testing

**Good luck!** 🚀
