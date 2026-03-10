# DTMA Data Architecture Audit

## Executive Summary
DTMA's data layer is centered on Supabase/Postgres, but the checked-in schema is not operating as one clean, authoritative model. The most serious issue is that learner state now exists in parallel course-based and module-based table families, and both are still actively queried by different runtime surfaces. That creates real risk of split enrollments, split progress, and inconsistent learner access outcomes.

A second major issue is schema drift. The repo contains a migration history, generated Supabase types, seed data, and active query code that do not fully agree on the same table contracts. The `modules` table is the clearest example: checked-in migrations define one shape, generated types define a wider shape, and active frontend code queries columns that are not introduced by the visible migration chain.

Highest-risk findings:

- learner state is split across legacy course-level and newer module-level persistence models
- the checked-in migration chain is not a reliable reconstruction of the runtime schema contract
- migration ordering is collision-prone and partially bypassed by standalone SQL scripts
- core entities mix slugs, text keys, UUID foreign keys, and denormalized text references inconsistently
- quiz persistence is mid-refactor, with legacy and normalized shapes both still present

## Current Data Model Overview
### Primary persistence surfaces
Confirmed persistence sources in the repo:

- `supabase/migrations/`
- `supabase/scripts/`
- `supabase/seed.sql`
- `setup-azure-user.sql`
- generated client schema types in `src/lib/supabase/types.ts`

### High-level entity map
```text
Identity / learner profile
public.users
|- user_business_profiles
|- user_sessions
|- subscriptions
|- admin_memberships
|- user_xp
|- user_badges        (legacy)
`- earned_badges      (newer badge model)

Catalog / learning content
public.course_categories
public.industries
public.audience_levels
public.difficulty_levels
public.courses
|- lessons
|- modules
|  |- lessons (via lessons.module_id)
|  |- quizzes (via quizzes.module_id)
|  |- module_enrollments
|  |  `- module_lesson_progress
|  |- saved_modules
|  `- module_quiz_attempts
|- quizzes            (legacy course-bound root)
|- course_resources
`- related_courses

Legacy learner state still present
public.user_enrollments
`- lesson_progress

Additional learner-state table
public.learner_lesson_progress

Media / storage
public.media_items
public.media_assets
storage.objects policies for:
|- lms-content
`- course-content
```

### Core table families observed
Catalog and content:

- `public.courses` in `supabase/migrations/initial_schema.sql:49-79`
- `public.lessons` in `supabase/migrations/002_add_lessons_table.sql:5-19`
- `public.quizzes` in `supabase/migrations/003_add_quizzes_table.sql:5-17`
- `public.course_resources` in `supabase/migrations/004_add_course_resources_table.sql:5-17`
- `public.course_categories`, `public.industries`, `public.audience_levels`, `public.difficulty_levels` in `supabase/migrations/007_add_filter_lookup_tables.sql:7-143`
- `public.modules` in `supabase/migrations/029_add_modules_table.sql:11-25`

Learner identity and profile:

- `public.users` in `supabase/scripts/supabase_auth_setup.sql:14-29`
- learner profile enrichment in `supabase/migrations/043_add_learner_profile_fields.sql:6-24` and `supabase/migrations/045_add_profile_enrichment_fields.sql:5-72`

Legacy learner state:

- `public.user_enrollments` and `public.lesson_progress` in `supabase/migrations/027_add_progress_tracking_tables.sql:8-120`
- `public.saved_courses` in `supabase/migrations/049_add_saved_courses_table.sql:4-15`
- `public.quiz_attempts`, `public.user_xp`, and `public.user_badges` in `supabase/migrations/044_add_quiz_xp_badges.sql:7-53`

Newer module-level learner state:

- `public.module_enrollments`, `public.module_lesson_progress`, `public.saved_modules`, and `public.module_quiz_attempts` in `supabase/migrations/20260304170000_module_learner_refactor.sql:49-130`

Other operational data:

- `public.subscriptions` in `supabase/migrations/029_add_subscriptions_table.sql:9-129`
- `public.badges` and `public.earned_badges` in `supabase/migrations/049_add_badges_catalog.sql:7-108`
- `public.admin_memberships` in `supabase/migrations/049_admin_auth_rbac.sql:10-90`
- `public.media_items` and `public.media_assets` in `supabase/migrations/initial_schema.sql:7-44` and `supabase/migrations/initial_schema.sql:87-125`

### Concepts not found as first-class persisted domains
No dedicated FAQ or Q&A persistence model was found in the audited schema. A repo search across `src`, `api`, `..\DTMA-API\src`, `supabase/migrations`, and `supabase/scripts` did not return FAQ/Q&A tables or migrations; the only match was a prose string inside seeded course copy at `supabase/migrations/010_seed_coming_soon_courses.sql:579`.

## Entity / Relationship Assessment
### What aligns reasonably well
Some foundational relationships are explicit and useful:

- `lessons.course_slug -> courses.slug` in `supabase/migrations/002_add_lessons_table.sql:17-18`
- `course_resources.course_slug -> courses.slug` in `supabase/migrations/004_add_course_resources_table.sql:15-16`
- `modules.course_slug -> courses.slug` in `supabase/migrations/029_add_modules_table.sql:22-24`
- `quizzes.module_id -> modules.id` and `quizzes.lesson_id -> lessons.id` in `supabase/migrations/048_add_quiz_hierarchy_binding.sql:6-23`
- `module_enrollments.module_id -> modules.id` and `module_lesson_progress.enrollment_id -> module_enrollments.id` in `supabase/migrations/20260304170000_module_learner_refactor.sql:49-94`

### Confirmed boundary weaknesses
The model does not describe one stable learner domain. It currently contains:

- course-level enrollment and progress: `user_enrollments`, `lesson_progress`, `saved_courses`
- module-level enrollment and progress: `module_enrollments`, `module_lesson_progress`, `saved_modules`, `module_quiz_attempts`
- a third lesson-progress table with text keys: `learner_lesson_progress`

That is not just historical residue in the schema. Active code still reads and writes both models:

- course-based runtime queries: `..\DTMA-API\src\routes\enrollment.ts:44-50`, `..\DTMA-API\src\routes\savedCourses.ts:27-31`, `..\DTMA-API\src\middleware\lessonAccess.ts:83-89`, `..\DTMA-API\src\middleware\lessonAccess.ts:160-164`
- module-based runtime queries: `src/lib/enrollment/service.ts:82-87`, `src/lib/enrollment/service.ts:293-297`, `src/services/savedCoursesService.ts:44-47`, `src/lib/enrollment/service.ts:374-378`, `api/middleware/lessonAccess.mjs:175-180`

### Relationship consistency concerns
The schema mixes several identity strategies:

- `courses.category_id` starts as plain `TEXT` in `supabase/migrations/initial_schema.sql:52`
- later it is constrained to `course_categories.slug`, not `course_categories.id`, in `supabase/migrations/021_add_category_foreign_key.sql:44-49`
- `007_add_filter_lookup_tables.sql:34-44` creates `industries.id UUID`, but `courses` receives a plain `industry TEXT` column in `supabase/migrations/007_add_filter_lookup_tables.sql:131-142`
- `learner_lesson_progress` stores `user_id`, `course_id`, and `lesson_id` as `TEXT` rather than UUID/FK columns in `supabase/migrations/039_add_learner_lesson_progress.sql:5-20`
- generated client types describe `modules.course_id` and `modules.status` in `src/lib/supabase/types.ts:301-341`, while the visible `modules` migration family does not clearly introduce those columns

The result is a model where some relationships are normalized, some are slug-bound, some are free-text, and some appear to exist only in the live database contract rather than in the repo migration chain.

## Migration Health Assessment
### Confirmed positives
The repo does contain a meaningful migration history and several migrations are idempotent via `IF NOT EXISTS`, `DROP POLICY IF EXISTS`, or guarded `DO $$ ... $$` blocks.

### Confirmed migration-health problems
The checked-in migration set is not cleanly ordered:

- duplicate numeric prefixes exist for multiple versions, including `024_*`, `026_*`, `028_*`, `029_*`, `039_*`, `040_*`, `041_*`, `044_*`, `045_*`, `047_*`, `048_*`, `049_*`, and `050_*`
- a placeholder migration exists at `supabase/migrations/026_placeholder.sql`
- the repo mixes sequential numeric filenames and timestamped filenames such as `supabase/migrations/20260304170000_module_learner_refactor.sql`

The repo also includes schema-affecting SQL outside the migration chain:

- `supabase/scripts/supabase_auth_setup.sql`
- `supabase/scripts/supabase_auth_setup_clean.sql`
- `supabase/scripts/disable_rls_temp.sql`
- `supabase/scripts/permanent_rls_policies.sql`
- `setup-azure-user.sql`

### Seed and migration coupling
Seed data still depends on cleanup migrations to become valid:

- `supabase/seed.sql:17`, `supabase/seed.sql:57`, and many later inserts use `category_id` values prefixed with `cat-`
- `supabase/migrations/021_add_category_foreign_key.sql:5-33` later strips the `cat-` prefix and nulls out invalid values before adding the FK

That means migration ordering is not just cosmetic. Data validity depends on running corrective migrations after seed inserts.

### Repo/schema drift evidence
The repo does not fully describe the schema that application code expects:

- `supabase/migrations/029_add_modules_table.sql:11-25` defines `modules` without `course_id`, `estimated_duration_minutes`, `status`, `thumbnail_url`, or `slug`
- `supabase/migrations/20260304170000_module_learner_refactor.sql:4-45` later adds `slug` and an index on `status`
- `supabase/migrations/20260304123000_add_module_thumbnail_url.sql:1-4` adds `thumbnail_url`
- active frontend queries still expect `estimated_duration_minutes` and `status` on `modules` in `src/services/courseService.ts:338-342` and `src/services/courseService.ts:441-444`
- generated types expect `course_id`, `thumbnail_url`, `estimated_duration_minutes`, and `status` on `modules` in `src/lib/supabase/types.ts:301-341`
- generated types still model only legacy learner tables in `src/lib/supabase/types.ts:679-819`, while runtime code uses `module_enrollments`, `module_lesson_progress`, and `saved_modules` through `as any` casts in `src/lib/enrollment/service.ts:82-87`, `src/lib/enrollment/service.ts:293-297`, `src/lib/enrollment/service.ts:374-378`, and `src/services/savedCoursesService.ts:44-47`

## Query and Indexing Risk Assessment
### Confirmed index coverage that helps
Several common reads are indexed:

- catalog filters on `courses` in `supabase/migrations/024_add_filter_indexes.sql`
- `user_enrollments` lookup indexes in `supabase/migrations/027_add_progress_tracking_tables.sql:23-27`
- `module_enrollments`, `module_lesson_progress`, and `saved_modules` indexes in `supabase/migrations/20260304170000_module_learner_refactor.sql:65-128`

### Confirmed query pressure points
Active read paths are learner-heavy and order-sensitive:

- modules filtered by `status` and `course_slug`, ordered by `order_index` in `src/services/courseService.ts:338-342`
- lessons filtered by `module_id`, ordered by `order_index` in `src/services/courseService.ts:358-362` and `src/services/courseService.ts:605-608`
- course resources filtered by `course_slug`, ordered by `order_index` in `src/services/courseService.ts:662-666`
- subscriptions filtered by `user_id` and `status`, ordered by `created_at` in `..\DTMA-API\src\routes\enrollment.ts:341-350`
- saved items filtered by `user_id`, ordered by `created_at` in `..\DTMA-API\src\routes\savedCourses.ts:27-31` and `src/services/savedCoursesService.ts:44-47`

### Inferred index risks
These are inferred from query shape versus visible indexes:

- `course_resources` has an index on `course_slug` only in `supabase/migrations/004_add_course_resources_table.sql:20`, but active reads also sort on `order_index` in `src/services/courseService.ts:662-666`
- `subscriptions` has separate indexes on `user_id`, `status`, and `plan_id` in `supabase/migrations/029_add_subscriptions_table.sql:23-25`, but the active access check combines `user_id`, `status`, and `created_at DESC` in `..\DTMA-API\src\routes\enrollment.ts:343-349`
- `saved_courses` and `saved_modules` support recent-first reads, but visible indexes optimize equality more than ordered retrieval: `supabase/migrations/049_add_saved_courses_table.sql:12-15` and `supabase/migrations/20260304170000_module_learner_refactor.sql:104-108`

These are not proven performance defects yet, but they are credible scale risks for Stage01 and Stage02A read paths.

## Auditability / Traceability Assessment
### Confirmed audit fields
Many tables at least include `created_at` and sometimes `updated_at`, including `courses`, `lessons`, `modules`, `user_enrollments`, `module_enrollments`, `subscriptions`, and `badges`.

### Confirmed auditability gaps
Auditability is inconsistent across content and learner tables:

- `saved_courses` has only `created_at` in `supabase/migrations/049_add_saved_courses_table.sql:4-8`
- `saved_modules` has only `created_at` in `supabase/migrations/20260304170000_module_learner_refactor.sql:96-102`
- `course_resources` has `created_at` but no `updated_at`, lifecycle field, or actor field in `supabase/migrations/004_add_course_resources_table.sql:5-17`
- instructor-managed content tables do not record `created_by` or `updated_by` in `supabase/migrations/initial_schema.sql:49-79`, `supabase/migrations/002_add_lessons_table.sql:5-19`, and `supabase/migrations/029_add_modules_table.sql:11-25`
- no soft-delete or archival pattern was found for content and bookmark tables; lifecycle is expressed inconsistently through hard deletes, nullable timestamps, and ad hoc `status` columns

For an instructor/admin platform, that limits traceability of who changed published content and when.

## Findings by Severity
### Critical
#### Finding 1: Learner state is split across active course-level and module-level persistence models
| Field | Detail |
| --- | --- |
| Title | Learner state is split across active course-level and module-level persistence models |
| Severity | Critical |
| Impact Area | Data Integrity |
| Evidence | Legacy learner tables are defined in `supabase/migrations/027_add_progress_tracking_tables.sql:8-120` and `supabase/migrations/049_add_saved_courses_table.sql:4-15`. Newer learner tables are defined in `supabase/migrations/20260304170000_module_learner_refactor.sql:49-130`. A third progress table exists in `supabase/migrations/039_add_learner_lesson_progress.sql:5-20`. Both runtime families are live: `..\DTMA-API\src\routes\enrollment.ts:44-50`, `..\DTMA-API\src\routes\savedCourses.ts:27-31`, and `..\DTMA-API\src\middleware\lessonAccess.ts:83-89` use `user_enrollments`, `saved_courses`, and `lesson_progress`, while `src/lib/enrollment/service.ts:82-87`, `src/lib/enrollment/service.ts:293-297`, `src/services/savedCoursesService.ts:44-47`, and `api/middleware/lessonAccess.mjs:175-180` use `module_enrollments`, `saved_modules`, and `module_lesson_progress`. |
| Why It Matters | A single learner can accumulate progress, bookmarks, and access state in different tables depending on which runtime path is exercised. That is a direct release blocker for learner continuity, reporting, and authorization correctness. |
| Recommended Action | Choose one canonical learner-state model, freeze writes to the deprecated one, and plan an explicit migration/backfill for existing rows before launch. |
| Fix Effort | Large |
| Release Relevance | Blocker |

### High
#### Finding 2: The checked-in migration chain is not an authoritative source of the runtime schema
| Field | Detail |
| --- | --- |
| Title | The checked-in migration chain is not an authoritative source of the runtime schema |
| Severity | High |
| Impact Area | Release Readiness |
| Evidence | `supabase/migrations/029_add_modules_table.sql:11-25` defines `modules` without `course_id`, `estimated_duration_minutes`, or `status`. Later repo migrations only visibly add `slug` and an index on `status` in `supabase/migrations/20260304170000_module_learner_refactor.sql:4-45` and `thumbnail_url` in `supabase/migrations/20260304123000_add_module_thumbnail_url.sql:1-4`. However, generated types require `course_id`, `thumbnail_url`, `estimated_duration_minutes`, and `status` in `src/lib/supabase/types.ts:301-341`, and active queries select `thumbnail_url`, `estimated_duration_minutes`, and `status` in `src/services/courseService.ts:338-342` and `src/services/courseService.ts:441-444`. At the same time, generated types still stop at legacy learner tables in `src/lib/supabase/types.ts:679-819`, while active code uses `module_enrollments`, `module_lesson_progress`, and `saved_modules` via `as any` casts in `src/lib/enrollment/service.ts:82-87`, `src/lib/enrollment/service.ts:293-297`, `src/lib/enrollment/service.ts:374-378`, and `src/services/savedCoursesService.ts:44-47`. |
| Why It Matters | Fresh environments cannot be trusted to recreate the database contract that the app currently expects. Schema drift also forces developers to bypass types with `as any`, which hides integration defects until runtime. |
| Recommended Action | Reconcile the checked-in migrations, generated Supabase types, and live query contract. Treat one repo-backed schema export as the release baseline and regenerate types from that exact state. |
| Fix Effort | Large |
| Release Relevance | Blocker |

#### Finding 3: Migration history is collision-prone and partly bypassed by standalone SQL scripts
| Field | Detail |
| --- | --- |
| Title | Migration history is collision-prone and partly bypassed by standalone SQL scripts |
| Severity | High |
| Impact Area | Operational Readiness |
| Evidence | The repo contains duplicate migration prefixes such as `024_*`, `028_*`, `029_*`, `039_*`, `049_*`, and `050_*`, plus `supabase/migrations/026_placeholder.sql`. The repo also contains schema-affecting scripts outside the migration chain, including `supabase/scripts/supabase_auth_setup.sql`, `supabase/scripts/supabase_auth_setup_clean.sql`, `supabase/scripts/permanent_rls_policies.sql`, `supabase/scripts/disable_rls_temp.sql`, and `setup-azure-user.sql`. Seed validity also depends on later cleanup: `supabase/seed.sql:17` and similar rows use `cat-` prefixed categories, while `supabase/migrations/021_add_category_foreign_key.sql:5-33` repairs those values before enforcing the FK. |
| Why It Matters | Environment rebuilds and release promotions become unreliable when schema changes can come from multiple paths and migration ordering is ambiguous. That makes rollback and incident recovery materially harder. |
| Recommended Action | Normalize the migration sequence into one ordered history, remove placeholders, and move any required schema-changing scripts into the canonical migration stream. |
| Fix Effort | Medium |
| Release Relevance | Pre-release |

#### Finding 4: Core entity relationships use mixed key strategies and partial normalization
| Field | Detail |
| --- | --- |
| Title | Core entity relationships use mixed key strategies and partial normalization |
| Severity | High |
| Impact Area | Architecture |
| Evidence | `courses.category_id` is plain `TEXT` in `supabase/migrations/initial_schema.sql:52` and is later constrained to `course_categories.slug` rather than `id` in `supabase/migrations/021_add_category_foreign_key.sql:44-49`. `industries` has UUID primary keys in `supabase/migrations/007_add_filter_lookup_tables.sql:34-44`, but `courses` stores `industry TEXT` in `supabase/migrations/007_add_filter_lookup_tables.sql:131-142`. `learner_lesson_progress` uses text identifiers for `user_id`, `course_id`, and `lesson_id` in `supabase/migrations/039_add_learner_lesson_progress.sql:5-20`. On the application side, `Lesson` uses `courseId` while `Module` uses `courseSlug` and `Quiz` uses `courseSlug` plus `moduleId`/`lessonId` in `src/types/dtma-lms.ts:58-105`. |
| Why It Matters | Inconsistent keys complicate joins, backfills, cache keys, and downstream analytics. They also make future features such as FAQ/Q&A attachment, instructor analytics, and content versioning harder to model cleanly. |
| Recommended Action | Define a canonical identifier policy per aggregate boundary and use it consistently in new schema work. Where denormalized text is intentional, document it explicitly and constrain it. |
| Fix Effort | Large |
| Release Relevance | Pre-release |

### Medium
#### Finding 5: Quiz persistence is mid-refactor, with legacy and normalized shapes both still present
| Field | Detail |
| --- | --- |
| Title | Quiz persistence is mid-refactor, with legacy and normalized shapes both still present |
| Severity | Medium |
| Impact Area | Maintainability |
| Evidence | `supabase/migrations/003_add_quizzes_table.sql:5-17` models each quiz row as a single question with inline `question`, `options`, and `correct_answer`. `supabase/migrations/047_refactor_quiz_model.sql:4-50` turns `quizzes` into a container, creates `quiz_questions`, and explicitly notes that migrating existing rows is left to a manual script. `supabase/migrations/048_add_quiz_hierarchy_binding.sql:6-23` adds `module_id` and `lesson_id`. The TypeScript model still carries both the new `questions` collection and the legacy single-question fields in `src/types/dtma-lms.ts:83-105`. |
| Why It Matters | Quiz authoring, grading, reporting, and data migration are harder to reason about when both row shapes are valid at the same time. It also increases the risk of partial reads or writes during Stage02A and Stage02B quiz work. |
| Recommended Action | Decide which quiz representation is canonical, migrate legacy rows, and remove the backward-compatibility contract once data is reconciled. |
| Fix Effort | Medium |
| Release Relevance | Pre-release |

#### Finding 6: Auditability and lifecycle metadata are inconsistent across operational tables
| Field | Detail |
| --- | --- |
| Title | Auditability and lifecycle metadata are inconsistent across operational tables |
| Severity | Medium |
| Impact Area | Operational Readiness |
| Evidence | `saved_courses` stores only `created_at` in `supabase/migrations/049_add_saved_courses_table.sql:4-8`; `saved_modules` also stores only `created_at` in `supabase/migrations/20260304170000_module_learner_refactor.sql:96-102`; `course_resources` has `created_at` but no `updated_at` or actor fields in `supabase/migrations/004_add_course_resources_table.sql:5-17`. Instructor-managed tables `courses`, `lessons`, and `modules` do not record `created_by` or `updated_by` in `supabase/migrations/initial_schema.sql:49-79`, `supabase/migrations/002_add_lessons_table.sql:5-19`, and `supabase/migrations/029_add_modules_table.sql:11-25`. |
| Why It Matters | Stage02B content operations cannot be traced cleanly, and several learner-state tables cannot answer basic operational questions such as who changed a row, whether it was archived, or what the previous state was. |
| Recommended Action | Add a minimal auditability standard for mutable operational tables: actor attribution where relevant, consistent `updated_at`, and an explicit lifecycle approach for rows that should not disappear silently. |
| Fix Effort | Medium |
| Release Relevance | Pre-release |

#### Finding 7: Media and course-content persistence is fragmented between relational tables and direct storage URL patterns
| Field | Detail |
| --- | --- |
| Title | Media and course-content persistence is fragmented between relational tables and direct storage URL patterns |
| Severity | Medium |
| Impact Area | Architecture |
| Evidence | The repo defines `media_items` and `media_assets` in `supabase/migrations/initial_schema.sql:7-44` and `supabase/migrations/initial_schema.sql:87-125`. Course content also stores direct file URLs on `lessons.video_url`, `lessons.resource_url`, and `course_resources.resource_url` in `supabase/migrations/002_add_lessons_table.sql:11-19` and `supabase/migrations/004_add_course_resources_table.sql:5-17`. Storage governance is split between `course-content` policies in `supabase/migrations/049_course_content_storage_anon_policies.sql:8-49` and `lms-content` policies in `supabase/migrations/049_admin_auth_rbac.sql:247-288`. Active code reads direct URLs from `lessons` and `course_resources` rather than through `media_items` or `media_assets`, for example in `src/services/courseService.ts:358-362`, `src/services/courseService.ts:605-608`, and `src/services/courseService.ts:662-666`. |
| Why It Matters | The platform currently has no single source of truth for media ownership, metadata, and access policy. That increases the chance of orphaned files, duplicated metadata, and inconsistent access control as content volume grows. |
| Recommended Action | Define which content classes should be modeled as first-class media entities versus plain URLs, then align storage policy and query paths with that ownership model. |
| Fix Effort | Medium |
| Release Relevance | Later |

#### Finding 8: Ordered learner and catalog reads have visible composite-index gaps (inferred risk)
| Field | Detail |
| --- | --- |
| Title | Ordered learner and catalog reads have visible composite-index gaps |
| Severity | Medium |
| Impact Area | Performance |
| Evidence | `course_resources` queries filter by `course_slug` and order by `order_index` in `src/services/courseService.ts:662-666`, but the visible index is only `idx_resources_course_slug` in `supabase/migrations/004_add_course_resources_table.sql:20`. Enrollment access checks read `subscriptions` by `user_id`, `status`, and `created_at DESC` in `..\DTMA-API\src\routes\enrollment.ts:343-349`, while `supabase/migrations/029_add_subscriptions_table.sql:23-25` only defines single-column indexes. Saved-item reads sort by `created_at` in `..\DTMA-API\src\routes\savedCourses.ts:27-31` and `src/services/savedCoursesService.ts:44-47`, but visible indexes prioritize equality over ordered retrieval in `supabase/migrations/049_add_saved_courses_table.sql:12-15` and `supabase/migrations/20260304170000_module_learner_refactor.sql:104-108`. |
| Why It Matters | These paths are central to marketplace, learner-dashboard, and access flows. The current indexes may be adequate at MVP size, but the visible schema does not show deliberate support for the full filter-plus-order patterns already in use. |
| Recommended Action | Verify the top read paths with real query plans in the target Supabase environment and add composite indexes only where the plans confirm need. |
| Fix Effort | Small |
| Release Relevance | Later |

## Quick Wins
- Freeze new writes to one learner-state model and document the canonical tables for enrollment, progress, bookmarks, and quiz attempts.
- Regenerate `src/lib/supabase/types.ts` from the actual release schema and remove `as any` workarounds where module-level tables are already live.
- Replace duplicate or placeholder migration filenames with a single ordered history before the next environment rebuild.
- Add a small schema-contract check in CI that compares repo migrations, generated Supabase types, and queried columns for drift.
- Define whether FAQ and Q&A are in or out of MVP scope; if they are in scope, add explicit persistence design rather than letting them emerge ad hoc.

## Release Risks
- New environments may not reproduce the same database contract that current code expects because migrations, generated types, and query code are out of sync.
- Learner enrollments, progress, and saved items can fragment across old and new tables depending on which runtime surface handles the request.
- Quiz data may remain partially migrated because the refactor explicitly leaves legacy-row conversion as manual work.
- Stage02B content operations are weakly traceable because content tables do not record actor-level audit fields.
