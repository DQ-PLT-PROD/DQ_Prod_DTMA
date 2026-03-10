# DTMA Frontend Architecture Audit

## Executive Summary
The frontend shows a partial move toward feature-based organization, but ownership is still split across `src/features`, top-level `src/components`, `src/hooks`, `src/services`, and `src/lib`. The result is not a clean domain-oriented frontend; it is a mixed model where stage pages often depend on shared cross-stage shells, duplicated services, and direct browser-side data access.

Stage separation is clearest at the route table level in `src/AppRouter.tsx:170-379`, but it weakens below routing. Stage00 and Stage01 share the same landing shell and marketplace data services. Stage02A and Stage02B use different auth systems, yet still share UI components and some course/domain services. Several important concerns are split between routes, layouts, contexts, direct Supabase calls, and component-local logic.

The highest delivery risks are:

- stage boundaries exist mostly as URL namespaces, not as owned frontend modules
- frontend data access is inconsistent, with direct Supabase access coexisting beside newer API client abstractions
- duplicated hooks and services have already drifted
- auth and role-based UI enforcement are fragmented across two auth providers and component-level permission checks
- forms, validation, and reusable UI primitives are ad hoc rather than standardized

## Current Frontend Architecture
### Frontend Structure Summary
The active client application is a Vite/React SPA rooted in `src/index.tsx:1-145` and routed by `src/AppRouter.tsx:170-379`.

```text
src/
|-- App.tsx
|-- AppRouter.tsx
|-- components/
|   |-- auth/
|   |-- Button/
|   |-- enrollment/
|   |-- Footer/
|   |-- Header/
|   |-- layouts/
|   |-- PageLayout/
|   |-- Sidebar/
|   `-- ui/
|-- config/
|-- constants/
|-- features/
|   |-- admin-auth/
|   |-- app/
|   |-- auth/
|   |-- courses/
|   |-- dashboard/
|   |-- enrollment/
|   |-- instructor-portal/
|   |-- landing/
|   |-- learner/
|   |-- learning/
|   |-- mentors/
|   |-- portal/
|   `-- recommendations/
|-- hooks/
|-- lib/
|-- services/
|-- test/
|-- types/
`-- utils/
```

### Runtime Composition
At runtime, the frontend is a single browser SPA with shared root providers:

```text
index.tsx
`-- ApolloProvider
    `-- MsalProvider
        `-- AppRouter
            `-- BrowserRouter
                `-- AuthProvider
                    `-- SavedCoursesProvider
                        `-- all public, learner, and marketplace routes

admin/instructor routes
`-- nested AdminAuthProvider per route branch
```

Evidence:

- `src/index.tsx:10-19` initializes Apollo and an external GraphQL endpoint
- `src/AppRouter.tsx:172-176` wraps the entire app in `AuthProvider` and `SavedCoursesProvider`
- `src/AppRouter.tsx:263-289` adds `AdminAuthProvider` only inside `/admin/*` and `/instructor/*`

### Architectural Style Observed
Confirmed current pattern:

- feature folders exist and are meaningful in places such as `src/features/courses`, `src/features/portal`, and `src/features/instructor-portal`
- ownership is diluted by top-level shared layers such as `src/components`, `src/hooks`, `src/services`, and `src/lib`
- many stage pages use shared components and shared services directly instead of stage-owned adapters
- data fetching is primarily `useEffect` plus service calls; no common query/cache layer was observed in `src/`
- `package.json:19-41` includes `@apollo/client`, but frontend code inspection found bootstrap usage in `src/index.tsx:7-19` only

## Stage Boundary Assessment
### Stage Mapping
| Stage | Primary Routes | Main Frontend Modules | Boundary Assessment |
| --- | --- | --- | --- |
| Stage00: Landing Page | `/` | `src/App.tsx:6-20`, `src/features/landing/pages/HomePage.tsx:24-97` | Public landing shell is clear at entry, but it embeds marketplace content and shared header logic. |
| Stage01: Course Marketplace | `/courses`, `/modules/:itemId`, `/mentors*` | `src/AppRouter.tsx:179-202`, `src/features/courses/**`, `src/features/landing/components/CourseCatalogSection.tsx:58-189` | Marketplace routes are explicit, but Stage00 homepage reuses Stage01 services and cards. |
| Stage02A: Learners App | `/dashboard/*`, `/portal/*`, `/learning` redirect | `src/AppRouter.tsx:204-250`, `src/features/dashboard/**`, `src/features/portal/**`, `src/features/learning/**` | Learner runtime exists, but legacy dashboard and portal coexist, with redirects and overlapping ownership. |
| Stage02B: Instructor/Admin Platform | `/admin/*`, `/instructor/*` | `src/AppRouter.tsx:262-334`, `src/features/admin-auth/**`, `src/features/instructor-portal/**` | URL namespace and auth provider are separate, but shared header/profile patterns and shared data access reduce isolation. |

### Where Boundaries Hold
- Route prefixes are explicit in `src/AppRouter.tsx:177-334`.
- Learner and admin auth providers are distinct: `src/lib/auth/AuthContext.tsx` versus `src/lib/admin-auth/AuthContext.tsx:37-183`.
- Stage02A and Stage02B have separate primary layouts: `src/features/portal/layout/PortalLayout.tsx:25-289` and `src/features/instructor-portal/layout/InstructorLayout.tsx:55-281`.

### Where Boundaries Leak
- Stage00 embeds Stage01 catalog behavior through `src/features/landing/components/CourseCatalogSection.tsx:68-89`, which calls `fetchCourses` and `fetchPublishedCoursesForNav` from `src/services/courseService.ts`.
- The shared header mixes landing navigation, marketplace navigation, and learner sign-in behavior in one component: `src/components/Header/Header.tsx:66-127`, `src/components/Header/Header.tsx:171-251`, `src/components/Header/Header.tsx:258-331`.
- `src/components/Header/ProfileDropdown.tsx:19-28` switches between learner and admin session models inside one shared dropdown.
- Stage02A keeps a legacy dashboard shell: `src/features/dashboard/pages/DashboardRouter.tsx:62-73` redirects legacy routes and sends onboarding to `/portal/onboarding`, while `src/features/dashboard/pages/DashboardLayout.tsx:40-70` still carries hardcoded company-switching UI.

## State and Data Flow Assessment
### State Management
Observed client state patterns:

- local component state dominates forms, navigation, and async status
- React context is used selectively for auth, saved courses, and role switching
- there is no shared frontend query/cache layer visible in `src/`
- `package.json:19-41` does not list Redux, Zustand, Jotai, MobX, TanStack Query, React Hook Form, Zod, Formik, or Yup

Key contexts:

- learner auth: `src/lib/auth/AuthContext.tsx:67-525`
- admin auth: `src/lib/admin-auth/AuthContext.tsx:37-183`
- saved courses: `src/features/courses/context/SavedCoursesContext.tsx:22-127`
- instructor role switch persistence: `src/features/instructor-portal/context/RoleSwitcherContext.tsx:20-79`

### Data Fetching and API Usage
Data access is inconsistent:

- direct browser-to-Supabase access is common in `src/services/courseService.ts:279-894`, `src/services/savedCoursesService.ts:24-96`, `src/lib/enrollment/service.ts:174-522`, and instructor CRUD files such as `src/features/instructor-portal/components/course-management/CourseForm.tsx:61-140`
- newer API client abstractions exist in `src/lib/api/enrollmentApiClient.ts:1-250` and `src/lib/api/lessonAccessApiClient.ts:1-326`
- code inspection found those API clients defined but not used by application code outside their tests

### Persistence and Client-Side Fallbacks
Client persistence is spread across several features:

- saved-courses login handoff uses `sessionStorage` in `src/features/courses/context/SavedCoursesContext.tsx:55-70`
- course progress is persisted in `localStorage` in `src/features/portal/pages/CoursePlayerPage.tsx:317-324`
- learner progress queue logic also uses browser storage in `src/features/portal/services/progressService.ts`
- legacy learning flow uses `localStorage` in `src/features/learning/pages/LearningScreen.tsx`

This confirms that server state, cached state, and temporary client state are not managed through a single model.

## Component Architecture Assessment
### Shared Component Layer
The repo has a shared component layer, but it is not yet a coherent design system.

Evidence:

- primitive button exists in `src/components/Button/Button.tsx:15-60`
- a second button system exists in `src/components/PageLayout/index.tsx:178-213`
- toast exists centrally in `src/components/ui/Toast.tsx:16-109`
- a separate local toast implementation exists inside `src/features/landing/components/CallToAction.tsx:90-132`

### Reusability Quality
Some components are genuinely cross-cutting. Others are overloaded:

- `src/components/Header/Header.tsx` is not a neutral shell; it embeds landing scroll behavior, marketplace discovery, sign-in entry, mobile navigation, and learner redirection
- `src/components/Header/ProfileDropdown.tsx` is not a simple avatar menu; it resolves either MSAL learner state or Supabase admin state and changes navigation accordingly
- `src/components/Header/components/ExploreDropdown.tsx:20-44` fetches marketplace navigation data directly, so the shared header depends on Stage01 data
- `src/features/courses/components/CourseCard.tsx:65-83` fetches learner access state, making a catalog card depend on learner auth state and enrollment logic

## Forms and Validation Assessment
### Observed Pattern
Forms are built mostly with local state and inline validation logic.

Evidence:

- onboarding validation is computed with `useMemo` inside `src/features/dashboard/pages/onboarding/index.tsx:73-95`
- profile validation is embedded in `src/features/portal/components/profile/ProfilePageContainer.tsx:166-209`
- admin login uses simple local state and `required` fields in `src/features/admin-auth/pages/AdminLoginPage.tsx`
- instructor CRUD forms perform imperative checks inside submit handlers, for example `src/features/instructor-portal/components/course-management/CourseForm.tsx:95-112`
- quiz editing uses inline validation and immediate browser confirmations in `src/features/instructor-portal/pages/QuizEditor.tsx:191-207`, `src/features/instructor-portal/pages/QuizEditor.tsx:271-377`

### Validation Stack
No shared schema-based validation library was observed. `package.json:19-41` does not list the common validation/form packages that would usually centralize this behavior.

## Auth / Role-based UI Assessment
### Learner Auth
Learner auth is MSAL-based and also performs user sync, onboarding routing, and database lookups inside the same context:

- environment toggles and debug logging: `src/lib/auth/AuthContext.tsx:80-93`
- user extraction and Graph/database sync: `src/lib/auth/AuthContext.tsx:156-316`
- onboarding redirect gate: `src/lib/auth/AuthContext.tsx:391-466`

### Admin / Instructor Auth
Admin auth is separate and Supabase-based:

- session and membership load: `src/lib/admin-auth/AuthContext.tsx:17-35`, `src/lib/admin-auth/AuthContext.tsx:43-72`
- email/password sign-in: `src/lib/admin-auth/AuthContext.tsx:133-147`
- CASL ability creation: `src/lib/admin-auth/AuthContext.tsx:161-176`, `src/lib/admin-auth/ability.ts:4-71`

### Route Guards
- learner protected route auto-triggers login and redirects dashboard users toward `/portal`: `src/components/auth/ProtectedRoute.tsx:25-59`
- admin protected route checks session plus active membership only: `src/components/auth/AdminProtectedRoute.tsx:14-39`
- course access guard checks access by combining enrollment data with fetched lessons: `src/features/courses/components/guards/EnrollmentGuard.tsx:41-120`

Confirmed implication:

- learner and admin route entry are guarded
- fine-grained instructor permissions are mostly enforced in page components via `ability.can(...)`, for example `src/features/instructor-portal/components/course-management/CourseForm.tsx:49-53`, `src/features/instructor-portal/components/course-management/ModuleForm.tsx:59-64`, and `src/features/instructor-portal/pages/MediaLibraryPage.tsx:22-24`

## Findings by Severity
### High
#### Finding 1: Stage boundaries are route-level only, not module-owned
| Field | Detail |
| --- | --- |
| Title | Stage boundaries are route-level only, not module-owned |
| Severity | High |
| Impact Area | Architecture |
| Evidence | `src/AppRouter.tsx:177-334` defines stage-like route prefixes, but cross-stage reuse is heavy. Stage00 homepage embeds Stage01 catalog logic in `src/features/landing/components/CourseCatalogSection.tsx:68-89`. The shared header combines landing, marketplace, and learner behavior in `src/components/Header/Header.tsx:66-127` and `src/components/Header/Header.tsx:171-251`. `src/components/Header/ProfileDropdown.tsx:19-28` switches between learner and admin sessions. |
| Why It Matters | This structure makes stage changes harder to isolate. A marketplace, landing, or learner navigation change can regress another stage because the same shared shell owns all three behaviors. |
| Recommended Action | Define stage-owned shells and adapters. Keep only truly neutral primitives in shared layers. Stop adding new Stage00 and Stage01 behavior into the same header and landing components. |
| Fix Effort | Large |
| Release Relevance | Pre-release |

#### Finding 2: Frontend data access is split between direct Supabase calls and newer API clients
| Field | Detail |
| --- | --- |
| Title | Frontend data access is split between direct Supabase calls and newer API clients |
| Severity | High |
| Impact Area | Architecture |
| Evidence | Direct browser-side data access is widespread in `src/services/courseService.ts:279-894`, `src/services/savedCoursesService.ts:24-96`, `src/lib/enrollment/service.ts:174-522`, and instructor CRUD files such as `src/features/instructor-portal/components/course-management/CourseForm.tsx:61-140`, `src/features/instructor-portal/components/course-management/ModuleForm.tsx:74-145`, `src/features/instructor-portal/components/course-management/LessonForm.tsx:68-120`, and `src/features/instructor-portal/pages/QuizEditor.tsx:91-177`. In parallel, API clients exist in `src/lib/api/enrollmentApiClient.ts:1-250` and `src/lib/api/lessonAccessApiClient.ts:1-326`, but code inspection found only definitions and tests, not application adoption. |
| Why It Matters | The frontend currently supports more than one contract for the same domain. That increases drift risk, complicates testing, and makes backend hardening or policy changes harder to roll out consistently. |
| Recommended Action | Pick one frontend access path per domain. For enrollment and lesson access, stop adding new direct-Supabase reads from UI code and converge on one contract. |
| Fix Effort | Large |
| Release Relevance | Pre-release |

#### Finding 3: Duplicated hooks and services have already diverged
| Field | Detail |
| --- | --- |
| Title | Duplicated hooks and services have already diverged |
| Severity | High |
| Impact Area | Maintainability |
| Evidence | There are two `useCourseDetails` hooks with different related-course behavior: `src/hooks/useCourseDetails.ts:34-45` and `src/features/courses/hooks/useCourseDetails.ts:34-44`. There are two user sync services: `src/lib/auth/userService.ts:19-273` and `src/features/auth/services/userService.ts:19-281`. There are two learner profile services with different fields and `PROFILE_SELECT` clauses: `src/lib/learner/learnerProfileService.ts:5-141` and `src/features/learner/services/learnerProfileService.ts:5-197`. |
| Why It Matters | Duplicate logic with different shapes guarantees inconsistent behavior over time. It also obscures the real ownership of the user and learner profile models. |
| Recommended Action | Collapse each duplicated concern to one canonical frontend module and convert other import paths to thin re-exports only if necessary. |
| Fix Effort | Medium |
| Release Relevance | Pre-release |

#### Finding 4: Auth and role-based UI enforcement are fragmented across two auth stacks and component-level checks
| Field | Detail |
| --- | --- |
| Title | Auth and role-based UI enforcement are fragmented across two auth stacks and component-level checks |
| Severity | High |
| Impact Area | Security |
| Evidence | Learner auth is handled in `src/lib/auth/AuthContext.tsx:67-525`, while admin auth is handled separately in `src/lib/admin-auth/AuthContext.tsx:37-183`. `src/components/auth/ProtectedRoute.tsx:25-59` auto-starts MSAL login and redirects dashboard users to `/portal`. `src/components/auth/AdminProtectedRoute.tsx:22-39` only checks session plus active membership. Fine-grained instructor permission checks are then repeated inside pages using CASL, for example `src/features/instructor-portal/components/course-management/CourseForm.tsx:49-53`, `src/features/instructor-portal/components/course-management/ModuleForm.tsx:59-64`, and `src/features/instructor-portal/pages/MediaLibraryPage.tsx:22-24`. `src/components/Header/ProfileDropdown.tsx:19-28` also branches UI behavior based on either auth stack. |
| Why It Matters | Access behavior is harder to reason about when route entry, session state, membership, and per-action permissions are spread across multiple layers. This increases the chance of inconsistent UI gating and makes audits slower. |
| Recommended Action | Publish a single frontend auth/access matrix per stage. Centralize stage-level route protection, and make component-level permission checks a secondary layer rather than the main source of truth. |
| Fix Effort | Large |
| Release Relevance | Pre-release |

#### Finding 5: Stage00 CTA forms expose external integration details directly in the client
| Field | Detail |
| --- | --- |
| Title | Stage00 CTA forms expose external integration details directly in the client |
| Severity | High |
| Impact Area | Security |
| Evidence | `src/features/landing/components/CallToAction.tsx:314-321` and `src/features/landing/components/CallToAction.tsx:375-382` POST directly to external endpoints with a hardcoded `Authorization: "Bearer enquiry1234"` header. The same file also embeds its own form controls and local toast implementation in `src/features/landing/components/CallToAction.tsx:15-132`. |
| Why It Matters | Client-shipped secrets and direct external submission contracts are easy to expose, hard to rotate safely, and difficult to test consistently across environments. This is also a Stage00-specific integration sitting inside presentational landing code. |
| Recommended Action | Move these submissions behind a server-owned endpoint or edge function and remove the credential from browser code. Separate the integration adapter from the landing component. |
| Fix Effort | Small |
| Release Relevance | Blocker |

### Medium
#### Finding 6: Shared component reuse is inconsistent and some shared components are overloaded
| Field | Detail |
| --- | --- |
| Title | Shared component reuse is inconsistent and some shared components are overloaded |
| Severity | Medium |
| Impact Area | Maintainability |
| Evidence | `src/components/Button/Button.tsx:15-60` exists, but alternate button systems are also defined in `src/components/PageLayout/index.tsx:178-213`, and many screens still use bespoke button markup. `src/components/ui/Toast.tsx:16-109` is duplicated by a local toast in `src/features/landing/components/CallToAction.tsx:90-132`. `src/components/Header/Header.tsx:66-127` and `src/components/Header/ProfileDropdown.tsx:19-28` mix multiple stage concerns into shared components. |
| Why It Matters | Shared components should reduce variance. When shared and bespoke patterns coexist without clear rules, UI changes become slower and more defect-prone. |
| Recommended Action | Define which shared pieces are primitives, which are stage shells, and which are feature widgets. Retire duplicate toast and button patterns first. |
| Fix Effort | Medium |
| Release Relevance | Later |

#### Finding 7: Forms and validation are ad hoc and repeated across stages
| Field | Detail |
| --- | --- |
| Title | Forms and validation are ad hoc and repeated across stages |
| Severity | Medium |
| Impact Area | Maintainability |
| Evidence | Onboarding uses inline computed validation in `src/features/dashboard/pages/onboarding/index.tsx:73-95`. Profile editing uses inline validation rules in `src/features/portal/components/profile/ProfilePageContainer.tsx:166-209`. Course, module, lesson, and quiz flows each implement manual validation and submit handling in files such as `src/features/instructor-portal/components/course-management/CourseForm.tsx:95-112` and `src/features/instructor-portal/pages/QuizEditor.tsx:271-377`. `package.json:19-41` does not include a shared form/validation stack. |
| Why It Matters | Repeated validation logic slows changes, increases inconsistency, and makes it harder to enforce the same rules on onboarding, profile, and instructor workflows. |
| Recommended Action | Standardize one form pattern for new frontend work, including field state, validation, submit lifecycle, and error rendering. |
| Fix Effort | Medium |
| Release Relevance | Pre-release |

#### Finding 8: Learner state and progress handling are split across server calls and browser storage
| Field | Detail |
| --- | --- |
| Title | Learner state and progress handling are split across server calls and browser storage |
| Severity | Medium |
| Impact Area | Data Integrity |
| Evidence | Saved-course handoff uses `sessionStorage` in `src/features/courses/context/SavedCoursesContext.tsx:55-70`. Learning progress persists to `localStorage` in `src/features/portal/pages/CoursePlayerPage.tsx:317-324`. Legacy learning also reads and writes browser progress in `src/features/learning/pages/LearningScreen.tsx`. `src/features/portal/services/progressService.ts` maintains a local queue for server sync. |
| Why It Matters | Multiple persistence paths make it harder to define which state is authoritative, especially across login transitions, multi-device usage, and future offline behavior. |
| Recommended Action | Document authoritative state per domain and reduce browser-storage writes to explicit cache/offline cases only. |
| Fix Effort | Medium |
| Release Relevance | Pre-release |

#### Finding 9: Stage02A still carries legacy dashboard surfaces that obscure current ownership
| Field | Detail |
| --- | --- |
| Title | Stage02A still carries legacy dashboard surfaces that obscure current ownership |
| Severity | Medium |
| Impact Area | Release Readiness |
| Evidence | `src/features/dashboard/pages/DashboardRouter.tsx:62-73` keeps a separate dashboard route tree but redirects several routes to `/404` or `/portal/onboarding`. `src/features/dashboard/pages/DashboardLayout.tsx:40-70` still contains hardcoded company switcher data and onboarding navigation into the portal. |
| Why It Matters | Legacy route trees and transitional shells make release scope less clear and increase the chance of shipping stale surfaces that no longer represent the learner product direction. |
| Recommended Action | Decide whether `/dashboard/*` is still a supported Stage02A surface. If not, reduce it to an explicit compatibility layer with minimal UI ownership. |
| Fix Effort | Small |
| Release Relevance | Pre-release |

## Quick Wins
- Stop adding new Stage00 or Stage01 behavior into `src/components/Header/Header.tsx` and `src/components/Header/ProfileDropdown.tsx`; treat them as frozen until stage ownership is clarified.
- Replace the hardcoded CTA bearer token flow in `src/features/landing/components/CallToAction.tsx` with a server-owned submission endpoint.
- Choose one canonical learner profile service and one canonical user sync service, then remove duplicate implementations.
- Adopt one frontend access path for enrollment and lesson access before adding more learning features.
- Standardize on one toast and one button primitive, then use them in new forms instead of adding more local variants.
- Mark `/dashboard/*` as either deprecated or active, then remove ambiguity from redirects and layout ownership.

## Release Risks
### Pre-release Risks
- Navigation and shell regressions remain likely because Stage00, Stage01, and Stage02A share the same header and some of the same course discovery flows.
- Access-control defects remain likely because route guards, auth providers, and component-level permission checks are not aligned under one policy surface.
- Enrollment and lesson-access defects remain likely because direct Supabase access and newer API clients coexist without a single chosen contract.
- Profile and onboarding changes remain risky because duplicate learner profile and user services already model the same data differently.

### Blocker
- The Stage00 CTA integration currently ships a hardcoded authorization token in browser code at `src/features/landing/components/CallToAction.tsx:314-321` and `src/features/landing/components/CallToAction.tsx:375-382`.

### Inferred Risks Requiring Deeper Audit
These are not claimed as confirmed defects yet, but the current frontend structure raises them:

- direct browser-side instructor CRUD may be tightly coupled to Supabase RLS and storage rules, which should be reviewed together with backend policy definitions
- cross-stage shared UI may hide ownership conflicts in analytics, event tracking, and release rollout logic
- duplicated service layers may already be producing inconsistent field usage between onboarding, profile, and marketplace screens
