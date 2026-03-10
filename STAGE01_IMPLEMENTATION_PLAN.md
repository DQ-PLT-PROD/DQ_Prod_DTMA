# DTMA Sprint 0 - Stage01 Implementation Plan
## Course Catalog & Course Details Stabilization

**Owner:** Dev D  
**Sprint:** Sprint 0 (Platform Stabilization)  
**Stage:** Stage01 – Course Marketplace / Catalog  
**Status:** In Progress

---

## Executive Summary

Stage01 focuses on ensuring the course catalog and course details pages continue to function correctly after RLS hardening. Based on codebase analysis, the current implementation has permissive RLS policies that allow public read access to all course data, including potentially unpublished courses.

### Key Findings

1. **Current RLS Policy:** Courses table uses `USING (true)` for public read access
2. **Application-Level Filtering:** Status filtering happens in application code, not database policy
3. **Security Gap:** Unpublished/draft courses may be accessible if status filter is bypassed
4. **Frontend Compatibility:** Current queries should work with hardened RLS if policies are properly scoped

---

## Task Breakdown

### Task D1: Validate Catalog Queries After RLS Activation

**Status:** Ready for Testing  
**Estimated Effort:** 0.5 day

#### Current Implementation
- `fetchCourses()` in `src/services/courseService.ts` handles catalog queries
- Uses `.eq('status', 'published')` filter at application level
- Joins with `course_categories` and `lessons` tables
- Implements caching with 5-minute TTL

#### Actions Required
1. ✅ Run validation test script: `node test-stage01-catalog.mjs`
2. Verify catalog queries work with current RLS
3. Test with/without authentication
4. Validate category and lesson joins work correctly

#### Acceptance Criteria
- [x] Catalog loads successfully
- [ ] Queries operate under public read policies
- [ ] No RLS violations occur
- [ ] Category and lesson joins work

---

### Task D2: Verify Course Details Page

**Status:** Ready for Testing  
**Estimated Effort:** 0.5 day

#### Current Implementation
- `CourseDetailsPage.tsx` fetches single course by slug
- Uses same query pattern as catalog with additional metadata
- Includes lessons, categories, and course resources

#### Actions Required
1. Test course details query with published course
2. Verify all metadata fields are accessible
3. Test with various course slugs
4. Validate related data (lessons, categories) loads correctly

#### Acceptance Criteria
- [ ] Course details page loads successfully
- [ ] Course metadata appears correctly
- [ ] No unauthorized access errors occur
- [ ] Related data (lessons, categories) accessible

---

### Task D3: Ensure Only Published Courses Are Public

**Status:** ⚠️ Security Gap Identified  
**Estimated Effort:** 0.5 day

#### Current Implementation
- RLS policy: `CREATE POLICY "Public Read Access: courses" ON public.courses FOR SELECT USING (true)`
- Status filtering happens in application code only
- No database-level enforcement of published status

#### Security Issue
The current RLS policy allows public read access to ALL courses regardless of status. This means:
- Draft courses are technically accessible if status filter is bypassed
- Unpublished courses could be discovered through direct queries
- No defense-in-depth at database level

#### Recommended Fix
Update RLS policy to enforce published status at database level:

```sql
-- Drop existing permissive policy
DROP POLICY IF EXISTS "Public Read Access: courses" ON public.courses;

-- Create status-aware policy
CREATE POLICY "Public can read published courses" ON public.courses
FOR SELECT USING (status = 'published');

-- Service role still has full access for admin operations
CREATE POLICY "Service role full access" ON public.courses
FOR ALL USING (auth.role() = 'service_role');
```

#### Actions Required
1. ✅ Create RLS policy update script
2. Test unpublished course access (should be blocked)
3. Test draft course access (should be blocked)
4. Verify published courses remain accessible
5. Test admin/service role access still works

#### Acceptance Criteria
- [ ] Unpublished courses are not visible in catalog
- [ ] Only approved/published courses appear publicly
- [ ] Direct queries for draft courses are blocked
- [ ] Service role can still access all courses

---

### Task D4: Adjust Frontend Data Fetching If Needed

**Status:** Ready for Testing  
**Estimated Effort:** 0.5 day

#### Current Implementation
- Frontend uses anon key for public queries
- Service role used for enrollment operations
- Queries include status filter at application level

#### Actions Required
1. Test current frontend queries with hardened RLS
2. Verify no breaking changes needed
3. Test filtered queries (category, audience level, search)
4. Validate ordering and pagination work

#### Potential Adjustments
If RLS policy is updated per Task D3, no frontend changes should be needed because:
- Application already filters for `status = 'published'`
- RLS policy will enforce same constraint at database level
- This provides defense-in-depth without breaking changes

#### Acceptance Criteria
- [ ] Catalog queries succeed under new security policies
- [ ] Frontend uses approved data access paths
- [ ] Filtered queries work correctly
- [ ] Search functionality works
- [ ] No performance degradation

---

## Validation Tests

### Test Script
Created `test-stage01-catalog.mjs` with comprehensive validation:

1. **Catalog Query Tests**
   - Basic catalog query with published filter
   - Catalog with category joins
   - Catalog with lesson joins

2. **Course Details Tests**
   - Full course details query
   - Metadata access verification

3. **Security Tests**
   - Unpublished courses hidden
   - Draft course access blocked
   - Published filter enforcement

4. **Frontend Compatibility Tests**
   - Frontend catalog query pattern
   - Filtered queries
   - Search queries

### Running Tests
```bash
node test-stage01-catalog.mjs
```

---

## RLS Policy Updates

### Current Policy (Permissive)
```sql
CREATE POLICY "Public Read Access: courses" ON public.courses
FOR SELECT USING (true);
```

### Recommended Policy (Hardened)
```sql
-- Public can only read published courses
CREATE POLICY "Public can read published courses" ON public.courses
FOR SELECT USING (status = 'published');

-- Service role has full access
CREATE POLICY "Service role full access" ON public.courses
FOR ALL USING (auth.role() = 'service_role');
```

### Implementation Script
Create `supabase/migrations/029_harden_courses_rls.sql`:

```sql
-- DTMA Sprint 0 - Stage01: Harden Courses RLS
-- Ensure only published courses are publicly accessible

BEGIN;

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Public Read Access: courses" ON public.courses;

-- Create status-aware public read policy
CREATE POLICY "Public can read published courses" ON public.courses
FOR SELECT USING (status = 'published');

-- Ensure service role has full access for admin operations
DROP POLICY IF EXISTS "Service role full access" ON public.courses;
CREATE POLICY "Service role full access" ON public.courses
FOR ALL USING (auth.role() = 'service_role');

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'courses'
ORDER BY policyname;

COMMIT;
```

---

## Dependencies & Coordination

### Upstream Dependencies
- None (Stage01 is independent)

### Downstream Impact
- **Stage02 (Enrollment):** Uses course queries, should not be affected
- **Stage03 (Learning):** Depends on course/lesson access, coordinate on lesson RLS
- **Stage04 (Progress):** No direct dependency

### Cross-Stage Coordination
- Coordinate with Stage03 on lesson table RLS policies
- Ensure enrollment checks still work after RLS hardening
- Validate preview lesson access remains functional

---

## Risk Assessment

### High Risk
- ⚠️ **Unpublished Course Exposure:** Current RLS allows access to all courses
  - **Mitigation:** Implement status-based RLS policy immediately

### Medium Risk
- Frontend queries may fail if RLS is too restrictive
  - **Mitigation:** Test thoroughly before deploying
- Performance impact from RLS policy evaluation
  - **Mitigation:** Monitor query performance, add indexes if needed

### Low Risk
- Breaking changes to existing functionality
  - **Mitigation:** Application already filters for published status

---

## Timeline

| Task | Estimated | Status |
|------|-----------|--------|
| D1: Catalog validation | 0.5 day | Ready |
| D2: Course details validation | 0.5 day | Ready |
| D3: Published filtering | 0.5 day | In Progress |
| D4: Frontend compatibility | 0.5 day | Ready |
| **Total** | **2 days** | **In Progress** |

---

## Next Steps

1. ✅ Run validation test script
2. Create RLS hardening migration
3. Test RLS policy in development
4. Coordinate with other stage owners
5. Deploy to staging
6. Validate in staging environment
7. Report completion

---

## Reporting Template

```
Stage01 Status Update - [Date]

✅ Catalog validation: [done/in progress/blocked]
✅ Course details page: [done/in progress/blocked]
⚠️  Published course filtering: [done/in progress/blocked]
✅ Query adjustments: [done/in progress/blocked]

Issues:
- Current RLS policy allows access to unpublished courses
- Recommended hardening: status-based RLS policy

Next: [Next action item]
```

---

## Definition of Done

Stage01 remediation is complete when:

- [x] Test script created and documented
- [ ] Catalog loads successfully with RLS enabled
- [ ] Course details page works correctly
- [ ] Only published courses appear publicly (RLS enforced)
- [ ] No RLS violations occur
- [ ] Platform security posture improved
- [ ] All validation tests pass
- [ ] Documentation updated
- [ ] Changes deployed to staging
- [ ] Sign-off from tech lead
