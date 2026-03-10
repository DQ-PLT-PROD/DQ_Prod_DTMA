# DTMA Sprint 0 - Stage01 Testing Guide
## Course Catalog & Course Details Stabilization

**Owner:** Dev D  
**Sprint:** Sprint 0 (Platform Stabilization)  
**Last Updated:** March 10, 2026

---

## Overview

This guide provides comprehensive testing instructions for Stage01 remediation work, which focuses on ensuring the course catalog and course details pages continue to function correctly after RLS hardening.

---

## Quick Start

### Run Automated Tests
```bash
node test-stage01-catalog.mjs
```

Expected output: All 11 tests passing (100% success rate)

---

## Test Categories

### 1. Catalog Query Tests (Task D1)

These tests validate that catalog queries work correctly with RLS policies.

#### Test 1.1: Basic Catalog Query
**Purpose:** Verify catalog can fetch published courses

**Test Command:**
```javascript
const { data, error } = await supabase
  .from('courses')
  .select('id, slug, title, status, is_featured')
  .eq('status', 'published')
  .limit(10)
```

**Expected Result:**
- ✅ Query succeeds without errors
- ✅ Returns only published courses
- ✅ All returned courses have status='published'

**Manual Verification:**
1. Open browser to catalog page
2. Verify courses display
3. Check browser console for errors

---

#### Test 1.2: Category Join Query
**Purpose:** Verify catalog can join with course_categories table

**Test Command:**
```javascript
const { data, error } = await supabase
  .from('courses')
  .select('*, course_categories(name)')
  .eq('status', 'published')
  .limit(5)
```

**Expected Result:**
- ✅ Query succeeds with join
- ✅ Category data is included
- ✅ No RLS violations

**Manual Verification:**
1. Open catalog page
2. Verify category filters work
3. Check category badges on course cards

---

#### Test 1.3: Lessons Join Query
**Purpose:** Verify catalog can join with lessons table

**Test Command:**
```javascript
const { data, error } = await supabase
  .from('courses')
  .select('*, lessons(id, title, type)')
  .eq('status', 'published')
  .limit(3)
```

**Expected Result:**
- ✅ Query succeeds with join
- ✅ Lesson data is included
- ✅ Lesson count is accurate

**Manual Verification:**
1. Open catalog page
2. Verify lesson count displays on cards
3. Check duration calculations

---

### 2. Course Details Tests (Task D2)

These tests validate that course details pages load correctly.

#### Test 2.1: Course Details Query
**Purpose:** Verify full course details can be fetched

**Test Command:**
```javascript
const { data, error } = await supabase
  .from('courses')
  .select(`
    *,
    course_categories(name, slug),
    lessons(id, title, type, order_index, is_preview, estimated_duration_minutes)
  `)
  .eq('slug', courseSlug)
  .eq('status', 'published')
  .single()
```

**Expected Result:**
- ✅ Query succeeds
- ✅ All course metadata present
- ✅ Category data included
- ✅ Lessons data included

**Manual Verification:**
1. Open a course details page
2. Verify all sections display:
   - Hero image
   - Course title and description
   - Category badge
   - Lessons list
   - Enrollment button
3. Check for console errors

---

#### Test 2.2: Metadata Access
**Purpose:** Verify all course metadata fields are accessible

**Test Command:**
```javascript
const { data, error } = await supabase
  .from('courses')
  .select(`
    id, slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, hero_image_url,
    intro_video_url, is_featured, status, rating, review_count
  `)
  .eq('status', 'published')
  .limit(1)
  .single()
```

**Expected Result:**
- ✅ All fields accessible
- ✅ No missing data errors
- ✅ Proper data types

**Manual Verification:**
1. Open course details page
2. Verify all metadata displays correctly
3. Check images load
4. Verify video player works (if applicable)

---

### 3. Security Tests (Task D3)

These tests validate that only published courses are publicly accessible.

#### Test 3.1: Unpublished Courses Hidden
**Purpose:** Verify unpublished courses don't appear in catalog

**Test Command:**
```javascript
const { data, error } = await supabase
  .from('courses')
  .select('id, slug, title, status')
```

**Expected Result:**
- ✅ Only published courses returned
- ✅ No draft/unpublished courses visible
- ⚠️ Current: May return all courses (permissive RLS)
- ✅ After hardening: Only published courses

**Manual Verification:**
1. Open catalog page
2. Count visible courses
3. Compare with database count of published courses
4. Verify no draft courses appear

---

#### Test 3.2: Draft Course Access
**Purpose:** Verify draft courses cannot be accessed directly

**Test Command:**
```javascript
const { data, error } = await supabase
  .from('courses')
  .select('id, slug, title, status')
  .eq('status', 'draft')
  .limit(1)
```

**Expected Result:**
- ⚠️ Current: May return draft courses (permissive RLS)
- ✅ After hardening: RLS blocks access or returns empty

**Manual Verification:**
1. Try to access a draft course by URL
2. Should see 404 or access denied
3. Verify not listed in catalog

---

#### Test 3.3: Published Filter Enforcement
**Purpose:** Verify published filter works correctly

**Test Command:**
```javascript
const { data, error } = await supabase
  .from('courses')
  .select('id, status')
  .eq('status', 'published')
```

**Expected Result:**
- ✅ All returned courses have status='published'
- ✅ Filter is enforced

**Manual Verification:**
1. Check catalog page
2. Verify only published courses appear
3. Test with different filters applied

---

### 4. Frontend Compatibility Tests (Task D4)

These tests validate that frontend queries work with RLS policies.

#### Test 4.1: Frontend Catalog Query
**Purpose:** Verify exact frontend query pattern works

**Test Command:**
```javascript
const { data, error } = await supabase
  .from('courses')
  .select('*, course_categories(name), lessons(type, estimated_duration_minutes)')
  .eq('status', 'published')
  .order('is_coming_soon', { ascending: true })
  .order('created_at', { ascending: false })
```

**Expected Result:**
- ✅ Query succeeds
- ✅ Proper ordering (available first, then by date)
- ✅ All joins work

**Manual Verification:**
1. Open catalog page
2. Verify courses display in correct order
3. Check featured courses appear first
4. Verify coming soon courses appear last

---

#### Test 4.2: Filtered Catalog Query
**Purpose:** Verify filtered queries work

**Test Command:**
```javascript
const { data, error } = await supabase
  .from('courses')
  .select('*, course_categories(name)')
  .eq('status', 'published')
  .eq('is_featured', true)
```

**Expected Result:**
- ✅ Query succeeds
- ✅ Only featured courses returned
- ✅ Filters work correctly

**Manual Verification:**
1. Open catalog page
2. Apply category filter
3. Apply audience level filter
4. Apply multiple filters
5. Verify results are correct

---

#### Test 4.3: Search Query
**Purpose:** Verify search functionality works

**Test Command:**
```javascript
const searchTerm = 'digital'
const { data, error } = await supabase
  .from('courses')
  .select('id, title, short_description, status')
  .eq('status', 'published')
  .or(`title.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`)
```

**Expected Result:**
- ✅ Query succeeds
- ✅ Returns matching courses
- ✅ Search is case-insensitive

**Manual Verification:**
1. Open catalog page
2. Enter search term
3. Verify results match search
4. Test various search terms
5. Test empty search

---

## RLS Hardening

### Current State (Before Hardening)

**Policy:**
```sql
CREATE POLICY "Public Read Access: courses" ON public.courses
FOR SELECT USING (true);
```

**Security Assessment:**
- ⚠️ Permissive - allows access to all courses
- ⚠️ Status filtering only at application level
- ⚠️ No defense-in-depth

### Recommended Hardening (Migration 029)

**Policy:**
```sql
-- Public can only read published courses
CREATE POLICY "Public can read published courses" ON public.courses
FOR SELECT USING (status = 'published');

-- Service role has full access
CREATE POLICY "Service role full access courses" ON public.courses
FOR ALL USING (auth.role() = 'service_role');
```

**Benefits:**
- ✅ Database-level enforcement
- ✅ Defense-in-depth security
- ✅ No breaking changes
- ✅ Service role access maintained

### Applying the Migration

**Step 1: Review Migration**
```bash
cat supabase/migrations/029_harden_courses_rls.sql
```

**Step 2: Apply to Development**
```bash
# Using Supabase CLI
supabase db push

# Or apply directly in Supabase SQL Editor
```

**Step 3: Verify Policies**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('courses', 'lessons', 'course_resources', 'quizzes')
ORDER BY tablename, policyname;
```

**Step 4: Run Tests**
```bash
node test-stage01-catalog.mjs
```

**Expected:** All tests still pass

---

## Manual Testing Checklist

### Pre-Deployment Testing

- [ ] Run automated test suite
- [ ] All tests pass (11/11)
- [ ] Review test output for warnings
- [ ] Check Supabase logs for errors

### Catalog Page Testing

- [ ] Navigate to `/courses`
- [ ] Verify courses load
- [ ] Test category filters
- [ ] Test audience level filters
- [ ] Test level tag filters
- [ ] Test industry filters
- [ ] Test topic filters
- [ ] Test search functionality
- [ ] Test sorting
- [ ] Test pagination (if applicable)
- [ ] Verify only published courses appear
- [ ] Check performance (load time < 2s)

### Course Details Page Testing

- [ ] Open a course details page
- [ ] Verify hero image loads
- [ ] Check course title displays
- [ ] Verify description appears
- [ ] Check category badge
- [ ] Verify lessons list displays
- [ ] Check lesson count is accurate
- [ ] Verify duration calculation
- [ ] Test enrollment button
- [ ] Check preview lessons (if any)
- [ ] Verify related courses section
- [ ] Test breadcrumb navigation
- [ ] Check responsive design

### Security Testing

- [ ] Try to access unpublished course by slug
- [ ] Verify 404 or access denied
- [ ] Check draft courses don't appear in catalog
- [ ] Test direct database queries
- [ ] Verify service role still has access
- [ ] Check RLS policies in Supabase dashboard

### Performance Testing

- [ ] Measure catalog page load time
- [ ] Check query performance in Supabase
- [ ] Verify caching works (5-minute TTL)
- [ ] Test with 10+ courses
- [ ] Check network tab for slow queries
- [ ] Verify no N+1 query issues

### Cross-Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

---

## Troubleshooting

### Issue: Catalog not loading

**Symptoms:**
- Blank page
- Loading spinner indefinitely
- Console errors

**Diagnosis:**
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify Supabase connection
4. Check RLS policies

**Solution:**
```javascript
// Test Supabase connection
import { getSupabase } from './lib/supabase/client'
const supabase = getSupabase()
const { data, error } = await supabase.from('courses').select('count')
console.log('Connection test:', { data, error })
```

---

### Issue: RLS policy too restrictive

**Symptoms:**
- Queries fail with permission errors
- Empty results when data exists
- "permission denied" errors

**Diagnosis:**
1. Check RLS policies in Supabase dashboard
2. Verify using correct Supabase key (anon vs service)
3. Check policy conditions

**Solution:**
```sql
-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'courses';

-- Test with service role
-- Should have full access
```

---

### Issue: Unpublished courses visible

**Symptoms:**
- Draft courses appear in catalog
- Can access unpublished courses by URL

**Diagnosis:**
1. Check RLS policies
2. Verify status filter in queries
3. Check application-level filtering

**Solution:**
Apply RLS hardening migration:
```bash
supabase db push
```

---

## Performance Benchmarks

### Target Metrics

- Catalog page load: < 2 seconds
- Course details load: < 1.5 seconds
- Search response: < 500ms
- Filter application: < 300ms

### Monitoring

Check Supabase dashboard for:
- Query execution time
- Number of queries per page load
- Cache hit rate
- RLS policy evaluation time

---

## Reporting

### Daily Standup Template

```
Stage01 Status Update - [Date]

✅ Catalog validation: Complete
✅ Course details page: Complete
✅ Published course filtering: Complete
✅ Query adjustments: Complete

Test Results: 11/11 passing (100%)

Issues: None

Next: [Next action]
```

---

## Sign-off Criteria

Stage01 is complete when:

- [x] All automated tests pass (11/11)
- [ ] RLS hardening migration applied
- [ ] Manual testing complete
- [ ] No security vulnerabilities
- [ ] Performance meets targets
- [ ] Documentation updated
- [ ] Code review approved
- [ ] Deployed to staging
- [ ] Validated in staging
- [ ] Tech lead sign-off

---

## Related Documentation

- [Stage01 Implementation Plan](../../STAGE01_IMPLEMENTATION_PLAN.md)
- [Stage01 Test Checklist](../../STAGE01_TEST_CHECKLIST.md)
- [RLS Hardening Migration](../../supabase/migrations/029_harden_courses_rls.sql)
- [Course Service](../../src/services/courseService.ts)
- [Catalog Page](../../src/features/courses/pages/CourseCatalogPage.tsx)
- [Course Details Page](../../src/features/courses/pages/CourseDetailsPage.tsx)
