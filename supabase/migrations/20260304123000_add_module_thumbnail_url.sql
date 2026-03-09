ALTER TABLE public.modules
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

COMMENT ON COLUMN public.modules.thumbnail_url IS
'Module thumbnail image used across admin and learner-facing module displays.';
