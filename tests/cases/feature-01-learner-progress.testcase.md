# Test Case Document: Feature 01 - Learner Progress Persistence

## Feature Overview

| Field | Value |
|-------|-------|
| **Feature Name** | Learner Progress Persistence |
| **Spec Reference** | [feature-01-learner-progress.md](file:///c:/Users/user/OneDrive/Documents/DQ_Prod_DTMA/DTMA%20Specs/feature-01-learner-progress.md) |
| **Target Delivery** | Jan 16 |
| **Status** | Planned |

## Scope

### In Scope
- Persist lesson progress per authenticated learner
- Restore progress on learning page load
- Track: last accessed lesson, per-lesson completion state, video position

### Out of Scope
- XP, badges, leaderboards
- Instructor analytics or reporting
- AI recommendations
- Offline-first sync beyond basic fallback
- Quiz attempt analytics

---

## Assumptions & Dependencies

| Category | Assumption/Dependency |
|----------|----------------------|
| **Auth** | User is authenticated via Azure AD (MSAL) |
| **Database** | Supabase is configured and accessible |
| **Tables** | `user_enrollments`, `lesson_progress`, `lessons` tables exist |
| **Service** | `progressService.ts` exports required functions |
| **Fallback** | localStorage may contain legacy progress data |

---

## Test Data Requirements

### Mock Users
```typescript
const mockUser = { userId: 'user-123' };
```

### Mock Enrollments
```typescript
const mockEnrollment = {
  id: 'enroll-1',
  user_id: 'user-123',
  course_slug: 'intro-to-testing',
  started_at: '2024-01-01T00:00:00Z',
  last_accessed_at: '2024-01-15T00:00:00Z',
  progress_pct: 50,
};
```

### Mock Lesson Progress
```typescript
const mockLessonProgress = [
  { id: 'lp-1', enrollment_id: 'enroll-1', lesson_id: 'lesson-1', completed: true, watch_time_seconds: 300 },
  { id: 'lp-2', enrollment_id: 'enroll-1', lesson_id: 'lesson-2', completed: false, watch_time_seconds: 120 },
];
```

---

## Test Scenarios

### Suite 1: `getOrCreateEnrollment`

| ID | Scenario | Type | Spec Ref |
|----|----------|------|----------|
| TC1.1 | Returns null when Supabase is not configured | Negative | FR4 |
| TC1.2 | Returns existing enrollment if found | Happy Path | FR2 |
| TC1.3 | Creates new enrollment when none exists | Happy Path | FR1 |
| TC1.4 | Updates `last_accessed_at` on existing enrollment | Happy Path | FR1 |

### Suite 2: `getUserCourseProgress`

| ID | Scenario | Type | Spec Ref |
|----|----------|------|----------|
| TC2.1 | Returns empty progress when Supabase not configured | Negative | FR4 |
| TC2.2 | Returns enrollment with lesson progress | Happy Path | FR2, FR3 |
| TC2.3 | Returns empty lesson progress if none exists | Edge Case | FR2 |

### Suite 3: `updateLessonProgress`

| ID | Scenario | Type | Spec Ref |
|----|----------|------|----------|
| TC3.1 | Returns false when Supabase not configured | Negative | FR4 |
| TC3.2 | Returns false when no enrollment found | Negative | FR1 |
| TC3.3 | Upserts lesson progress correctly with completion | Happy Path | FR1 |
| TC3.4 | Upserts with watch time in seconds | Happy Path | FR1 |

### Suite 4: `updateEnrollmentProgress`

| ID | Scenario | Type | Spec Ref |
|----|----------|------|----------|
| TC4.1 | Returns false when Supabase not configured | Negative | FR4 |
| TC4.2 | Clamps progress between 0 and 100 | Edge Case | FR1 |
| TC4.3 | Sets `completed_at` when progress reaches 100% | Edge Case | FR1 |

### Suite 5: `syncLocalProgressToServer`

| ID | Scenario | Type | Spec Ref |
|----|----------|------|----------|
| TC5.1 | Returns false when Supabase not configured | Negative | FR4 |
| TC5.2 | Returns false for empty lessons array | Edge Case | FR4 |
| TC5.3 | Syncs only completed lessons to server | Happy Path | FR4 |
| TC5.4 | Updates enrollment progress percentage | Happy Path | FR1 |

### Suite 6: `getUserEnrollments`

| ID | Scenario | Type | Spec Ref |
|----|----------|------|----------|
| TC6.1 | Returns empty array when Supabase not configured | Negative | FR4 |
| TC6.2 | Returns enrollments ordered by last access | Happy Path | FR2 |
| TC6.3 | Filters to only active enrollments | Happy Path | FR2 |

### Suite 7: `getActualProgressStats`

| ID | Scenario | Type | Spec Ref |
|----|----------|------|----------|
| TC7.1 | Returns default stats when Supabase not configured | Negative | FR4 |
| TC7.2 | Calculates progress percentage correctly | Happy Path | FR3 |
| TC7.3 | Handles zero total lessons | Edge Case | FR3 |

---

## Acceptance Criteria Mapping

| AC | Criteria | Test Coverage |
|----|----------|---------------|
| AC1 | Persist & Restore (video position ±10s) | TC3.3, TC3.4, TC2.2 |
| AC2 | Completion Persistence | TC3.3, TC5.3 |
| AC3 | Resume Pointer (last accessed lesson) | TC1.4, TC2.2, TC6.2 |
| AC4 | Backend Failure Handling | TC1.1, TC2.1, TC3.1, TC4.1, TC5.1, TC6.1, TC7.1 |
| AC5 | No Regression | All passing tests |

---

## Related Files

- **Service Implementation**: [progressService.ts](file:///c:/Users/user/OneDrive/Documents/DQ_Prod_DTMA/src/features/portal/services/progressService.ts)
- **Test Implementation**: [progressService.test.ts](file:///c:/Users/user/OneDrive/Documents/DQ_Prod_DTMA/src/features/portal/services/progressService.test.ts)
- **Test Config**: [vitest.config.ts](file:///c:/Users/user/OneDrive/Documents/DQ_Prod_DTMA/vitest.config.ts)
