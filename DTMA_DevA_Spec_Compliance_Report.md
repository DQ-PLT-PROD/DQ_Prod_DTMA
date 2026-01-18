1) Executive Summary
Overall state: In progress (Partial)
Confidence: Medium
- MSAL/Entra ID auth and user sync to a Supabase `users` table are implemented and keyed by `azure_user_id` from MSAL account IDs. (`src/services/auth/msal.ts`, `src/features/auth/context/AuthContext.tsx`, `src/features/auth/services/userService.ts`, `src/lib/supabase/types.ts`)
- Learner onboarding flow is not implemented; `/dashboard/onboarding` redirects to 404 and `onboardingComplete` is hardcoded true. (`src/features/dashboard/pages/DashboardRouter.tsx`, `src/features/dashboard/pages/DashboardLayout.tsx`)
- Learner profile page is missing; the sidebar links to `/dashboard/profile` but no route or page exists, and no role/goals/preferences fields are stored. (`src/components/Sidebar/Sidebar.tsx`, `src/features/dashboard/pages/DashboardRouter.tsx`, `src/lib/supabase/types.ts`)
- Dashboard overview is business-oriented and mock-driven; no learner Continue/Saved/Account sections are wired. (`src/features/dashboard/pages/overview/index.tsx`)
- A progress-driven course list exists only in the learning portal (`/portal/my-courses/in-progress`) and is not integrated into the dashboard. (`src/features/portal/pages/InProgressPage.tsx`, `src/AppRouter.tsx`)
- Saved courses and account status widgets are absent; there is no `saved_courses` table or UI/actions. (`src/lib/supabase/types.ts`, `supabase/migrations`)
- Security/architecture risk: client-side use of Supabase service role for progress/enrollment operations conflicts with the spec requirement to avoid embedding service keys in the browser. (`src/lib/supabase/serviceClient.ts`, `src/features/portal/services/progressService.ts`)

2) Spec Compliance Matrix (Must be complete)
| Spec Item | Status (Done/Partial/Not found/Blocked) | Evidence (file paths) | Notes |
| --- | --- | --- | --- |
| A1 Onboarding | Not found | `src/features/dashboard/pages/DashboardRouter.tsx` | Route exists only as a redirect to 404; no onboarding UI or persistence. |
| Redirect trigger after login when onboarding not completed | Not found | `src/features/auth/components/ProtectedRoute.tsx` `src/features/dashboard/pages/DashboardRouter.tsx` | Auth flow redirects authenticated users from `/dashboard` to `/portal`; no onboarding gating or completion check. |
| Captures role track + goals/preferences | Not found | `src/lib/supabase/types.ts` | No role/goals/preferences fields in `users`; no onboarding components found. |
| Persists onboarding completion state | Not found | `src/features/dashboard/pages/DashboardRouter.tsx` `src/lib/supabase/types.ts` | `onboardingComplete` is hardcoded `true`; no DB fields for completion flag. |
| Idempotent updates (no duplicates) | Not found | `src/features/dashboard/pages/DashboardRouter.tsx` | No onboarding persistence logic exists. |
| Skip behavior (if implemented) | Not found | `src/features/dashboard/pages/DashboardRouter.tsx` | No onboarding UI or skip controls. |
| A2 Minimal Profile | Not found | `src/components/Sidebar/Sidebar.tsx` `src/features/dashboard/pages/DashboardRouter.tsx` | Sidebar link exists but route/page is missing. |
| Profile route exists | Not found | `src/components/Sidebar/Sidebar.tsx` `src/features/dashboard/pages/DashboardRouter.tsx` | `/dashboard/profile` is not routed; unknown paths redirect to overview. |
| Loads persisted profile | Not found | `src/features/auth/services/userService.ts` | Only auth sync for base user fields; no learner profile fetch UI. |
| Edit + Save works | Not found | `src/features/auth/services/userService.ts` | No profile edit UI; user service only updates base user metadata. |
| Validation exists (role track required, max items) | Not found | `src/features/auth/services/userService.ts` | No UI or validation logic for role/goals/preferences. |
| A3 Learner Dashboard | Partial | `src/features/dashboard/pages/overview/index.tsx` `src/features/portal/pages/InProgressPage.tsx` | Dashboard exists but is mock/business-focused; progress list exists in portal only. |
| Dashboard overview is backend-driven (no mocks) | Partial | `src/features/dashboard/pages/overview/index.tsx` | Uses mock `onboardingData` and business widgets; no learner data wiring. |
| Continue learning list is derived from progress | Partial | `src/features/portal/pages/InProgressPage.tsx` `src/features/portal/services/progressService.ts` | Progress-driven list exists in portal, not on `/dashboard/overview`. |
| Continue CTA navigates and resumes correctly | Partial | `src/features/portal/pages/InProgressPage.tsx` `src/features/portal/pages/CoursePlayerPage.tsx` `src/features/learning/services/learningSnapshotService.ts` | CTA navigates to course, but no resume lesson ID is used. |
| Saved courses list exists + persists | Not found | `src/lib/supabase/types.ts` `supabase/migrations` | No `saved_courses` table or UI/services found. |
| Save/unsave actions exist | Not found | `src/lib/supabase/types.ts` | No saved-course actions in UI or services. |
| Account status widget exists | Not found | `src/features/dashboard/pages/overview/index.tsx` | Dashboard overview does not render subscription/account status. |
| Empty/loading/error states exist | Partial | `src/features/portal/pages/InProgressPage.tsx` `src/features/dashboard/pages/overview/index.tsx` | Portal list has loading/empty states; dashboard has generic error UI. |
| No remaining mock arrays powering learner sections | Not found | `src/features/dashboard/pages/overview/index.tsx` | Mock `onboardingData` is still present. |
| Auth model alignment: MSAL/Entra ID usage and how profile data is keyed | Done | `src/services/auth/msal.ts` `src/features/auth/context/AuthContext.tsx` `src/features/auth/services/userService.ts` | Uses MSAL and stores users by `azure_user_id` derived from MSAL account IDs. |
| Data model existence: users table extensions or learner_profiles, saved_courses table | Partial | `src/lib/supabase/types.ts` `supabase/migrations/027_add_progress_tracking_tables.sql` | Users/enrollments/progress exist; learner profile fields and saved_courses are missing. |

3) Feature-by-Feature Deep Dive
3.1 Feature A1 - Onboarding
- Current routes/components involved: `/dashboard/onboarding` is routed to a 404 redirect; sidebar has an onboarding link but no page exists. (`src/features/dashboard/pages/DashboardRouter.tsx`, `src/components/Sidebar/Sidebar.tsx`)
- Where onboarding completion is stored (DB/local/none): not stored; `onboardingComplete` is hardcoded `true` in the dashboard router and only local state exists in layout. (`src/features/dashboard/pages/DashboardRouter.tsx`, `src/features/dashboard/pages/DashboardLayout.tsx`)
- What fields are captured and how: none found; no role/goals/preferences form or storage. (`src/lib/supabase/types.ts`)
- Gaps vs spec: missing onboarding UI, data model, completion flag, redirect gating, skip behavior, and idempotent upsert logic.

3.2 Feature A2 - Minimal Profile
- Current profile page status: sidebar links to `/dashboard/profile`, but there is no route or page implementation; unknown routes redirect to overview. (`src/components/Sidebar/Sidebar.tsx`, `src/features/dashboard/pages/DashboardRouter.tsx`)
- Fields editable: none found for learner role/goals/preferences; only base user data is synced from MSAL/Graph. (`src/features/auth/services/userService.ts`)
- Backend wiring status: user sync updates `users` table fields like name/email/job title only. (`src/features/auth/services/userService.ts`, `src/lib/supabase/types.ts`)
- Gaps vs spec: profile view/edit UI, persistence of role_track/goals/preferences, validation, and save feedback are missing.

3.3 Feature A3 - Learner Dashboard
- Current dashboard layout source file(s): business dashboard overview is implemented in `src/features/dashboard/pages/overview/index.tsx` and routed in `src/features/dashboard/pages/DashboardRouter.tsx`.
- Identify mocked data usage (exact arrays/constants): `onboardingData` is hardcoded in the overview; service requests/metrics components are not wired to learner data. (`src/features/dashboard/pages/overview/index.tsx`)
- Data sources used today (services, RPCs): the learning portal uses `getUserEnrollments` and `getActualProgressStats` from the portal progress service; a learning snapshot RPC exists but is unused. (`src/features/portal/pages/InProgressPage.tsx`, `src/features/portal/services/progressService.ts`, `src/features/learning/services/learningSnapshotService.ts`)
- Continue learning logic present? Evidence: in portal `InProgressPage` which lists enrollments and progress; not on `/dashboard/overview`. (`src/features/portal/pages/InProgressPage.tsx`)
- Saved courses model present? Evidence: not found in types or migrations. (`src/lib/supabase/types.ts`, `supabase/migrations`)
- Account status present? Evidence: no subscription/account widget in dashboard overview. (`src/features/dashboard/pages/overview/index.tsx`)

4) Data Model & Migrations
- `supabase/migrations/027_add_progress_tracking_tables.sql`: creates `user_enrollments` and `lesson_progress` tables used by the portal progress service.
- `supabase/migrations/028_update_enrollment_schema.sql`: updates enrollment schema/RLS patterns referencing `users` and `azure_user_id`.
- `supabase/migrations/039_add_learner_lesson_progress.sql`: adds `learner_lesson_progress` table (not referenced in UI).
- `supabase/migrations/040_add_learning_snapshot_rpc.sql` (and follow-ups `041_fix_learning_snapshot_rpc.sql`, `042_fix_learning_snapshot_rpc_ambiguous.sql`): adds `get_learning_snapshot` RPC with `resumeLessonId` support.
- `src/lib/supabase/types.ts`: includes `users`, `user_enrollments`, and `lesson_progress` table definitions, but no learner profile fields.
- Learner profile fields/table (`role_track`, `goals`, `preferences`, onboarding flags): Not found in migrations or types.
- Saved courses table (`saved_courses`): Not found in migrations or types.

5) Risks & Blockers
- No onboarding or profile UI/routes are implemented; required learner data capture and edit flows are missing. (`src/features/dashboard/pages/DashboardRouter.tsx`)
- `/dashboard` routing is redirected to `/portal` after login, conflicting with spec for a learner dashboard at `/dashboard/overview`. (`src/features/auth/components/ProtectedRoute.tsx`, `src/AppRouter.tsx`)
- No data model exists for learner profiles or saved courses, blocking persistence and dashboard sections. (`supabase/migrations`, `src/lib/supabase/types.ts`)
- Client-side service-role usage in progress/enrollment services violates the spec's security requirement and may block production readiness. (`src/lib/supabase/serviceClient.ts`, `src/features/portal/services/progressService.ts`)
- Resume lesson support is defined in RPC but not consumed in UI; continue flow cannot reliably resume where the learner left off. (`supabase/migrations/040_add_learning_snapshot_rpc.sql`, `src/features/portal/pages/CoursePlayerPage.tsx`)

6) Minimal "Next Actions" (Max 10)
1. `supabase/migrations/*` add learner profile storage (extend `users` or create `learner_profiles`) with `role_track`, `goals`, `preferences`, and onboarding flags; this enables persistent onboarding/profile data required by A1/A2.
2. `src/lib/supabase/types.ts` update generated types after migration; ensures new learner profile fields are usable in services and UI.
3. `src/features/dashboard/pages/DashboardRouter.tsx` add a real `/dashboard/onboarding` route and remove the 404 redirect; exposes onboarding UI entry point.
4. `src/features/auth/components/ProtectedRoute.tsx` implement onboarding gating (redirect to `/dashboard/onboarding` when `onboarding_completed=false`) instead of redirecting to `/portal`; meets A1 redirect requirement.
5. `src/features/learner/services/learnerProfileService.ts` (new) implement read/write/upsert for role_track/goals/preferences and completion flags keyed by `azure_user_id`/`users.id`; satisfies A1 persistence and idempotency.
6. `src/features/dashboard/pages/profile/index.tsx` (new) implement the minimal profile form with validation and Save feedback; fulfills A2 view/edit requirements.
7. `src/features/dashboard/pages/overview/index.tsx` replace mock overview with learner sections (Continue learning, Saved courses, Account status) and wire to services; fulfills A3 dashboard scope.
8. `supabase/migrations/*` add `saved_courses` table with `(user_id, course_id)` unique constraint and `saved_at`; required for A3 saved courses persistence.
9. `src/features/courses/pages/CourseDetailsPage.tsx` and `src/features/dashboard/pages/overview/index.tsx` add save/unsave actions and a saved courses section; closes A3 saved courses gap.
10. `src/features/portal/pages/CoursePlayerPage.tsx` integrate `resumeLessonId` from `get_learning_snapshot` and update continue navigation to resume lessons; closes A3 resume behavior gap.
