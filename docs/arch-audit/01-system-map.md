# DTMA System Map

Date: 2026-03-06

## Scope

This document maps the current repository structure, runtime boundaries, stage ownership, and early architecture risks before deeper audit work begins.

Validation commands run from this repository:

| Command | Result | Notes |
| --- | --- | --- |
| `npm run lint` | Passed | `package.json:12` |
| `npm run test:run` | Passed after rerun outside sandbox | Initial sandbox run failed with `spawn EPERM` while loading `vitest.config.ts`; repository tests passed once process spawning was allowed |
| Typecheck | No script found | `package.json:6-18` has no `typecheck` script |

## Repository Summary

Confirmed from the root layout and entry points, this is not a formal monorepo. It is one root Vite/React application with embedded API code, Supabase SQL, and multiple deployment targets.

```text
DQ_Prod_DTMA/
|-- src/                  # Main React SPA
|   |-- features/         # Stage-oriented feature folders
|   |-- lib/              # Auth, Supabase, API, payment, AI widget
|   |-- services/         # Shared data services
|   |-- components/       # Shared UI
|   `-- utils/            # Cross-cutting helpers
|-- api/                  # Local Node/Vercel API surface
|   |-- server.mjs        # Main request router
|   |-- [...path].mjs     # Vercel catch-all wrapper
|   |-- enrollment.mjs    # Legacy/serverless-specific API file
|   |-- lesson-access.mjs # Legacy/serverless-specific API file
|   |-- stripe.mjs        # Separate Stripe API implementation
|   `-- middleware/       # Auth, access, logging, rate limiting
|-- supabase/
|   |-- migrations/       # Schema, RLS, RBAC, content model evolution
|   |-- scripts/          # Operational SQL scripts
|   `-- seed.sql
|-- k8s/                  # Kubernetes manifests
|-- docs/                 # Existing reports, deployment notes, specs
|-- public/               # Static media, logos, videos
|-- tests/                # Audit/spec artifacts and task docs
|-- Dockerfile            # Container build path
|-- azure-pipelines.yml   # Azure DevOps deploy path
|-- vercel.json           # Vercel deploy path
`-- .env*                 # Environment files committed in repo
```

## Runtime Boundary Diagram

```text
                            +----------------------+
                            | Microsoft Graph API  |
                            | /v1.0/me             |
                            +----------^-----------+
                                       |
+-------------+      MSAL/CIAM         |
| Browser SPA  |-----------------------+
| src/index.tsx|
+------+------+ 
       |
       | route-level composition
       v
+-------------------------+
| Single React Router SPA |
| src/AppRouter.tsx       |
+----+-------------+------+
     |             |
     | direct      | HTTP /api/*
     | Supabase    v
     |        +-------------------+
     |        | Node/Vercel API   |
     |        | api/server.mjs    |
     |        +---------+---------+
     |                  |
     +------------------+
                        |
                        v
               +----------------------+
               | Supabase             |
               | DB + Auth + Storage  |
               | RPC + RLS policies   |
               +----------------------+
```

## Application And Module Map

| Surface | Primary entry points | Runtime | Main responsibilities | Main data/auth dependencies |
| --- | --- | --- | --- | --- |
| Root SPA shell | `src/index.tsx:10-19`, `src/AppRouter.tsx:170-379` | Browser | Boots MSAL, Apollo, router, shared providers | MSAL, external GraphQL endpoint, React Router |
| Public landing | `src/App.tsx:5-14`, `src/features/landing/pages/HomePage.tsx:1-91` | Browser | Stage00 marketing, trust content, landing CTA, featured catalog teaser | Shared `Header`, `Footer`, `AIWidgetStandalone`, course service |
| Marketplace/catalog | `src/features/courses/pages/CourseCatalogPage.tsx`, `src/features/landing/components/CourseCatalogSection.tsx:58-189`, `src/services/courseService.ts` | Browser | Public browsing, filters, module/course detail, save/enroll CTA handoff | Direct Supabase reads via `getSupabase()` |
| Learner dashboard/portal | `src/features/dashboard/pages/DashboardRouter.tsx:53-75`, `src/features/portal/layout/PortalLayout.tsx:25-260` | Browser | Onboarding, in-progress learning, profile, badges, saved courses | Azure/MSAL auth context plus Supabase profile reads |
| Learner learning player | `src/features/portal/pages/CoursePlayerPage.tsx`, `src/lib/api/lessonAccessApiClient.ts`, `src/lib/api/enrollmentApiClient.ts` | Browser + API | Lesson playback, access gating, progress and enrollment checks | Custom `/api/lessons/*`, `/api/enrollment/*`, direct Supabase reads in some flows |
| Instructor/admin surface | `src/lib/admin-auth/AuthContext.tsx:32-165`, `src/AppRouter.tsx:262-334`, `src/features/instructor-portal/**` | Browser | Admin sign-in, RBAC, course/module/lesson/quiz/media management | Supabase Auth email/password, `admin_memberships`, direct Supabase CRUD, Supabase Storage |
| Embedded API | `api/server.mjs`, `api/[...path].mjs:1-5`, `package.json:7-9` | Node local server or Vercel function | Enrollment APIs, lesson access APIs, saved courses, mock Stripe endpoints | Supabase service role, Azure token validation middleware |
| Data plane | `supabase/migrations/*.sql`, `src/lib/supabase/client.ts:1-28` | Supabase | Content schema, enrollments, learner profile fields, admin RBAC, storage policy evolution | Public anon client, authenticated client, service-role access in API |

## Stage Mapping

| Product stage | Mapped routes/features | Evidence |
| --- | --- | --- |
| Stage00: Landing Page | `/`, landing sections, trust content, partner logos, hero, AI widget | `src/App.tsx:5-14`, `src/features/landing/pages/HomePage.tsx:1-91` |
| Stage01: Course Marketplace | `/courses`, `/modules/:itemId`, landing catalog teaser, mentors, payment success | `src/AppRouter.tsx:177-202`, `src/AppRouter.tsx:184-192`, `src/features/courses/**`, `src/services/courseService.ts` |
| Stage02A: Learners App | `/dashboard/*`, `/portal/*`, `/learning` redirect, onboarding, profile, saved, badges, course player | `src/AppRouter.tsx:204-250`, `src/features/dashboard/**`, `src/features/portal/**`, `src/features/learning/**` |
| Stage02B: Instructor/Admin Platform | `/admin/login`, `/admin/logout`, `/instructor/*`, course/module/lesson/quiz/media tooling | `src/AppRouter.tsx:262-334`, `src/lib/admin-auth/**`, `src/features/instructor-portal/**` |

### Stage Boundary Notes

- The repo contains all four product stages inside one SPA router rather than separate deployable apps.
- Stage00 and Stage01 already share data services: the landing page imports `CourseCatalogSection`, which calls the same course service used by `/courses`.
- Stage02A retains transitional routes: `/dashboard/*` exists, but redirects some paths to `/portal/*` (`src/features/dashboard/pages/DashboardRouter.tsx:66-73`).
- Stage02B is isolated by route prefix and auth provider, but not by repository or runtime boundary.

## External Integrations

| Integration | Where it appears | Current role |
| --- | --- | --- |
| Azure External Identities / MSAL | `src/lib/auth/msal.ts:46-110`, `src/lib/auth/AuthContext.tsx`, `.env`, `k8s/base/configmap.yaml` | Learner authentication for public-to-portal journeys |
| Microsoft Graph | `src/lib/auth/graphService.ts:20-59`, `src/lib/auth/AuthContext.tsx` | Enrich learner profile data after sign-in |
| Supabase DB/Auth/Storage/RPC | `src/lib/supabase/client.ts:1-28`, `src/lib/admin-auth/AuthContext.tsx`, `src/services/courseService.ts`, `src/features/instructor-portal/lib/storage.ts`, `api/server.mjs` | Primary operational backend for content, enrollments, admin RBAC, learner profiles, storage |
| Custom Node/Vercel API | `api/server.mjs`, `api/middleware/*.mjs`, `src/lib/api/*.ts` | Server-side lesson access, enrollment contract, saved courses, mock Stripe |
| External GraphQL endpoint | `src/index.tsx:10-19` | Apollo client is initialized against `https://90va0q4bccgp.share.zrok.io/services-api`; no in-repo Apollo consumers were found beyond bootstrap |
| Stripe | `src/lib/payment/stripe.ts`, `api/server.mjs:1313-1343`, `api/stripe.mjs` | Payment flow exists in thin/mocked form; active server router currently returns mock checkout and verification responses |
| Azure DevOps + OVH Kubernetes | `azure-pipelines.yml`, `k8s/**` | Container/Kubernetes deployment path |
| Vercel | `vercel.json`, `api/[...path].mjs` | SPA + serverless deployment path |

## Environment And Deployment Surfaces

### Runtime configuration surfaces

| Surface | Evidence | Notes |
| --- | --- | --- |
| Client env files | `.env`, `.env.local`, `.env.txt` | Repo contains multiple committed environment files, including a service-role variable in `.env.txt` |
| Browser runtime template | `env.template.js:1-16` | Separate runtime injection path exists alongside Vite env handling |
| Vite env loading | `vite.config.ts`, `src/lib/auth/msal.ts`, `src/lib/supabase/client.ts` | Browser uses `VITE_*` variables |
| API-side manual env loading | `api/server.mjs:12-36`, `api/middleware/auth.mjs:12-38` | API layer manually parses `.env` files instead of using a shared config module |

### Deployment surfaces

| Target | Evidence | Notes |
| --- | --- | --- |
| Vercel | `vercel.json:1-32`, `api/[...path].mjs:1-5` | SPA rewrite plus catch-all serverless wrapper |
| Docker container | `Dockerfile:3-31` | Container build path exists, but wording and flags still reference Next.js |
| Nginx subpath hosting | `default.conf:1-42` | Separate `/dtma` subpath hosting configuration exists |
| Azure DevOps pipeline | `azure-pipelines.yml:7-69` | Manual pipeline builds and deploys container images |
| Kubernetes | `k8s/base/**`, `k8s/overlays/Production/**`, `k8s/overlays/staging/staging-ingress.yaml` | Production overlay exists; staging deployment manifest referenced by pipeline is missing |

## Key Architecture Observations

1. The repository is a single deployable frontend codebase with embedded backend behavior rather than separate Stage00/01/02A/02B applications.
   Evidence: `package.json:7-17`, `src/AppRouter.tsx:170-379`, root-level `api/`, `supabase/`, and `k8s/`.

2. Route composition, not repository layout, is currently the primary stage boundary.
   Evidence: `src/AppRouter.tsx:177-372` holds public, learner, admin, instructor, legacy, and redirect routes in one place.

3. Learner and instructor authentication are intentionally split across different identity systems.
   Evidence: learner auth uses Azure/MSAL in `src/lib/auth/msal.ts` and `src/lib/auth/AuthContext.tsx`; instructor auth uses Supabase Auth password sign-in in `src/lib/admin-auth/AuthContext.tsx:133-141`.

4. Data access is mixed across three patterns.
   Evidence:
   - Direct browser reads/writes to Supabase in `src/services/courseService.ts`, `src/features/instructor-portal/components/course-management/*.tsx`
   - Browser-to-API calls in `src/lib/api/enrollmentApiClient.ts` and `src/lib/api/lessonAccessApiClient.ts`
   - Service-role access inside `api/server.mjs`

5. The instructor/admin platform currently depends on browser-side direct CRUD against Supabase tables and browser-side storage uploads.
   Evidence: `CourseForm.tsx:69-137`, `ModuleForm.tsx:79-145`, `LessonForm.tsx:205-226`, `QuizzesSection.tsx:64-116`, `src/features/instructor-portal/lib/storage.ts:124-191`.

6. The database model is evolving rapidly and preserves migration history for multiple authorization strategies.
   Evidence: `supabase/migrations/044_courses_rls_instructor_write.sql`, `045_courses_disable_rls.sql`, `046_disable_rls_lessons_and_modules.sql`, `049_admin_auth_rbac.sql`, `20260306103000_secure_learner_quiz_access.sql`.

7. Existing docs already drift from current runtime entry points.
   Evidence: `api/[...path].mjs` routes Vercel traffic to `api/server.mjs`, while `docs/deployment/VERCEL_DEPLOYMENT.md` and `docs/deployment/PRODUCTION_DEPLOYMENT_SUMMARY.md` still reference `api/enrollment.mjs` and `api/lesson-access.mjs`.

## Early Red Flags

| Area | Observation | Evidence |
| --- | --- | --- |
| Stage isolation | All stages share one router, one bundle, and one repo-level dependency graph, which increases coupling and release coordination risk | `src/AppRouter.tsx:170-379`, `src/features/**` |
| Auth boundary complexity | Learner auth uses Azure/MSAL while instructor auth uses Supabase Auth, but both operate inside the same SPA and share the same Supabase project | `src/lib/auth/msal.ts`, `src/lib/admin-auth/AuthContext.tsx`, `src/lib/supabase/client.ts` |
| Direct admin writes | Stage02B writes directly from browser to `courses`, `modules`, `lessons`, `quizzes`, and storage rather than through a separate admin API boundary | `CourseForm.tsx:69-137`, `ModuleForm.tsx:94-145`, `LessonForm.tsx:208-226`, `QuizzesSection.tsx:64-116`, `src/features/instructor-portal/lib/storage.ts:124-191` |
| Security/config hygiene | Supabase URL and anon key are hardcoded as browser fallbacks, and committed env files include production-style variables plus a service-role variable in `.env.txt` | `src/lib/supabase/client.ts:5-6`, `.env`, `.env.local`, `.env.txt:24` |
| Service duplication | Duplicated service modules already exist for user sync and learner profile access, increasing drift risk | `src/lib/auth/userService.ts`, `src/features/auth/services/userService.ts`, `src/lib/learner/learnerProfileService.ts`, `src/features/learner/services/learnerProfileService.ts` |
| Deployment drift | Repo supports Vercel, Docker/Nginx, and Azure DevOps/K8s simultaneously, but the staging pipeline points to a missing manifest | `vercel.json`, `Dockerfile`, `default.conf`, `azure-pipelines.yml:36-69`, `k8s/overlays/staging/` |
| API/doc drift | Current active API runtime is `api/server.mjs`, but legacy API files and deployment docs still describe older serverless shapes | `package.json:7`, `api/[...path].mjs`, `api/enrollment.mjs`, `api/lesson-access.mjs`, deployment docs |
| Incomplete Stage02B surface | Several instructor routes and tabs are still `ComingSoon` or disabled, which affects MVP closure assumptions | `src/AppRouter.tsx:329-333`, `src/features/instructor-portal/pages/CourseManagementPage.tsx:22-31`, `src/features/instructor-portal/layout/InstructorLayout.tsx` |

## Open Questions For Deeper Audit

1. Which deployment target is authoritative for production: Vercel, container/Nginx, or Kubernetes?
2. Is Stage02B expected to remain browser-to-Supabase, or should it move behind a dedicated admin API?
3. Are the committed env files intentional release artifacts, or accidental credential/config leakage?
4. Which Supabase migration state is actually deployed in production, given the history of both disabling and re-enabling RLS?
5. Are `api/enrollment.mjs`, `api/lesson-access.mjs`, and `api/stripe.mjs` still operationally relevant, or should they be treated as legacy drift?
6. Is the external GraphQL endpoint in `src/index.tsx` still required? No in-repo Apollo consumers were found beyond application bootstrap.
7. Should `/dashboard/*` remain a supported learner surface, or is `/portal/*` the only intended Stage02A shell going forward?
8. Is there a separate API/backend repository that owns contracts referenced by env vars and external tabs, or should this repo be treated as the only deployable system for MVP closure?
