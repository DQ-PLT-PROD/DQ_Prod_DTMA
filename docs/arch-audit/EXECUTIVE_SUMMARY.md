# DTMA Executive Architecture Summary

Date: 2026-03-06

Evidence base:
- [01-system-map.md](01-system-map.md)
- [02-frontend-audit.md](02-frontend-audit.md)
- [03-backend-audit.md](03-backend-audit.md)
- [04-data-audit.md](04-data-audit.md)
- [05-security-ops-audit.md](05-security-ops-audit.md)

## Platform Summary

DTMA currently behaves as one shared platform rather than four cleanly separated products. Stage00, Stage01, Stage02A, and Stage02B all live inside one React SPA, while learner logic is split across an embedded `api/` layer, a separate `DTMA-API` service, and direct Supabase access. Supabase is the core operational backend, but the repository also carries multiple competing deployment paths across Vercel, Docker/Nginx, and Kubernetes. See [01-system-map.md](01-system-map.md), [02-frontend-audit.md](02-frontend-audit.md), and [03-backend-audit.md](03-backend-audit.md).

The release problem is not isolated technical debt. The blocker set shows DTMA still lacks one authoritative backend, one authoritative learner data model, one secure instructor write path, and one reproducible production deployment path. See [03-backend-audit.md](03-backend-audit.md), [04-data-audit.md](04-data-audit.md), and [05-security-ops-audit.md](05-security-ops-audit.md).

### Grouped View Of The Findings

| Workstream | Consolidated picture |
| --- | --- |
| Architecture | Stage boundaries are mostly route-level, and learner backend ownership is split across overlapping runtimes. |
| Security | Secrets are exposed, authorization is inconsistent, and instructor write protection is not defensible in the current shape. |
| Data | Learner state is split across old and new persistence models, and schema history does not cleanly match runtime expectations. |
| Operational Readiness | CI/CD, runtime config, and deployment assets do not yet provide one repeatable production path. |
| Delivery / Maintainability | Duplicate services, mixed access patterns, and missing service boundaries will continue to slow delivery until ownership is simplified. |

## Top 10 Findings

| Rank | Finding | Category | Severity | Release Relevance | Source |
| --- | --- | --- | --- | --- | --- |
| 1 | Committed Supabase service-role secret and hardcoded production defaults. | Security | Critical | Blocker | [05-security-ops-audit.md](05-security-ops-audit.md), Critical Finding 1 |
| 2 | Instructor content and media mutation depend on anonymous or browser-direct writes. | Security | Critical | Blocker | [05-security-ops-audit.md](05-security-ops-audit.md), Critical Finding 2 |
| 3 | Overlapping backend surfaces implement the same learner domain with incompatible models. | Architecture | Critical | Blocker | [03-backend-audit.md](03-backend-audit.md), Critical Finding 1 |
| 4 | Learner state is split across active course-level and module-level persistence models. | Data | Critical | Blocker | [04-data-audit.md](04-data-audit.md), Critical Finding 1 |
| 5 | Learner APIs accept caller-supplied `userId` when authentication is absent. | Security | Critical | Blocker | [03-backend-audit.md](03-backend-audit.md), Critical Finding 2 |
| 6 | Legacy serverless handlers use permissive CORS and weak JWT handling. | Security | Critical | Blocker | [05-security-ops-audit.md](05-security-ops-audit.md), Critical Finding 3 |
| 7 | The migration chain is not authoritative for the schema the app currently uses. | Data | High | Blocker | [04-data-audit.md](04-data-audit.md), High Finding 2 |
| 8 | CI/CD does not provide a trustworthy release gate. | Operational Readiness | High | Blocker | [05-security-ops-audit.md](05-security-ops-audit.md), High Finding 4 |
| 9 | Deployment assets describe conflicting runtime models and broken Kubernetes wiring. | Operational Readiness | High | Blocker | [05-security-ops-audit.md](05-security-ops-audit.md), High Finding 5 |
| 10 | Stage00 CTA code exposes a hardcoded bearer token in the browser. | Security | High | Blocker | [02-frontend-audit.md](02-frontend-audit.md), High Finding 5 |

## Release Blockers

Confirmed blockers before release:
- Exposed privileged secrets and hardcoded production configuration. See [05-security-ops-audit.md](05-security-ops-audit.md).
- Anonymous or browser-direct mutation for instructor-managed content and storage. See [05-security-ops-audit.md](05-security-ops-audit.md).
- Weak legacy serverless learner handlers still on the deploy surface. See [05-security-ops-audit.md](05-security-ops-audit.md).
- Two learner backends with incompatible domain assumptions. See [03-backend-audit.md](03-backend-audit.md).
- Unauthenticated learner endpoints that trust caller-supplied identity. See [03-backend-audit.md](03-backend-audit.md).
- Split learner persistence across old and new table families. See [04-data-audit.md](04-data-audit.md).
- Non-authoritative migration history relative to runtime schema. See [04-data-audit.md](04-data-audit.md).
- No trustworthy CI/CD release gate. See [05-security-ops-audit.md](05-security-ops-audit.md).
- No internally consistent production deployment description across manifests and runtime assets. See [05-security-ops-audit.md](05-security-ops-audit.md).
- Public Stage00 CTA token exposure. See [02-frontend-audit.md](02-frontend-audit.md).

## Quick Wins

- Rotate the exposed Supabase service-role key and remove committed secret-bearing env files.
- Remove or proxy the Stage00 CTA bearer-token integration.
- Require auth on all user-scoped learner endpoints and delete fallback `userId` semantics.
- Make sequential lesson gating fail closed.
- Disable legacy `api/enrollment.mjs` and `api/lesson-access.mjs` from deployment.
- Freeze writes to the deprecated learner-state tables.
- Publish one `.env.example` and one canonical environment contract.
- Add one CI workflow that proves install, lint, test, and build for the chosen release artifact.

## Remediation Roadmap

### 0-3 Days

- Rotate compromised secrets and clean repo-managed env files.
- Remove the Stage00 CTA client-side credential.
- Disable legacy weak learner handlers.
- Require auth for all user-scoped enrollment and access endpoints.
- Revoke anonymous instructor/media write paths.
- Freeze deprecated learner-state writes.
- Choose one canonical release runtime and owner.

### 1-2 Weeks

- Retire the secondary learner backend and standardize one API contract.
- Reconcile migrations, generated types, and live schema into one release baseline.
- Stand up a real CI/CD gate for the chosen artifact.
- Align Docker, Vercel, runtime injection, and Kubernetes to one deployment model.
- Finish or explicitly de-scope payment.
- Standardize request validation for write endpoints and fail lesson gating closed.

### 1-2 Months

- Extract explicit backend domain boundaries for catalog, media, instructor/admin, and assessment concerns.
- Reduce route-level stage coupling with stage-owned shells.
- Remove duplicate frontend services and standardize forms/validation.
- Improve observability with structured logging, readiness checks, and centralized error monitoring.
- Finish quiz persistence cleanup and define explicit FAQ/Q&A persistence if those features remain in scope.

## Suggested Ownership By Workstream

| Workstream | Suggested owner |
| --- | --- |
| Security hardening | Security lead plus backend/platform owner |
| Backend/API consolidation | Backend lead |
| Data model and migration reconciliation | Data or Supabase owner |
| Frontend containment and stage cleanup | Frontend lead |
| CI/CD and deployment path cleanup | DevOps/platform lead |
| Release validation and signoff | QA lead / release manager |
| Scope and defer decisions | Product owner |

## Final Recommendation On Release Readiness

Recommendation: `No-go` for release in the current state.

DTMA should not move to release closure until the confirmed blocker set is closed. The minimum acceptable pre-release state is: one secured instructor write path, one canonical learner backend, one canonical learner-state model, one trustworthy schema baseline, and one reproducible deployment pipeline. The maintainability items can follow later, but the blocker set cannot.
