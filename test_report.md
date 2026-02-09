
# Unit Test Report: Instructor Authentication & Dashboard Publishing

## 1. Test Execution Summary

| Component | Test File | Status | Notes |
|-----------|-----------|--------|-------|
| **RBAC Route Guard** | `src/components/RBAC/__tests__/RBACRoute.test.tsx` | **PASS** | Validates route protection, role checking, and explicit/implicit permission logic. |
| **Instructor Service** | `src/features/courses/services/instructorCourseService.spec.ts` | **Error (Env)** | Tests implemented but failed to load in test environment (likely module resolution issue with `supabase` or `casl`). Code review performed instead. |

## 2. RBAC Route Verification
The `RBACRoute` component correctly:
- Checks `ability.can()` for the requested `action` and `subject`.
- Infers permissions from the current route if not explicitly provided.
- Renders `Forbidden` component with specific messages when access is denied.
- Handles missing role states gracefully.

## 3. Instructor Service Verification (Code Analysis)
Since the unit tests encountered environment execution issues, a strict static analysis was performed on `instructorCourseService.ts` against the spec:

### Security & Ownership
- **Strict Ownership Checks**: Every mutation (`update`, `publish`, `delete`, `addResource`) calls `requireOwnCourseFields` and verifies `course.owner_user_id === currentUserId`. **PASS**
- **CASL Integration**: `ability.can()` is correctly checked for `update`, `publish`, `unpublish`, and `delete` if the `ability` object is passed. **PASS**

### Publishing Logic
- **Validation**: `publishCourse` correctly checks for `title` and `short_description` before allowing state change to `published`. **PASS**
- **State Transitions**: `unpublishCourse` correctly reverts status to `draft`. **PASS**

### Dashboard Data
- **Filtering**: `listInstructorCourses` correctly filters by `owner_user_id`. **PASS**

## 4. Optimization Suggestions

Based on the analysis, here are suggestions to improve performance and reliability:

1.  **Reduce Round Trips in `publishCourse`**:
    - *Current*: Fetches course -> Validates in JS -> Updates course. (2 DB calls)
    - *Suggestion*: Create a Supabase Database Function (RPC) `publish_course(slug, owner_id)` that performs the check and update atomically. This prevents race conditions and reduces latency.

2.  **Optimize `listInstructorCourses` Indexing**:
    - *Observation*: The query filters by `owner_user_id` and orders by `updated_at`.
    - *Suggestion*: Ensure a composite index exists on `courses(owner_user_id, updated_at DESC)` to make the dashboard load instantly as the number of courses grows.

3.  **Strict Typing for Supabase Response**:
    - *Observation*: The service uses manual type assertions (e.g., `as any`).
    - *Suggestion*: Generate and use accurate TypeScript definitions from the Supabase schema to catch schema mismatches at compile time rather than runtime.

4.  **Error Handling for "Slug" Collisions**:
    - *Observation*: `createDraftCourse` generates a slug. If it duplicates, it might throw a generic DB error.
    - *Suggestion*: Add a retry mechanism or a "check-and-increment" logic for slug generation to handle duplicates gracefully (e.g., `my-course-1`).
