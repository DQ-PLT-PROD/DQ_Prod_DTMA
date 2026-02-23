# Optimization Spec: Learner Progress Test Remediation

## 1. Context & Reference
- **Original Feature Spec**: [feature-01-learner-progress.md](../../DTMA Specs/feature-01-learner-progress.md)
- **Current Test Status**: 88% Passing (15/17 tests passing)
- **Objective**: Address the specific "missed items" (technical gaps) preventing the final 2 unit tests from passing.

> [!NOTE]
> This is **not** a feature rebuild. It is a targeted remediation plan to fix the test harness so it can accurately valid the existing implementation against the original spec.

---

## 2. Identified Gaps (Missed Items)

The following items from `feature-01-learner-progress.md` are implemented in code but failing in tests due to mock limitations:

### Gap A: Chained Query Mocking
**Spec Reference**: Section 6 (Service Layer) & Section 4 (Data Model)
- **Issue**: The implementation uses chained Supabase filters (e.g., `.eq('user_id', ...).eq('course_slug', ...)`) to locate records.
- **Test Failure**: `getUserCourseProgress` and `getActualProgressStats` fail with `TypeError: ...eq is not a function`.
- **Cause**: The current test mock setup does not support method chaining depth > 1.

### Gap B: Aggregation Mocking
**Spec Reference**: Section 3 (FR3: Per-Lesson Completion State)
- **Issue**: The implementation counts completed lessons to calculate progress percentage.
- **Test Failure**: `should calculate progress percentage correctly` fails.
- **Cause**: The mock setup cannot return specific "count" structures required by the `getActualProgressStats` function.

---

## 3. Remediation Specifications

### Spec 1: Enhance Test Harness (Mocking)
Refine the test setup in `progressService.test.ts` to support the existing code's query patterns.

**Requirements**:
1.  **Support Chaining**: Update the `mockChain` helper to allow infinite/recursive chaining of `.eq()`, `.select()`, and `.order()`.
2.  **Support "Thenable"**: Ensure the chain can be awaited (returning a Promise) at any point, mimicking the Supabase SDK.
3.  **Context-Aware Returns**: Allow the mock to return different data based on the *table* being queried (e.g., `user_enrollments` vs `lesson_progress`), rather than a generic global state.

### Spec 2: Verify "Missed" Edge Cases
Once the harness is fixed, verify these specific edge cases mentioned in the original spec:
1.  **Zero Progress**: Verify 0/10 lessons = 0% (Spec FR3).
2.  **Partial Progress**: Verify 3/10 lessons = 30% (Spec FR3).
3.  **Completion**: Verify 10/10 lessons = 100% and triggers `completed_at` (Spec FR1, AC2).

---

## 4. Execution Plan
1.  **Modify** `progressService.test.ts` to implement the improved mock pattern.
2.  **Run** `npx vitest run progressService` to confirm the 2 failing tests now pass.
3.  **Verify** no regressions in the other 15 tests.
