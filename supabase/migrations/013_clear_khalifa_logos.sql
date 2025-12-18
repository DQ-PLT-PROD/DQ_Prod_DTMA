
UPDATE public.courses
SET hero_image_url = NULL
WHERE hero_image_url LIKE '%mzn_logo%';

UPDATE public.courses
SET intro_video_poster_url = NULL
WHERE intro_video_poster_url LIKE '%mzn_logo%';
