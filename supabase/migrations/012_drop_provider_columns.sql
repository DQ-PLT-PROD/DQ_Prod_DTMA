-- Migration: Drop provider columns
-- Removes generic provider fields as the platform is single-tenant (DTMA Academy only)

ALTER TABLE public.courses
DROP COLUMN IF EXISTS provider_name,
DROP COLUMN IF EXISTS provider_logo_url,
DROP COLUMN IF EXISTS provider_description;
