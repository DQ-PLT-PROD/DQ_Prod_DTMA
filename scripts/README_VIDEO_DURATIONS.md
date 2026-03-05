# Video Duration Measurement Guide

## Problem
Lesson durations are showing incorrect values (25-35 mins) instead of actual video lengths (~5 mins).

## Solution
Use the automated script to measure actual video durations and update the database.

## Prerequisites

1. Install Puppeteer (if not already installed):
```bash
npm install puppeteer --save-dev
```

2. Ensure you have the required environment variables in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# OR
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Running the Script

### Option 1: Automated Update (Recommended)
This script will measure all video durations and automatically update the database:

```bash
node scripts/measure-and-update-durations.mjs
```

The script will:
- Fetch all lessons with video URLs from the database
- Launch a headless browser to load each video
- Measure the actual duration of each video
- Update the database with correct durations
- Print a summary report

### Option 2: Browser-Based Measurement
If you prefer to measure durations in your browser:

1. Navigate to any course page in your app
2. Open browser console (F12)
3. Run:
```javascript
await measureVideoDurations()
```

4. Copy the generated SQL statements
5. Run them in Supabase SQL Editor

## What Gets Updated

The script updates the `estimated_duration_minutes` field in the `lessons` table with actual video durations (rounded up to the nearest minute).

## Expected Results

After running the script, lesson durations should show actual video lengths:
- "Economy 4.0 & Your Role in Perf..." → 5:21 (6 mins)
- "Seeing Your Work as a Transacti..." → 5:09 (6 mins)
- "The Transaction Lifecycle: Using..." → 4:42 (5 mins)
- etc.

## Troubleshooting

### Script fails with "Cannot find module 'puppeteer'"
Install puppeteer:
```bash
npm install puppeteer --save-dev
```

### Script fails with "Missing Supabase credentials"
Check your `.env` file has the required variables.

### Video fails to load
- Check that video URLs are accessible
- Verify video files exist in your storage
- Check network connectivity

### Browser launch fails
On some systems, you may need additional dependencies:
```bash
# Ubuntu/Debian
sudo apt-get install -y chromium-browser

# Or use system Chrome
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

## Manual Update (Fallback)

If the automated script doesn't work, you can manually update durations in Supabase SQL Editor:

```sql
-- Update specific lessons
UPDATE lessons SET estimated_duration_minutes = 6 WHERE title = 'Economy 4.0 & Your Role in Performance';
UPDATE lessons SET estimated_duration_minutes = 6 WHERE title = 'Seeing Your Work as a Transaction';
UPDATE lessons SET estimated_duration_minutes = 5 WHERE title = 'The Transaction Lifecycle: Using PLTs';
-- etc.
```

## Verification

After updating, verify the changes:

```sql
SELECT 
    course_slug,
    title,
    estimated_duration_minutes,
    video_url
FROM lessons
WHERE video_url IS NOT NULL
ORDER BY course_slug, order_index;
```

## Notes

- The script rounds durations UP to the nearest minute (5:21 becomes 6 mins)
- Intro and outro lessons are included in the measurement
- The UI will automatically reflect the updated durations after refresh
