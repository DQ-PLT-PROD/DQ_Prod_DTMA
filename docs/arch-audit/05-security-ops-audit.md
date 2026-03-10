# DTMA Security, DevOps, and Release-Readiness Audit

## Executive Summary
DTMA has several confirmed release blockers in its security and operational surface. The most serious are not abstract hardening gaps; they are active exposures in the current repo and migration set:

- a Supabase service-role key is committed in repository files
- browser and anonymous write paths are explicitly enabled for instructor-managed content and course media
- legacy serverless API handlers include weak authentication patterns and permissive CORS
- deployment assets do not describe one coherent, reproducible production path

The repo also shows broader release-readiness weaknesses: CI/CD is not enforcing a real build-test-deploy gate, environment definitions drift across Vite, Kubernetes, and Nginx-style runtime injection, and observability is limited to console logs, `morgan`, and minimal health endpoints.

Confirmed blocker-level items:

- committed server-side secret material
- fail-open content/media authorization through RLS disablement and anonymous storage policies
- weakly secured legacy API functions still present on the deploy surface
- non-authoritative deployment configuration and broken pipeline/manifests

Validation during audit:

- `npm run build` passed after rerunning outside the sandbox because the initial sandbox run failed with `spawn EPERM` while loading Vite/esbuild
- no `typecheck` script exists in `package.json`

## Security Posture Assessment
The security posture is mixed and inconsistent across runtime surfaces.

Positive controls present:

- the separate Express API uses `helmet()` in `..\DTMA-API\src\app.ts:17`
- the separate Express API uses central JSON body limits and rate limiting in `..\DTMA-API\src\app.ts:19-29`
- Azure JWT validation with issuer and audience checks exists in `..\DTMA-API\src\middleware\auth.ts:70-105`

However, the repo also contains materially weaker paths:

- the in-repo `api/` runtime manually loads env files and uses a service-role client in `api/server.mjs:12-63`
- legacy serverless handlers expose permissive CORS and custom auth behavior in `api/enrollment.mjs:72-111` and `api/lesson-access.mjs:34-61`
- instructor/media write paths are allowed directly from the browser through Supabase rather than a hardened backend boundary

Confirmed web-security concerns:

- committed secrets and default production credentials in client code
- wildcard CORS in legacy serverless handlers
- manual request validation in many endpoints
- upload handling that relies on storage policies and browser tokens more than on backend enforcement

## Authorization & Access Control Assessment
Authorization is not consistently enforced at the server or data layer.

Learner APIs:

- the separate Express API has real JWT validation in `..\DTMA-API\src\middleware\auth.ts:124-204`
- however, several enrollment endpoints still allow caller-supplied `userId` values when auth is absent in `..\DTMA-API\src\routes\enrollment.ts:18-32`, `..\DTMA-API\src\routes\enrollment.ts:71-84`, `..\DTMA-API\src\routes\enrollment.ts:121-132`, `..\DTMA-API\src\routes\enrollment.ts:313-323`, and `..\DTMA-API\src\routes\enrollment.ts:369-380`

Instructor/admin paths:

- the intended secure model exists in `supabase/migrations/049_admin_auth_rbac.sql:92-288`, with `admin_memberships` and role-aware RLS
- but earlier migrations explicitly disable RLS for `courses`, `lessons`, and `modules` so anon-key clients can write: `supabase/migrations/045_courses_disable_rls.sql:1-5` and `supabase/migrations/046_disable_rls_lessons_and_modules.sql:1-19`
- instructor portal writes directly from the browser through `getSupabase()` in `src/features/instructor-portal/lib/dbClient.ts:15-21`, and then uses that client for content writes in `src/features/instructor-portal/components/course-management/LessonForm.tsx:203-228`

Media paths:

- anonymous insert, update, delete, and read policies are granted on `storage.objects` for `course-content` in `supabase/migrations/049_course_content_storage_anon_policies.sql:5-49`
- upload code falls back to the anon key if the user has no session in `src/features/instructor-portal/lib/storage.ts:124-191` and `src/features/instructor-portal/lib/mediaService.ts:137-143`

This is confirmed authorization drift, not an inferred risk.

## Configuration / Secrets Management Assessment
Configuration and secret handling is one of the weakest parts of the current release posture.

Confirmed issues:

- committed env files contain live environment values in `.env:1-20`, `.env.local:1-20`, and `.env.txt:1-24`
- `.env.txt:24` contains a Supabase service-role key in version control
- browser client defaults hardcode the production Supabase URL and anon key in `src/lib/supabase/client.ts:5-6`
- the backend service role is referenced with a `VITE_`-prefixed variable in `api/server.mjs:46-47`, `api/enrollment.mjs:15-18`, and `api/lesson-access.mjs:11-14`
- committed Kubernetes secret/config files contain environment values directly in `k8s/base/secret.yaml:1-10` and `k8s/base/configmap.yaml:1-15`

Environment drift is also visible:

- app env uses `dqproddev` and `ugmybskacomcdgdngolz.supabase.co` in `.env:2-15`
- Kubernetes base config uses `dqproj`, localhost URLs, a different Supabase URL, and a typoed logout variable in `k8s/base/configmap.yaml:6-15`
- runtime injection template uses `VITE_AZURE_POST_LOGOUT_R` rather than `VITE_AZURE_POST_LOGOUT_REDIRECT_URI` in `env.template.js:3-15`

## Deployment & Environment Assessment
DTMA does not currently have one authoritative production deployment path.

Frontend build:

- root production build works via Vite: `package.json:10` and verified during audit
- there is no `typecheck` script in `package.json:6-18`

CI/CD:

- `.github/workflows/build.yml:1-19` only runs SonarQube and does not build, lint, or test the app
- `.github/workflows/vercel-deploy.yml:1-107` is fully commented out
- `.github/workflows/branch-protection.yml:44-68` does not install dependencies and intentionally exits with failure in the test step
- `azure-pipelines.yml:7-68` disables automatic triggers and references `k8s/overlays/staging/deployment.yaml`, but repo inspection found only `k8s/overlays/staging/staging-ingress.yaml`

Container/runtime model:

- `Dockerfile:3-31` builds a Node/Vite preview image
- `entrypoint.sh:6-13`, `default.conf:1-42`, and `env.template.js:1-15` describe an Nginx/static-site runtime with env templating
- those are different runtime models, and they are not reconciled in the repo

Kubernetes:

- production deployment uses image `.../frontend:latest` in `k8s/overlays/Production/deployment.yaml:17-23`
- production ingress routes to `dtma-service` in `k8s/overlays/Production/ingress.yaml:19-25`, but the base Service is named `kf-frontend-service` in `k8s/base/service.yaml:1-12`
- production kustomization sets `namespace: staging` and references `staging-ingress.yaml` in `k8s/overlays/Production/kustomization.yaml:1-6`

These are confirmed release-readiness defects, not just cleanup opportunities.

## Observability & Operational Readiness Assessment
Observability is minimal.

What exists:

- `morgan("dev")` in `..\DTMA-API\src\app.ts:20`
- console-based logging across both runtimes
- health endpoints in `..\DTMA-API\src\routes\health.ts:1-6` and `api/server.mjs:1170-1175`

What is missing or weak:

- no structured logging framework
- no metrics endpoint, tracing, or monitoring integration was found
- no Sentry, Datadog, New Relic, OpenTelemetry, or Prometheus integration was found in repo search
- health endpoints do not verify downstream dependencies
- the legacy rate limiter is in-memory only and explicitly notes Redis is needed for production in `api/middleware/rateLimiter.mjs:7-18`
- request logging and rate limiting in the legacy API identify authenticated users via `req.user.id`, but auth populates `azureUserId` in `api/middleware/requestLogger.mjs:36-49`, `api/middleware/rateLimiter.mjs:82-88`, and `api/middleware/auth.mjs:183-194`

Operationally, DTMA can start and answer basic health checks, but it does not have strong signals for partial outage, auth failures, storage failures, or deployment drift.

## Findings by Severity
### Critical
#### Finding 1: A Supabase service-role key is committed in the repository, and client/runtime config hardcodes production Supabase credentials
| Field | Detail |
| --- | --- |
| Title | A Supabase service-role key is committed in the repository, and client/runtime config hardcodes production Supabase credentials |
| Severity | Critical |
| Impact Area | Security |
| Evidence | `.env.txt:24` contains a `VITE_SUPABASE_SERVICE_ROLE_KEY`. Additional live environment values are committed in `.env:1-20` and `.env.local:1-20`. The browser client hardcodes the production Supabase URL and anon key defaults in `src/lib/supabase/client.ts:5-6`. The backend service role is also referenced via a `VITE_`-prefixed variable in `api/server.mjs:46-47`, `api/enrollment.mjs:15-18`, and `api/lesson-access.mjs:11-14`. |
| Why It Matters | A service-role key is a privileged backend credential. Once committed, it must be treated as compromised. Hardcoded production defaults also make accidental cross-environment access and key reuse more likely. |
| Recommended Action | Rotate the exposed service-role key immediately, remove committed env files from version control, eliminate hardcoded production defaults from browser code, and move all privileged server secrets to deployment-managed secret stores using non-`VITE_` names. |
| Fix Effort | Medium |
| Release Relevance | Blocker |

#### Finding 2: Instructor content and media write paths are explicitly open to anonymous or browser-direct mutation
| Field | Detail |
| --- | --- |
| Title | Instructor content and media write paths are explicitly open to anonymous or browser-direct mutation |
| Severity | Critical |
| Impact Area | Security |
| Evidence | `supabase/migrations/045_courses_disable_rls.sql:1-5` disables RLS on `courses` so the anon key can write. `supabase/migrations/046_disable_rls_lessons_and_modules.sql:1-19` disables RLS on `lessons` and `modules` for anon-key writes. `supabase/migrations/049_course_content_storage_anon_policies.sql:5-49` grants anon insert/select/update/delete on `storage.objects` for the `course-content` bucket. The instructor portal uses the browser Supabase client via `src/features/instructor-portal/lib/dbClient.ts:15-21`, writes lessons directly in `src/features/instructor-portal/components/course-management/LessonForm.tsx:203-228`, and upload code falls back to anon credentials in `src/features/instructor-portal/lib/storage.ts:124-191` and `src/features/instructor-portal/lib/mediaService.ts:137-143`. |
| Why It Matters | This defeats the intended role-based instructor model. If the deployed database still reflects these migrations, content and media protection depends on client behavior rather than enforceable server-side authorization. |
| Recommended Action | Remove anon write paths for instructor-managed tables and storage, restore strict RLS or route writes through a trusted backend, and verify that the intended RBAC model in `049_admin_auth_rbac.sql` is the only active write path. |
| Fix Effort | Large |
| Release Relevance | Blocker |

#### Finding 3: Legacy serverless API handlers use permissive CORS and weak authentication patterns
| Field | Detail |
| --- | --- |
| Title | Legacy serverless API handlers use permissive CORS and weak authentication patterns |
| Severity | Critical |
| Impact Area | Security |
| Evidence | `api/enrollment.mjs:73-77` and `api/lesson-access.mjs:35-39` set `Access-Control-Allow-Origin: *` while accepting `Authorization` headers. `api/enrollment.mjs:38-58` derives user identity by decoding the JWT payload without signature validation and explicitly notes proper JWT validation is still needed. These handlers also initialize privileged Supabase clients with the service-role key in `api/enrollment.mjs:15-18` and `api/lesson-access.mjs:11-14`. |
| Why It Matters | If these handlers are deployed or reachable, they create a privileged API surface with materially weaker trust checks than the separate Express API. That is not acceptable for release closure. |
| Recommended Action | Remove or disable the legacy handlers from the deployment surface, or bring them up to the same auth, CORS, validation, and authorization standard as the primary backend before release. |
| Fix Effort | Medium |
| Release Relevance | Blocker |

### High
#### Finding 4: CI/CD does not provide a trustworthy release gate
| Field | Detail |
| --- | --- |
| Title | CI/CD does not provide a trustworthy release gate |
| Severity | High |
| Impact Area | Release Readiness |
| Evidence | `.github/workflows/build.yml:1-19` only runs SonarQube. `.github/workflows/vercel-deploy.yml:1-107` is fully commented out. `.github/workflows/branch-protection.yml:44-68` does not install dependencies and intentionally exits with failure in the test step. `azure-pipelines.yml:7-68` disables automatic triggers and applies `k8s/overlays/staging/deployment.yaml`, but no such file exists in the repo. |
| Why It Matters | There is no reliable automated path that proves the app can be built, tested, packaged, and deployed from the current repository state. Release depends on manual knowledge and partial tooling. |
| Recommended Action | Choose one authoritative CI/CD path, make it build/test/package the actual deploy artifact, and fail merges when that pipeline does not pass. Remove dead or commented deployment workflows once the canonical path is live. |
| Fix Effort | Medium |
| Release Relevance | Blocker |

#### Finding 5: Deployment assets describe conflicting production runtimes and broken Kubernetes wiring
| Field | Detail |
| --- | --- |
| Title | Deployment assets describe conflicting production runtimes and broken Kubernetes wiring |
| Severity | High |
| Impact Area | Operational Readiness |
| Evidence | `Dockerfile:3-31` builds a Node container that runs `npm run preview`, while `entrypoint.sh:6-13`, `default.conf:1-42`, and `env.template.js:1-15` assume an Nginx/static runtime. Kubernetes production ingress routes to `dtma-service` in `k8s/overlays/Production/ingress.yaml:19-25`, but the base Service is `kf-frontend-service` in `k8s/base/service.yaml:1-12`. `k8s/overlays/Production/kustomization.yaml:1-6` sets `namespace: staging` and references `staging-ingress.yaml` from the production overlay. |
| Why It Matters | Even if the frontend build succeeds, the repo does not define one internally consistent way to run it in production. That increases the chance of broken releases, routing failures, or environment injection errors. |
| Recommended Action | Choose one production runtime model, delete the unused one, and reconcile Kubernetes service names, namespaces, ingress references, and image promotion rules against that chosen path. |
| Fix Effort | Large |
| Release Relevance | Blocker |

#### Finding 6: Production configuration drifts across env files, runtime injection, and Kubernetes manifests
| Field | Detail |
| --- | --- |
| Title | Production configuration drifts across env files, runtime injection, and Kubernetes manifests |
| Severity | High |
| Impact Area | Developer Experience |
| Evidence | `.env:2-15` uses `dqproddev`, Vercel URLs, and `ugmybskacomcdgdngolz.supabase.co`. `k8s/base/configmap.yaml:6-15` uses `dqproj`, localhost URLs, a different Supabase URL, and `VITE_AZURE_POST_LOGOUT_R`. `env.template.js:3-15` also expects `VITE_AZURE_POST_LOGOUT_R`. No `.env.example` file exists in the repo. |
| Why It Matters | Environment drift is a common source of release defects, especially in auth flows. Different deployment paths may resolve different redirect URIs, identity hosts, or backend endpoints without any single source of truth. |
| Recommended Action | Define one canonical environment contract, publish a non-secret `.env.example`, and ensure Vite, backend env parsing, runtime template injection, and Kubernetes manifests all use the same keys and values. |
| Fix Effort | Medium |
| Release Relevance | Pre-release |

#### Finding 7: Payment handling remains a mock/stub path rather than a production-ready backend
| Field | Detail |
| --- | --- |
| Title | Payment handling remains a mock/stub path rather than a production-ready backend |
| Severity | High |
| Impact Area | Release Readiness |
| Evidence | `api/stripe.mjs:1-12` states the backend is a minimal stub. `api/stripe.mjs:49-59` returns a mock session when Stripe is not configured. `api/stripe.mjs:195` still leaves enrollment creation as `TODO`. The legacy API server also hardcodes mock Stripe session behavior in `api/server.mjs:1312-1340`. |
| Why It Matters | If payments are in scope for release, this path is not operationally complete. It can report success without completing the core business action that should follow payment. |
| Recommended Action | Either remove payment from release scope explicitly or finish the backend flow end-to-end: auth, checkout creation, webhook verification, enrollment/subscription mutation, and monitoring. |
| Fix Effort | Medium |
| Release Relevance | Pre-release |

### Medium
#### Finding 8: Request validation is fragmented and mostly manual
| Field | Detail |
| --- | --- |
| Title | Request validation is fragmented and mostly manual |
| Severity | Medium |
| Impact Area | Maintainability |
| Evidence | The separate API validates env with Zod in `..\DTMA-API\src\config\env.ts:6-19`, but route payloads rely on manual checks such as `..\DTMA-API\src\routes\savedCourses.ts:54-58`, `..\DTMA-API\src\routes\enrollment.ts:134-138`, and `api/server.mjs:108-115`. Upload helpers accept arbitrary `file.type` and use only size checks in `src/features/instructor-portal/lib/storage.ts:98-103` and `src/features/instructor-portal/lib/mediaService.ts:97-123`. |
| Why It Matters | Manual validation is harder to keep consistent and easier to miss as new endpoints and upload paths are added. That increases defect risk and makes contracts less clear to clients. |
| Recommended Action | Introduce shared request schemas for API payloads and explicit allowlists for upload MIME types, extensions, and size by media category. |
| Fix Effort | Medium |
| Release Relevance | Pre-release |

#### Finding 9: Observability is too shallow for production incident response
| Field | Detail |
| --- | --- |
| Title | Observability is too shallow for production incident response |
| Severity | Medium |
| Impact Area | Operational Readiness |
| Evidence | Health checks only return shallow status in `..\DTMA-API\src\routes\health.ts:5-6` and `api/server.mjs:1170-1175`. Logging is mostly `console.*` across both runtimes, with `morgan("dev")` in `..\DTMA-API\src\app.ts:20`. Repo search found no Sentry, Datadog, New Relic, OpenTelemetry, or Prometheus integration. The legacy rate limiter is in-memory only in `api/middleware/rateLimiter.mjs:7-18`. |
| Why It Matters | A release can appear healthy while downstream services, auth providers, or storage paths are partially failing. Without structured telemetry, triage and rollback decisions become slower and more error-prone. |
| Recommended Action | Add dependency-aware readiness checks, structured logs with correlation IDs, and at least one production error-monitoring path before closure. |
| Fix Effort | Medium |
| Release Relevance | Pre-release |

#### Finding 10: Auth bypass and mock-auth switches remain present in the frontend runtime
| Field | Detail |
| --- | --- |
| Title | Auth bypass and mock-auth switches remain present in the frontend runtime |
| Severity | Medium |
| Impact Area | Security |
| Evidence | The client reads `VITE_USE_MOCK_AUTH` and `VITE_BYPASS_AZURE_AUTH` in `src/lib/auth/AuthContext.tsx:80-93`, prioritizes them over real auth in `src/lib/auth/AuthContext.tsx:321-338`, and creates a bypass user that skips Azure entirely in `src/lib/auth/AuthContext.tsx:554-566`. |
| Why It Matters | These switches are not enabled in the committed `.env`, so this is an inferred release risk rather than a confirmed current exploit. However, leaving bypass code in the production bundle raises the chance of misconfiguration or accidental enablement. |
| Recommended Action | Remove bypass/mock auth from production builds or gate it behind compile-time dev-only code paths that cannot be enabled through runtime configuration in production. |
| Fix Effort | Small |
| Release Relevance | Later |

## Quick Wins
- Rotate the exposed Supabase service-role key immediately and invalidate any downstream secrets derived from it.
- Remove committed `.env*` files from version control and replace them with a non-secret `.env.example`.
- Disable or remove the legacy `api/enrollment.mjs` and `api/lesson-access.mjs` handlers from any active deployment target.
- Revoke anonymous write/delete policies on `course-content` and confirm RLS is enabled for instructor-managed tables.
- Make one CI workflow run `npm ci`, `npm run lint`, `npm run test:run`, and `npm run build` on every merge path.
- Reconcile the production Kubernetes overlay so namespace, service names, ingress names, and referenced files match real repo contents.

## Release Blockers
- Committed server-side secret material, specifically the Supabase service-role key in `.env.txt`.
- Anonymous or browser-direct mutation paths for courses, lessons, modules, and `course-content` storage.
- Legacy serverless API handlers with permissive CORS and weak JWT handling still present on the deploy surface.
- No trustworthy, reproducible deployment pipeline or internally consistent production manifest set.

## Pre-release Checklist Recommendations
- Confirm the exact production runtime: Vercel serverless, Express service, containerized frontend, or Kubernetes. Remove the other paths from active release ownership.
- Verify every production secret is managed outside git and rotate any secret that has ever appeared in repo history.
- Prove the instructor path can only write through authenticated admin membership enforcement.
- Run one full release pipeline from clean checkout to deployable artifact using the same environment contract production will use.
- Add dependency-aware readiness checks for Supabase, auth configuration, and any payment/webhook dependencies.
- Add at least one centralized error-monitoring and alerting path before declaring release closure.
