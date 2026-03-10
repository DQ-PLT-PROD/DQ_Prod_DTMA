# DTMA Consolidated Executive Architecture Audit

Date: 2026-03-06

Evidence base:
- [01-system-map.md](01-system-map.md)
- [02-frontend-audit.md](02-frontend-audit.md)
- [03-backend-audit.md](03-backend-audit.md)
- [04-data-audit.md](04-data-audit.md)
- [05-security-ops-audit.md](05-security-ops-audit.md)

## Platform Summary

DTMA is currently one repository and one React/Vite SPA that contains all four product stages, an embedded `api/` serverless or Node API layer, Supabase schema and operational SQL, and several competing deployment paths. The stage split exists mainly at route level, not at deployable application or domain-service level. That means Stage00, Stage01, Stage02A, and Stage02B share code, runtime assumptions, and release risk more than the product framing suggests. See [01-system-map.md](01-system-map.md), [02-frontend-audit.md](02-frontend-audit.md), and [03-backend-audit.md](03-backend-audit.md).

```text
Browser SPA
  |- Stage00 landing
  |- Stage01 marketplace
  |- Stage02A learner portal/dashboard
  `- Stage02B instructor/admin
        |            \
        | direct      \ HTTP /api/*
        v              v
     Supabase <---- Embedded API layer
        ^
        |
  Separate DTMA-API service also exists for learner flows
```

The most important architectural fact for release planning is that DTMA does not have one cleanly chosen backend, one cleanly chosen learner data model, or one cleanly chosen production deployment path. The major blocker set is therefore not cosmetic debt. It is concentrated in identity, data authority, write protection, and deployment reproducibility. See [03-backend-audit.md](03-backend-audit.md), [04-data-audit.md](04-data-audit.md), and [05-security-ops-audit.md](05-security-ops-audit.md).

### Grouped View Of The Findings

| Workstream | Consolidated picture | Primary audit sources |
| --- | --- | --- |
| Architecture | Stage boundaries are mostly route prefixes, frontend and backend both mix multiple ownership models, and learner/instructor concerns are not isolated by runtime boundary. | [01-system-map.md](01-system-map.md), [02-frontend-audit.md](02-frontend-audit.md), [03-backend-audit.md](03-backend-audit.md) |
| Security | Privileged secrets are exposed, server-side authorization is inconsistent, and instructor content can be mutated through browser-direct or anonymous paths. | [02-frontend-audit.md](02-frontend-audit.md), [03-backend-audit.md](03-backend-audit.md), [05-security-ops-audit.md](05-security-ops-audit.md) |
| Data | Learner persistence is split across old and new table families, migration history is not authoritative, and schema drift is already visible in generated types and queries. | [04-data-audit.md](04-data-audit.md), [03-backend-audit.md](03-backend-audit.md) |
| Operational Readiness | CI/CD, Docker/Nginx, Vercel, and Kubernetes do not describe one trustworthy release path, and observability is shallow. | [01-system-map.md](01-system-map.md), [05-security-ops-audit.md](05-security-ops-audit.md), [03-backend-audit.md](03-backend-audit.md) |
| Delivery / Maintainability | Duplicate services, mixed API access patterns, absent service boundaries, and ad hoc validation will slow changes and increase regression risk. | [02-frontend-audit.md](02-frontend-audit.md), [03-backend-audit.md](03-backend-audit.md), [04-data-audit.md](04-data-audit.md) |

## Top 10 Findings

| Rank | Finding | Category | Severity | Release Relevance | Why it is in the top 10 | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Privileged Supabase secret material is committed, and production defaults are hardcoded into runtime config. | Security | Critical | Blocker | This is an immediate compromise and environment-contamination risk. Rotating later is not a valid release strategy. | [05-security-ops-audit.md](05-security-ops-audit.md), Critical Finding 1 |
| 2 | Instructor content and media mutation currently depend on anonymous or browser-direct write paths. | Security | Critical | Blocker | Stage02B writes are not defensible if database protection depends on client behavior. | [05-security-ops-audit.md](05-security-ops-audit.md), Critical Finding 2 |
| 3 | DTMA ships overlapping backend/API surfaces for the same learner domain, but they use incompatible models and contracts. | Architecture | Critical | Blocker | Two runtimes can enforce different access rules against different tables for the same learner journey. | [03-backend-audit.md](03-backend-audit.md), Critical Finding 1 |
| 4 | Learner enrollments, progress, and saved state are split across active course-level and module-level persistence models. | Data | Critical | Blocker | A learner can accumulate state in different tables depending on which code path handles the request. | [04-data-audit.md](04-data-audit.md), Critical Finding 1 |
| 5 | Several learner APIs allow caller-supplied `userId` values when authentication is absent. | Security | Critical | Blocker | User-scoped reads and mutations cannot rely on unauthenticated identity input. | [03-backend-audit.md](03-backend-audit.md), Critical Finding 2 |
| 6 | Legacy serverless handlers remain on the deploy surface with permissive CORS and weak JWT handling. | Security | Critical | Blocker | Even if a stronger backend exists elsewhere, the weaker one still expands the attack surface. | [05-security-ops-audit.md](05-security-ops-audit.md), Critical Finding 3 |
| 7 | The checked-in migration chain is not an authoritative reconstruction of the schema the app currently uses. | Data | High | Blocker | Fresh environments, rollback, and incident recovery cannot be trusted while migrations, types, and query code disagree. | [04-data-audit.md](04-data-audit.md), High Finding 2 |
| 8 | CI/CD does not currently provide a trustworthy release gate. | Operational Readiness | High | Blocker | The repo has no reliable automated proof that the intended artifact can be built, tested, packaged, and deployed. | [05-security-ops-audit.md](05-security-ops-audit.md), High Finding 4 |
| 9 | Deployment assets describe conflicting runtime models and broken Kubernetes wiring. | Operational Readiness | High | Blocker | Production release cannot be repeatable while runtime ownership is split across incompatible manifests and hosting assumptions. | [05-security-ops-audit.md](05-security-ops-audit.md), High Finding 5 |
| 10 | A Stage00 CTA flow ships a hardcoded bearer token in browser code. | Security | High | Blocker | This is a concrete client-side secret exposure in the public landing experience. | [02-frontend-audit.md](02-frontend-audit.md), High Finding 5 |

## Release Blockers

The audits identify the following confirmed release blockers. These are the items that should be treated as release-go or release-no-go criteria.

| Blocker | Category | Source |
| --- | --- | --- |
| Supabase service-role secret is committed, and runtime config hardcodes production credentials/defaults. | Security | [05-security-ops-audit.md](05-security-ops-audit.md), Critical Finding 1 |
| Instructor/admin content and media write paths are open to anonymous or browser-direct mutation. | Security | [05-security-ops-audit.md](05-security-ops-audit.md), Critical Finding 2 |
| Legacy serverless handlers use permissive CORS and weak JWT handling while still sitting on the deploy surface. | Security | [05-security-ops-audit.md](05-security-ops-audit.md), Critical Finding 3 |
| Two backend surfaces implement overlapping learner APIs using divergent domain models. | Architecture | [03-backend-audit.md](03-backend-audit.md), Critical Finding 1 |
| Several enrollment and access endpoints permit caller-supplied user targeting when auth is absent. | Security | [03-backend-audit.md](03-backend-audit.md), Critical Finding 2 |
| Learner state is split across active course-level and module-level persistence models. | Data | [04-data-audit.md](04-data-audit.md), Critical Finding 1 |
| The checked-in migration chain is not authoritative for the runtime schema. | Data | [04-data-audit.md](04-data-audit.md), High Finding 2 |
| CI/CD does not provide a trustworthy release gate. | Operational Readiness | [05-security-ops-audit.md](05-security-ops-audit.md), High Finding 4 |
| Deployment assets define conflicting production runtimes and broken Kubernetes wiring. | Operational Readiness | [05-security-ops-audit.md](05-security-ops-audit.md), High Finding 5 |
| Stage00 CTA submission code exposes a hardcoded bearer token in the browser. | Security | [02-frontend-audit.md](02-frontend-audit.md), High Finding 5 |

### Before Release vs After Release

Before release:
- Every blocker in the table above.
- Sequential lesson access failing open. See [03-backend-audit.md](03-backend-audit.md), High Finding 3.
- Payment flow scope decision: either remove it from scope or complete the backend lifecycle. See [03-backend-audit.md](03-backend-audit.md), Medium Finding 8 and [05-security-ops-audit.md](05-security-ops-audit.md), High Finding 7.
- Environment contract cleanup and `.env.example` publication. See [05-security-ops-audit.md](05-security-ops-audit.md), High Finding 6.

After release, if explicitly deferred and tracked:
- Shared component overload and form-pattern standardization. See [02-frontend-audit.md](02-frontend-audit.md), Medium Findings 6-7.
- Long-horizon domain extraction for quiz, FAQ, Q&A, and media architecture once canonical ownership is chosen. See [03-backend-audit.md](03-backend-audit.md), High Finding 5 and [04-data-audit.md](04-data-audit.md), Medium Findings 5 and 7.
- Composite-index tuning based on query plans rather than pre-emptive schema churn. See [04-data-audit.md](04-data-audit.md), Medium Finding 8.

## Quick Wins

| Quick win | Impact | Effort | Timing | Evidence |
| --- | --- | --- | --- | --- |
| Rotate the exposed Supabase service-role key and remove committed `.env*` secrets from version control. | Removes an active compromise path immediately. | Small | Before release | [05-security-ops-audit.md](05-security-ops-audit.md), Critical Finding 1 |
| Remove the hardcoded Stage00 CTA bearer token by proxying the submission server-side or disabling the integration temporarily. | Eliminates a public client-side secret quickly. | Small | Before release | [02-frontend-audit.md](02-frontend-audit.md), High Finding 5 |
| Require authentication on all user-scoped learner endpoints and remove fallback `userId` semantics. | Closes a direct authorization gap with limited code surface. | Small | Before release | [03-backend-audit.md](03-backend-audit.md), Critical Finding 2 |
| Make lesson access fail closed when prerequisite verification errors occur. | Prevents access grants on backend failure. | Small | Before release | [03-backend-audit.md](03-backend-audit.md), High Finding 3 |
| Disable legacy `api/enrollment.mjs` and `api/lesson-access.mjs` from deployment. | Shrinks the attack surface and reduces contract confusion. | Small | Before release | [05-security-ops-audit.md](05-security-ops-audit.md), Critical Finding 3 |
| Publish one non-secret `.env.example` aligned to the chosen runtime. | Reduces configuration drift and onboarding errors. | Small | Before release | [05-security-ops-audit.md](05-security-ops-audit.md), High Finding 6 |
| Freeze writes to one learner-state model while canonical migration/backfill is prepared. | Stops the data split from getting worse during closure. | Small | Before release | [04-data-audit.md](04-data-audit.md), Critical Finding 1 |
| Add one CI workflow that runs install, lint, tests, and build on the chosen release artifact. | Creates a real release gate quickly without waiting for broader platform cleanup. | Medium | Before release | [05-security-ops-audit.md](05-security-ops-audit.md), High Finding 4 |

## Remediation Roadmap

### 0-3 Days

Objective: remove active security exposure and stop further data divergence.

| Action | Outcome | Fix before release |
| --- | --- | --- |
| Rotate exposed Supabase service-role credentials and remove committed secrets from repo-managed env files. | Secret compromise window is closed and new environments stop inheriting leaked values. | Yes |
| Disable Stage00 CTA hardcoded bearer-token flow or move it behind a server-owned endpoint. | Public client no longer ships an external integration credential. | Yes |
| Require auth for all user-scoped learner endpoints and remove caller-supplied identity fallbacks. | Learner reads and mutations stop trusting unauthenticated `userId` input. | Yes |
| Disable legacy serverless learner handlers from production routing. | Weak CORS/JWT paths are removed from the attack surface. | Yes |
| Revoke anonymous write paths for instructor-managed tables and `course-content` storage. | Stage02B writes become enforceable by server-side auth/RLS rather than client behavior. | Yes |
| Freeze deprecated learner-state writes and document the canonical table family. | Further split-brain learner data accumulation stops. | Yes |
| Decide the canonical production runtime and release pipeline owner. | Teams stop patching all deployment paths in parallel. | Yes |

### 1-2 Weeks

Objective: establish one authoritative backend, one authoritative schema, and one deployable artifact.

| Action | Outcome | Fix before release |
| --- | --- | --- |
| Choose the canonical backend/API runtime and retire or hard-disable the secondary learner surface. | One access model, one contract set, one operational owner. | Yes |
| Reconcile migrations, generated Supabase types, and live query expectations into one release baseline. | Fresh environments and rollback paths become trustworthy. | Yes |
| Implement a real CI gate for the chosen artifact: install, lint, tests, build, and deploy packaging. | Merges and releases have an enforceable quality gate. | Yes |
| Reconcile Docker, Nginx, Vercel, and Kubernetes assets to the chosen runtime model. | The repo describes one internally consistent production path. | Yes |
| Make lesson gating fail closed and standardize request validation for write endpoints. | Access-control and contract defects stop turning failures into grants. | Yes |
| Decide payment scope. If in MVP, finish webhook-driven enrollment mutation. If not, remove payment from release claims and routes. | Checkout behavior matches product promises. | Yes |
| Publish one environment contract and `.env.example`, then align Vite, API, runtime injection, and manifests to it. | Environment drift becomes auditable. | Yes |

### 1-2 Months

Objective: reduce structural drag after the blocker set is closed.

| Action | Outcome | Fix before release |
| --- | --- | --- |
| Extract backend domain boundaries for catalog, instructor/admin, media, assessment, and future FAQ/Q&A. | New features stop defaulting to browser-direct or route-level ownership. | No |
| Reduce route-level stage coupling by introducing stage-owned shells and clearer shared-layer rules. | Stage00, Stage01, Stage02A, and Stage02B become easier to change independently. | No |
| Remove duplicate frontend services and hooks, then standardize one form and validation pattern. | Fewer regressions and clearer ownership at the client layer. | No |
| Add structured logs, dependency-aware readiness checks, centralized error reporting, and durable rate limiting. | Production triage improves materially. | No, but recommended soon after release |
| Finish quiz persistence cleanup and define explicit persistence strategy for FAQ, Q&A, and media ownership. | Future product expansion can build on stable aggregates instead of transitional models. | No |

## Suggested Ownership By Workstream

| Workstream | Primary responsibilities | Suggested owner(s) |
| --- | --- | --- |
| Security hardening | Secret rotation, env cleanup, auth boundary cleanup, disabling weak deploy surfaces, RLS restoration | Security lead plus platform/backend owner |
| Backend/API consolidation | Canonical learner runtime choice, endpoint auth enforcement, contract standardization, payment scope decision | Backend lead |
| Data/platform integrity | Canonical learner data model, migration reconciliation, type regeneration, backfill planning | Data engineer or Supabase owner |
| Frontend containment | CTA fix, stage-shell cleanup, duplicate service retirement, auth matrix publication | Frontend lead |
| DevOps / release engineering | Canonical pipeline, deploy artifact definition, manifest cleanup, environment contract | DevOps/platform lead |
| QA / release management | Blocker exit criteria, regression coverage around auth/enrollment/progress, release signoff | QA lead or release manager |
| Product / delivery | Scope calls on payment, `/dashboard/*` compatibility, FAQ/Q&A MVP inclusion, deferred-work approvals | Product owner |

## Final Recommendation On Release Readiness

DTMA is not release-ready in its current state.

The decision basis is straightforward: the audit set shows confirmed blocker-level issues in privileged secret handling, instructor write protection, learner authorization, learner data authority, schema reproducibility, and deployment reproducibility. Any one of those would justify a release hold. In combination, they indicate that the current release candidate is not yet operating from a single trustworthy architecture baseline. See [02-frontend-audit.md](02-frontend-audit.md), [03-backend-audit.md](03-backend-audit.md), [04-data-audit.md](04-data-audit.md), and [05-security-ops-audit.md](05-security-ops-audit.md).

Recommended decision:
- `No-go` for release until the blocker list is closed.
- Treat the `0-3 days` and `1-2 weeks` roadmap items as release-closure work, not optional hardening.
- Allow the `1-2 months` items to trail release only if the platform first establishes one canonical backend, one canonical learner-state model, one secured instructor write path, and one reproducible production deployment path.
