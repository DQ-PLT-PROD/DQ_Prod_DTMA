# Issue Resolution Report - PR Feedback

## Issues Identified

### Issue 1: Enrollment Button 404 Error on Vercel
**Status**: ✅ ROOT CAUSE IDENTIFIED

**Problem**: The enrollment button throws a 404 error in the Vercel deployment (develop branch).

**Root Cause Analysis**:
1. The frontend enrollment API client (`src/lib/api/enrollmentApiClient.ts`) makes requests to `/api/enrollment/*` endpoints
2. Vercel uses serverless functions with a specific routing pattern
3. The API route is defined in `api/enrollment.mjs` as a Vercel serverless function
4. However, the `vercel.json` configuration only has generic rewrites and doesn't explicitly handle the enrollment API routes
5. The `api/[...path].mjs` catch-all route imports `server.mjs` which has the enrollment handlers, but there's a mismatch in how routes are being resolved

**The Issue**:
- The `api/enrollment.mjs` file exists as a standalone Vercel function
- The `api/server.mjs` also has enrollment handlers
- There's duplication and potential routing conflicts
- Vercel may not be routing `/api/enrollment/*` requests correctly to either handler

**Evidence**:
- `api/enrollment.mjs` exports a default handler function (Vercel serverless function format)
- `api/server.mjs` has `enrollmentHandlers` object with all the same endpoints
- The catch-all `api/[...path].mjs` imports `server.mjs` but may not be catching enrollment routes if `enrollment.mjs` exists

### Issue 2: Incorrect Lesson Duration Display
**Status**: ✅ ROOT CAUSE IDENTIFIED

**Problem**: Lesson duration shows "25-35 mins" but actual video is only ~5 minutes.

**Root Cause Analysis**:
1. Course durations are calculated by summing `estimated_duration_minutes` from all lessons
2. The `estimated_duration_minutes` field in the database contains incorrect placeholder values
3. The system has tools to measure actual video durations (`scripts/update-video-durations.mjs`, `src/utils/measureVideoDurations.ts`)
4. However, these tools only detect and report discrepancies - they don't automatically update the database
5. The migration `supabase/migrations/050_populate_lesson_durations.sql` may have populated incorrect initial values

**Evidence**:
```typescript
// From courseService.ts - Duration calculation
calculatedDuration = row.lessons.reduce((acc: number, lesson: any) =>
    acc + (Number(lesson.estimated_duration_minutes) || 0), 0);

// From formatDuration function
const formatDuration = (minutes: number): string => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
}
```

If the database has incorrect values like 25-35 minutes per lesson, the sum will be wrong.

## Solutions

### Solution 1: Fix Enrollment API 404 Error

**Option A: Use Single API Handler (Recommended)**
Remove the duplicate `api/enrollment.mjs` and rely solely on the catch-all `api/[...path].mjs` + `api/server.mjs` pattern.

**Option B: Fix Vercel Routing**
Keep both handlers but ensure proper routing in `vercel.json`.

**Recommended Approach**: Option A - Consolidate to single handler
- Delete `api/enrollment.mjs` (duplicate)
- Ensure `api/[...path].mjs` properly routes all `/api/enrollment/*` requests
- Test all enrollment endpoints

### Solution 2: Fix Lesson Durations

**Immediate Fix**:
1. Run the video duration measurement tool in the browser (already exists at `/measure-video-durations`)
2. Copy the generated SQL UPDATE statements
3. Execute them in Supabase SQL editor

**Long-term Fix**:
1. Create a migration script that measures actual video durations
2. Update the database with correct values
3. Add validation to prevent incorrect durations from being saved

## Action Items

### Priority 1: Fix Enrollment 404 (Blocking)
- [ ] Delete `api/enrollment.mjs` to remove duplication
- [ ] Verify `api/[...path].mjs` catches all enrollment routes
- [ ] Test enrollment flow in Vercel preview deployment
- [ ] Verify authentication token is properly passed

### Priority 2: Fix Lesson Durations (User-facing bug)
- [ ] Navigate to `/measure-video-durations` page in production
- [ ] Run the video duration measurement
- [ ] Copy generated SQL statements
- [ ] Execute SQL in Supabase to update durations
- [ ] Verify course details pages show correct durations

## Testing Checklist

### Enrollment API Testing
- [ ] GET `/api/enrollment/status/:courseSlug` returns 200
- [ ] POST `/api/enrollment/enroll` creates enrollment
- [ ] GET `/api/enrollment/user/me` returns user enrollments
- [ ] GET `/api/enrollment/access/:courseSlug` returns access contract
- [ ] All endpoints require authentication
- [ ] 401 returned for unauthenticated requests

### Duration Display Testing
- [ ] Course details page shows correct total duration
- [ ] Individual lesson durations are accurate
- [ ] Duration format is consistent (e.g., "5 min", "1 hr 30 min")
- [ ] Course cards show correct durations

## Files to Modify

### For Enrollment Fix:
1. `api/enrollment.mjs` - DELETE (duplicate)
2. `vercel.json` - Verify routing (may not need changes)
3. Test in Vercel deployment

### For Duration Fix:
1. Navigate to production `/measure-video-durations`
2. Run measurement tool
3. Execute generated SQL in Supabase
4. No code changes needed

## Notes

- The enrollment API duplication suggests a refactoring was incomplete
- The duration issue is data-related, not code-related
- Both issues are straightforward to fix once identified
- Consider adding integration tests for API routes
- Consider automating video duration updates
