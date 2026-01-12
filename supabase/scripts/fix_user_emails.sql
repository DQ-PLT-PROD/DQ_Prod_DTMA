-- =====================================================
-- Fix User Emails Script
-- =====================================================
-- This script identifies and fixes users with fallback email addresses
-- Run this in your Supabase SQL Editor

-- Step 1: Identify users with fallback emails
SELECT 
    id,
    azure_user_id,
    email,
    name,
    created_at,
    CASE 
        WHEN email = 'user@domain.com' THEN 'Generic fallback'
        WHEN email LIKE 'user-%@missing-email.local' THEN 'Generated fallback'
        ELSE 'Other issue'
    END as email_issue_type
FROM users 
WHERE email = 'user@domain.com' 
   OR email LIKE 'user-%@missing-email.local'
ORDER BY created_at DESC;

-- Step 2: Check if any azure_user_id values look like emails (auto-fixable)
SELECT 
    id,
    azure_user_id,
    email,
    name,
    CASE 
        WHEN azure_user_id LIKE '%@%' THEN azure_user_id
        ELSE 'Cannot auto-fix'
    END as suggested_email
FROM users 
WHERE (email = 'user@domain.com' OR email LIKE 'user-%@missing-email.local')
  AND azure_user_id LIKE '%@%';

-- Step 3: PREVIEW what would be updated (DRY RUN)
-- Uncomment the SELECT below to see what would be changed
/*
SELECT 
    'UPDATE users SET email = ''' || azure_user_id || ''', updated_at = NOW() WHERE id = ''' || id || ''';' as update_statement
FROM users 
WHERE (email = 'user@domain.com' OR email LIKE 'user-%@missing-email.local')
  AND azure_user_id LIKE '%@%'
  AND azure_user_id != email;
*/

-- Step 4: ACTUAL FIX (UNCOMMENT TO APPLY)
-- ⚠️ WARNING: Only run this after reviewing the preview above!
-- This will update users where azure_user_id looks like a valid email
/*
UPDATE users 
SET 
    email = azure_user_id,
    updated_at = NOW()
WHERE (email = 'user@domain.com' OR email LIKE 'user-%@missing-email.local')
  AND azure_user_id LIKE '%@%'
  AND azure_user_id != email;
*/

-- Step 5: Verify the fix
-- Run this after applying the update to see the results
/*
SELECT 
    id,
    azure_user_id,
    email,
    name,
    updated_at
FROM users 
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
*/

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. This script only fixes users where azure_user_id contains an @ symbol
-- 2. Users with azure_user_id that doesn't look like an email need manual review
-- 3. The automatic fix in the code will also handle this when users log in next
-- 4. Always run the preview queries first before applying updates
-- =====================================================