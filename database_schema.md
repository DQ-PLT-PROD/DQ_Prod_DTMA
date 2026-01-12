# Database Schema Documentation

This document outlines the current database schema based on the migration files found in `supabase/migrations`.

## Core Tables

### 1. `courses`
Stores the main course information.
- **PK**: `id` (UUID)
- **Unique**: `slug` (TEXT)
- **Columns**:
    - `title` (TEXT)
    - `short_description` (TEXT)
    - `long_description` (TEXT)
    - `category_id` (TEXT)
    - `audience_level` (TEXT)
    - `topic_tags` (TEXT[])
    - `level_tag` (TEXT)
    - `estimated_duration_minutes` (NUMERIC)
    - `lesson_count` (NUMERIC)
    - `hero_image_url` (TEXT)
    - `intro_video_url` (TEXT)
    - `intro_video_poster_url` (TEXT)
    - `thumbnail_url` (TEXT)
    - `is_featured` (BOOLEAN)
    - `status` (TEXT, default 'draft')
    - `rating` (NUMERIC)
    - `review_count` (NUMERIC)
    - `delivery_mode` (TEXT)
    - `enrollment_url` (TEXT)
    - `learning_outcomes` (TEXT[])
    - `skills_gained` (TEXT[])
    - `upon_completion` (TEXT)
    - `start_date` (TEXT)
    - `created_at` (TIMESTAMPTZ)
    - `updated_at` (TIMESTAMPTZ)
- **RLS**: Public Read Access enabled.

### 2. `lessons`
Stores the curriculum content for courses.
- **PK**: `id` (UUID)
- **FK**: `course_slug` -> `public.courses(slug)` (ON DELETE CASCADE)
- **Columns**:
    - `title` (TEXT)
    - `type` (TEXT) - Check: `IN ('intro', 'standard', 'outro', 'quiz')`
    - `order_index` (NUMERIC)
    - `estimated_duration_minutes` (NUMERIC)
    - `video_url` (TEXT)
    - `resource_url` (TEXT)
    - `content` (TEXT)
    - `created_at` (TIMESTAMPTZ)
    - `updated_at` (TIMESTAMPTZ)
- **RLS**: Public Read Access enabled.

### 3. `quizzes`
Stores assessment questions linked to courses.
- **PK**: `id` (UUID)
- **FK**: `course_slug` -> `public.courses(slug)` (ON DELETE CASCADE)
- **Columns**:
    - `title` (TEXT)
    - `order_index` (NUMERIC)
    - `question` (TEXT)
    - `options` (JSONB) - Structure: Array of `{id, text}` objects
    - `correct_answer` (TEXT) - ID of the correct option
    - `explanation` (TEXT)
    - `created_at` (TIMESTAMPTZ)
- **RLS**: Public Read Access enabled.

### 4. `course_resources`
Stores downloadable assets or external links for courses.
- **PK**: `id` (UUID)
- **FK**: `course_slug` -> `public.courses(slug)` (ON DELETE CASCADE)
- **Columns**:
    - `title` (TEXT)
    - `type` (TEXT) - Check: `IN ('whitepaper', 'pdf', 'template', 'tool', 'worksheet', 'other')`
    - `description` (TEXT)
    - `resource_url` (TEXT)
    - `file_size_bytes` (NUMERIC)
    - `order_index` (NUMERIC)
    - `created_at` (TIMESTAMPTZ)
- **RLS**: Public Read Access enabled.

## Storage to Database Mapping

The database schema supports the storage folder structure shown below by storing full URLs in specific columns.

| Storage Folder | Database Table | Column | Logic |
| :--- | :--- | :--- | :--- |
| **`thumbnail/`** | `courses` | `thumbnail_url` | Stores the URL to the image file in this folder. |
| **`lessons/`** | `lessons` | `video_url` | Stores the URL to the video file. `type` = 'standard' |
| **`intro/`** | `lessons` | `video_url` | Stores the URL to the video file. `type` = 'intro' |
| **`outro/`** | `lessons` | `video_url` | Stores the URL to the video file. `type` = 'outro' |
| **`resources/`** | `course_resources` | `resource_url` | Stores the URL to the PDF/Doc file. |
