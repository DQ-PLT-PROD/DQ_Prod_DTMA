# DTMA Backend and API Architecture Audit

## Executive Summary
The audited backend is split across two overlapping runtime surfaces:

- an in-repo API layer under `api/` inside `DQ_Prod_DTMA`
- a separate Express service under `..\DTMA-API\src`

Both surfaces implement overlapping learner APIs for enrollment, lesson access, and saved courses, but they do not represent the same domain model consistently. The most serious issue is not just duplication; it is divergent duplication. The separate implementations disagree on whether access is course-based or standalone-module-based, and they expose different contracts and different authorization behavior.

The backend currently serves Stage02A learner concerns far more than the rest of the platform. Stage01 catalog, Stage02B instructor/admin, media/file handling, quiz management, FAQ, and Q&A do not have clear backend service boundaries in the audited code. Controller, use-case, and repository layers are largely absent; most logic is embedded directly in route files or in the monolithic `api/server.mjs`.

Highest-risk findings:

- duplicated backend surfaces implement the same APIs with different domain assumptions
- several enrollment endpoints allow caller-supplied `userId` values when authentication is absent
- sequential lesson gating fails open when prerequisite verification fails
- backend logic is concentrated in route files and a monolithic server rather than service/repository boundaries
- instructor/admin, catalog, media, quiz, FAQ, and Q&A domains are mostly missing from the backend surface

## Current Backend Architecture
### Runtime Surfaces
```text
DTMA platform backend surfaces

1. DQ_Prod_DTMA/api/
   |-- [...path].mjs          -> catch-all proxy to server.mjs
   |-- server.mjs            -> manual HTTP router + handlers
   |-- enrollment.mjs        -> separate enrollment function
   |-- lesson-access.mjs     -> separate lesson-access function
   |-- stripe.mjs            -> Stripe stub
   `-- middleware/

2. ..\DTMA-API\src/
   |-- app.ts                -> Express app
   |-- routes/
   |   |-- enrollment.ts
   |   |-- lessons.ts
   |   |-- savedCourses.ts
   |   |-- health.ts
   |   `-- test.ts
   |-- middleware/
   |-- config/
   |-- services/            -> empty during audit
   |-- types/               -> empty during audit
   `-- utils/               -> empty during audit
```

Evidence:

- `api/[...path].mjs:1-4` proxies requests to `api/server.mjs`
- `..\DTMA-API\src\app.ts:33-41` mounts `/api/enrollment`, `/api/lessons`, `/api/saved-courses`, and `/api/test`
- repo inspection found no files under `..\DTMA-API\src\services\`, `..\DTMA-API\src\types\`, or `..\DTMA-API\src\utils\`

### Backend Style Observed
The separate `DTMA-API` service uses Express with central middleware:

- app bootstrap: `..\DTMA-API\src\app.ts:14-46`
- env validation: `..\DTMA-API\src\config\env.ts:6-19`
- shared Supabase admin client: `..\DTMA-API\src\config\supabase.ts:4-6`

The in-repo `api/` surface mixes multiple approaches:

- catch-all server proxy: `api/[...path].mjs:1-4`
- monolithic manual HTTP router: `api/server.mjs:1-1385`
- separate endpoint files still present beside the catch-all layer: `api/enrollment.mjs`, `api/lesson-access.mjs`, `api/stripe.mjs`

### Major Backend Domains Actually Present
Confirmed backend domains in the audited code:

- authentication and token validation
- enrollment
- lesson access and lesson progress
- saved courses
- health/test endpoints
- payment stub

Confirmed domains not represented as first-class backend modules:

- catalog query or catalog admin service
- instructor/admin service boundary
- media/file upload service boundary
- quiz authoring/grading service boundary
- FAQ and Q&A service boundary
- background jobs or asynchronous workflow layer

## Domain Boundary Assessment
### Stage Coverage
| Stage | Backend Coverage | Assessment |
| --- | --- | --- |
| Stage00: Landing Page | No DTMA-owned Stage00 backend route was observed in the audited services. | Stage00 backend concerns appear to be externalized or absent from the platform backend. |
| Stage01: Course Marketplace | Partial. Saved courses, enrollment status, and lesson-access summaries exist, but no dedicated catalog API or catalog service boundary was found. | Marketplace read-model concerns are incomplete server-side. |
| Stage02A: Learners App | Primary implemented backend surface. Enrollment, lesson access, lesson progress, and saved courses are present in both backend implementations. | Learner domain exists, but it is duplicated and inconsistent. |
| Stage02B: Instructor/Admin Platform | No dedicated instructor/admin API surface was found in either backend. | Stage02B appears to rely on direct client-side Supabase access rather than a backend boundary. |

### Domain Separation
| Domain | Evidence | Assessment |
| --- | --- | --- |
| Learner access | `..\DTMA-API\src\routes\enrollment.ts`, `..\DTMA-API\src\routes\lessons.ts`, `..\DTMA-API\src\routes\savedCourses.ts`, `api/server.mjs` | Present, but duplicated across two runtimes. |
| Catalog | No catalog route mounted in `..\DTMA-API\src\app.ts:33-41`; no catalog route list in `api/server.mjs:1359-1380` | Missing as a backend boundary. |
| Instructor/admin | No admin/instructor routes in `..\DTMA-API\src\app.ts:33-41` or `api/server.mjs:1359-1380` | Missing as a backend boundary. |
| Media/storage | No media route or storage service found under `..\DTMA-API\src\routes`; no media route in `api/server.mjs:1359-1380` | Missing as a backend boundary. |
| Quiz | Repo search across `api` and `..\DTMA-API\src` found no backend quiz module or route | Missing as a backend boundary. |
| FAQ / Q&A | Repo search across `api` and `..\DTMA-API\src` found no FAQ or Q&A backend module | Missing as a backend boundary. |
| Payments | `api/stripe.mjs:1-211` only | Present as a stub, not an integrated domain service. |

### Controller / Service / Repository Boundaries
Observed boundary quality is weak:

- `..\DTMA-API\src\routes\enrollment.ts:18-428` performs request parsing, authorization decisions, user creation, Supabase data access, mapping, and response shaping in one file
- `..\DTMA-API\src\routes\lessons.ts:8-246` combines route handling with read-model assembly and progress writes
- `..\DTMA-API\src\middleware\lessonAccess.ts:35-315` contains core lesson-access domain rules rather than just transport middleware concerns
- `api/server.mjs:128-1385` centralizes routing, body parsing, validation, logging, data access, and domain handlers

No repository abstraction was observed. Supabase calls are issued directly from routes or middleware in both backends.

## API Contract Assessment
### Contract Shape
The backend exposes mostly REST-like JSON endpoints, but contracts are not centrally defined.

Evidence:

- `..\DTMA-API\src\config\env.ts:6-19` uses Zod only for environment validation
- no DTO or schema files were found under `..\DTMA-API\src\types\` or `..\DTMA-API\src\utils\`
- route files use manual field checks such as `..\DTMA-API\src\routes\savedCourses.ts:54-58` and `..\DTMA-API\src\routes\enrollment.ts:134-138`

### Contract Consistency
Response shapes vary by endpoint:

- status endpoints return plain state objects, for example `..\DTMA-API\src\routes\enrollment.ts:59-63`
- detail and mutation endpoints often add `success: true`, for example `..\DTMA-API\src\routes\enrollment.ts:110-113` and `..\DTMA-API\src\routes\lessons.ts:113-121`
- error bodies vary between `{ error }` and `{ error, message }`, for example `..\DTMA-API\src\middleware\error.ts:3-9` versus route-level `res.status(...).json({ error: ... })`

### Contract Drift Between Backends
There are multiple contract styles for similar backend concerns:

- `..\DTMA-API\src\routes\lessons.ts:8-129` uses REST path parameters such as `/access/:courseSlug/:lessonId`
- legacy `api/lesson-access.mjs:49-57` routes on query parameters using `action=check`
- `..\DTMA-API\src\middleware\lessonAccess.ts:83-89` checks `user_enrollments` by `course_slug`
- `api/middleware/lessonAccess.mjs:173-180` checks `module_enrollments` by resolved module ID

This is confirmed contract drift, not a hypothetical risk.

## Authorization Assessment
### Auth Mechanisms Present
Two auth mechanisms are present in the audited backend code:

- Azure AD / JWT validation for learner-facing APIs: `..\DTMA-API\src\middleware\auth.ts:124-203`, `api/middleware/auth.mjs:197-327`
- Supabase token validation helper in the legacy `api/` layer: `api/middleware/auth.mjs:329-386`

### Learner Authorization
Learner access uses:

- optional auth on several enrollment endpoints in `..\DTMA-API\src\routes\enrollment.ts:19-20`, `..\DTMA-API\src\routes\enrollment.ts:71-72`, `..\DTMA-API\src\routes\enrollment.ts:121-122`, `..\DTMA-API\src\routes\enrollment.ts:314-315`, `..\DTMA-API\src\routes\enrollment.ts:370-371`
- lesson access middleware that checks preview status, enrollment, and sequential progress in `..\DTMA-API\src\middleware\lessonAccess.ts:35-315`

### Instructor/Admin Authorization
No instructor/admin authorization boundary was observed in the separate `DTMA-API` service. No admin routes, permission middleware, or role-based route segmentation were found in `..\DTMA-API\src\app.ts:33-41`.

### Key Authorization Observations
- learner authorization exists, but several user-specific endpoints accept a caller-supplied `userId` when auth is absent
- sequential lesson access fails open when verification errors occur
- instructor/admin permission enforcement is effectively absent from the audited backend surfaces

## Media / File Handling Assessment
### Confirmed Backend Surface
No media upload, media library, or storage-management backend route was found in either backend surface.

Evidence:

- `..\DTMA-API\src\app.ts:33-41` mounts no media routes
- `api/server.mjs:1359-1380` lists lesson access, saved courses, enrollment, test, and Stripe only
- repo search across `api` and `..\DTMA-API\src` found no backend media/upload/storage module

### Assessment
This is a missing backend boundary, not just a thin implementation. For Stage02B, media/file handling does not appear to have a server-owned service surface in the audited code.

### Async / Background Processing
No queue, worker, or job framework was observed in the backend surfaces during audit. The only recurring async task found was the cleanup timer inside the legacy in-memory rate limiter at `api/middleware/rateLimiter.mjs:17`.

## Error Handling & Observability Assessment
### Error Handling
Error handling is inconsistent:

- `..\DTMA-API\src\middleware\error.ts:3-9` provides a generic Express error wrapper
- many routes bypass the shared handler and return inline errors directly, for example `..\DTMA-API\src\routes\enrollment.ts:52-67`, `..\DTMA-API\src\routes\savedCourses.ts:33-43`, and `..\DTMA-API\src\routes\lessons.ts:77-125`
- legacy `api/server.mjs` uses custom `sendError` responses instead of a shared middleware contract

### Logging
Logging is mostly raw `console.log`, `console.warn`, and `console.error`:

- request logging and event logging exist only in the legacy `api/` layer: `api/middleware/requestLogger.mjs:10-101`
- `DTMA-API` uses `morgan("dev")` in `..\DTMA-API\src\app.ts:20`, but domain events are still logged ad hoc inside routes and middleware

### Observability Quality
The legacy logger and rate limiter are internally inconsistent with the current auth user shape:

- `api/middleware/requestLogger.mjs:36` reads `req.user?.id`
- `api/middleware/rateLimiter.mjs:82` and `api/middleware/rateLimiter.mjs:125` also check `req.user.id`
- auth populates `azureUserId` instead of `id` in `api/middleware/auth.mjs:183-194`

This means authenticated requests are not being identified consistently inside those observability controls.

## Findings by Severity
### Critical
#### Finding 1: Two backend surfaces implement the same learner APIs with divergent domain models
| Field | Detail |
| --- | --- |
| Title | Two backend surfaces implement the same learner APIs with divergent domain models |
| Severity | Critical |
| Impact Area | Architecture |
| Evidence | `api/[...path].mjs:1-4` routes to `api/server.mjs`, while `..\DTMA-API\src\app.ts:33-41` mounts a separate Express API exposing the same learner domains. The data models diverge: `..\DTMA-API\src\middleware\lessonAccess.ts:83-89` and `..\DTMA-API\src\middleware\lessonAccess.ts:275-279` use `user_enrollments` and `course_slug`, while `api/middleware/lessonAccess.mjs:173-180` and `api/middleware/lessonAccess.mjs:301-307` use `module_enrollments` and module-scoped access. Legacy `api/lesson-access.mjs:49-57` also exposes yet another contract style via query-string action routing. |
| Why It Matters | This is not simple duplication; it is incompatible duplication. Different deployments or routes can enforce different access rules against different tables. That is a direct release-readiness and data-integrity risk. |
| Recommended Action | Choose one canonical backend runtime and one canonical learner domain model. Freeze or remove the secondary implementation before adding any more learner or marketplace features. |
| Fix Effort | Large |
| Release Relevance | Blocker |

#### Finding 2: Several enrollment endpoints permit caller-supplied user targeting when authentication is absent
| Field | Detail |
| --- | --- |
| Title | Several enrollment endpoints permit caller-supplied user targeting when authentication is absent |
| Severity | Critical |
| Impact Area | Security |
| Evidence | `..\DTMA-API\src\routes\enrollment.ts:19-31`, `..\DTMA-API\src\routes\enrollment.ts:71-83`, `..\DTMA-API\src\routes\enrollment.ts:121-131`, `..\DTMA-API\src\routes\enrollment.ts:314-323`, and `..\DTMA-API\src\routes\enrollment.ts:370-380` all use `requireAuth({ required: false })` and then fall back to query/body `userId` values when no authenticated user is present. The same pattern also exists in the legacy server at `api/server.mjs:930-946` and `api/server.mjs:1020-1028`. |
| Why It Matters | User-specific reads and mutations should not rely on caller-supplied identity in unauthenticated requests. This permits enrollment reads, access-contract reads, and enrollment mutations to be driven by externally supplied identifiers. |
| Recommended Action | Require authentication for all user-scoped learner endpoints and remove all fallback `userId` query/body semantics from public APIs. |
| Fix Effort | Small |
| Release Relevance | Blocker |

### High
#### Finding 3: Sequential lesson access fails open when verification errors occur
| Field | Detail |
| --- | --- |
| Title | Sequential lesson access fails open when verification errors occur |
| Severity | High |
| Impact Area | Security |
| Evidence | In `..\DTMA-API\src\middleware\lessonAccess.ts:150-167` and `..\DTMA-API\src\middleware\lessonAccess.ts:186-188`, failed prerequisite or progress checks return `canAccess: true`. The legacy module-based version does the same in `api/middleware/lessonAccess.mjs:60-88` and `api/middleware/lessonAccess.mjs:110-115`. |
| Why It Matters | Access-control checks should fail closed when prerequisite verification cannot be completed. The current behavior converts backend errors into granted access. |
| Recommended Action | Change sequential access checks to fail closed for non-preview content and surface operational failures distinctly from access-denied outcomes. |
| Fix Effort | Small |
| Release Relevance | Pre-release |

#### Finding 4: Controller, use-case, and data-access boundaries are largely absent
| Field | Detail |
| --- | --- |
| Title | Controller, use-case, and data-access boundaries are largely absent |
| Severity | High |
| Impact Area | Maintainability |
| Evidence | `..\DTMA-API\src\services\` is empty, while route files such as `..\DTMA-API\src\routes\enrollment.ts:18-428` and `..\DTMA-API\src\routes\lessons.ts:8-246` directly execute Supabase operations and domain logic. `..\DTMA-API\src\middleware\lessonAccess.ts:35-315` embeds core business rules inside middleware. The legacy `api/server.mjs:128-1385` is a monolithic router and handler host rather than a transport-only layer. |
| Why It Matters | Without service and repository boundaries, domain rules are harder to test, reuse, and evolve. The codebase becomes transport-driven instead of domain-driven, which slows changes and increases regression risk. |
| Recommended Action | Extract shared use-cases for user resolution, enrollment, access contracts, and lesson progress. Isolate direct Supabase access behind repositories or focused data gateways. |
| Fix Effort | Large |
| Release Relevance | Pre-release |

#### Finding 5: Backend stage coverage is heavily learner-centric; instructor/admin, catalog, media, quiz, FAQ, and Q&A boundaries are missing
| Field | Detail |
| --- | --- |
| Title | Backend stage coverage is heavily learner-centric; instructor/admin, catalog, media, quiz, FAQ, and Q&A boundaries are missing |
| Severity | High |
| Impact Area | Architecture |
| Evidence | `..\DTMA-API\src\app.ts:33-41` mounts only learner-oriented routes plus a test route. `api/server.mjs:1359-1380` lists lesson access, saved courses, enrollment, test, and Stripe only. Repo search across `api` and `..\DTMA-API\src` found no backend modules for FAQ, Q&A, or quiz services, and no media route/service boundary. |
| Why It Matters | Stage01 and Stage02B cannot rely on stable backend domain ownership if their core server-side boundaries do not exist. This pushes logic into the client and makes the platform harder to secure and extend. |
| Recommended Action | Define an explicit backend capability map by stage and create first-class service boundaries for catalog, instructor/admin, media, and assessment/Q&A domains. |
| Fix Effort | Large |
| Release Relevance | Pre-release |

### Medium
#### Finding 6: Request validation and API contracts are mostly manual and inconsistent
| Field | Detail |
| --- | --- |
| Title | Request validation and API contracts are mostly manual and inconsistent |
| Severity | Medium |
| Impact Area | Release Readiness |
| Evidence | Zod is only used for environment validation in `..\DTMA-API\src\config\env.ts:6-19`. Route files rely on ad hoc checks such as `..\DTMA-API\src\routes\savedCourses.ts:54-58` and `..\DTMA-API\src\routes\enrollment.ts:134-138`. Response envelopes vary between plain objects and `{ success: true, ... }` across `..\DTMA-API\src\routes\enrollment.ts:59-63`, `..\DTMA-API\src\routes\enrollment.ts:110-113`, and `..\DTMA-API\src\routes\lessons.ts:19-37`. Legacy `api/lesson-access.mjs:49-57` introduces yet another contract style through query-param action routing. |
| Why It Matters | Without stable request/response schemas, clients drift, error handling becomes inconsistent, and contract changes become harder to audit. |
| Recommended Action | Define schema-validated DTOs for each endpoint and standardize response envelopes and error shapes across the canonical backend surface. |
| Fix Effort | Medium |
| Release Relevance | Pre-release |

#### Finding 7: Error handling and observability are inconsistent, and the legacy logger/rate limiter do not match the current auth user shape
| Field | Detail |
| --- | --- |
| Title | Error handling and observability are inconsistent, and the legacy logger/rate limiter do not match the current auth user shape |
| Severity | Medium |
| Impact Area | Operational Readiness |
| Evidence | `..\DTMA-API\src\middleware\error.ts:3-9` provides a generic error wrapper, but many routes return inline errors directly. Legacy request logging and rate limiting inspect `req.user.id` in `api/middleware/requestLogger.mjs:36` and `api/middleware/rateLimiter.mjs:82`, `api/middleware/rateLimiter.mjs:125`, while auth writes `azureUserId` in `api/middleware/auth.mjs:183-194`. |
| Why It Matters | Operational tooling is only useful when identity, request context, and error shape are consistent. The current mismatch reduces the reliability of logging and throttling signals. |
| Recommended Action | Standardize request context fields and use one structured error/logging strategy in the canonical backend. |
| Fix Effort | Medium |
| Release Relevance | Later |

#### Finding 8: Payment handling is still a stub and is not integrated into enrollment lifecycle management
| Field | Detail |
| --- | --- |
| Title | Payment handling is still a stub and is not integrated into enrollment lifecycle management |
| Severity | Medium |
| Impact Area | Release Readiness |
| Evidence | `api/stripe.mjs:5-10` explicitly states the production concerns are not implemented. It falls back to mock checkout behavior in `api/stripe.mjs:49-59`, and the webhook handler still contains `// TODO: Create enrollment in database` at `api/stripe.mjs:191-196`. No queue/worker layer was observed for payment follow-up processing. |
| Why It Matters | Payment success and enrollment creation are not fully coupled server-side. That creates release risk for paid enrollment flows and weakens operational recovery paths. |
| Recommended Action | Move payment flow ownership into the canonical backend, implement idempotent webhook-driven enrollment creation, and define retry/operational handling. |
| Fix Effort | Medium |
| Release Relevance | Pre-release |

## Quick Wins
- Require authentication on all user-scoped enrollment and access-contract endpoints and remove `userId` query/body fallbacks.
- Make sequential lesson access fail closed when prerequisite verification cannot be completed.
- Select one canonical backend surface and stop shipping overlapping learner APIs from two runtimes.
- Add schema validation for every write endpoint before further API expansion.
- Extract user-resolution and enrollment logic into shared services so new APIs do not duplicate the same Supabase access patterns again.
- Define explicit backend ownership for Stage02B media, catalog, quiz, FAQ, and Q&A concerns before extending those features.

## Release Risks
### Blockers
- Two backend surfaces currently implement overlapping learner APIs against different domain assumptions.
- Several enrollment and access-contract endpoints accept caller-supplied user identity when authentication is absent.

### Pre-release Risks
- Sequential lesson gating fails open on verification errors.
- Stage02B instructor/admin and media concerns do not have backend boundaries in the audited code.
- Catalog, quiz, FAQ, and Q&A server-side architecture is absent or not represented.
- Payment webhook flow is not integrated into authoritative enrollment handling.
- API contracts are not schema-defined or standardized.

### Inferred Risks Requiring Deeper Audit
These are not claimed as confirmed defects yet, but the current backend structure raises them:

- direct frontend-to-Supabase admin and media workflows may be compensating for missing backend domains
- deployment may be ambiguous because both the in-repo API layer and the separate `DTMA-API` service expose overlapping learner routes
- data migration and release coordination will be difficult until the platform chooses one canonical backend domain model for enrollment and lesson access
