
# DTMA Sprint 0 Specification
## Stage02A – Learner Application Security & Access Remediation

**Owner:** Dev B  
**Sprint:** Sprint 0 (Platform Stabilization Sprint)  
**Stage:** Stage02A – Learner App  
**Objective:** Secure learner-facing APIs and ensure the learner experience continues to function correctly after platform hardening changes (RLS re-enabled, anon access removed, and backend access control enforced).

---

# 1. Background

During the DTMA architecture audit, several risks were identified in the learner application layer:

- Learner APIs trusting caller-supplied identity (`userId` in payloads)
- Legacy serverless handlers still active and bypassing the canonical backend
- Lesson access checks not consistently enforcing entitlement
- Potential reliance on relaxed database policies

Sprint 0 aims to **restore proper authentication, enforce authorization checks, and remove insecure execution paths** while ensuring learner features continue to work.

---

# 2. Scope of Work

Dev B owns **all remediation work for the learner application (Stage02A)** including:

- securing learner APIs
- enforcing authenticated identity
- removing legacy serverless handlers
- validating learner access control
- ensuring learner dashboard and lesson flows remain operational

This stage must work **only for authenticated users**.

---

# 3. Remediation Tasks

## Task B1 — Enforce Authentication on Learner APIs

### Description
All learner APIs must require authenticated users.

### Actions
- Add authentication middleware to all learner endpoints.
- Ensure requests contain a valid Supabase session or JWT.
- Reject requests that do not include valid authentication.

### Acceptance Criteria
- All learner endpoints require authentication.
- Anonymous users cannot call learner APIs.
- Unauthorized requests return HTTP 401.

---

## Task B2 — Remove Caller-Supplied Identity

### Description
The system must not trust identity values passed by the client.

### Actions
- Remove any use of `req.body.userId` or similar fields.
- Extract user identity from verified session tokens.
- Replace client-supplied identity with server-derived identity.

### Acceptance Criteria
- APIs no longer accept user identity in request payloads.
- Identity is derived from authenticated session context.
- Attempting to impersonate another user fails.

---

## Task B3 — Disable Legacy Serverless Handlers

### Description
Legacy serverless functions that bypass backend authorization must be removed.

### Actions
- Identify legacy handlers such as:
  - enrollment.mjs
  - lesson-access.mjs
- Remove or disable these handlers.
- Ensure learner operations go through the canonical backend API.

### Acceptance Criteria
- Legacy handlers are disabled or removed.
- All learner requests go through the Express backend.
- No alternative execution paths remain.

---

## Task B4 — Secure Lesson Access Gating

### Description
Learners must only access lessons they are entitled to.

### Actions
- Verify that learner entitlement checks exist before lesson access.
- Ensure lessons require valid enrollment or progress state.
- Implement fail-closed logic for access checks.

### Acceptance Criteria
- Learners cannot access lessons they are not entitled to.
- Access validation occurs before lesson content is returned.
- Any validation failure denies access.

---

## Task B5 — Validate Learner Progress Endpoints

### Description
Learner progress tracking must work correctly under new authentication constraints.

### Actions
- Review endpoints responsible for:
  - module enrollment
  - lesson progress updates
  - quiz attempts
- Ensure authenticated identity is used when storing progress.

### Acceptance Criteria
- Learner progress is recorded correctly.
- Progress endpoints use authenticated user identity.
- Progress updates cannot be forged by clients.

---

# 4. Validation Tests

The following tests must pass before closing the remediation tasks.

## Learner Login

Test:

User logs into the platform.

Expected Result:
- Valid session token generated
- Session attached to API calls

---

## Learner Dashboard

Test:

Authenticated user opens learner dashboard.

Expected Result:
- Dashboard loads successfully
- Data corresponds to authenticated learner

---

## Lesson Access

Test:

Learner opens a lesson they are enrolled in.

Expected Result:
- Lesson loads successfully

Test:

Learner attempts to access a lesson they are not enrolled in.

Expected Result:
- Access denied

---

## Progress Tracking

Test:

Learner completes a lesson or quiz.

Expected Result:
- Progress is recorded under authenticated user identity

---

# 5. Deliverables

Dev B must provide:

- Updated learner API endpoints
- Removal of insecure identity handling
- Disabled legacy serverless handlers
- Verified lesson access control
- Evidence of successful validation tests

---

# 6. Definition of Done

Stage02A remediation is complete when:

- All learner APIs require authentication
- Identity is derived from authenticated session tokens
- Legacy serverless handlers are removed
- Lesson access is properly gated
- Learner flows function correctly under hardened security conditions

---

# 7. Risks

Potential risks include:

- hidden dependencies on legacy handlers
- frontend components expecting insecure API behavior
- incomplete access validation logic

Mitigation: run full learner flow tests after each change.

---

# 8. Estimated Effort

| Task | Effort |
|-----|------|
Auth enforcement | 0.5 day |
Identity refactor | 0.5 day |
Legacy handler removal | 0.5 day |
Lesson access validation | 0.5 day |
Progress endpoint verification | 0.5 day |

Total estimated effort: **~2.5 days**

---

# 9. Reporting

Dev B should report progress in standups using:

```
Stage02A status
- API authentication: done/in progress
- Identity refactor: done/in progress
- Legacy handlers removed: done/in progress
- Lesson access checks: done/in progress
- Progress tracking validation: done/in progress
```

---

End of specification.
