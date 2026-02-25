## 1) Executive Verdict
- State: Partial
- Confidence: High
- Enrollment data foundation exists in `user_enrollments` with unique user-course constraint, status, method, progress, and timestamps.
- A backend enforcement stack exists (`api/server.mjs`, `api/middleware/auth.mjs`, `api/middleware/lessonAccess.mjs`) with Entra token validation and 401/403 handling.
- Active runtime paths still rely heavily on frontend direct Supabase access via service-role client (`src/lib/supabase/serviceClient.ts`, `src/lib/enrollment/service.ts`, `src/features/portal/services/progressService.ts`).
- Route-level guard component exists but is not mounted on learning routes (`src/features/courses/components/guards/EnrollmentGuard.tsx`, `src/AppRouter.tsx`).
- Lesson-level gating exists in UI (`CourseOutline`, `PreviewContentGate`) and backend middleware, but frontend player still consumes direct lesson URLs from course fetches.
- Identity model mismatch risk is material: frontend syncs `users.azure_user_id` from MSAL account ids, while backend enrollment queries use token `oid/sub` as `user_id`.
- Access contract exists in frontend and backend, but contract remains minimal (no reason codes/lifecycle reason details).
- Lifecycle is partial: cancel and re-enroll paths exist; completion uses `completed_at`/progress but no `status='completed'`; revoke is not implemented in runtime code.
- Discovery/course CTA logic is partially integrated; dashboard paths use enrollment/progress reads directly, not a centralized backend access contract.
- Security hardening is incomplete for end-state: browser-exposed service-role pattern and `auth.uid()`-based RLS coupling remain.
- Test coverage is partial: unit tests exist for enrollment/CTA logic, plus standalone API/e2e scripts; no integrated API test suite and no route guard tests found.

## 2) Current Architecture Snapshot
- Identity source (MSAL claims, which identifier is used):
  - Frontend auth sync uses `localAccountId || homeAccountId` as Azure user id (`src/lib/auth/AuthContext.tsx`).
  - Backend auth middleware extracts `azureUserId` from token `oid || sub` (`api/middleware/auth.mjs`).
  - Enrollment table uses `user_id` referencing `users.id` UUID (`supabase/migrations/027_add_progress_tracking_tables.sql`).
- Persistence layer (Supabase tables used):
  - Core: `user_enrollments`, `lesson_progress`, `subscriptions` (`supabase/migrations/027_add_progress_tracking_tables.sql`, `029_add_subscriptions_table.sql`).
  - Additional/parallel progress schema exists: `learner_lesson_progress` (`supabase/migrations/039_add_learner_lesson_progress.sql`).
- Access enforcement pattern (frontend-only vs backend):
  - Both exist, but active UI mostly uses frontend Supabase services (`src/lib/enrollment/service.ts`, `src/features/portal/services/progressService.ts`).
  - Backend enforcement APIs exist (`/api/enrollment/*`, `/api/lessons/*`) in `api/server.mjs` and middleware.
- Any temporary/insecure patterns detected:
  - Browser-side service-role client using `VITE_SUPABASE_SERVICE_ROLE_KEY` (`src/lib/supabase/serviceClient.ts`, `src/vite-env.d.ts`, `.env.example`).
  - Temporary scripts include disabling RLS (`supabase/scripts/disable_rls_temp.sql`).
  - RLS policies depend on `auth.uid()` while app identity is Entra/MSAL (`supabase/migrations/027_add_progress_tracking_tables.sql`, `028_update_enrollment_schema.sql`).

## 3) Spec Compliance Matrix (End-State)

| Capability | Status (Present/Partial/Not Found/Blocked) | Evidence (file paths) | Notes |
|---|---|---|---|
| ### Data Model |  |  |  |
| Enrollment/entitlement table exists | Present | `supabase/migrations/027_add_progress_tracking_tables.sql` | `public.user_enrollments` created. |
| Unique constraint (user-course) | Present | `supabase/migrations/027_add_progress_tracking_tables.sql` | `UNIQUE (user_id, course_slug)`. |
| Status/state field exists (active/completed/expired/revoked) | Partial | `supabase/migrations/028_update_enrollment_schema.sql`, `supabase/migrations/030_align_enrollment_status.sql` | Current statuses are `active/cancelled/expired`; no runtime `completed` status, revoked replaced. |
| access_start_at / access_end_at exist | Not Found | `supabase/migrations`, `src/lib/supabase/types.ts` | Search run: `rg "access_start_at|access_end_at" d:\DTMA\DQ_Prod_DTMA` returned no matches. |
| enrollment_method exists | Present | `supabase/migrations/028_update_enrollment_schema.sql`, `src/lib/enrollment/service.ts` | Column and write paths exist. |
| last_accessed_at exists | Present | `supabase/migrations/027_add_progress_tracking_tables.sql`, `src/features/portal/services/progressService.ts` | Column exists and is updated. |
| progress_pct exists | Present | `supabase/migrations/027_add_progress_tracking_tables.sql`, `src/features/portal/services/progressService.ts` | Column exists and updates occur. |
| ### Access Decision Engine |  |  |  |
| Central function/service exists (e.g., canAccess / getAccessContract) | Present | `src/lib/enrollment/service.ts`, `api/middleware/lessonAccess.mjs`, `api/server.mjs` | Frontend `getAccessContract`; backend `checkLessonAccess` and enrollment access endpoint. |
| Contract includes reason/status (not just boolean) | Partial | `api/middleware/lessonAccess.mjs`, `api/server.mjs`, `src/lib/enrollment/service.ts` | Lesson checks include `reason/accessType`; enrollment access contract does not include reason. |
| Preview access supported | Present | `api/middleware/lessonAccess.mjs`, `src/features/portal/components/PreviewContentGate.tsx`, `src/features/courses/components/CourseOutline.tsx` | Implemented in backend and UI. |
| ### Enforcement |  |  |  |
| Frontend route guard exists for learning routes | Partial | `src/features/courses/components/guards/EnrollmentGuard.tsx`, `src/AppRouter.tsx` | Guard exists but is not applied to `/portal/learning/:courseId`. |
| Lesson-level gating exists | Partial | `src/features/courses/components/CourseOutline.tsx`, `src/features/portal/components/PreviewContentGate.tsx`, `api/middleware/lessonAccess.mjs` | UI and backend logic exist, but active player flow still fetches media directly from lesson data. |
| Backend API enforcement exists (DTMA-API) | Present | `api/server.mjs`, `api/middleware/lessonAccess.mjs` | Enrollment and lesson endpoints enforce access checks server-side. |
| Entra token validation middleware exists (DTMA-API) | Present | `api/middleware/auth.mjs` | JWKS validation and token claim extraction implemented. |
| Backend returns 401/403 appropriately | Present | `api/middleware/auth.mjs`, `api/server.mjs`, `api/middleware/lessonAccess.mjs` | Explicit 401/403 responses in auth and access handlers. |
| ### Lifecycle |  |  |  |
| Completion transition supported | Partial | `src/features/portal/services/progressService.ts`, `supabase/migrations/041_migrate_legacy_completions.sql` | Completion tracked via `completed_at` and `progress_pct`; no status transition to `completed`. |
| Expiry supported (time-based) | Partial | `supabase/migrations/030_align_enrollment_status.sql`, `src/lib/enrollment/service.ts` | Expired status/function exists; no access window fields or scheduled expiry enforcement found. |
| Renew/reactivate supported | Partial | `src/lib/enrollment/service.ts`, `supabase/migrations/030_align_enrollment_status.sql` | Re-enroll/reactivate logic exists in frontend + SQL function; no dedicated backend endpoint. |
| Revocation supported (admin/system) | Not Found | `src`, `api` | Search run: `rg "revoked|revoke" d:\DTMA\DQ_Prod_DTMA\src d:\DTMA\DQ_Prod_DTMA\api` returned no runtime matches. |
| Cancellation supported (if planned) | Present | `src/lib/enrollment/service.ts`, `api/server.mjs`, `supabase/migrations/030_align_enrollment_status.sql` | Cancel path implemented in frontend service and backend API. |
| ### UX States |  |  |  |
| Not enrolled -> Enroll CTA | Present | `src/components/enrollment/EnrollmentButton.tsx`, `src/features/courses/pages/CourseDetailsPage.tsx` | Enroll CTA appears with sign-in flow. |
| Active -> Continue CTA | Present | `src/components/enrollment/EnrollmentButton.tsx`, `src/features/courses/utils/ctaStateManager.ts` | Continue state implemented. |
| Completed -> Review/View | Partial | `src/features/courses/utils/ctaStateManager.ts` | "View Certificate" depends on progress input; not consistently wired across views. |
| Expired -> Renew | Present | `src/components/enrollment/EnrollmentButton.tsx`, `src/lib/enrollment/service.ts` | Expired/cancelled maps to re-enroll CTA. |
| Revoked -> Contact support | Not Found | `src/components/enrollment/EnrollmentButton.tsx`, `src/features/courses/utils/ctaStateManager.ts` | No revoked state/UI flow found. |
| ### Integrations |  |  |  |
| Discovery/course details CTAs reflect enrollment status | Partial | `src/features/courses/components/CourseCard.tsx`, `src/components/enrollment/EnrollmentButton.tsx`, `src/features/courses/pages/CourseDetailsPage.tsx` | Implemented, but relies on frontend Supabase service paths. |
| Dashboard uses enrollment contract (in-progress, completed, etc.) | Not Found | `src/features/portal/pages/InProgressPage.tsx`, `src/features/portal/services/progressService.ts` | Dashboard reads enrollments/progress directly; no `getAccessContract` usage found. |
| AI widget can explain access (optional) | Not Found | `src/lib/ai-widget/utils/intentRegistry.ts` | AI intents cover generic enrollment help; no contract/status explanation flow. |
| ### Security |  |  |  |
| No service-role key in browser for enrollment writes | Blocked | `src/lib/supabase/serviceClient.ts`, `src/vite-env.d.ts`, `.env.example`, `src/lib/enrollment/service.ts` | Browser service-role path is present and used by enrollment/progress services. |
| RLS policies align with MSAL identity OR backend proxy exists | Partial | `supabase/migrations/027_add_progress_tracking_tables.sql`, `supabase/migrations/028_update_enrollment_schema.sql`, `api/server.mjs` | Backend proxy exists, but active frontend bypasses via service-role and policies depend on `auth.uid()`. |
| Any auth.uid() dependencies flagged | Present | `supabase/migrations/027_add_progress_tracking_tables.sql`, `supabase/migrations/028_update_enrollment_schema.sql`, `supabase/migrations/039_add_learner_lesson_progress.sql` | Multiple policies tie access to `auth.uid()` despite Entra-first identity model. |
| ### Observability |  |  |  |
| Logs for enrollment create/update | Present | `api/server.mjs`, `api/middleware/requestLogger.mjs` | Enrollment and access events logged via middleware and handlers. |
| Metrics/events (optional) | Partial | `api/middleware/requestLogger.mjs`, `src/lib/ai-widget/hooks/useAIWidget.ts` | Console logging exists; no durable enrollment metrics pipeline found. |
| Audit trail fields present | Present | `supabase/migrations/027_add_progress_tracking_tables.sql`, `supabase/migrations/030_align_enrollment_status.sql` | `created_at`, `updated_at`, `started_at`, `cancelled_at`, `last_accessed_at` exist. |
| ### Testing |  |  |  |
| Unit tests for enrollment service/guard | Partial | `src/features/courses/services/__tests__/enrollmentService.test.ts`, `src/features/courses/utils/__tests__/ctaStateManager.test.ts` | Enrollment/CTA unit tests exist; no `EnrollmentGuard` tests found. |
| API tests (if API exists) | Partial | `test-auth-api.mjs`, `test-api.mjs`, `test-lesson-access-api.mjs` | Script-based tests exist, not integrated into package test runner. |
| E2E tests (optional) | Partial | `test-e2e-lesson-access.mjs`, `test-all-passing.mjs` | End-to-end scripts exist but are standalone Node scripts. |

## 4) Code Walkthrough (Evidence-Based)
### 4.1 Read Path
- User identity originates in MSAL auth context, then DB user sync:
  - `src/lib/auth/AuthContext.tsx` uses `localAccountId || homeAccountId` for `azure_user_id` sync.
  - `src/lib/auth/userService.ts` reads/writes `users` by `azure_user_id`.
- Course/discovery access decisions:
  - `src/features/courses/components/CourseCard.tsx` calls `getAccessContract` from `src/lib/enrollment/service.ts`.
  - `src/features/courses/utils/ctaStateManager.ts` maps contract to CTA state.
- Learning route runtime checks:
  - `src/features/portal/pages/CoursePlayerPage.tsx` calls `isUserEnrolled(databaseUser.id, courseId)` and redirects unenrolled users.
  - `src/features/learning/pages/LearningScreen.tsx` performs similar client-side checks and uses `PreviewContentGate`.
  - `src/features/courses/components/CourseOutline.tsx` applies lesson UI locking rules using `isUserEnrolled` and sequential UI logic.
- Backend read path (available, limited active wiring):
  - `api/server.mjs` exposes `/api/enrollment/access/:courseSlug` and `/api/lessons/course-access/:courseSlug`.
  - `api/middleware/lessonAccess.mjs` computes per-lesson decisions including `reason` and `accessType`.

### 4.2 Write Path
- Enrollment CTA path (current frontend path):
  - `src/components/enrollment/EnrollmentButton.tsx` -> `enrollInCourse(databaseUser.id, courseSlug)` -> `src/lib/enrollment/service.ts` insert into `user_enrollments`.
  - Data shape written: `user_id`, `course_slug`, `started_at`, `last_accessed_at`, `progress_pct`, `status`, `enrollment_method`.
- Payment success path:
  - `src/features/courses/components/payment/PaymentSuccessHandler.tsx` -> `enrollInCourse(...)` in frontend service.
- Backend enrollment write path (implemented API):
  - `api/server.mjs` `/api/enrollment/enroll` checks duplicate enrollment first, then inserts new row (idempotent for already-active enrollments).
- Update paths:
  - Cancel: frontend `cancelEnrollment` (`src/lib/enrollment/service.ts`) and backend `/api/enrollment/cancel` (`api/server.mjs`).
  - Progress/completion updates: `src/features/portal/services/progressService.ts` updates `lesson_progress` and `user_enrollments.progress_pct` and sets `completed_at` at >=100.
- Idempotency behavior:
  - Frontend and backend enrollment creation both check existing active enrollment and return success without duplicate insert.

### 4.3 Gating Points Inventory
- Route-level gating component (not mounted):
  - `src/features/courses/components/guards/EnrollmentGuard.tsx`
- Active route declarations:
  - `src/AppRouter.tsx` (learning route is `CoursePlayerPage` directly)
- Learning page client checks:
  - `src/features/portal/pages/CoursePlayerPage.tsx`
  - `src/features/learning/pages/LearningScreen.tsx`
- Lesson UI gate components:
  - `src/features/portal/components/PreviewContentGate.tsx`
  - `src/features/courses/components/CourseOutline.tsx`
- Frontend access service logic:
  - `src/lib/enrollment/service.ts`
- Backend enforcement middleware and endpoints:
  - `api/middleware/lessonAccess.mjs`
  - `api/server.mjs`
  - `api/middleware/auth.mjs`

## 5) Data Model Inventory (Migrations)
- `supabase/migrations/027_add_progress_tracking_tables.sql`
  - Adds `user_enrollments` and `lesson_progress`, unique user-course constraint, progress fields, RLS policies.
- `supabase/migrations/028_update_enrollment_schema.sql`
  - Adds `status` and `enrollment_method`; adds lesson `is_preview`; updates enrollment RLS and helper functions.
- `supabase/migrations/029_add_subscriptions_table.sql`
  - Adds `subscriptions` table for access contract subscription checks.
- `supabase/migrations/030_align_enrollment_status.sql`
  - Migrates status model from revoked to cancelled/expired; adds `cancelled_at`; adds cancel/expire/reactivate functions.
- `supabase/migrations/039_add_learner_lesson_progress.sql`
  - Adds parallel `learner_lesson_progress` schema (TEXT user_id, `auth.uid()` RLS), creating dual progress models.
- `supabase/migrations/040_add_learning_snapshot_rpc.sql`
  - Adds snapshot RPC using UUID user id.
- `supabase/migrations/041_fix_learning_snapshot_rpc.sql`
  - Changes snapshot RPC to TEXT user id comparison (`e.user_id::text = p_user_id`).
- `supabase/migrations/042_fix_learning_snapshot_rpc_ambiguous.sql`
  - Fixes ambiguity in snapshot RPC variable naming.
- `supabase/migrations/041_migrate_legacy_completions.sql`
  - Migrates legacy completions into `user_enrollments` with `completed_at` and `progress_pct=100`.

Schema mismatches called out:
- Identity key mismatch: `user_enrollments.user_id` references `users.id` UUID, but backend enrollment handlers query/write using Entra `oid/sub` (`api/server.mjs`) rather than mapped `users.id`.
- Lifecycle status mismatch vs end-state: no `status='completed'`; completion represented via `completed_at` and progress.
- Access window fields missing: no `access_start_at`/`access_end_at` in schema/types.
- Type drift: runtime code uses `cancelled_at`, but `src/lib/supabase/types.ts` `user_enrollments` typing does not include `cancelled_at`.
- Duplicate/parallel progress schemas (`lesson_progress` vs `learner_lesson_progress`) increase correctness risk.

## 6) Risks & Blockers (Top 10)
1. Browser service-role exposure for enrollment/progress writes can bypass intended access boundaries. Evidence: `src/lib/supabase/serviceClient.ts`, `src/lib/enrollment/service.ts`, `src/features/portal/services/progressService.ts`, `src/vite-env.d.ts`.
2. Backend identity mismatch likely breaks API-based enrollment checks/writes for real users (`oid/sub` vs `users.id`). Evidence: `api/middleware/auth.mjs`, `api/server.mjs`, `supabase/migrations/027_add_progress_tracking_tables.sql`, `src/lib/auth/userService.ts`.
3. Route guard exists but is not applied; route-level enforcement objective is not actually met. Evidence: `src/features/courses/components/guards/EnrollmentGuard.tsx`, `src/AppRouter.tsx`.
4. Frontend and backend enforcement paths diverge; active UI mostly bypasses backend policy endpoints. Evidence: `src/lib/enrollment/service.ts`, `src/features/portal/pages/CoursePlayerPage.tsx`, `src/lib/api/enrollmentApiClient.ts`.
5. Access contract is too thin for lifecycle-grade gating (no reason codes for enrollment-level decisions). Evidence: `src/lib/enrollment/service.ts`, `api/server.mjs`.
6. Revocation lifecycle is absent in runtime code, preventing a complete entitlement lifecycle. Evidence: no matches for runtime revoke flow in `src`/`api` (`rg "revoked|revoke" ...`), only historical migration mention.
7. Completion lifecycle modeled via `completed_at` rather than explicit entitlement status, causing ambiguous state handling. Evidence: `src/features/portal/services/progressService.ts`, `supabase/migrations/041_migrate_legacy_completions.sql`.
8. RLS/auth alignment remains fragile (`auth.uid()` dependency + Entra-first app model + service-role workaround scripts). Evidence: `supabase/migrations/027_add_progress_tracking_tables.sql`, `028_update_enrollment_schema.sql`, `supabase/scripts/disable_rls_temp.sql`.
9. Dashboard/discovery state consistency risk: multiple code paths fetch enrollment/progress differently and not through one contract. Evidence: `src/features/portal/pages/InProgressPage.tsx`, `src/features/landing/components/Home.tsx`, `src/features/courses/components/CourseCard.tsx`.
10. Test strategy fragmentation: script-based API/e2e checks are not integrated into `npm test`, reducing release confidence. Evidence: `package.json`, `test-auth-api.mjs`, `test-e2e-lesson-access.mjs`.

## 7) "Next Actions" Roadmap (Max 12)
1. Change: Enforce a single identity bridge in backend: map Entra `oid/sub` to `users.id` before any enrollment/progress query/write.
Files/tables involved: `api/server.mjs`, `api/middleware/auth.mjs`, `users`, `user_enrollments`.
Why it matters: fixes correctness/security for backend enforcement and unblocks API-first architecture.

2. Change: Remove browser service-role usage for enrollment/progress; route all writes through backend APIs.
Files/tables involved: `src/lib/supabase/serviceClient.ts`, `src/lib/enrollment/service.ts`, `src/features/portal/services/progressService.ts`, `api/server.mjs`.
Why it matters: eliminates key exposure risk and restores enforceable backend controls.

3. Change: Mount route guard on learning routes and use backend course-access summary as source of truth.
Files/tables involved: `src/AppRouter.tsx`, `src/features/courses/components/guards/EnrollmentGuard.tsx`.
Why it matters: closes route-level bypass and aligns with end-state gating requirements.

4. Change: Switch CoursePlayer/LearningScreen lesson content loading to `/api/lessons/content/*` endpoints.
Files/tables involved: `src/features/portal/pages/CoursePlayerPage.tsx`, `src/features/learning/pages/LearningScreen.tsx`, `src/lib/api/lessonAccessApiClient.ts`.
Why it matters: enforces backend lesson-level authorization instead of frontend-only media URL exposure.

5. Change: Expand access contract to include decision reason and lifecycle action hints (`reason`, `nextAction`, `isExpired`, `isRevoked`).
Files/tables involved: `api/server.mjs`, `src/lib/api/enrollmentApiClient.ts`, `src/lib/enrollment/service.ts`.
Why it matters: enables consistent UX states and deterministic policy behavior.

6. Change: Add explicit entitlement lifecycle fields and transitions (`access_start_at`, `access_end_at`, optional `revoked_at`, `completed_at` policy mapping).
Files/tables involved: new Supabase migration, `user_enrollments`, `src/lib/supabase/types.ts`.
Why it matters: required for expiry/renew/revoke lifecycle-ready state.

7. Change: Implement revocation flow (admin/system endpoint + UI state).
Files/tables involved: `api/server.mjs` (new revoke endpoint), admin UI files, `src/components/enrollment/EnrollmentButton.tsx`, CTA manager.
Why it matters: closes an end-state lifecycle gap and supports operational controls.

8. Change: Add scheduled/system expiry processing and renew endpoint/workflow.
Files/tables involved: backend job/cron layer, `api/server.mjs`, `user_enrollments`.
Why it matters: converts expired state from static field to enforced lifecycle behavior.

9. Change: Consolidate progress schemas; choose one (`lesson_progress` or `learner_lesson_progress`) and retire the other with migration plan.
Files/tables involved: `supabase/migrations/027_add_progress_tracking_tables.sql`, `039_add_learner_lesson_progress.sql`, related services.
Why it matters: removes duplicate truth sources and reduces reconciliation bugs.

10. Change: Fix contract/CTA import and module path drift around enrollment access.
Files/tables involved: `src/features/courses/utils/ctaStateManager.ts`, `src/lib/enrollment.ts`, `src/lib/enrollment/index.ts`.
Why it matters: prevents runtime/build instability and ensures all CTA states use the same contract.

11. Change: Harden RLS for Entra model or enforce strict backend-proxy-only access and anon read minimization.
Files/tables involved: `supabase/migrations/027_add_progress_tracking_tables.sql`, `028_update_enrollment_schema.sql`, `supabase/scripts/*.sql`.
Why it matters: closes authorization gaps and removes dependency on temporary permissive policies.

12. Change: Promote API/e2e scripts into CI-run test suites (Vitest integration or dedicated API test stage) and add route-guard tests.
Files/tables involved: `package.json`, `test-*.mjs`, `src/features/courses/components/guards/EnrollmentGuard.tsx` tests.
Why it matters: raises delivery confidence from partial to hardened/lifecycle-ready.
