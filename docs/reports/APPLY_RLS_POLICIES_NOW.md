# 🚨 URGENT: Apply RLS Policies to Fix Enrollment

## The Issue
Your enrollment is failing with RLS policy violations because the permanent policies haven't been applied to Supabase yet.

## Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project: `ugmybskacomcdgdngolz`
3. Click "SQL Editor" in the left sidebar

### Step 2: Run the Permanent Policies
1. Copy the entire contents of `permanent_rls_policies.sql`
2. Paste it into the SQL Editor
3. Click "Run" button

### Step 3: Verify Success
1. Copy the contents of `verify_enrollment_setup.sql` 
2. Paste and run it in SQL Editor
3. You should see policies listed and no errors

### Step 4: Test Enrollment
1. Your dev server is already running at http://localhost:3000
2. Go to any course page
3. Click "Enroll Now" - it should work now!

## What This Does
- Enables proper RLS policies for service role access
- Allows your Azure AD authenticated users to enroll
- Maintains security while fixing the 401/406 errors

## Expected Result
After applying these policies, enrollment should work immediately without any code changes.