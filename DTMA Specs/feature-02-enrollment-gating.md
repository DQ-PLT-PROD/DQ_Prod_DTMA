
# DTMA Feature Specification 02
## Enrollment & Access Gating (Minimal, Rule-Based)

### Status
Planned – Jan 16 Delivery

### Owner
One Developer (End-to-End Ownership)

---

## 0. Objective

Implement a **minimal enrollment and access control model** so that authenticated users can only access full course content if they are enrolled, while non-enrolled users can access preview content.

### Success Statement
A learner can view previews of a course, enroll once, and thereafter access all protected lessons consistently across sessions and devices.

---

## 1. Scope

### In Scope
- Course enrollment persistence per authenticated learner
- Rule-based access checks (preview vs full content)
- Backend-backed entitlement checks used by frontend routes and services

### Out of Scope (Explicit)
- Payments or subscriptions
- Pricing plans
- Refunds, renewals, or cancellations
- Role-based instructor permissions (handled separately)
- Admin UI for enrollment management

---

## 2. User Stories

1. **Preview Before Enrollment**  
   As a visitor or learner, I can view limited preview lessons without enrolling.

2. **Enroll Once**  
   As a learner, once I enroll in a course, I can access all its lessons.

3. **Persistent Access**  
   As a learner, my enrollment status is remembered across sessions and devices.

---

## 3. Functional Requirements

### FR1: Enrollment Creation
- Enrollment must be created when:
  - User explicitly clicks an “Enroll” CTA, OR
  - Auto-enrollment occurs on first full-content access (acceptable for MVP)

- Enrollment record must be persisted server-side.

---

### FR2: Access Rules
- Non-enrolled users:
  - Can access preview lessons only
  - Cannot access full lessons or assessments

- Enrolled users:
  - Can access all lessons and learning resources for that course

---

### FR3: Access Enforcement Points
Access checks must be enforced at:
- Learning page route entry
- Lesson navigation
- API/service calls fetching protected lesson content

---

### FR4: Graceful Handling
- If enrollment lookup fails:
  - Block protected content
  - Show a clear CTA or message (Enroll / Access Required)
  - Do not crash learning flow

---

## 4. Data Model (Supabase)

### Table: `course_enrollments`

| Field | Type | Notes |
|------|-----|------|
| id | UUID (PK) | |
| user_id | string / uuid | Must match users table |
| course_id | string / uuid | |
| enrolled_at | timestamp | default now() |
| status | enum/string | `active`, `revoked` (optional) |

**Constraints**
- Unique `(user_id, course_id)`
- Index `(user_id)`
- Index `(course_id)`

Migration file must be added under `supabase/migrations`.

---

## 5. Access Control

- Only authenticated users can enroll
- Users can only read their own enrollment records
- Supabase RLS preferred
- Temporary frontend/service enforcement acceptable for MVP (log TODO)

---

## 6. Service Layer (Frontend)

Implement an enrollment service (e.g. `enrollmentService.ts`) with:

- `getEnrollment(courseId)`
- `enrollInCourse(courseId)`
- `isUserEnrolled(courseId)`

All protected content checks must call `isUserEnrolled`.

---

## 7. UI / UX Requirements

### Enrollment CTA
- Clear “Enroll” or “Start Course” CTA on:
  - Course details page
  - Access-blocked lesson screen

### Blocked Access State
- Friendly message explaining access restriction
- CTA to enroll
- No broken navigation or blank screens

No visual redesign required.

---

## 8. Acceptance Criteria (Definition of Done)

### AC1: Enrollment Persistence
- Given a learner enrolls in a course
- When they refresh or log in on another device
- Then they remain enrolled

### AC2: Access Enforcement
- Non-enrolled users cannot access full lessons
- Enrolled users can access full lessons

### AC3: Preview Access
- Preview lessons remain accessible without enrollment

### AC4: Failure Handling
- Enrollment lookup failure does not crash learning
- Protected content remains blocked

### AC5: No Regression
- Existing preview flows still work
- No auth or routing regressions

---

## 9. Testing Requirements

### Unit Tests
- Enrollment creation logic
- Enrollment lookup logic

### Manual Integration Checks (MVP-Acceptable)
- Enroll → access full content
- Logout/login → access still allowed
- Non-enrolled → blocked from protected lessons

---

## 10. Rollout

- Feature enabled by default
- Auto-enrollment acceptable if explicit CTA not wired
- No payment integration required

---

## 11. Open Verification Items (Codex Check)

Before finalizing:
1. Confirm canonical `user_id` used across auth and Supabase
2. Identify how preview lessons are flagged today
3. Confirm lesson fetch boundaries in learning flow

---

## Completion Definition (One Line)

**Done means:**  
Enrollment is persisted server-side and consistently governs access to full course content.
