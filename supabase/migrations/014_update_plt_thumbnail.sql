-- Migration: 014_update_plt_thumbnail.sql
-- Description: Update the PLT course with the new thumbnail uploaded to storage.

UPDATE public.courses
SET hero_image_url = 'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/thumbnail/Gemini_Generated_Image_stk7llstk7llstk7.png',
    intro_video_poster_url = 'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/thumbnail/Gemini_Generated_Image_stk7llstk7llstk7.png'
WHERE slug = 'perfecting-life-transactions';
