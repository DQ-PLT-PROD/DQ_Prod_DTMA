# Supabase Course Content Upload Guide

This guide explains how to upload course materials (videos, resources) to Supabase storage for the DTMA Learning Platform.

## Prerequisites

1. Access to the Supabase project dashboard
2. Your course video files (.mp4 recommended)
3. Course resources (PDF, etc.)

---

## Step 1: Create the Storage Bucket

### Via Supabase Dashboard (Recommended)

1. Go to **Storage** in the left sidebar
2. Click **New bucket**
3. Enter bucket name: `course-content`
4. Check **Public bucket** (so files are accessible without auth)
5. Click **Create bucket**

---

## Step 2: Folder Structure

```
course-content/
└── plt-course-01/
    ├── intro/
    │   └── Intro_V2.mp4
    ├── lessons/
    │   ├── Lesson_1.mp4
    │   ├── Lesson_2.mp4
    │   ├── Lesson_3.mp4
    │   ├── Lesson_4.mp4
    │   ├── Lesson_5.mp4
    │   ├── Lesson_6.mp4
    │   ├── Lesson_7.mp4
    │   ├── Lesson_8.mp4
    │   └── Lesson_9.mp4
    ├── outro/
    │   └── Outro_V2.mp4
    └── resources/
        └── PLT_Whitepaper.pdf
```

### Creating Folders

1. Click on the `course-content` bucket
2. Click **Create folder** → `plt-course-01`
3. Inside `plt-course-01`, create 4 subfolders: `intro`, `lessons`, `outro`, `resources`

---

## Step 3: Upload Files

1. Navigate to the target folder
2. Click **Upload files**
3. Select your file(s)
4. Wait for upload to complete

---

## Step 4: Update Database with Video URLs

After uploading, run these SQL statements in Supabase SQL Editor:

```sql
-- Intro
UPDATE public.lessons 
SET video_url = 'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/intro/Intro_V2.mp4'
WHERE course_slug = 'perfecting-life-transactions' AND order_index = 0;

-- Lessons 1-9
UPDATE public.lessons SET video_url = 'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_1.mp4' WHERE course_slug = 'perfecting-life-transactions' AND order_index = 1;
UPDATE public.lessons SET video_url = 'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_2.mp4' WHERE course_slug = 'perfecting-life-transactions' AND order_index = 2;
UPDATE public.lessons SET video_url = 'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_3.mp4' WHERE course_slug = 'perfecting-life-transactions' AND order_index = 3;
UPDATE public.lessons SET video_url = 'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_4.mp4' WHERE course_slug = 'perfecting-life-transactions' AND order_index = 4;
UPDATE public.lessons SET video_url = 'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_5.mp4' WHERE course_slug = 'perfecting-life-transactions' AND order_index = 5;
UPDATE public.lessons SET video_url = 'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_6.mp4' WHERE course_slug = 'perfecting-life-transactions' AND order_index = 6;
UPDATE public.lessons SET video_url = 'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_7.mp4' WHERE course_slug = 'perfecting-life-transactions' AND order_index = 7;
UPDATE public.lessons SET video_url = 'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_8.mp4' WHERE course_slug = 'perfecting-life-transactions' AND order_index = 8;
UPDATE public.lessons SET video_url = 'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_9.mp4' WHERE course_slug = 'perfecting-life-transactions' AND order_index = 9;

-- Outro
UPDATE public.lessons 
SET video_url = 'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/outro/Outro_V2.mp4'
WHERE course_slug = 'perfecting-life-transactions' AND order_index = 10;

-- Whitepaper
UPDATE public.course_resources 
SET resource_url = 'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/resources/PLT_Whitepaper.pdf'
WHERE course_slug = 'perfecting-life-transactions';
```

---

## Quick Reference

| Content | Folder Path |
|---------|-------------|
| Intro | `plt-course-01/intro/` |
| Lessons | `plt-course-01/lessons/` |
| Outro | `plt-course-01/outro/` |
| Resources | `plt-course-01/resources/` |
