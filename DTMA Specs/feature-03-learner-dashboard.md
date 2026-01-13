
# DTMA Feature Specification 03
## Learner Dashboard (Thin but Real)

### Status
Planned – Jan 16 Delivery

### Owner
One Developer (End-to-End Ownership)

---

## 0. Objective

Implement a **real learner dashboard** that serves as the learner’s home, powered entirely by **backend data** (enrollments and progress), not mocks.

### Success Statement
After login, a learner lands on a dashboard that accurately shows their enrolled courses, current progress, and clear entry points to continue learning.

---

## 1. Scope

### In Scope
- Dashboard page backed by real data
- Display of enrolled courses
- Display of progress per course
- “Continue Learning” navigation

### Out of Scope (Explicit)
- Notifications
- Saved/bookmarked courses
- Learner profile editing
- Analytics charts
- Instructor or admin views

---

## 2. User Stories

1. **Learner Home**
   As a learner, when I sign in, I see all courses I’m enrolled in.

2. **Continue Learning**
   As a learner, I can resume a course directly from my dashboard.

3. **Progress Awareness**
   As a learner, I can see how far along I am in each course.

---

## 3. Functional Requirements

### FR1: Dashboard Data Load
On dashboard load:
- Fetch learner enrollments
- Fetch learner progress summaries per course
- Join enrollment + progress data client-side or via service

---

### FR2: Course Cards
Each enrolled course card must show:
- Course title
- Progress indicator (percent or completed/not)
- CTA:
  - “Continue” if in progress
  - “Start” if not started
  - “Completed” (non-clickable or view-only) if completed

---

### FR3: Navigation
- “Continue” navigates to:
  - Learning page
  - Resumes last accessed lesson using persisted progress

---

### FR4: Empty States
- No enrollments:
  - Show friendly empty state
  - CTA to browse courses
- Data loading:
  - Skeleton or loading indicator

---

## 4. Data Dependencies

This feature depends on:
- Feature 01: Learner Progress Persistence
- Feature 02: Enrollment & Access Gating

The dashboard must not reimplement logic already owned by these features.

---

## 5. Service Layer (Frontend)

Implement or reuse services:
- `getEnrollmentsForUser()`
- `getCourseProgress(courseId)` or aggregated variant

No direct DB calls from UI components.

---

## 6. UI / UX Requirements

- Reuse existing dashboard layout/components where possible
- No redesign required
- Responsive behavior maintained
- Clear visual hierarchy:
  - Course title
  - Progress
  - Primary CTA

---

## 7. Acceptance Criteria (Definition of Done)

### AC1: Real Data Only
- Dashboard renders using backend enrollment + progress data
- No mocked or hardcoded data

### AC2: Accurate Progress
- Progress shown matches learner progress in learning flow

### AC3: Resume Works
- Clicking “Continue” resumes correct lesson

### AC4: Empty State
- Learners with no enrollments see a helpful empty state

### AC5: No Regression
- Auth, routing, and learning flows remain intact

---

## 8. Testing Requirements

### Unit Tests
- Mapping of enrollment + progress to dashboard view model

### Manual Integration Checks (MVP-Acceptable)
- Enroll → dashboard shows course
- Make progress → dashboard updates
- Logout/login → dashboard persists state

---

## 9. Rollout

- Feature enabled by default
- Protected route (auth required)
- No feature flag required

---

## 10. Open Verification Items (Codex Check)

Before finalizing:
1. Confirm existing dashboard route and layout file paths
2. Identify existing mocked data to remove
3. Confirm navigation path to learning screen

---

## Completion Definition (One Line)

**Done means:**  
The dashboard accurately reflects what the learner is enrolled in and allows them to resume learning with one click.
