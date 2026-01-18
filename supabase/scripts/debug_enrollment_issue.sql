-- Debug queries to identify the enrollment issue

-- 1. Check if the user exists in the users table
SELECT id, azure_user_id, email, name 
FROM users 
WHERE azure_user_id = '9c191842-b9a6-42aa-8711-b026e150306b';

-- 2. Check the current RLS policies on user_enrollments
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_enrollments';

-- 3. Check if the columns exist
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_enrollments' 
ORDER BY ordinal_position;

-- 4. Check if the course exists
SELECT id, slug, title 
FROM courses 
WHERE slug = 'perfecting-life-transactions';

-- 5. Test the auth.uid() function
SELECT auth.uid() as current_auth_uid;

-- 6. Test if we can find the user with current auth
SELECT id, azure_user_id, email 
FROM users 
WHERE azure_user_id = auth.uid()::text;

-- 7. Check existing enrollments for this user (if any)
SELECT * 
FROM user_enrollments 
WHERE user_id IN (
    SELECT id FROM users WHERE azure_user_id = '9c191842-b9a6-42aa-8711-b026e150306b'
);

-- 8. Try a manual insert to see what happens (replace with actual user_id)
-- INSERT INTO user_enrollments (user_id, course_slug, started_at, last_accessed_at, progress_pct, status, enrollment_method)
-- VALUES (
--     (SELECT id FROM users WHERE azure_user_id = '9c191842-b9a6-42aa-8711-b026e150306b'),
--     'perfecting-life-transactions',
--     NOW(),
--     NOW(),
--     0,
--     'active',
--     'explicit'
-- );