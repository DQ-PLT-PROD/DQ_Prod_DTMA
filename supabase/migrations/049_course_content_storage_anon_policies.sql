-- Migration: 049_course_content_storage_anon_policies.sql
-- Description: Allow anonymous and authenticated users to upload and manage media in course-content bucket.
-- Required for Media Library uploads with or without sign-in.

-- --- Anonymous (unauthenticated) ---
-- Allow anon to upload (INSERT)
CREATE POLICY "course_content_insert_anon"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'course-content');

-- Allow anon to read (SELECT)
CREATE POLICY "course_content_select_anon"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'course-content');

-- Allow anon to update (needed for upsert)
CREATE POLICY "course_content_update_anon"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'course-content');

-- Allow anon to delete
CREATE POLICY "course_content_delete_anon"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'course-content');

-- --- Authenticated (signed-in) ---
CREATE POLICY "course_content_insert_auth"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-content');

CREATE POLICY "course_content_select_auth"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'course-content');

CREATE POLICY "course_content_update_auth"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'course-content');

CREATE POLICY "course_content_delete_auth"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-content');
