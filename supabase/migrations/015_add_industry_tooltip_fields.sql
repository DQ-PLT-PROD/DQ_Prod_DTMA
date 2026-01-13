-- Migration: 015_add_industry_tooltip_fields.sql
-- Description: Add description and short_name fields for industry tooltips and compact UI

ALTER TABLE industries
  ADD COLUMN IF NOT EXISTS short_name TEXT;

-- Note: description column already exists from 007_add_filter_lookup_tables.sql
-- This migration ensures short_name is available for compact sidebar labels
