# DTMA Jan 16 Feature State Report

## 1. Executive Summary (High Level)
| Feature | Current State | Confidence | Blockers | ETA Risk |
| --- | --- | --- | --- | --- |
| Feature 01: Learner Progress Persistence (backend/Supabase persisted) | In progress (Partial) | High | No progress table or backend write/read; localStorage only | High |
| Feature 02: Enrollment & Access Gating (minimal, rule-based) | In progress (Partial) | Medium | No enrollment model; learning route not gated; rules are UI-only | High |
| Feature 03: Learner Dashboard (thin but real, no mocks) | In progress (Partial) | High | Dashboard data is mocked; no backend queries | High |
| Feature 04: Course Completion State (persisted completion) | In progress (Partial) | High | Completion not persisted; localStorage-only state | High |

## 2. Feature-by-Feature Functional Assessment (Detailed)

### Feature 01 — Learner Progress Persistence (backend/Supabase persisted)

#### 2.1 Functional Checklist (Mark each item)
 / [ ] FR1: Progress Write Events  
Status: Partial  
Evidence: `src/pages/LearningScreen.tsx`  
Notes: Writes progress to `localStorage` only (`courseProgress_${courseId}`), no Supabase write.

 / [ ] FR2: Progress Read on Learning Load  
Status: Partial  
Evidence: `src/pages/LearningScreen.tsx`  
Notes: Reads from `localStorage` only; no backend fetch.

 / [x] FR3: Per-lesson Completion State Rendering  
Status: Done  
Evidence: `src/components/CourseOutline.tsx`, `src/types/course.ts`, `src/pages/LearningScreen.tsx`  
Notes: Lesson completion drives UI badges and styles; sourced from client state.

 / [ ] FR4: Fallback Behavior  
Status: Partial  
Evidence: `src/pages/LearningScreen.tsx`  
Notes: If no stored progress, lessons default to incomplete; no server fallback.

#### 2.2 Data Model & Migrations
- Do we have a progress table? No.
- Migration file(s): None found in `supabase/migrations` or `migrations`.
- RLS present? No (no table).
- Any conflicts with existing schema? None observed.

#### 2.3 Integration Points
- Learning page entry point: `src/pages/LearningScreen.tsx`.
- Outline rendering: `src/components/CourseOutline.tsx`.
- Video player progress hooks: `src/components/VideoPlayer.tsx` (onTimeUpdate) and `src/pages/LearningScreen.tsx` (handleTimeUpdate).
- localStorage usage: `src/pages/LearningScreen.tsx` (`courseProgress_${courseId}`), `src/components/HeroSection.tsx` (`courseProgress`).

#### 2.4 Gaps / Blockers
- No Supabase progress table/migration.
- No service layer for progress write/read.
- Progress persistence is browser-only; no user-scoped storage.

#### 2.5 Exact "Next Actions" (Max 5)
1. Add a Supabase `course_progress` (or equivalent) table migration with user and lesson keys.
2. Add a progress service to write/read progress in `src/services`.
3. Replace `localStorage` writes in `src/pages/LearningScreen.tsx` with service calls (keep local cache if needed).
4. Read progress from service on learning load and merge with lesson list.
5. Align resume detection in `src/components/HeroSection.tsx` with the persisted progress source.

### Feature 02 — Enrollment & Access Gating (minimal, rule-based)

#### 2.1 Functional Checklist (Mark each item)
 / [ ] FR1: Enrollment Creation  
Status: Not started  
Evidence: No enrollment table or service in `supabase/migrations` or `src/services`.  
Notes: Only `enrollment_url` is present on course records.

 / [ ] FR2: Access Rules  
Status: Partial  
Evidence: `src/components/CourseOutline.tsx`, `src/pages/LearningScreen.tsx`, `src/pages/courses/CourseDetailsPage.tsx`  
Notes: Lesson-level gating is client-only; course start requires login in CTA, but no enrollment rules.

 / [ ] FR3: Enforcement Points  
Status: Partial  
Evidence: `src/components/CourseOutline.tsx`, `src/pages/LearningScreen.tsx`, `src/components/ProtectedRoute.tsx`  
Notes: Lessons/next button gated; `/learning` route not protected; dashboard is protected.

 / [ ] FR4: Failure Handling  
Status: Not started  
Evidence: `src/pages/CourseAssessment.tsx`  
Notes: Quiz lock is disabled (`if (false && !allLessonsCompleted)`), no access-denied UX for learning.

#### 2.2 Data Model & Migrations
- Do we have an enrollment table? No.
- Migration file(s): None found in `supabase/migrations` or `migrations`.
- RLS present? No (no table).
- Any conflicts with existing schema? None observed.

#### 2.3 Integration Points
- Course details CTA entry: `src/pages/courses/CourseDetailsPage.tsx` (login check before start).
- Learning route entry: `src/pages/LearningScreen.tsx` (no auth/enrollment guard).
- Lesson gating: `src/components/CourseOutline.tsx`, `src/pages/LearningScreen.tsx` (next lesson unlock logic).
- Route protection for dashboard: `src/components/ProtectedRoute.tsx`.
- Quiz gating disabled: `src/pages/CourseAssessment.tsx`.

#### 2.4 Gaps / Blockers
- No enrollment persistence or access rules tied to user records.
- Learning route is accessible without auth or enrollment.
- Quiz access gating is disabled.

#### 2.5 Exact "Next Actions" (Max 5)
1. Add an `enrollments` table migration with user-course relationships.
2. Add enrollment service calls for create/read in `src/services`.
3. Gate `/learning` by enrollment (and auth) in routing or a guard component.
4. Enable quiz access gating in `src/pages/CourseAssessment.tsx` once rules are defined.
5. Add a minimal access-denied state for non-enrolled users.

### Feature 03 — Learner Dashboard (thin but real, no mocks)

#### 2.1 Functional Checklist (Mark each item)
 / [ ] FR1: Dashboard Data Load from Backend  
Status: Not started  
Evidence: `src/pages/dashboard/overview/index.tsx`, `src/pages/dashboard/overview/MetricsOverview.tsx`  
Notes: All data is static or mocked; no services called.

 / [ ] FR2: Course Cards Show Progress + CTA State  
Status: Not started  
Evidence: No course progress UI in `src/pages/dashboard/overview/*`.  
Notes: No course list, progress, or CTA states in dashboard.

 / [ ] FR3: Resume Navigation to Last Lesson  
Status: Not started  
Evidence: No dashboard links to `/learning?courseId=...`.  
Notes: Resume behavior is not implemented in dashboard.

 / [ ] FR4: Empty States and Loading  
Status: Partial  
Evidence: `src/pages/dashboard/overview/ServiceRequestsTable.tsx`, `src/pages/dashboard/overview/ObligationsDeadlines.tsx`, `src/pages/dashboard/overview/Announcements.tsx`, `src/pages/dashboard/overview/MetricsOverview.tsx`  
Notes: UI has loading placeholders, but no real data source.

#### 2.2 Data Model & Migrations
- Do we have dashboard-related tables (progress/enrollments/completions) for learner view? No.
- Migration file(s): None found in `supabase/migrations` or `migrations`.
- RLS present? No (no table).
- Any conflicts with existing schema? None observed.

#### 2.3 Integration Points
- Dashboard entry: `src/pages/dashboard/DashboardRouter.tsx` (protected).
- Layout: `src/pages/dashboard/DashboardLayout.tsx`.
- Overview page: `src/pages/dashboard/overview/index.tsx`.
- Mocked data sources:
  - `src/pages/dashboard/overview/index.tsx` (onboardingData constant).
  - `src/pages/dashboard/overview/ServiceRequestsTable.tsx` (serviceRequests array).
  - `src/pages/dashboard/overview/ObligationsDeadlines.tsx` (obligations array).
  - `src/pages/dashboard/overview/Announcements.tsx` (announcements array).
  - `src/pages/dashboard/overview/MetricsOverview.tsx` (kpiCards array).
  - `src/components/Header/notifications/NotificationCenter.tsx` and `src/components/Header/utils/mockNotifications.ts`.
- Queries/services currently driving it: None found in `src/services`.

#### 2.4 Gaps / Blockers
- Dashboard data is entirely mocked; no backend integration.
- No learner course progress or resume CTAs.
- Dashboard sub-routes (profile/settings/support) redirect to `/404` in `src/pages/dashboard/DashboardRouter.tsx`.

#### 2.5 Exact "Next Actions" (Max 5)
1. Add a dashboard data service to fetch user enrollments/progress.
2. Replace mocked arrays in `src/pages/dashboard/overview/*` with service calls.
3. Add a learner course list component with progress and resume CTA.
4. Wire resume CTA to `/learning?courseId=...`.
5. Provide real empty states driven by backend responses.

### Feature 04 — Course Completion State (persisted completion)

#### 2.1 Functional Checklist (Mark each item)
 / [x] FR1: Completion Rule  
Status: Done  
Evidence: `src/pages/LearningScreen.tsx`  
Notes: Lesson completes when near end; course completion derived from all lessons completed.

 / [x] FR2: Trigger Evaluation Points  
Status: Done  
Evidence: `src/pages/LearningScreen.tsx` (handleTimeUpdate, handleNext)  
Notes: Completion updated on playback near end and on Next action.

 / [ ] FR3: Persistence  
Status: Partial  
Evidence: `src/pages/LearningScreen.tsx`  
Notes: Completion stored in `localStorage` only; no backend persistence.

 / [ ] FR4: Idempotency  
Status: Not started  
Evidence: No completion upsert logic in `src/services` or migrations.  
Notes: No server-side idempotent updates.

#### 2.2 Data Model & Migrations
- Do we have a completion table? No.
- Migration file(s): None found in `supabase/migrations` or `migrations`.
- RLS present? No (no table).
- Any conflicts with existing schema? None observed.

#### 2.3 Integration Points
- Completion evaluation: `src/pages/LearningScreen.tsx` (completedCount, allLessonsCompleted).
- Completion UI feedback: `src/components/CourseOutline.tsx` (Completed badge), `src/pages/LearningScreen.tsx` (progress bar), `src/pages/CourseAssessment.tsx` (summary/achievement).
- Completion persistence: `src/pages/LearningScreen.tsx` (localStorage).
- Completion is derived, not persisted: no DB record or service.

#### 2.4 Gaps / Blockers
- No persisted completion model or service.
- Completion state is derived from localStorage, not user-scoped in backend.
- Quiz lock based on completion is disabled.

#### 2.5 Exact "Next Actions" (Max 5)
1. Add a `course_completions` table migration with user-course status.
2. Add completion service for read/write with idempotent upsert.
3. Write completion updates from `src/pages/LearningScreen.tsx` to backend.
4. Read completion on learning load and merge with lesson state.
5. Re-enable completion-based quiz gating in `src/pages/CourseAssessment.tsx`.

## 3. Cross-Feature Dependency Notes
- Feature 03 (Learner Dashboard) depends on Feature 01 (progress persistence) and Feature 04 (completion) to display real progress and completion states.
- Feature 04 (Completion State) depends on Feature 01 (progress write/read) to support persisted completion.
- Feature 02 (Enrollment & Access Gating) depends on a persisted enrollment model to enforce access on `/learning`.

## 4. Risk Notes (Jan 16)
- No progress/enrollment/completion tables exist in migrations; backend persistence is missing for three features.
- Learning route is accessible without enrollment or auth; gating is unenforced.
- Dashboard is entirely mock-driven; no backend integration path.
- Quiz lock is disabled, so completion-based gating does not execute.
- LocalStorage key mismatch (`courseProgress` vs `courseProgress_${courseId}`) can lead to inconsistent resume behavior.

Quick wins that reduce risk fastest:
- Add minimal Supabase tables for progress, enrollments, and completions with RLS.
- Replace localStorage-only progress with service read/write in `src/pages/LearningScreen.tsx`.
- Gate `/learning` by auth/enrollment and re-enable quiz lock.
- Replace mocked dashboard arrays with backend queries, even if limited to a single course.
- Align resume detection to use the same progress key/source.

## 5. Appendix: Evidence Index
- `src/pages/LearningScreen.tsx` -> progress read/write in localStorage, completion rule, progress bar.
- `src/components/CourseOutline.tsx` -> lesson lock rules and completion UI badges.
- `src/components/VideoPlayer.tsx` -> timeupdate hook feeding progress.
- `src/pages/CourseAssessment.tsx` -> completion-based quiz lock disabled.
- `src/pages/courses/CourseDetailsPage.tsx` -> start learning CTA requires login.
- `src/components/ProtectedRoute.tsx` -> dashboard route protection.
- `src/pages/dashboard/overview/index.tsx` -> mocked onboarding progress and layout.
- `src/pages/dashboard/overview/ServiceRequestsTable.tsx` -> mocked service requests data.
- `src/pages/dashboard/overview/ObligationsDeadlines.tsx` -> mocked obligations data.
- `src/pages/dashboard/overview/Announcements.tsx` -> mocked announcements data.
- `src/pages/dashboard/overview/MetricsOverview.tsx` -> mocked KPI data.
- `src/components/Header/notifications/NotificationCenter.tsx` and `src/components/Header/utils/mockNotifications.ts` -> mocked notifications.
- `supabase/migrations` -> no progress/enrollment/completion table migrations present.
