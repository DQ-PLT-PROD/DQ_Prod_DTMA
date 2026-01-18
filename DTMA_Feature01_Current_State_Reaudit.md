# DTMA_Feature01_Current_State_Reaudit

1) Executive Verdict

State: In progress (Partial)

Confidence: High

- Backend progress persistence is implemented via `user_enrollments` + `lesson_progress` tables and a snapshot RPC, but the spec-aligned `learner_lesson_progress` table exists and is not wired into the app.
- Learning load restores completion and resume position from Supabase RPC (`get_learning_snapshot`) and seeks the player using `currentTime` state, but RPC failures can collapse the lesson list to empty.
- Progress writes are throttled and persisted to `lesson_progress` with watch time + completion timestamps, and enrollment progress updates `user_enrollments.progress_pct`.
- LocalStorage is no longer used for progress (no fallback cache), and the Hero CTA has no progress-driven resume indicator.
- RLS policies exist but are tied to `auth.uid()` (Supabase Auth), while the app uses a service-role client from the frontend for MSAL, indicating a temporary/unsecured integration.

2) Spec Compliance Matrix

| Spec Requirement | Status (Done/Partial/Not Found/Blocked) | Evidence (file paths) | Notes |
| --- | --- | --- | --- |
| Supabase migration exists for progress table | Partial | `supabase/migrations/027_add_progress_tracking_tables.sql`, `supabase/migrations/039_add_learner_lesson_progress.sql` | Two progress schemas exist; app uses `lesson_progress` + `user_enrollments`, while spec-aligned `learner_lesson_progress` is unused. |
| Progress table schema matches expected fields (user_id, course_id, lesson_id, status, progress, position, timestamps) | Partial | `supabase/migrations/039_add_learner_lesson_progress.sql`, `supabase/migrations/027_add_progress_tracking_tables.sql` | `learner_lesson_progress` matches spec fields but not used by code; `lesson_progress` lacks course_id/status/progress_percent/last_position_seconds. |
| RLS policies exist and are correct for current auth model (Entra ID, not Supabase Auth) | Partial | `supabase/migrations/027_add_progress_tracking_tables.sql`, `supabase/migrations/039_add_learner_lesson_progress.sql`, `src/lib/supabase/serviceClient.ts` | Policies rely on `auth.uid()`; frontend uses service-role key to bypass RLS. No MSAL-to-Supabase auth mapping. |
| Frontend has progress service layer (read/write) | Done | `src/features/learning/services/progressService.ts`, `src/features/learning/services/learningSnapshotService.ts` | Dedicated services for progress + snapshot RPC. |
| LearningScreen reads backend progress on load | Done | `src/features/learning/pages/LearningScreen.tsx`, `src/features/learning/services/learningSnapshotService.ts` | Uses `getLearningSnapshot` and merges `lessonProgress` into UI lessons. |
| LearningScreen writes backend progress on events/throttled | Done | `src/features/learning/pages/LearningScreen.tsx`, `src/features/learning/services/progressService.ts` | Throttled sync every 20s + forced sync on pause/next/prev/completion. |
| Resume selects last accessed lesson | Done | `supabase/migrations/041_fix_learning_snapshot_rpc.sql`, `src/features/learning/pages/LearningScreen.tsx` | RPC orders by `lesson_progress.updated_at` to set `resumeLessonId`; LearningScreen selects it. |
| Resume restores playback position (if implemented) | Done | `src/features/learning/pages/LearningScreen.tsx`, `src/features/learning/components/VideoPlayer.tsx` | `lesson_progress.watch_time_seconds` -> `currentTime`, VideoPlayer seeks when delta > 0.5s. |
| LocalStorage is fallback only (backend is source of truth) | Not Found | `rg "localStorage" src` | No progress localStorage fallback present. |
| HeroSection uses consistent progress source/key | Not Found | `src/features/landing/HeroSection.tsx` | `hasStarted` state is never set; no progress lookup. |

3) Data Model & Security Check

3.1 Migrations

- `supabase/migrations/027_add_progress_tracking_tables.sql`: Adds `user_enrollments` and `lesson_progress` with RLS and updated_at triggers.
- `supabase/migrations/028_update_enrollment_schema.sql`: Adds enrollment status/method and lesson preview flag; updates RLS policies.
- `supabase/migrations/039_add_learner_lesson_progress.sql`: Adds spec-aligned `learner_lesson_progress` table with status/progress/position fields and RLS.
- `supabase/migrations/040_add_learning_snapshot_rpc.sql`: Adds `get_learning_snapshot` RPC (UUID user_id).
- `supabase/migrations/041_fix_learning_snapshot_rpc.sql`: Replaces RPC to accept TEXT user_id and query `user_enrollments`/`lesson_progress`.

3.2 RLS / Authorization Reality

- Requests are made from the frontend via `getSupabaseForEnrollment()` using a service-role key embedded in the client (`src/lib/supabase/serviceClient.ts`).
- If service role is unavailable, the client falls back to anon, but RLS policies use `auth.uid()` and would block progress/enrollment operations (`supabase/migrations/027_add_progress_tracking_tables.sql`).
- There is no backend proxy in this repo for progress operations; authorization is effectively service-role from the browser (temporary/unsecured).

4) Read Path (Progress Restore)

- Fetch on load: `getLearningSnapshot(courseId, databaseUser?.id)` in `src/features/learning/pages/LearningScreen.tsx`.
- Backend source: `get_learning_snapshot` RPC queries `user_enrollments` + `lesson_progress` and returns `resumeLessonId` (`supabase/migrations/041_fix_learning_snapshot_rpc.sql`).
- Merge into lessons: `lessonProgress` -> `completedIds` -> `toUILesson` mapping (`src/features/learning/pages/LearningScreen.tsx`, `src/types/course.ts`).
- Resume selection: `resumeLessonId` is matched to lesson id and sets `currentLessonIndex`; otherwise index 0 (`src/features/learning/pages/LearningScreen.tsx`).
- Playback position: `watch_time_seconds` mapped into `lessonPositionsRef` and applied via `currentTime` (`src/features/learning/pages/LearningScreen.tsx`, `src/features/learning/components/VideoPlayer.tsx`).
- 0 rows behavior: empty `lessonProgress` results in no completed lessons and `resumeLessonId` undefined; defaults to first lesson (`src/features/learning/pages/LearningScreen.tsx`).
- Network/RPC error: `getLearningSnapshot` returns empty snapshot; LearningScreen renders “No lessons found” (`src/features/learning/services/learningSnapshotService.ts`, `src/features/learning/pages/LearningScreen.tsx`).

5) Write Path (Progress Save)

- Write entry point: `handleTimeUpdate` -> `syncLessonProgress` in `src/features/learning/pages/LearningScreen.tsx`.
- Trigger events:
  - Time updates (throttled)
  - Pause (`handlePlayPause`)
  - Next/Prev/lesson select (`handleNext`, `handlePrev`, `handleLessonSelect`)
  - Near-end auto-complete (`completeLesson`)
- Throttling: `PROGRESS_SYNC_INTERVAL_MS = 20000` with `lastProgressSyncRef` (`src/features/learning/pages/LearningScreen.tsx`).
- Persistence fields: `lesson_progress` upsert with `completed`, `watch_time_seconds`, `completed_at`, `updated_at` (`src/features/learning/services/progressService.ts`).
- Enrollment progress: `updateEnrollmentProgress` writes `user_enrollments.progress_pct` and `completed_at` when >=100 (`src/features/learning/services/progressService.ts`).
- Error handling: warnings logged and no UI crash; no localStorage fallback (`src/features/learning/pages/LearningScreen.tsx`, `src/features/learning/services/progressService.ts`).

6) LocalStorage Usage Audit

- Progress keys: Not found (no progress localStorage usage in `src`).
- Existing localStorage usage unrelated to progress: MSAL cache and mock auth only (`src/services/auth/msal.ts`, `src/services/auth/mockAuth.ts`).
- Hero/learning key consistency: Not applicable; no progress keys are read or written in `HeroSection` or `LearningScreen`.

7) Gaps / Blockers (Max 10)

- Spec-aligned `learner_lesson_progress` table exists but is not used by the frontend (`supabase/migrations/039_add_learner_lesson_progress.sql`, `src/features/learning/services/progressService.ts`).
- Current progress persistence uses `lesson_progress` (enrollment-based) and lacks `status`, `progress_percent`, `last_position_seconds`, and `course_id` fields expected by the spec (`supabase/migrations/027_add_progress_tracking_tables.sql`).
- RLS policies depend on `auth.uid()` (Supabase Auth), but the app uses MSAL and a service-role client in the browser (`supabase/migrations/027_add_progress_tracking_tables.sql`, `src/lib/supabase/serviceClient.ts`).
- No progress localStorage fallback; if RPC fails, lessons may render empty and progress is lost from UI state (`src/features/learning/services/learningSnapshotService.ts`, `src/features/learning/pages/LearningScreen.tsx`).
- Hero CTA resume indicator not wired (state never set, no progress lookup) (`src/features/landing/HeroSection.tsx`).

8) “Done Today” Feasibility

Not closable today

Top 3 reasons:
- The implementation persists to `lesson_progress`, but the spec’s table (`learner_lesson_progress`) is not wired or referenced.
- Auth/RLS alignment is incomplete; progress relies on service-role from the frontend and `auth.uid()` policies that don’t match MSAL.
- No localStorage fallback path for progress or resume, and Hero CTA does not reflect progress.

Top 3 actions required:
- Decide and align on a single progress table: either wire the app to `learner_lesson_progress` or update the spec to match `lesson_progress`.
- Implement an auth-safe access pattern for progress writes/reads (backend proxy or MSAL-to-Supabase auth mapping) and update RLS accordingly.
- Add a minimal fallback cache and Hero CTA progress check so progress UX survives RPC errors.
