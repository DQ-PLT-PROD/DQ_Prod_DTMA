
# DTMA Feature Specification 04
## Course Completion State (Closure)

### Status
Planned – Jan 16 Delivery

### Owner
One Developer (End-to-End Ownership)

---

## 0. Objective

Implement a **clear, persisted course completion state** that formally closes the learning loop once a learner completes all required lessons in a course.

### Success Statement
When a learner completes a course, the system reliably marks it as completed, persists that state, and reflects it consistently across the learning flow and dashboard.

---

## 1. Scope

### In Scope
- Determination of course completion based on lesson completion
- Persistence of course-level completion state
- Clear UI feedback when a course is completed
- Use of completion state in learner dashboard

### Out of Scope (Explicit)
- Certificates or downloadable credentials
- XP, badges, or gamification
- Social sharing
- Instructor analytics
- Re-completion or retake flows

---

## 2. User Stories

1. **Course Completion Recognition**  
   As a learner, when I finish all lessons, the course is marked as completed.

2. **Completion Persistence**  
   As a learner, once completed, the course remains completed across sessions and devices.

3. **Clear Closure**  
   As a learner, I receive clear feedback that I have completed the course.

---

## 3. Functional Requirements

### FR1: Completion Rule
- A course is considered **completed** when:
  - All required lessons in the course are marked as `completed`
- Optional (if lessons are optional):
  - Only required lessons count toward completion

---

### FR2: Completion Trigger
- Completion evaluation must run:
  - When a lesson is marked completed
  - When learning screen loads (to ensure consistency)

---

### FR3: Persistence
- Course completion state must be persisted server-side.
- Completion timestamp must be recorded.

---

### FR4: Idempotency
- Completion logic must be idempotent:
  - Re-triggering completion must not create duplicates
  - Completion timestamp must not change once set

---

## 4. Data Model (Supabase)

### Option A (Preferred): Dedicated Table `learner_course_completion`

| Field | Type | Notes |
|------|-----|------|
| id | UUID (PK) | |
| user_id | string / uuid | |
| course_id | string / uuid | |
| completed_at | timestamp | |
| created_at | timestamp | default now() |

**Constraints**
- Unique `(user_id, course_id)`
- Index `(user_id)`
- Index `(course_id)`

---

### Option B: Derived Completion (Fallback)
- Derive completion dynamically from lesson progress
- Cache result client-side only

> Option B is acceptable only if DB changes are blocked; Option A is strongly preferred.

---

## 5. Access Control

- Learners can only read their own completion records
- Completion records are write-once
- Supabase RLS preferred

---

## 6. Service Layer (Frontend)

Implement a completion service (or extend progress service):

- `checkCourseCompletion(courseId)`
- `markCourseCompleted(courseId)`
- `isCourseCompleted(courseId)`

Completion evaluation must reuse lesson progress from Feature 01.

---

## 7. UI / UX Requirements

### Completion Feedback
- On completion:
  - Show a simple modal, banner, or toast
  - Message example: “Course completed”

### Dashboard Representation
- Completed courses must:
  - Show “Completed” state
  - Disable “Continue” CTA or replace with “View”

No visual redesign required.

---

## 8. Acceptance Criteria (Definition of Done)

### AC1: Completion Trigger
- Given all lessons are completed
- Then the course is marked completed automatically

### AC2: Persistence
- Completion persists after refresh and logout/login

### AC3: Idempotency
- Re-opening lessons does not alter completion timestamp

### AC4: Dashboard Consistency
- Completed courses appear as completed on dashboard

### AC5: No Regression
- Lesson progress logic remains intact
- No learning flow breakage

---

## 9. Testing Requirements

### Unit Tests
- Completion rule evaluation
- Idempotent write behavior

### Manual Integration Checks (MVP-Acceptable)
- Complete last lesson → completion state triggers
- Refresh → completion remains
- Dashboard reflects completed state

---

## 10. Rollout

- Feature enabled by default
- No feature flag required
- Depends on Feature 01 (lesson progress)

---

## 11. Open Verification Items (Codex Check)

Before finalizing:
1. Confirm whether lessons have a `required` flag
2. Confirm course/lesson relationship cardinality
3. Identify best place to hook completion evaluation

---

## Completion Definition (One Line)

**Done means:**  
Course completion is automatically detected, persisted once, and consistently reflected across learning and dashboard views.
