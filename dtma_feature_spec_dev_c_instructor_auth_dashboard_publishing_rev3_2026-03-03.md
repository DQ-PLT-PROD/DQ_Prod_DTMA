# DTMA Feature Specification (Rev 3)
## Dev C — Admin Auth Integration, Dashboard & Publishing (TxM)

**Feature Owner:** Dev C  
**Original Milestone:** MVP 1.0 (2026-01-29)  
**Revision Date:** 2026-03-03  
**Priority:** P1 (Critical Path for Admin Surface)

---

## 1. Purpose & Outcome

This feature delivers a secure admin experience that enables authorized staff to:
- Access protected admin routes
- View and manage courses by status (Draft vs Published)
- Use an overview dashboard with actionable status tiles and recent activity
- Create/edit course metadata, thumbnails, lesson media, and URL resources
- Publish/unpublish courses and quizzes
- Operate under enforced RBAC and RLS controls

### Success Definition
An authorized instructor/admin can sign in, access protected admin routes, use the Admin Portal to manage draft and published content, and publish courses that appear in learner catalog surfaces, with access enforced by DB-backed memberships and RLS.

---

## 2. Scope Boundaries (Strict)

### In Scope
- Instructor/admin role identification and RBAC enforcement
- Protected admin routes
- Admin Portal overview dashboard:
  - Metrics tiles with only production-ready metrics
  - `Active Students` shown as `Coming Soon` until learner activity attribution is available
  - Recent activity showing pending drafts/publication work and last resumable admin actions
- Admin Portal chrome/copy update from `Instructor Portal` to `Admin Portal`
- Course management workspace tabs:
  - `Classifications` shown as a coming-soon page, matching the Learning Paths placeholder pattern
  - `Courses`
  - `Modules`
  - `Lessons`
  - `Quizzes`
- Course publishing/content page:
  - Create/edit title, description, thumbnail
  - Replace course thumbnail
  - Set lesson video from Media Library or local file upload
  - Replace lesson video
  - Attach resources as URLs (PDF links, external links)
  - Save draft
  - Publish/unpublish courses and quizzes
- Supabase Auth for instructor/admin surface (`/instructor/*`)
- `/admin/login` and `/admin/logout` flow
- DB-backed authorization source (`admin_memberships`)
- CASL ability checks for admin-surface actions
- RLS policy hardening for admin-managed content tables
- Storage policy hardening for instructor content bucket(s)
- Removal of insecure browser-side service-role patterns
- Rollback script and staged rollout expectations

### Explicitly Out of Scope (Deferred)
- Net-new transcoding or binary media processing pipelines
- Automated learner-level activity analytics and "who is taking the course" reporting
- Full audit/event warehouse beyond the recent activity needs defined in this spec
- Moderation workflow
- Version history UI
- Rich course builder (chapters, quizzes, assessments)
- Multi-instructor collaboration
- Revenue/payout logic

> Guardrail: If it requires learner-level activity attribution, media transcoding, moderation queues, or payout logic, it is out of scope.

---

## 3. Core Concepts & Contracts

### 3.1 Roles
Minimum roles:
- `learner`
- `viewer`
- `editor`
- `instructor`
- `admin`

Role source of truth:
- `public.admin_memberships` (not localStorage toggles)

### 3.2 Course Status Lifecycle
Course status values:
- `draft`
- `published`
- (optional) `archived`

Publishing rules:
- Only authorized instructor roles can publish
- Published courses appear in learner-facing discovery/catalog

### 3.3 Instructor Ownership
Each course has `owner_user_id` (Entra object id) for ownership filtering.

### 3.4 Admin Portal Naming
- The authenticated admin surface must use the product label `Admin Portal`
- Existing route namespaces may remain `/instructor/*` during transition, but user-facing copy must not say `Instructor Portal`

### 3.5 Recent Activity Contract
- Recent activity should prioritize resumable work:
  - drafts pending publication
  - last edited course/module/lesson/quiz
  - last publish/unpublish-related action
- MVP implementation may derive activity from existing `updated_at`, `status`, and `updated_by` fields where available
- A dedicated audit log table is optional, not required for this revision

---

## 4. Data Model

> Extend existing schema minimally; avoid broad redesign.

### 4.1 Table: `courses` (required)
| Field | Type | Notes |
|------|-----|------|
| id | text/uuid (PK) | existing type |
| owner_user_id | text | Entra object id |
| title | text | required |
| description | text | required |
| status | text | `draft` / `published` |
| thumbnail_url | text | optional |
| video_url | text | optional (URL only) |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

Indexes:
- `(owner_user_id, status)`

### 4.2 Table: `course_resources` (URL attachments)
| Field | Type | Notes |
|------|-----|------|
| id | uuid (PK) | |
| course_id | text/uuid | FK to courses |
| title | text | required |
| url | text | required |
| type | text | optional (`pdf`, `link`, etc.) |
| created_at | timestamptz | |

Constraints:
- index `(course_id)`

### 4.3 Table: `public.admin_memberships` (new authz source)
| Field | Type | Notes |
|------|-----|------|
| id | uuid (PK) | |
| user_id | uuid | FK to `auth.users.id` |
| role | text | `admin` / `instructor` / `editor` / `viewer` |
| status | text | `active` / `inactive` |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

Constraints/Indexes:
- Enforce one active membership per user
- Indexes on `(user_id)`, `(role)`, `(status)`

### 4.4 Existing Content Tables (extend as needed)
Minimum content fields needed for this revision:
- `lessons`
  - `video_url` or equivalent uploaded asset URL/reference
  - `updated_at`
  - `updated_by` (recommended if available for recent activity)
- `modules`
  - `updated_at`
  - `updated_by` (recommended if available for recent activity)
- `quizzes`
  - `status` or equivalent publish state
  - `updated_at`
  - `updated_by` (recommended if available for recent activity)

Implementation note:
- Reuse existing media library/storage tables if present; do not introduce a new upload architecture unless required by the current codebase

---

## 5. Security & Authorization

### 5.1 Route Protection
Admin routes must be protected (currently under the `/instructor/*` namespace):
- Not authenticated (admin surface) → redirect `/admin/login`
- Authenticated but no active membership → deny access (redirect or 403)
- Learner routes remain on existing learner auth flow

### 5.2 Data Access Rules
- Instructor/admin members can CRUD only within allowed RBAC permissions
- Learners read only `published` learner content
- CASL required for frontend action-level checks
- Backend/RLS is final enforcement; UI checks are not sufficient alone

### 5.3 RLS Policy Rules
- Enable RLS on admin-managed content tables (`courses`, `lessons`, `modules`, `course_categories`, related content tables as applicable)
- Policies must validate active membership via `auth.uid()` + `admin_memberships`
- Role-sensitive policy expectations:
  - `viewer`: read-only
  - `editor`: update content, no destructive delete
  - `instructor`/`admin`: full CRUD (within defined policy boundaries)

### 5.4 Storage Policies
- Public read where intended
- Write/delete only for active authorized admin memberships

### 5.5 Key Handling
- Service role key is server-only
- No browser runtime dependency on service-role credentials

---

## 6. Functional Requirements

### FR-1: Admin Auth Integration (RBAC)
- Resolve membership role for logged-in admin surface user
- Expose resolved role/ability for authorization checks
- No role decisions from localStorage switches

Acceptance:
- Admin routes are unreachable by unauthorized users

### FR-2: Protected Admin Routes
Required routes/pages:
- `/instructor`
- `/instructor/courses/new`
- `/instructor/courses/:id/edit`
- `/instructor/courses/:id/preview` (optional)
- `/admin/login`
- `/admin/logout` (or equivalent action)

Acceptance:
- Non-members cannot access via direct URL

### FR-3: Admin Portal Overview Dashboard
Dashboard must show:
- Drafts and Published sections/tabs
- Courses owned by the logged-in admin/instructor membership
- Quick actions: Edit, Publish, Unpublish (Preview optional)
- Metrics tiles with only validated metrics
- `Active Students` rendered as `Coming Soon`, matching the non-actionable state already used for `Completion Rate`

Acceptance:
- Dashboard reflects only permitted courses/actions
- No active student count is shown until reliable learner activity tracking exists

### FR-3A: Recent Activity Panel
Recent activity must show actionable admin work, not just passive timestamps.

Required behaviors:
- Prioritize content that is saved as draft and pending publication
- Show the last meaningful admin action on a course/module/lesson/quiz
- Provide a clear continuation path back into the relevant edit flow
- Support a useful fallback empty state when no recent work exists

Acceptance:
- An admin can identify what they were last working on and continue from the activity feed
- Drafts pending publication are surfaced ahead of low-signal events

### FR-3B: Admin Portal Branding
- The top-left product label and related admin-surface copy must say `Admin Portal`
- Remove or replace remaining `Instructor Portal` labels in the authenticated admin shell

Acceptance:
- No visible admin-shell label says `Instructor Portal`

### FR-4: Publishing Page (Metadata + Resources)
Instructor can:
- Create draft
- Edit title, description, thumbnail_url
- Add/remove URL resources
- Save draft
- Publish/unpublish

Publishing validations:
- title required
- description required

Acceptance:
- Publish blocked until required fields present

### FR-4A: Course Management Tabs
Required tab order in course management:
- `Classifications`
- `Courses`
- `Modules`
- `Lessons`
- `Quizzes`

Tab-specific requirements:
- `Classifications`
  - Render a `Coming Soon` placeholder page matching the existing Learning Paths pattern
- `Courses`
  - Remove the redundant secondary `Add new` button
  - Label the image field explicitly as `Thumbnail`
  - Provide a functional `Replace Thumbnail` action
- `Modules`
  - Render before `Lessons`
  - Remove the redundant secondary `Add new` button
- `Lessons`
  - Remove the redundant secondary `Add new` button
  - Support lesson video selection from Media Library or local file upload
  - Provide a functional `Replace Lesson Video` action
  - URL-only input is not sufficient for done criteria
- `Quizzes`
  - Quiz publish/unpublish wiring must function
  - Remove the content browser view
  - Retain only the flat list view

Acceptance:
- The tab order matches the required sequence
- Each tab exposes only the expected primary creation CTA
- Thumbnail and lesson video replacement flows are functional
- Quiz publishing works from the flat list view

### FR-5: CASL Enforcement
- Implement ability matrix by role
- Hide/disable unauthorized actions
- Protect handlers against direct invocation

Acceptance:
- Unauthorized action attempts are blocked in UI and backend

### FR-6: Secure Instructor Mutations
- Instructor writes use authenticated client flow
- No browser-side override of RLS/service-role behavior

Acceptance:
- Unauthorized direct writes fail

### FR-7: Mixed Auth Route Split (if backend APIs are used)
- Admin endpoints validate Supabase JWT
- Learner endpoints validate Azure JWT (existing flow)

Acceptance:
- Correct token type enforced per route domain

### FR-8: Rollback and Cutover
- Maintain rollback SQL/script for authz policy changes
- Deploy to non-prod first
- Use feature flag for guard cutover where applicable

Acceptance:
- Reversible rollout with monitored cutover

---

## 7. Service Layer (Required)

Implement/extend `instructorCourseService.ts` (or equivalent):
```ts
listMyCourses({ status? })
getCourseForEdit(courseId)
createCourseDraft(payload)
updateCourse(courseId, payload)
publishCourse(courseId)
unpublishCourse(courseId)
listCourseResources(courseId)
addCourseResource(courseId, resource)
removeCourseResource(resourceId)
listDashboardSummary()
listRecentAdminActivity()
replaceCourseThumbnail(courseId, fileOrAsset)
attachLessonVideo(lessonId, source)
replaceLessonVideo(lessonId, source)
publishQuiz(quizId)
unpublishQuiz(quizId)
```

Auth/RBAC layer requirements:
```ts
useAdminAuth() // session, user, loading, signIn, signOut, refresh
buildAdminAbility(role, membership)
```

Rules:
- UI must not directly bypass service/security layer
- Service handles authorization checks and safe errors
- Recent activity may be composed from existing content timestamps/statuses for MVP; do not block delivery on a full audit subsystem

---

## 8. Learner Catalog Integration Contract

Expose:
- `listPublishedCourses()`
- Includes at minimum: `id`, `title`, `description`, `thumbnail_url`, `video_url?`

Acceptance:
- Published appears in catalog
- Draft does not

---

## 9. UI / UX Requirements

- Reuse existing templates/components
- No mandatory redesign
- Use `Admin Portal` in the authenticated admin shell
- Required states:
  - Loading skeleton
  - Empty drafts
  - Empty published
  - Empty recent activity
  - Save/publish success feedback
  - Validation errors inline
  - Unauthorized/forbidden state for blocked access
  - Admin login error states
- Dashboard tile rules:
  - `Active Students` is visually present but disabled/non-numeric as `Coming Soon`
  - Do not show placeholder/fabricated student activity counts
- Recent activity rules:
  - Prefer drafts pending publication and resumable edit actions
  - Each row should expose enough context to understand the last admin action
- Course management rules:
  - Remove duplicate secondary `Add new` CTAs from `Courses`, `Modules`, and `Lessons`
  - `Modules` tab must appear before `Lessons`
  - `Courses` media field copy must clearly refer to a thumbnail
  - `Lessons` media UI must support Media Library selection and local upload
  - `Quizzes` uses flat list only; no content browser panel

---

## 10. Acceptance Criteria (Definition of Done)

- Unauthorized users cannot access `/instructor/*`
- Authorized instructor/admin can manage own courses
- Admin shell label says `Admin Portal`
- Draft create/edit/save works
- Publish/unpublish works
- Published appears in learner discovery; draft does not
- URL resources attach/remove correctly
- `Active Students` tile is shown as `Coming Soon`
- Recent activity shows resumable admin work, including drafts pending publication
- `Classifications` tab is a coming-soon placeholder
- `Modules` appears before `Lessons`
- Duplicate secondary `Add new` buttons are removed from `Courses`, `Modules`, and `Lessons`
- Course thumbnail labeling and replacement work
- Lesson video can be selected from Media Library or uploaded locally, and replaced later
- Quiz publish/unpublish works from the flat list view
- Quiz content browser is removed
- RBAC role permissions are enforced
- RLS enforced on admin-managed content tables
- No browser service-role dependency
- Critical errors handled gracefully (no blank screens)

---

## 11. Testing Checklist

Manual:
- Learner account blocked from instructor routes
- Authorized admin/instructor can access dashboard
- Admin shell shows `Admin Portal`
- Create draft → appears under Drafts
- Publish → moves to Published
- Unpublish → returns to Drafts
- Published visible in learner catalog
- Resource URL add/remove works
- `Active Students` tile shows `Coming Soon` with no numeric value
- Recent activity surfaces the most recently edited draft/pending publication item
- `Classifications` tab renders a coming-soon placeholder
- `Courses` tab has no redundant secondary `Add new` button
- Course image field is labeled `Thumbnail`
- `Replace Thumbnail` updates the existing course thumbnail
- `Modules` tab appears before `Lessons`
- `Lessons` tab has no redundant secondary `Add new` button
- Lesson video can be added from Media Library
- Lesson video can be added from a local file
- `Replace Lesson Video` updates the existing lesson video
- `Quizzes` shows only the flat list view
- Quiz publish/unpublish works end-to-end
- Unauthorized role action (e.g., viewer publish/delete) blocked
- Admin login/logout flow works
- No admin identity bleed into learner header/session views

Integration/Security:
- Unauthenticated `/instructor/*` redirects to `/admin/login`
- Authenticated non-member denied
- Unauthorized writes denied by RLS
- Storage write/delete denied for unauthorized users

---

## 12. Explicit Non-Goals

Do not implement in this feature:
- Payments/subscriptions
- Learner dashboard/progress systems
- Binary upload/transcoding pipelines
- AI capabilities
- Moderation queue systems

---

## 13. Completion Statement

**This feature is done when:**
> Authorized instructor/admin users can securely use the Admin Portal to manage draft and published courses, lessons, modules, and quizzes, with resumable recent activity, correct publishing behavior, and enforced RBAC/RLS controls.
