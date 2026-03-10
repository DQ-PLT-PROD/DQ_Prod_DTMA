# DTMA Remediation Backlog

Date: 2026-03-06

Source inputs:
- [06-recommendations.md](06-recommendations.md)
- [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)

## Purpose

This backlog converts the consolidated audit recommendations into execution-ready remediation work. It is organized for sprint planning, prioritizes confirmed release blockers first, and groups tasks under Frontend, Backend, Data, and Security/DevOps.

## Prioritization Basis

- `Pre-release` items are required to close confirmed blockers or high-risk pre-release issues from [06-recommendations.md](06-recommendations.md).
- `Post-release` items reduce structural drag and future defect risk, but do not need to block release once the blocker set is closed.
- Dependencies are expressed as backlog IDs to support sequencing and parallel execution.

## Phased Remediation Plan

| Phase | Timing | Objective | Target backlog items |
| --- | --- | --- | --- |
| Phase 0 | 0-3 days | Contain active security exposure and stop further data divergence. | `SD-01`, `SD-02`, `SD-04`, `FE-01`, `BE-01`, `BE-03`, `DATA-01` |
| Phase 1 | 1-2 weeks | Establish one release baseline: one backend, one schema contract, one deploy path. | `FE-02`, `FE-03`, `BE-02`, `BE-04`, `BE-05`, `DATA-02`, `DATA-03`, `DATA-04`, `SD-03`, `SD-05`, `SD-06` |
| Phase 2 | 1-2 months | Reduce structural coupling and improve long-term operability. | `FE-04`, `FE-05`, `BE-06`, `DATA-05`, `SD-07` |

## Frontend Backlog

| ID | Title | Description | Rationale | Dependencies | Effort | Owner Suggestion | Release Timing | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `FE-01` | Remove Stage00 client-side credential flow | Replace the landing CTA integration with a server-owned submission path or disable the integration until a secure proxy exists. Remove the hardcoded bearer token from shipped browser code. | The public landing experience currently exposes a live credential and should not ship in that state. | `SD-01` if the external credential is rotated first; otherwise none if the flow is disabled. | Small | Frontend lead with backend support | Pre-release | Phase 0 |
| `FE-02` | Converge learner access flows on the canonical API contract | Replace direct frontend enrollment and lesson-access calls in learner flows with the chosen canonical API path. Stop adding new direct Supabase access for these domains. | The frontend currently supports multiple contracts for the same learner workflows, which increases drift and test risk. | `BE-02`, `BE-04` | Large | Frontend lead | Pre-release | Phase 1 |
| `FE-03` | Consolidate duplicated user and learner-profile services | Collapse duplicate frontend user sync and learner-profile modules to one canonical implementation and publish the intended import path. | Duplicate services already model the same data differently, which increases regression risk around auth, onboarding, and profile changes. | `BE-02`, `DATA-02` | Medium | Frontend lead | Pre-release | Phase 1 |
| `FE-04` | Clarify stage ownership in routing and shells | Decide whether `/dashboard/*` remains supported, then introduce clearer stage-owned shells for Stage00, Stage01, Stage02A, and Stage02B. Keep shared UI limited to true primitives. | Route-level stage separation is weak and currently allows navigation and shell behavior to bleed across stages. | Product scope decision, `FE-03` | Large | Frontend lead plus product owner | Post-release | Phase 2 |
| `FE-05` | Standardize frontend form, validation, and shared primitive patterns | Define one form pattern, one validation approach, and one small set of shared primitives for new work. Retire duplicate button and toast patterns opportunistically. | Ad hoc forms and overloaded shared components slow delivery and increase inconsistency across stages. | `FE-03` | Medium | Frontend lead | Post-release | Phase 2 |

## Backend Backlog

| ID | Title | Description | Rationale | Dependencies | Effort | Owner Suggestion | Release Timing | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `BE-01` | Enforce auth on all user-scoped learner endpoints | Remove caller-supplied `userId` fallbacks from enrollment and access endpoints. Require authenticated identity for all user-specific reads and mutations. | Current learner APIs trust unauthenticated identity input, which is a confirmed release blocker. | None | Small | Backend lead | Pre-release | Phase 0 |
| `BE-02` | Choose the canonical learner backend and retire the secondary surface | Select the one backend runtime that owns learner APIs, then remove or hard-disable the overlapping implementation from release ownership. | DTMA currently has incompatible learner API surfaces and cannot safely ship both. | `SD-04` | Large | Backend lead plus platform owner | Pre-release | Phase 1 |
| `BE-03` | Remove legacy serverless learner handlers from deployment | Disable `api/enrollment.mjs` and `api/lesson-access.mjs` from active deployment routing once the canonical backend path is confirmed. | These handlers use weaker auth and CORS patterns and widen the production attack surface. | `SD-04`, `BE-01` | Small | Backend lead | Pre-release | Phase 0 |
| `BE-04` | Make lesson gating fail closed and standardize endpoint validation | Change sequential lesson access checks to fail closed on verification errors and apply schema-based validation to write endpoints on the canonical backend. | The current behavior can grant access on backend error and relies on manual validation. | `BE-02` | Medium | Backend lead | Pre-release | Phase 1 |
| `BE-05` | Decide payment release scope and implement the chosen path | Either remove payment from release scope and routes or finish the backend flow: checkout creation, webhook verification, enrollment mutation, and operational handling. | Payment is currently a stub and cannot be treated as production-ready without an explicit decision. | Product scope decision, `BE-02`, `DATA-02` | Medium | Backend lead plus product owner | Pre-release | Phase 1 |
| `BE-06` | Extract domain services for catalog, admin/media, and assessment concerns | Create explicit backend service boundaries for catalog, instructor/admin, media, quiz, and future FAQ/Q&A domains after the learner baseline is stabilized. | Missing domain boundaries currently push logic into routes and the frontend, limiting extensibility. | `BE-02`, `DATA-05` | Large | Backend lead | Post-release | Phase 2 |

## Data Backlog

| ID | Title | Description | Rationale | Dependencies | Effort | Owner Suggestion | Release Timing | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `DATA-01` | Freeze deprecated learner-state writes and declare the canonical table family | Choose the authoritative learner-state model for enrollment, progress, and saved items, then stop new writes to the deprecated tables. | Learner state is actively split across old and new table families, which is a confirmed release blocker. | `SD-04`, `BE-02` if the team chooses the canonical learner model through that decision; otherwise can start with an interim documented freeze. | Small | Data/Supabase owner with backend lead | Pre-release | Phase 0 |
| `DATA-02` | Reconcile migrations, generated types, and live schema into one release baseline | Produce one authoritative schema baseline, regenerate Supabase types from it, and remove query paths that rely on drift or `as any` workarounds. | The current migration history cannot be trusted to recreate the runtime schema, which blocks reliable release promotion. | `DATA-01` | Large | Data/Supabase owner | Pre-release | Phase 1 |
| `DATA-03` | Backfill learner-state data into the canonical model and validate integrity | Migrate legacy learner rows into the chosen model, validate counts and access behavior, and define rollback handling before release. | Freezing writes is not enough; existing learner continuity must survive the model transition. | `DATA-01`, `DATA-02`, `BE-02` | Large | Data/Supabase owner with backend lead | Pre-release | Phase 1 |
| `DATA-04` | Normalize migration history and absorb required standalone SQL into the canonical path | Remove placeholder or collision-prone migration patterns and move required schema-changing scripts into an ordered, reproducible migration stream. | Environment rebuilds and incident recovery remain unreliable while schema changes come from multiple paths. | `DATA-02` | Medium | Data/Supabase owner | Pre-release | Phase 1 |
| `DATA-05` | Close post-release persistence gaps and auditability standards | Finish quiz model cleanup, define persistence ownership for FAQ/Q&A if in scope, clarify media ownership, and add minimum audit fields for mutable operational tables. | These are important for extensibility and traceability, but can follow release once the core blocker set is closed. | Product scope decision, `DATA-02`, `BE-06` | Large | Data/Supabase owner | Post-release | Phase 2 |

## Security / DevOps Backlog

| ID | Title | Description | Rationale | Dependencies | Effort | Owner Suggestion | Release Timing | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `SD-01` | Rotate leaked secrets and remove committed secret-bearing env files | Rotate the exposed Supabase service-role credential and any related secrets, remove committed `.env*` secrets from version control, and confirm deployment-managed secret storage is used instead. | The repository currently contains privileged secret material and hardcoded production-style configuration. | None | Small | Security lead plus platform owner | Pre-release | Phase 0 |
| `SD-02` | Restore enforceable write protection for instructor-managed data and storage | Re-enable strict RLS or trusted-backend-only writes for `courses`, `modules`, `lessons`, and instructor media buckets. Remove anonymous write/delete policies. | Instructor content protection is currently dependent on client behavior and is a confirmed release blocker. | `SD-01` if rotated credentials are required during the change; otherwise none | Large | Security lead plus data/Supabase owner | Pre-release | Phase 0 |
| `SD-03` | Publish one environment contract and remove hardcoded runtime defaults | Create a non-secret `.env.example`, align variable names across Vite, backend parsing, runtime injection, and manifests, and remove hardcoded production defaults from code. | Environment drift currently exists across repo env files, runtime templates, and deployment manifests. | `SD-01`, `SD-04` | Medium | DevOps/platform lead | Pre-release | Phase 1 |
| `SD-04` | Select the canonical production runtime, release artifact, and owner | Decide whether production is owned by Vercel, container runtime, or Kubernetes, then document the release artifact, runtime topology, and owning team. | Many remediation tasks depend on one declared production target rather than several competing ones. | None | Small | Platform owner plus engineering leadership | Pre-release | Phase 0 |
| `SD-05` | Implement a real CI/CD release gate for the chosen artifact | Build one authoritative pipeline that installs dependencies, runs lint/tests/build for the chosen artifact, and blocks release when it fails. | DTMA currently lacks a trustworthy automated release gate. | `SD-04`, `SD-03` | Medium | DevOps/platform lead | Pre-release | Phase 1 |
| `SD-06` | Reconcile deployment assets to the chosen runtime model | Remove or archive unused deployment paths and fix the remaining manifests, service names, namespaces, ingress references, and runtime assumptions so they describe one coherent production deployment. | The current deployment assets conflict with each other and include broken Kubernetes wiring. | `SD-04`, `SD-03` | Large | DevOps/platform lead | Pre-release | Phase 1 |
| `SD-07` | Add readiness checks, structured logging, and centralized error monitoring | Implement dependency-aware readiness, structured logs with request correlation, and one production error-monitoring path for the canonical runtime. | Operational visibility is currently too shallow for reliable incident response. | `SD-05`, `SD-06` | Medium | DevOps/platform lead with backend lead | Post-release | Phase 2 |

## Sprint Execution Guidance

### Sprint 0: Immediate Containment

Goal:
- Eliminate active credential exposure.
- Close the known unauthorized write and user-targeting paths.
- Stop further learner-state divergence.
- Decide the canonical production target so the rest of the work can converge.

Recommended sprint scope:
- `SD-01`, `SD-02`, `SD-04`
- `FE-01`
- `BE-01`, `BE-03`
- `DATA-01`

Exit criteria:
- No client-shipped CTA credential remains.
- No public learner endpoint accepts caller-supplied identity.
- Legacy weak learner handlers are off the active deploy surface.
- Anonymous instructor/media writes are no longer possible.
- One production runtime and one learner baseline owner are documented.

### Sprint 1: Release Baseline

Goal:
- Converge on one backend, one schema baseline, and one deployable artifact.

Recommended sprint scope:
- `BE-02`, `BE-04`, `BE-05`
- `FE-02`, `FE-03`
- `DATA-02`, `DATA-03`, `DATA-04`
- `SD-03`, `SD-05`, `SD-06`

Exit criteria:
- One learner backend owns production traffic.
- Migrations, generated types, and runtime schema agree on the release baseline.
- CI/CD proves the chosen artifact from clean checkout to deployable output.
- Deployment manifests and runtime assets are internally consistent.

### Sprint 2+: Structural Hardening

Goal:
- Reduce coupling that would otherwise recreate the same release risks after launch.

Recommended sprint scope:
- `FE-04`, `FE-05`
- `BE-06`
- `DATA-05`
- `SD-07`

Exit criteria:
- Stage ownership is clearer at the frontend.
- Backend domains are explicit beyond learner flows.
- Data models for quiz, media, and future content concerns are easier to extend.
- Production observability is good enough for ongoing operations.

## Recommended Sequencing Notes

- `SD-04` should be completed first. Without a canonical production runtime, the backend, data, and deployment tasks can drift again.
- `BE-01`, `SD-01`, `SD-02`, and `FE-01` are the fastest blocker-reduction items and should start immediately in parallel.
- `DATA-01` should begin in the same window as backend consolidation planning so no new learner-state split is introduced during remediation.
- `BE-02`, `DATA-02`, and `SD-06` should be treated as one coordinated release-baseline track, not independent backlog items.
- `BE-05` should not remain undecided late into Sprint 1. Payment must either be explicitly out of scope or fully owned by the canonical backend before release.
