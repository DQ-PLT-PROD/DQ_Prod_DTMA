# Stage02A Status Against Backlog

## 1. Executive Summary

Stage02A is not on a single hardened runtime path yet.

- The current learner runtime is a `mixed path`:
  - backend `/api` calls for enrollment, lesson-access summary, and saved courses
  - direct browser Supabase reads/writes for course content, learner progress, resume snapshot, quiz attempts, badges, and learner profile
- `BE-01` is only `Partially Implemented`. Router-level auth exists on `/api/enrollment/*` and `/api/saved-courses`, but identity fallbacks still remain in handlers, and direct Supabase learner-state paths still accept caller-provided user identifiers.
- `BE-03` is only `Partially Implemented`. The specific legacy files `api/enrollment.mjs` and `api/lesson-access.mjs` are no longer present, but the deployed learner API surface is still serverless through `api/[...path].mjs -> api/server.mjs`, not a clearly separate canonical backend.
- Lesson gating exists, but it is not authoritative end-to-end. The portal route consults `/api/lessons/course-access/:courseSlug`, then the player loads lesson/course/resource content directly from Supabase instead of the gated `/api/lessons/content/:courseSlug/:lessonId` path.
- Current Stage02A depends on the course-scoped learner-state family: `user_enrollments`, `lesson_progress`, `saved_courses`, `quiz_attempts`, and `get_learning_snapshot`. No in-repo references to `module_enrollments`, `module_lesson_progress`, `saved_modules`, or `module_quiz_attempts` were found in `src/`, `api/`, or `supabase/`.

Verification signals:

- `npm run lint`: passed
- `npx tsc --noEmit`: failed with existing repo-wide type errors, including `src/components/auth/AuthDebugPanel.tsx`, `src/features/courses/components/enrollment/EnrollmentDebugPanel.tsx`, `src/features/courses/hooks/useCourseDetails.ts`, and `src/services/courseService.ts`
- `npm run test:run`: failed after escalation with 3 failing suites / 7 failing tests, including `src/features/portal/services/progressService.test.ts`, `src/features/courses/pages/__tests__/CourseCatalogPage.integration.test.tsx`, and unresolved import `src/features/courses/services/instructorCourseService.spec.ts`

## 2. Current Stage02A Runtime Map

Current flow type: `mixed path`

```text
Route entry
  /portal/*                                  -> src/AppRouter.tsx:94-109
    /portal/learning/:courseId               -> EnrollmentGuard
      EnrollmentGuard                        -> src/features/courses/components/guards/EnrollmentGuard.tsx:40-79
      lessonAccessApiClient.getCourseAccessSummary()
                                            -> src/lib/api/lessonAccessApiClient.ts:204-215
      GET /api/lessons/course-access/:slug   -> api/server.mjs:1221-1244

After route admission
  CoursePlayerPage fetches course/lessons/resources directly from Supabase
                                            -> src/features/portal/pages/CoursePlayerPage.tsx:93-97
                                            -> src/services/courseService.ts:234-395

Learner progress
  getUserCourseProgress()                    -> src/features/portal/services/progressService.ts:194-238
  updateLessonProgress()                     -> src/features/portal/services/progressService.ts:244-307
  updateEnrollmentProgress()                 -> src/features/portal/services/progressService.ts:313-362
  all use browser Supabase client            -> src/lib/supabase/serviceClient.ts:19-20
                                            -> src/lib/supabase/client.ts:16-27

Resume / dashboard snapshot
  getLearningSnapshot(courseSlug, userId)    -> src/features/learning/services/learningSnapshotService.ts:111-189
  calls Supabase RPC get_learning_snapshot   -> src/features/learning/services/learningSnapshotService.ts:131-136
                                            -> supabase/migrations/040_add_learning_snapshot_rpc.sql:3-73

Saved courses
  SavedCoursesService -> /api/saved-courses  -> src/services/savedCoursesService.ts:70-137
                                            -> api/server.mjs:1265-1291

Quiz completion / badges
  CourseAssessment -> achievementService     -> src/features/courses/pages/CourseAssessment.tsx:244-255
  direct Supabase writes to quiz_attempts,
  earned_badges, user_xp, user_enrollments   -> src/features/portal/services/achievementService.ts:64-217
```

Additional route note:

- `/dashboard/*` is wrapped in `ProtectedRoute`, but `/portal/*` is not. See `src/AppRouter.tsx:83-109`. Stage02A pages rely on page-level checks and API/service behavior rather than a route-level auth shell.
- Legacy `/learning?courseId=...` traffic redirects to `/portal/learning/:courseId` in `src/AppRouter.tsx:52-61` and `src/AppRouter.tsx:116-117`.
- `src/features/learning/pages/LearningScreen.tsx` still exists as a second learner implementation, but it is not the active routed path in `src/AppRouter.tsx`.

## 3. Backlog Status Table

| Backlog Item | Status | Evidence | Files | Gaps | Risk | Suggested Next Step |
| --- | --- | --- | --- | --- | --- | --- |
| `BE-01` Enforce auth on all user-scoped learner endpoints | Partially Implemented | `/api/enrollment/*` and `/api/saved-courses` apply `authenticateUser({ required: true })` in `api/server.mjs:1265-1338`. `/api/lessons/*` stays on `authenticateUser({ required: false })` in `api/server.mjs:1221-1259`. Frontend enrollment client fails fast without token in `src/lib/api/enrollmentApiClient.ts:72-84`. | `api/server.mjs`, `src/lib/api/enrollmentApiClient.ts`, `src/lib/api/lessonAccessApiClient.ts`, `src/AppRouter.tsx` | Lesson-access routes still allow anonymous requests for preview and summary; `/portal/*` is not route-protected; direct Supabase learner-state paths bypass backend auth entirely. | Hardened backend auth can be bypassed by browser-side Supabase reads/writes, and auth intent is inconsistent across learner routes. | Make Stage02A use one authenticated server-owned path for protected learner state and content. |
| Task B2 Remove caller-supplied identity | Partially Implemented | API clients stopped sending `userId` for enrollment/access in `src/lib/api/enrollmentApiClient.ts:120-227`. Server handlers still retain `query.userId` / `body.userId` branches in `api/server.mjs:613-622`, `api/server.mjs:681-690`, `api/server.mjs:756-769`, `api/server.mjs:972-981`, and `api/server.mjs:1059-1070`. Direct frontend services still accept caller-supplied IDs: `progressService` in `src/features/portal/services/progressService.ts:194-362`, `learningSnapshotService` in `src/features/learning/services/learningSnapshotService.ts:111-136`, `achievementService` in `src/features/portal/services/achievementService.ts:131-217`, `learnerProfileService` in `src/features/learner/services/learnerProfileService.ts:62-197`. | `api/server.mjs`, `src/lib/api/enrollmentApiClient.ts`, `src/features/portal/services/progressService.ts`, `src/features/learning/services/learningSnapshotService.ts`, `src/features/portal/services/achievementService.ts`, `src/features/learner/services/learnerProfileService.ts` | Old server branches and docs remain; browser-side services still trust `databaseUser.id` / `azureUserId` arguments and send them directly to Supabase or RPCs. | Identity spoofing risk remains if browser-side paths stay available after RLS/policy changes or if user IDs are manipulated client-side. | Remove dead `userId` fallback logic from `api/server.mjs` and replace browser-side user-targeted Supabase calls with server-derived identity. |
| Task B4 Secure lesson access gating | Partially Implemented | Server-side lesson gating exists in `api/middleware/lessonAccess.mjs:44-141`, and `EnrollmentGuard` checks server summary in `src/features/courses/components/guards/EnrollmentGuard.tsx:40-79`. Sequential gating fails open on errors in `api/middleware/lessonAccess.mjs:159-165`, `api/middleware/lessonAccess.mjs:184-189`, and `api/middleware/lessonAccess.mjs:212-217`. The active player still loads course/lesson/resource content directly from Supabase in `src/features/portal/pages/CoursePlayerPage.tsx:93-97` and `src/services/courseService.ts:234-395`, instead of using `lessonAccessApiClient.getLessonContent()` from `src/lib/api/lessonAccessApiClient.ts:220-247`. | `api/middleware/lessonAccess.mjs`, `api/server.mjs`, `src/features/courses/components/guards/EnrollmentGuard.tsx`, `src/features/portal/pages/CoursePlayerPage.tsx`, `src/services/courseService.ts`, `src/lib/api/lessonAccessApiClient.ts` | Protected lesson content is not served exclusively through the gated backend path; sequential enforcement is fail-open. | Learners may still receive lesson metadata, video URLs, and resources outside the intended access-check path. | Make the player consume `/api/lessons/content/:courseSlug/:lessonId` for protected lesson payloads and change sequential access checks to fail closed. |
| Task B5 Validate learner progress endpoints | Partially Implemented | A server-owned progress endpoint exists and requires auth in `api/server.mjs:327-423` and `api/server.mjs:1251-1254`. The active frontend progress path still reads/writes directly through Supabase in `src/features/portal/services/progressService.ts:194-362`, with browser client setup in `src/lib/supabase/serviceClient.ts:19-20` and `src/lib/supabase/client.ts:16-27`. Resume state also uses `get_learning_snapshot(courseSlug, userId)` directly from the browser in `src/features/learning/services/learningSnapshotService.ts:131-136`. Quiz completion writes go straight to `quiz_attempts` in `src/features/portal/services/achievementService.ts:141-175`. | `api/server.mjs`, `src/features/portal/services/progressService.ts`, `src/features/learning/services/learningSnapshotService.ts`, `src/features/portal/services/achievementService.ts`, `src/lib/supabase/serviceClient.ts`, `src/lib/supabase/client.ts` | The app is not actually using the hardened backend progress path end-to-end; browser writes are still first-class. | Progress, resume state, and quiz completion remain dependent on client-side DB access and policy behavior rather than server-owned identity enforcement. | Move progress, snapshot, and quiz-attempt mutations behind the backend before re-enabling stricter RLS. |
| `BE-03` Remove legacy serverless learner handlers from deployment | Partially Implemented | `api/enrollment.mjs` and `api/lesson-access.mjs` are not present in the current `api/` tree; current deployed learner entrypoint is `api/[...path].mjs:1-4` forwarding to `api/server.mjs`. Vercel still deploys the serverless `/api/*` surface via `vercel.json:2-10`. Frontend search found no current `src/` references to `/api/lesson-access` or the removed files. | `api/[...path].mjs`, `api/server.mjs`, `vercel.json`, repo `api/` tree | The learner API surface is still serverless and monolithic; there is no evidence in this repo that traffic has moved to a separate canonical backend runtime. | The attack surface is narrower than before, but deployment ownership is still unresolved and backlog acceptance criteria for canonical backend routing are not met. | Confirm the canonical runtime, then either keep `api/server.mjs` as the declared owner or remove this serverless surface from deployment. |
| Learner-state model split dependency (`DATA-01` related) | Blocked by Dependency | Active Stage02A code uses `user_enrollments`, `lesson_progress`, `saved_courses`, `quiz_attempts`, and `get_learning_snapshot` in `api/server.mjs:374-399`, `api/server.mjs:503-505`, `src/features/portal/services/progressService.ts:210-339`, `src/features/portal/services/achievementService.ts:141-215`, and `supabase/migrations/040_add_learning_snapshot_rpc.sql:39-69`. No in-repo matches were found for `module_enrollments`, `module_lesson_progress`, `saved_modules`, or `module_quiz_attempts` across `src/`, `api/`, and `supabase/`. A second learner progress table still exists in migrations as `learner_lesson_progress` in `supabase/migrations/039_add_learner_lesson_progress.sql:5-63` with no runtime usage found. | `api/server.mjs`, `src/features/portal/services/progressService.ts`, `src/features/portal/services/achievementService.ts`, `src/features/learning/services/learningSnapshotService.ts`, `supabase/migrations/027_add_progress_tracking_tables.sql`, `supabase/migrations/039_add_learner_lesson_progress.sql`, `supabase/migrations/040_add_learning_snapshot_rpc.sql`, `supabase/migrations/049_add_saved_courses_table.sql` | Stage02A is tightly bound to the course-scoped model, but the repo still contains alternative learner-state schema history. A canonical model declaration is not present in this repo. | Any move toward module-scoped learner state or alternate progress tables will break current Stage02A services, RPCs, and tests unless coordinated across backend and data workstreams. | Freeze the course-scoped family as the current runtime baseline or publish the migration plan before further Stage02A hardening work. |

## 4. File-Level Findings

### `api/server.mjs`

- The router now enforces auth on `/api/enrollment/*` and `/api/saved-courses` at `api/server.mjs:1265-1338`.
- The same file still contains legacy `userId`-fallback logic inside handlers at `api/server.mjs:613-622`, `api/server.mjs:681-690`, `api/server.mjs:756-769`, `api/server.mjs:972-981`, and `api/server.mjs:1059-1070`.
- Endpoint banners still advertise `?userId=xxx` in `api/server.mjs:1414-1419`, which indicates the legacy contract has not been fully removed.
- Lesson-access routes remain optional-auth in `api/server.mjs:1221-1229`, which is compatible with preview content but not with a strict "authenticated users only" interpretation for Stage02A.

### `api/middleware/lessonAccess.mjs`

- The middleware uses the course-scoped learner model: `user_enrollments` at `api/middleware/lessonAccess.mjs:89-105` and `lesson_progress` at `api/middleware/lessonAccess.mjs:175-205`.
- Sequential gating is fail-open on query failure or exception at `api/middleware/lessonAccess.mjs:159-165`, `api/middleware/lessonAccess.mjs:184-189`, and `api/middleware/lessonAccess.mjs:212-217`.
- `getCourseAccessSummary()` builds lesson/module accessibility summaries, but it is not the content-serving path; it is a read-model used by the frontend guard.

### `src/features/courses/components/guards/EnrollmentGuard.tsx`

- The active learner route gate calls `lessonAccessApiClient.getCourseAccessSummary(courseSlug)` in `src/features/courses/components/guards/EnrollmentGuard.tsx:49-64`.
- This confirms the active routed Stage02A shell does check a backend summary before entering `/portal/learning/:courseId`.
- The guard only checks enrollment summary; it does not ensure that subsequent lesson payloads come from the same gated backend path.

### `src/features/portal/pages/CoursePlayerPage.tsx` and `src/services/courseService.ts`

- After route entry, the course player fetches course, lessons, and resources directly from Supabase in `src/features/portal/pages/CoursePlayerPage.tsx:93-97`.
- Those functions map raw `lessons.video_url`, `lessons.resource_url`, and `course_resources.resource_url` from browser Supabase queries in `src/services/courseService.ts:260-395`.
- The player writes progress by calling `updateLessonProgress(databaseUser.id, ...)` and `updateEnrollmentProgress(databaseUser.id, ...)` in `src/features/portal/pages/CoursePlayerPage.tsx:357-364`, which feeds browser-side Supabase writes rather than `/api/lessons/progress`.

### `src/features/portal/services/progressService.ts`

- The header comment says "all operations now go through backend APIs", but the implementation still queries and updates `user_enrollments` and `lesson_progress` directly in `src/features/portal/services/progressService.ts:210-339`.
- The browser client comes from `getSupabaseForEnrollment()` in `src/lib/supabase/serviceClient.ts:19-20`, which simply returns `getSupabase()`.
- `getSupabase()` uses the public anon client in `src/lib/supabase/client.ts:16-27`; it is not deriving identity from the Stage02A backend.

### `src/features/learning/services/learningSnapshotService.ts`

- Resume state is loaded through `get_learning_snapshot` with a caller-provided `userId` in `src/features/learning/services/learningSnapshotService.ts:131-136`.
- The RPC itself joins `user_enrollments` and `lesson_progress` by `p_user_id` in `supabase/migrations/040_add_learning_snapshot_rpc.sql:39-69`.
- `InProgressPage` passes `databaseUser.id` into this service in `src/features/portal/pages/InProgressPage.tsx:111-125`.

### `src/features/courses/pages/CourseAssessment.tsx` and `src/features/portal/services/achievementService.ts`

- Quiz completion and course-completion side effects are direct Supabase writes, not backend calls.
- `CourseAssessment` invokes `recordQuizAttempt(databaseUser.id, ...)` and `recordCourseCompletion(databaseUser.id, ...)` in `src/features/courses/pages/CourseAssessment.tsx:244-255`.
- `achievementService` upserts `quiz_attempts`, `earned_badges`, `user_xp`, and updates `user_enrollments` directly in `src/features/portal/services/achievementService.ts:64-217`.

### `src/features/learning/pages/LearningScreen.tsx`

- A second learner implementation still exists and directly loads course, lesson, and resource data from Supabase in `src/features/learning/pages/LearningScreen.tsx:63-106`.
- This component also keeps progress local-only in `src/features/learning/pages/LearningScreen.tsx:235-249`.
- It is not the active route in `src/AppRouter.tsx`, but it remains a maintenance and audit-drift risk.

## 5. Dependency Risks

### Course-scoped learner-state dependency is real

The active Stage02A implementation depends on:

- `user_enrollments`
- `lesson_progress`
- `saved_courses`
- `quiz_attempts`
- `get_learning_snapshot`

Evidence:

- backend handlers: `api/server.mjs:374-399`, `api/server.mjs:503-505`, `api/server.mjs:654-659`, `api/server.mjs:721-726`, `api/server.mjs:835-872`, `api/server.mjs:949-953`, `api/server.mjs:1021-1025`, `api/server.mjs:1101-1111`
- frontend progress: `src/features/portal/services/progressService.ts:210-339`
- frontend achievements: `src/features/portal/services/achievementService.ts:141-215`
- snapshot RPC: `supabase/migrations/040_add_learning_snapshot_rpc.sql:39-69`

### No active module-scoped dependency was found

Repo search across `src/`, `api/`, and `supabase/` found no current matches for:

- `module_enrollments`
- `module_lesson_progress`
- `saved_modules`
- `module_quiz_attempts`

That means current Stage02A is not yet split across both table families in code. It is currently coupled to the course-scoped family only.

### There is still learner-state schema drift

- `supabase/migrations/039_add_learner_lesson_progress.sql:5-63` creates `learner_lesson_progress`.
- No runtime Stage02A code was found using `learner_lesson_progress`.
- This is not the exact module-scoped split from the backlog wording, but it is still a second learner-progress model in schema history.

## 6. Recommended Next Actions for Dev B

1. Treat Stage02A as `mixed-path` until direct Supabase learner-state calls are removed from `progressService`, `learningSnapshotService`, `achievementService`, and learner profile services.
2. Close the residual identity gap by removing `query.userId` / `body.userId` branches and endpoint docs from `api/server.mjs`.
3. Make the portal player use gated lesson payloads from `/api/lessons/content/:courseSlug/:lessonId` instead of direct `fetchCourseLessons()` / `fetchCourseResources()` browser reads.
4. Decide whether `api/server.mjs` is the canonical learner backend. `BE-03` cannot be marked done in this repo until that runtime decision is explicit.
5. Add focused verification coverage for:
   - anonymous `GET /api/enrollment/status/:courseSlug` returning `401`
   - unenrolled learner denied on lesson content path
   - progress written under server-derived identity only
   - resume snapshot not accepting arbitrary user targeting

## 7. Open Questions / Blockers

- Is `api/server.mjs` the intended canonical learner backend, or is Stage02A supposed to move to the separate Express runtime referenced in the architecture audit?
- Should `src/features/learning/pages/LearningScreen.tsx` be deleted as legacy, or is it still expected to be supported later?
- Are browser reads of `lessons`, `course_resources`, and `quiz_attempts` expected to survive after RLS hardening, or should those be treated as temporary drift?
- Is `learner_lesson_progress` officially deprecated? No active Stage02A runtime usage was found.
- The current verification baseline is incomplete because typecheck and test suite are not green:
  - `npx tsc --noEmit` fails on existing repo issues
  - `npm run test:run` fails in progress-service and course-catalog suites, so Stage02A hardening cannot be called verified from automated checks alone
