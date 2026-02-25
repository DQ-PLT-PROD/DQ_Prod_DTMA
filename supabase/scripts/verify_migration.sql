-- Verification queries to run in Supabase SQL Editor after migration

-- 1. Check if new columns were added to user_enrollments
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_enrollments' 
AND column_name IN ('status', 'enrollment_method');

-- 2. Check if is_preview column was added to lessons
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'lessons' 
AND column_name = 'is_preview';

-- 3. Check if preview lessons were marked
SELECT id, title, type, order_index, is_preview 
FROM lessons 
WHERE is_preview = true 
LIMIT 10;

-- 4. Check if helper functions were created
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('is_user_enrolled', 'get_user_enrollment_count');

-- 5. Check if enrollment_stats view was created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'enrollment_stats';

-- 6. Test the helper function (replace with actual user_id and course_slug)
-- SELECT is_user_enrolled('your-user-id-here', 'perfecting-life-transactions');