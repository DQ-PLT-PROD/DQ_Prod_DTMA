-- Migration: Correct resource URL for PLT Course
-- Updates the whitepaper URL to match the actual uploaded file

UPDATE public.course_resources 
SET resource_url = 'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/resources/25.01_DQ_DTMB_WP_Perfect_Life_Transactions_The_Cornerstone_of_Economy_4.0.pdf'
WHERE course_slug = 'perfecting-life-transactions' AND type = 'whitepaper';
