# Course Details Bugs 

## Latest PR Feedback Fixes (March 3, 2026)

### 1. Enrollment Button 404 Error (Vercel Deployment)
**Status**: ✅ FIXED  
**Reported By**: Damarice Menganyi & Wilson  

**Issue**: Enrollment button throws 404 error in Vercel deployment (develop branch)

**Root Cause**: Duplicate API handlers (`api/enrollment.mjs` and `api/server.mjs`) caused routing conflicts in Vercel.

**Solution**: Deleted `api/enrollment.mjs` to eliminate duplication. All enrollment requests now route through `api/[...path].mjs` → `api/server.mjs`.

**Files Changed**:
- ❌ Deleted: `api/enrollment.mjs`

**Documentation**: See `ENROLLMENT_API_FIX.md` for complete details.

**Testing**: Run `node scripts/test-enrollment-api.mjs` to verify all endpoints work.

---

### 2. Incorrect Lesson Duration Display (Updated March 3, 2026)
**Status**: ⚠️ SOLUTION PROVIDED (Manual Fix Required)  
**Reported By**: Damarice Menganyi & Wilson  

**Issue**: Lesson duration shows "25-35 mins" but actual video is ~5 mins

**Root Cause**: Database contains incorrect placeholder values in `estimated_duration_minutes` field.

**Solution**: Use built-in video duration measurement tool to detect actual durations and generate SQL to fix them.

**How to Fix**:
1. Navigate to `/measure-video-durations` in browser
2. Wait for measurement to complete
3. Copy generated SQL UPDATE statements
4. Execute in Supabase SQL Editor

**Documentation**: See `scripts/fix-durations-guide.md` for step-by-step instructions.

---

## Fixed: Incorrect Lesson Duration Display (March 2, 2026)

### Issue
Lesson durations were displaying as 25-35 minutes per lesson when actual video content was approximately 5 minutes per lesson. The system was using hardcoded estimates instead of reading actual video file durations.

### Root Cause
1. **Migration 050**: The `050_populate_lesson_durations.sql` migration was setting incorrect hardcoded durations (25-35 minutes for standard lessons)
2. **No Dynamic Detection**: The system wasn't reading actual video metadata to get real durations

### Solution
Implemented a dynamic video duration detection system:

1. **Video Metadata Utility** (`src/utils/videoMetadata.ts`):
   - Created utility functions to read actual video duration from video files
   - Uses HTML5 video element to load metadata and extract duration
   - Calculates total course duration by summing all lesson video durations

2. **Updated Hook** (`src/features/courses/hooks/useProductDetails.ts`):
   - Modified to call `calculateTotalDurationFromLessons()` which reads actual video files
   - Automatically detects real video duration when course loads
   - Falls back to database estimates if video loading fails

3. **Scan Script** (`scripts/update-video-durations.mjs`):
   - Node.js script to scan all lessons and identify which need duration updates
   - Provides summary of current duration data

### Files Modified
- `src/utils/videoMetadata.ts` - NEW: Video duration detection utility
- `src/features/courses/hooks/useProductDetails.ts` - Added automatic video duration detection
- `scripts/update-video-durations.mjs` - NEW: Script to scan and report video durations
- `supabase/migrations/050_populate_lesson_durations.sql` - Updated to set realistic defaults

### How It Works Now
The system now:
1. Fetches lessons for a course
2. For each lesson with a video URL, loads the video metadata
3. Extracts the ACTUAL duration from the video file (in seconds)
4. Converts to minutes and sums up the total
5. Displays the real duration (e.g., if 4 videos are 5:23, 4:45, 5:10, 4:52 = "20 min" total)
6. Falls back to database estimates only if video loading fails

### Testing
The fix works automatically:
1. Navigate to any course details page
2. The system will load video metadata in the background
3. Duration will display based on ACTUAL video file lengths
4. Check browser console for any video loading errors

### Scan Current Durations
To see which lessons need duration updates:
```bash
node scripts/update-video-durations.mjs
```

### Manual Database Update (Optional)
If you want to pre-populate durations in the database:
```sql
-- Run in Supabase SQL Editor after measuring actual video lengths
UPDATE lessons 
SET estimated_duration_minutes = <actual_minutes> 
WHERE id = '<lesson_id>';
```

### Benefits
- ✅ Shows EXACT video duration, not estimates
- ✅ Automatically updates if videos are replaced
- ✅ No manual database updates needed
- ✅ Works for any video format supported by HTML5
