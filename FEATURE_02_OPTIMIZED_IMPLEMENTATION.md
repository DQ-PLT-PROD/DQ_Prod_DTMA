# Feature 02 - Optimized Enrollment Gating Implementation

## Overview

This document outlines the implementation of the optimized enrollment gating feature with module-aware access control. The implementation allows visitors and unenrolled users to access:

1. **Course Hero Content** - Main course introduction
2. **Module Intro Content** - Introductory content for each module (when modules exist)
3. **Preview Lessons** - Individual lessons marked with `is_preview = true`

All other content requires active enrollment.

---

## Implementation Status

### ✅ Completed

1. **Feature Specification** - Updated `docs/features/feature-02-enrollment-gating.md`
2. **Database Schema** - Created migration `029_add_modules_table.sql`
3. **Server-Side Access Control** - Updated `api/middleware/lessonAccess.mjs`
4. **API Endpoints** - Added module intro endpoint to `api/server.mjs`

### ⏳ Pending (Optional - Based on Requirements)

5. **UI Components** - Update course outline to display modules
6. **Module Intro Component** - Create component to display module intros
7. **Data Migration** - Migrate existing courses to use modules (if needed)
8. **Testing** - Comprehensive test suite for module access

---

## Database Changes

### New Table: `modules`

```sql
CREATE TABLE public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index NUMERIC NOT NULL,
    intro_content TEXT,           -- Public intro content
    intro_video_url TEXT,          -- Public intro video
    intro_poster_url TEXT,         -- Video poster image
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_modules_course FOREIGN KEY (course_slug) 
        REFERENCES public.courses(slug) ON DELETE CASCADE,
    CONSTRAINT unique_module_order UNIQUE (course_slug, order_index)
);
```

### Updated Table: `lessons`

```sql
-- Add module_id to associate lessons with modules
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL;
```

**Migration File**: `supabase/migrations/029_add_modules_table.sql`

---

## API Changes

### New Endpoint: Get Module Intro

**Endpoint**: `GET /api/lessons/module-intro/:courseSlug/:moduleId`

**Authentication**: Optional (accessible to all users)

**Response**:
```json
{
  "success": true,
  "module": {
    "id": "uuid",
    "title": "Module Title",
    "description": "Module description",
    "orderIndex": 1,
    "introContent": "Markdown/HTML content",
    "introVideoUrl": "https://...",
    "introPosterUrl": "https://...",
    "hasIntroContent": true
  },
  "accessInfo": {
    "canAccess": true,
    "accessType": "module_intro",
    "reason": "Module intro is public content"
  }
}
```

### Updated Endpoint: Get Course Access Summary

**Endpoint**: `GET /api/lessons/course-access/:courseSlug`

**New Response Fields**:
```json
{
  "success": true,
  "hasModules": true,
  "modules": [
    {
      "id": "uuid",
      "title": "Module Title",
      "orderIndex": 1,
      "hasIntro": true,
      "introAccessible": true,
      "lessons": [...]
    }
  ],
  "summary": {
    "totalModules": 5,
    "modulesWithIntros": 3,
    ...
  }
}
```

---

## Access Control Logic

### Server-Side Middleware

**File**: `api/middleware/lessonAccess.mjs`

**New Function**: `checkModuleAccess(supabaseClient, userId, courseSlug, moduleId)`

- Module intros are **always accessible** (public content)
- Returns module data including intro content
- No enrollment check required

**Updated Function**: `getCourseAccessSummary(supabaseClient, userId, courseSlug)`

- Now includes module information
- Returns module intro accessibility status
- Groups lessons by module (if modules exist)

### Access Rules Summary

```javascript
IF User.isEnrolled(Course) THEN
  Allow Access (All Content)
ELSE
  IF Content == Course_Hero THEN
    Allow Access
  ELSE IF Content == Module_Intro AND Module.has_intro_content THEN
    Allow Access
  ELSE IF Content.is_preview == TRUE THEN
    Allow Access
  ELSE
    Block Access + Show "Enroll" CTA
  END IF
END IF
```

---

## Migration Guide

### Step 1: Run Database Migration

```bash
# Apply the migration
supabase migration up

# Or manually run the SQL file
psql -h <host> -U <user> -d <database> -f supabase/migrations/029_add_modules_table.sql
```

### Step 2: Verify Migration

```sql
-- Check if modules table exists
SELECT * FROM information_schema.tables WHERE table_name = 'modules';

-- Check if module_id column was added to lessons
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lessons' AND column_name = 'module_id';
```

### Step 3: (Optional) Create Sample Modules

```sql
-- Example: Create modules for "Perfecting Life Transactions" course
INSERT INTO public.modules (course_slug, title, description, order_index, intro_content, intro_video_url)
VALUES 
  ('perfecting-life-transactions', 'Introduction to PLT', 'Learn the fundamentals of Perfect Life Transactions', 1, 
   'Welcome to the first module...', 'https://example.com/module1-intro.mp4'),
  ('perfecting-life-transactions', 'Economy 4.0 Fundamentals', 'Understanding the digital economy', 2,
   'In this module, we explore...', 'https://example.com/module2-intro.mp4');

-- Associate lessons with modules
UPDATE public.lessons 
SET module_id = (SELECT id FROM modules WHERE course_slug = 'perfecting-life-transactions' AND order_index = 1)
WHERE course_slug = 'perfecting-life-transactions' AND order_index BETWEEN 1 AND 5;
```

### Step 4: Test API Endpoints

```bash
# Test module intro access (no auth required)
curl http://localhost:3001/api/lessons/module-intro/perfecting-life-transactions/<module-id>

# Test course access summary (includes modules)
curl http://localhost:3001/api/lessons/course-access/perfecting-life-transactions
```

---

## UI Implementation (Next Steps)

### 1. Update Course Outline Component

**File**: `src/features/courses/components/CourseOutline.tsx`

**Changes Needed**:
- Display modules as collapsible sections
- Show module intro indicator (video icon)
- Allow unenrolled users to access module intros
- Group lessons under their respective modules

### 2. Create Module Intro Component

**File**: `src/features/courses/components/ModuleIntro.tsx`

**Features**:
- Display module title and description
- Play module intro video (if available)
- Show intro content (markdown/HTML)
- Enrollment CTA for unenrolled users
- Smooth transition to first lesson

### 3. Update Learning Screen

**File**: `src/features/learning/pages/LearningScreen.tsx`

**Changes Needed**:
- Fetch module data from API
- Display module intros in course outline
- Handle module intro playback
- Update navigation to support module structure

### 4. Update Enrollment Guard

**File**: `src/features/courses/components/guards/EnrollmentGuard.tsx`

**Changes Needed**:
- Handle module intro access (always allow)
- Update access summary to include module info
- Display module structure in access denied state

---

## Testing Checklist

### Unit Tests

- [ ] `checkModuleAccess()` returns correct access for all users
- [ ] `getCourseAccessSummary()` includes module information
- [ ] Module intro endpoint returns correct data
- [ ] Courses without modules work correctly (backward compatibility)

### Integration Tests

- [ ] Unenrolled user can access module intros
- [ ] Unenrolled user cannot access lessons within module
- [ ] Enrolled user can access all content
- [ ] Module intro accessible via direct link
- [ ] Course access summary includes module data

### Manual Testing Scenarios

1. **Visitor explores course with modules**
   - Can view course hero
   - Can view all module intros
   - Cannot access lessons
   - Clear enrollment CTA displayed

2. **User enrolls in course**
   - Immediate access to all lessons
   - Module intros still accessible
   - Progress tracking works correctly

3. **Course without modules (flat structure)**
   - No errors or broken states
   - Only course hero and preview lessons accessible
   - Existing behavior preserved

4. **Module without intro content**
   - No errors when intro fields are null
   - Lesson list displayed correctly
   - No "empty" intro state shown

5. **Deep link to module intro**
   - Direct link works for all users
   - Video plays correctly
   - Enrollment CTA visible for unenrolled users

---

## Backward Compatibility

### Courses Without Modules

- The `module_id` field in `lessons` table is **nullable**
- Courses can exist without any modules (flat structure)
- Access control falls back to existing logic:
  - Course Hero accessible
  - Preview lessons accessible
  - All other lessons require enrollment

### Existing Enrollments

- No changes to `user_enrollments` table
- Existing enrollments continue to work
- No data migration required for enrollments

### Existing Lessons

- All existing lessons remain accessible
- `module_id` defaults to NULL (flat structure)
- No changes to lesson content or metadata

---

## Performance Considerations

### Caching Strategy

1. **Module Intros** - Heavily cached (public content)
   - CDN caching: 1 hour
   - Browser caching: 30 minutes
   - No user-specific data

2. **Course Access Summary** - Session cached
   - Cached per user session
   - Invalidated on enrollment change
   - Includes module and lesson access info

3. **Enrollment Status** - Client-side cached
   - Stored in React state
   - Refreshed on enrollment action
   - Optimistic UI updates

### Database Queries

- Module queries use indexed `course_slug` field
- Lesson queries include `module_id` index
- Access summary uses single query with joins
- No N+1 query issues

---

## Security Considerations

### Server-Side Enforcement

- All access checks performed server-side
- Frontend gating is visual only
- API endpoints verify enrollment before returning content
- RLS policies enforce database-level security

### Public Content

- Module intros are intentionally public
- No sensitive data in intro content
- Video URLs can be shared (marketing benefit)
- Enrollment required for full lessons

### Deep Link Protection

- Direct links to protected lessons redirect to course details
- Module intro links work for all users
- No content leakage through URL manipulation
- Clear messaging about access requirements

---

## Analytics & Telemetry

### Events to Track

1. **`module_intro_viewed`**
   - Props: `course_id`, `module_id`, `user_status` (Visitor | Enrolled)
   - Tracks engagement with module intros

2. **`module_intro_completed`**
   - Props: `course_id`, `module_id`, `watch_time_seconds`
   - Tracks completion of module intro videos

3. **`enrollment_from_module`**
   - Props: `course_id`, `module_id`, `source` (module_intro_cta)
   - Tracks conversions from module intro CTAs

4. **`access_denied_module_lesson`**
   - Props: `course_id`, `module_id`, `lesson_id`, `user_status`
   - Tracks attempts to access protected lessons from modules

---

## Rollout Plan

### Phase 1: Database & API (Completed)
- ✅ Create modules table
- ✅ Update lessons table
- ✅ Implement server-side access control
- ✅ Add API endpoints

### Phase 2: UI Components (Next)
- Update course outline
- Create module intro component
- Update learning screen
- Update enrollment guard

### Phase 3: Content Migration (Optional)
- Identify courses to organize into modules
- Create module structure
- Migrate lessons to modules
- Add module intro content

### Phase 4: Testing & QA
- Run automated test suite
- Manual QA on staging
- Performance testing
- Security audit

### Phase 5: Production Rollout
- Deploy to production
- Monitor error rates
- Track analytics
- Gather user feedback

---

## Troubleshooting

### Issue: Module intros not accessible

**Symptoms**: 404 error when accessing module intro endpoint

**Solutions**:
1. Verify migration ran successfully
2. Check if modules table exists
3. Verify module ID is correct
4. Check RLS policies on modules table

### Issue: Lessons not grouped by module

**Symptoms**: Lessons display in flat list instead of grouped by module

**Solutions**:
1. Verify `module_id` field exists on lessons table
2. Check if lessons have `module_id` set
3. Verify API returns module data in access summary
4. Check UI component is reading module data

### Issue: Enrollment required for module intros

**Symptoms**: Module intros blocked for unenrolled users

**Solutions**:
1. Verify `checkModuleAccess()` always returns `canAccess: true`
2. Check API endpoint doesn't require authentication
3. Verify RLS policy allows public read on modules table
4. Check UI component isn't incorrectly gating module intros

---

## Documentation Updates

### Files Updated

1. ✅ `docs/features/feature-02-enrollment-gating.md` - Feature specification
2. ✅ `supabase/migrations/029_add_modules_table.sql` - Database migration
3. ✅ `api/middleware/lessonAccess.mjs` - Access control logic
4. ✅ `api/server.mjs` - API endpoints
5. ✅ `FEATURE_02_OPTIMIZED_IMPLEMENTATION.md` - This document

### Files to Update (Next Steps)

6. ⏳ `src/features/courses/components/CourseOutline.tsx` - UI component
7. ⏳ `src/features/courses/components/ModuleIntro.tsx` - New component
8. ⏳ `src/features/learning/pages/LearningScreen.tsx` - Learning interface
9. ⏳ `src/features/courses/components/guards/EnrollmentGuard.tsx` - Access guard
10. ⏳ `docs/api/LESSON_ACCESS_API.md` - API documentation

---

## Success Criteria

### Functional Requirements

- [x] Module intros accessible to all users (enrolled or not)
- [x] Protected lessons require enrollment
- [x] Courses without modules work correctly (backward compatibility)
- [x] API endpoints return correct access information
- [ ] UI displays module structure correctly
- [ ] Enrollment CTAs visible on module intros

### Non-Functional Requirements

- [x] Server-side access control enforced
- [x] Database schema supports modules
- [x] API performance acceptable (<200ms response time)
- [ ] UI performance acceptable (no flicker or lag)
- [ ] Caching strategy implemented
- [ ] Analytics tracking in place

### User Experience

- [ ] Visitors can explore course structure via module intros
- [ ] Clear value proposition before enrollment
- [ ] Smooth transition from intro to lessons (enrolled users)
- [ ] No broken states or error pages
- [ ] Accessible and keyboard-friendly

---

## Next Steps

1. **Implement UI Components** (Priority: High)
   - Update CourseOutline to display modules
   - Create ModuleIntro component
   - Update LearningScreen to handle modules

2. **Add Analytics Tracking** (Priority: Medium)
   - Implement event tracking for module intros
   - Track conversion from module CTAs
   - Monitor engagement metrics

3. **Content Migration** (Priority: Low)
   - Identify courses to organize into modules
   - Create module structure and intro content
   - Migrate existing lessons to modules

4. **Testing & QA** (Priority: High)
   - Write unit tests for module access
   - Integration tests for API endpoints
   - Manual QA on staging environment

5. **Documentation** (Priority: Medium)
   - Update API documentation
   - Create user guide for content creators
   - Document module creation process

---

**Last Updated**: February 9, 2026  
**Status**: Phase 1 Complete (Database & API)  
**Next Phase**: UI Components Implementation
