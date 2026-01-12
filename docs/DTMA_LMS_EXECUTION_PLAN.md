# 1. DTMA Project Overview

- Existing repo is a multi-marketplace React app (courses, financial, non-financial services, knowledge hub) with Tailwind styling, Apollo/GraphQL calls, and mock fallbacks.
- DTMA will repurpose the Course Marketplace as the LMS backbone: courses mapped to 6XD Dimensions of Digital, serving Digital Leaders and Digital Workers.
- Scope here is only Course Catalog + Course Details; other marketplaces stay untouched unless needed for these flows.
- Core LMS flows to support: browse/select course; preview/enroll; learn and self-assess; rate/ask questions/find resources; complete/earn badge/share.

# 2. Tech Stack & Architecture (DTMA LMS)

- React + react-router for SPA routing; Tailwind utility classes + card-based components for UI; existing marketplace scaffolding (MarketplacePage/MarketplaceDetailsPage).
- Apollo/GraphQL scaffolding exists but currently falls back to mock data; Supabase is used only for Knowledge Hub media today.
- Supabase (future LMS): auth, row-level security, database tables, storage for media; React consumes via a thin data-access layer that can swap mock → Supabase queries later.
- Core LMS entities: Category (6XD Dimension), Course, Lesson, Enrollment, LessonProgress, User/Profile (with audienceLevel: Digital Leader | Digital Worker). Reuse existing Provider concept if helpful for partner attribution.

# 3. Current State Assessment (Catalog & Details)

- **Catalog (active route `/marketplace/courses`)**: `src/components/marketplace/MarketplacePage.tsx` renders filters + search + `MarketplaceGrid` (cards/quick view). Data pulled via `GET_ALL_COURSES` (Apollo) and falls back to `getFallbackItems` → `mockCourses`. Filter options from `GET_FACETS` or fallback config.
- **Catalog UI components**: `MarketplaceGrid.tsx`, `MarketplaceCard.tsx`, `MarketplaceQuickViewModal.tsx`, `marketplace/FilterSidebar.tsx`, `SearchBar.tsx`, promo cards, comparison storage helpers.
- **Config & data**: `src/utils/marketplaceConfig.ts` (and legacy duplicate `marketplaceConfiguration.tsx`) define course marketplace route, attributes, tabs, filter presets, and `mockCoursesData` (from `src/utils/mockData.ts`).
- **Course Details (active route `/marketplace/courses/:itemId`)**: `src/pages/marketplace/MarketplaceDetailsPage.tsx` + detail tabs (`components/marketplace/details/*`) powered by `useProductDetails` (Apollo `GET_COURSE`, falls back to `getFallbackItemDetails` → `mockCourses`). Uses `getMarketplaceConfig` for tab definitions and summary card fields.
- **Legacy/unused catalog**: `src/pages/CourseMarketplacePage.tsx` → `components/CourseMarketplace.tsx` with `CourseGrid`, `CourseCard`, `CourseQuickViewModal`, `RelatedCourses`, `FilterSidebar` (non-marketplace version) using `services/courses.ts` (GraphQL client mocked by `utils/mockData.ts`). Not wired in `AppRouter`.
- **Legacy/unused detail**: `src/pages/CourseDetailPage.tsx` (marketing-heavy single page) not routed.
- **Data handling summary**: No Supabase for courses; Apollo queries exist but mockGraphQL client (`src/services/graphql/client.ts`) and `fallbackData.ts` feed `mockCourses`. Two marketplace config files exist (TS vs TSX) with overlapping definitions.

**Course UI Map**

| Surface | Path | Data source / notes |
| --- | --- | --- |
| Catalog listing (active) | `src/components/marketplace/MarketplacePage.tsx` → `MarketplaceGrid.tsx` | Apollo `GET_ALL_COURSES`; falls back to `getFallbackItems('courses')` → `mockCourses` in `src/utils/mockData.ts`. |
| Catalog cards | `src/components/marketplace/MarketplaceCard.tsx` | Renders item provider + tags (category/deliveryMode); shares config from `marketplaceConfig`. |
| Catalog quick view | `src/components/marketplace/MarketplaceQuickViewModal.tsx` | Gets item props from catalog data; same mock source when API empty. |
| Course details (active) | `src/pages/marketplace/MarketplaceDetailsPage.tsx` | Uses `useProductDetails` to map `GET_COURSE`; falls back to `getFallbackItemDetails` which reads `mockCourses`. |
| Detail data hook | `src/hooks/useProductDetails.ts` | Maps GraphQL course fields (name, description, logoUrl, etc.) to UI shape; uses fallback mock dataset. |
| Marketplace config | `src/utils/marketplaceConfig.ts` and `src/utils/marketplaceConfiguration.tsx` | Define course tabs, attributes, filter presets, and `mockCoursesData` used across list/detail; both pull `mockCourses`. |
| Mock dataset | `src/utils/mockData.ts` | Contains `mockCourses` (e.g., Business Plan Development) and provider info; referenced by fallbackData, mock GraphQL client, config. |
| GraphQL mock client | `src/services/graphql/client.ts` | Returns `mockCourses` for course list/detail/related queries when API unavailable. |
| Legacy catalog flow | `src/components/CourseMarketplace.tsx` + `CourseGrid.tsx` + `CourseCard.tsx` + `CourseQuickViewModal.tsx` + `RelatedCourses.tsx` + `pages/CourseMarketplacePage.tsx` | Uses `services/courses.ts` (GraphQL → mock) and `utils/mockData.ts`; not routed. |
| Legacy detail page | `src/pages/CourseDetailPage.tsx` | Static/animated page, not connected to router. |

# 4. Functional Requirements for DTMA LMS (Phase 1 Scope)

- Core journeys to design around: browse and select course; preview and enroll; learn and self-assess; rate/ask questions/find resources; complete, earn badge, and share.
- **Must-have (mock data acceptable)**
  - Visitors: browse/search catalog; filter/browse by 6XD Category; open course detail.
  - Learners (future-auth): enroll CTA, view course detail + lesson list, see audience fit (Digital Leaders vs Digital Workers), start/continue course with planned lesson completion UX.
- **Planned later**
  - Real enrollment state, progress tracking, quizzes, certificates; admin CRUD for categories/courses/lessons; pricing/paywall rules; richer analytics.
- Pricing for MVP1: free; no payment or checkout flow required.

# 5. Data Strategy: Mock Data Now → Supabase Later

- Mirror future schema with TypeScript types in `src/types/dtma-lms.ts` and mock stores under `src/data/dtma/` (e.g., `categories.ts`, `courses.ts`, `lessons.ts`).
- Proposed shapes
  - `Category`: id, slug, name (6XD), description, icon/image.
  - `Course`: id, slug, title, shortDescription, longDescription, categoryId, audienceLevel (`"Digital Leaders" | "Digital Workers"`), topicTags: string[], levelTag, estimatedDurationMinutes, lessonCount, heroImageUrl, isFeatured, status, provider/partner (optional), pricing metadata.
  - `Lesson`: id, courseId, title, type (`intro | standard | outro | quiz`), orderIndex, estimatedDurationMinutes (≤7 for standard), content/video URL or body.
  - `Enrollment`: id, userId, courseId, status (enrolled/active/completed), startedAt/completedAt.
  - `LessonProgress`: id, enrollmentId/userId, lessonId, completedAt, score (for quizzes), timeSpent.
- Thin data-access layer in `src/lib/api/dtmaCourses.ts` (or `src/services/dtmaCourses.ts`): `getCategories()`, `getCourses()`, `getCoursesByCategory(slug)`, `getCourseBySlug(slug)`, `getLessonsByCourse(courseId)`, `getFeaturedCourses()`. Implement with mock imports now; later swap to Supabase queries.
- Supabase integration checklist (later): create tables/foreign keys for Category/Course/Lesson/Enrollment/LessonProgress; seed/ETL from mock; storage buckets for hero/lesson media; replace data-access functions with Supabase RPC/queries; add RLS for enrolled users; ensure edge cases for Digital Leader/Worker audience filter.

# 6. React Frontend Plan (Catalog & Details Only)

- **Course Catalog**
  - Route: keep `/marketplace/courses` (or alias `/courses` later). Components: `MarketplacePage` → `MarketplaceGrid`/`MarketplaceCard`/`MarketplaceQuickViewModal`, `marketplace/FilterSidebar`, `SearchBar`.
  - Data: from new data-access layer (mock now). Surface CategoryTag, TopicTag array, LevelTag on cards; include lesson count/duration badges.
  - Reuse: promo cards, comparison drawer if desired; Header/Footer wrappers.
- **Course Details**
  - Route: `/marketplace/courses/:slug` (consider slug over id). Components: detail hero + `SummaryCard`, `TabsNav` + content tabs (about, lessons/schedule, learning outcomes, provider), RelatedCourses.
  - Data: course (title, descriptions, audience, tags), category, topic tags, level, lesson list (intro/lessons/outro/quiz), duration metadata, CTAs (Enroll/Continue).
  - Flow: Page fetches course via data-access layer by slug; passes to tab components; lesson list rendered inline.
- **New/updated components**
  - Reuse `MarketplaceCard`/`SummaryCard` with DTMA styling tokens; add Tag components; add `LessonList` component for details; optional `AudienceCallout` for leaders/workers.

# 7. UI Modernization Plan (Airbnb-like Feel)

- Define lightweight design tokens (could live in `src/index.css` or `src/components/ui/theme.ts`): spacing scale (4/8px multiples), radius 12-16px, soft shadows, generous white space, card padding 20-24px.
- Typography: pair a modern sans (e.g., DM Sans/Manrope if allowed) for headings, Inter-like for body; establish H1–H5, body, caption sizes.
- Colors: use DTMA blues (#1839AD, #030C2B, #2E469E, #0E1940) with light surfaces; nav/hero gradients use existing DTMA nav gradient; primary buttons solid brand blue, secondary outlined.
- Catalog cards: cleaner layout with prominent title, concise description, CategoryTag/TopicTag/LevelTag row, duration + lesson count pill, enroll CTA. Subtle hover lift/shadow.
- Details page: hero banner with gradient/nav tone, category/level tags, audience statement, primary CTA; body sections separated by cards; lesson list as rounded panel; sticky summary card on desktop, sticky bottom CTA for mobile.
- Keep Tailwind utility approach; introduce reusable classNames/components instead of inline repetition where possible.

# 8. Componentization of Reusable Elements (Tags etc.)

- Create base `Tag`/`Badge` in `src/components/ui/Tag.tsx` with variants: `category`, `topic`, `level`, `meta` (duration/lessons), supporting left icons.
- Optional wrappers: `CategoryTag`, `TopicTag`, `LevelTag` exporting preset variant/color.
- Shared metadata rows: small `CourseMeta` component for duration + lesson count; `AudiencePill` for Digital Leaders/Workers callout; `CTAButton` styles for primary/secondary aligned to DTMA colors.
- Place shared components under `src/components/ui/` and consume across catalog cards, quick view, detail hero, related courses.

# 9. Remove Duplicated Dummy Course Data (Single Source of Truth)

- Establish mock data under `src/data/dtma/` and data-access layer (`src/lib/api/dtmaCourses.ts`) as the sole read source.
- Refactor `MarketplacePage` and `MarketplaceDetailsPage` to consume data-access functions; adjust GET_* fallbacks to route through the same layer; remove direct `mockCourses` imports.
- Update RelatedCourses, MarketplaceCard/QuickView modal to accept data from the shared layer (with mapping to existing prop shapes).
- Deprecate legacy `components/CourseMarketplace*` flow or wrap it around the shared data-access until removed; keep a shim for any other pages (Home promos) to fetch from the same source.

# 10. Implementation Roadmap (Milestones)

- **M1: Audit & Plan (shared)**
  - Document current catalog/detail flows and data sources (this file). Identify unused legacy routes/components for clean-up.
- **M2: Data Layer with Mock Hierarchy (shared)**
  - Add `src/types/dtma-lms.ts`; create `src/data/dtma/{categories,courses,lessons}.ts` with 6XD-aligned mock data (leaders/workers tags, lesson lists, topic tags).
  - Add `src/lib/api/dtmaCourses.ts` with fetch helpers that read mocks; include simple filter/search utilities.
- **M3: Wire Catalog to Data Layer (catalog page)**
  - Update `MarketplacePage`/`MarketplaceGrid`/`MarketplaceCard` to use data-access output (no direct GraphQL mocks), render CategoryTag/TopicTag/LevelTag, show lesson count/duration metadata.
  - Ensure route `/marketplace/courses` (and optional `/courses` alias) consumes slugs; update filter sidebar to use 6XD categories + audience levels.
- **M4: Wire Course Details (details page)**
  - Update `useProductDetails` (or replace with simpler hook) to fetch via data-access layer; inject lessons, audience info, tags into tabs; render lesson list and CTA states; align RelatedCourses to shared data.
- **M5: UI Modernization & Componentization (shared UI)**
  - Introduce Tag/Badge, CourseMeta, CTA buttons, page layout spacing tokens; apply to catalog cards, quick view modal, detail hero/summary card.
- **M6: Supabase Integration (future shared/backend)**
  - Implement tables/RLS, swap data-access calls to Supabase RPC/queries, add auth-aware enrollment/progress mutations; keep same interfaces to avoid UI refactor.

# 11. Risks, Unknowns, and Assumptions

- Pricing/paywall rules, enrollment eligibility, and certificate/quiz requirements are unspecified.
- Video/asset hosting destination (Supabase storage vs external) is undecided; affects lesson content fields.
- Audience segmentation (leaders vs workers) rules for visibility/filtering not defined; assuming simple tagging.
- Monetization model post-MVP is unknown; current assumption is free access for MVP1.
- Duplicate marketplace config files (`marketplaceConfig.ts` vs `marketplaceConfiguration.tsx`) need consolidation to avoid drift.
- Apollo/GraphQL schema for courses may differ from planned LMS shape; plan assumes we can own a new Supabase schema.

# 12. AI-Assisted Development Guidelines for this Repo

- ALWAYS specify exact files before changing; search for dummy text (e.g., course titles) before edits and list occurrences.
- When given a screenshot/description, first map likely routes/components (by text search) and confirm with the dev before editing.
- NEVER touch unrelated marketplaces or shared layouts without a clear tie to Catalog/Details; avoid breaking other journeys.
- Consolidate shared content/data into a single source of truth and shared components (tags/cards) before broad UI changes.

# 13. Next Steps for Me (the dev on Catalog & Details)

1. Read Sections 3, 5, and 6 to align on current state, data plan, and hierarchy.
2. Implement M2: add mock 6XD categories/courses/lessons + data-access layer in `src/data/dtma/` and `src/lib/api/dtmaCourses.ts`.
3. Implement M3–M4: point catalog and details to the data-access layer; render CategoryTag, TopicTag, LevelTag, lesson list, and audience callouts.
4. Coordinate with the team before executing M5 UI modernization to avoid conflicts with other marketplaces.
5. Later, use the Supabase integration checklist to replace mocks with real queries and enable enrollment/progress.

# 14. Collaboration & Interaction Behaviour

- After scans/plans/changes: summarize actions and list touched files with rationale.
- When unsure: ask 1–2 targeted questions (or present Option A/B) before proceeding.
- Before large or shared-scope edits: state intended files/changes and wait for confirmation.
- After finishing a milestone task: state which milestone was addressed and propose 1–3 next options.
- For new assets/requirements: restate understanding, note any missing info, then proceed once confirmed.
- When starting a new chat thread with no prior context: begin with a 3–5 line current-state summary (what’s built, data source, immediate milestone), then ask a single clarifying question: “Which focus area should I prioritize right now? (options: Catalog data wiring / Details page wiring / UI modernization / Supabase prep)”.
