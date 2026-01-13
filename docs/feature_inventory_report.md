# DTMA Platform Feature Inventory Report

## Scope
- Sources reviewed: `src`, `api`, `supabase/migrations`, `docs`, `k8s`, `azure-pipelines.yml`, `Dockerfile`, `vercel.json`.
- Focus: features present in code, configs, docs, UI, APIs, schemas, and feature flags.

## Status Legend
- Active: wired in routes/logic and reachable in the current app.
- Partial: UI or services exist, but not fully wired, mocked, or missing dependencies.
- Disabled: present in code but turned off by feature flags or route redirects.
- Docs-only: documented or in schema, but no runtime usage found.
- Blocked: present but missing a required module or dependency.

## Feature Flags (Current)
- `COURSE_MARKETPLACE`, `LEARNING_EXPERIENCE`, `USER_DASHBOARD_CORE`, `ADMIN_COURSE_MANAGEMENT`, `AUTHENTICATION` are enabled in `src/config/features.ts`.
- `GROWTH_AREAS`, `OTHER_MARKETPLACES`, `ADVANCED_FORMS`, `AI_CHATBOT` are disabled in `src/config/features.ts`.
- MVP scope and deactivation notes are documented in `docs/mvp-scope.md`.

## Feature Inventory

### Core Experience
| Feature | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Landing page (hero, proof, categories, CTA) | Active | `src/components/HomePage.tsx`, `src/components/HeroSection.tsx`, `src/components/ProofAndTrust.tsx`, `src/components/D6CategoriesSection.tsx`, `src/components/CallToAction.tsx` | Primary entry point at `/`. |
| Course catalog (filters, search, chips, bookmarks) | Active | `src/pages/courses/CourseCatalogPage.tsx`, `src/components/courses/FilterSidebar.tsx`, `src/components/courses/CourseGrid.tsx` | Bookmarks are local state only. |
| Course details (hero video, tabs, related courses) | Active | `src/pages/courses/CourseDetailsPage.tsx`, `src/hooks/useProductDetails.ts`, `src/components/courses/details/*` | Tabs cover outline, outcomes, resources. |
| Learning experience (video, outline, progress) | Active | `src/pages/LearningScreen.tsx`, `src/components/VideoPlayer.tsx`, `src/components/CourseOutline.tsx` | Progress stored in `localStorage`. |
| Course assessments/quizzes | Active | `src/pages/CourseAssessment.tsx` | Locking logic is currently disabled. |
| Coming soon page | Active | `src/pages/ComingSoon.tsx`, `src/AppRouter.tsx` | Used for `/coming-soon/*`. |
| Legacy route redirects | Active | `src/AppRouter.tsx` | Disabled legacy marketplaces redirect to `/404` or `/courses`. |

### Authentication and User Management
| Feature | Status | Evidence | Notes |
| --- | --- | --- | --- |
| MSAL (Entra/CIAM) auth flow | Active | `src/services/auth/msal.ts`, `src/components/Header/context/AuthContext.tsx`, `src/components/ProtectedRoute.tsx` | Redirect-based login and auto-login for protected routes. |
| Mock auth and bypass mode | Active | `src/services/auth/mockAuth.ts`, `src/components/Header/context/AuthContext.tsx` | Controlled via env vars. |
| User sync to Supabase (customer IDs) | Active | `src/services/userService.ts`, `supabase/migrations/006_add_users_table.sql`, `IMPLEMENTATION_SUMMARY.md` | Sync runs on auth success. |
| Business profile management | Partial | `src/services/businessProfileService.ts`, `src/hooks/useUserSync.ts` | Services exist, no UI route found. |
| Graph API enrichment | Active | `src/services/graphService.ts`, `src/components/Header/context/AuthContext.tsx` | Requires `User.Read` token. |
| Auth debug panel | Active | `src/components/AuthDebugPanel.tsx`, `src/AppRouter.tsx` | Exposed at `/auth-debug`. |
| Auth test page | Partial | `src/pages/AuthTestPage.tsx` | No route wired in `src/AppRouter.tsx`. |

### Dashboard and Notifications
| Feature | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Dashboard overview | Partial | `src/pages/dashboard/overview/*`, `src/pages/dashboard/DashboardRouter.tsx` | Uses mocked data and UI stubs. |
| Profile/settings/support routes | Partial | `src/components/Sidebar/Sidebar.tsx`, `src/pages/dashboard/DashboardRouter.tsx` | Sidebar links exist, routes redirect to `/404`. |
| Notifications center | Partial | `src/components/Header/notifications/*`, `src/pages/dashboard/overview/index.tsx` | Header menu disabled; overview modal uses mock data. |

### Course Data and Taxonomy (Supabase)
| Feature | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Courses, lessons, quizzes, resources | Active | `src/services/courseService.ts`, `supabase/migrations/002_add_lessons_table.sql`, `supabase/migrations/003_add_quizzes_table.sql`, `supabase/migrations/004_add_course_resources_table.sql` | Requires Supabase configured; no fallback for courses. |
| Course categories and filters | Active | `src/services/filterService.ts`, `supabase/migrations/007_add_filter_lookup_tables.sql` | Fallback data used if Supabase is unavailable. |
| Industry hierarchy (parent/child) | Active | `src/services/filterService.ts`, `supabase/migrations/013_add_industry_hierarchy.sql`, `supabase/migrations/020_insert_all_subindustries.sql` | Used for nested filters. |
| Related courses | Active | `src/services/courseService.ts`, `supabase/migrations/022_add_related_courses_table.sql` | Driven by explicit relationships. |
| Coming soon courses | Active | `supabase/migrations/009_add_coming_soon_column.sql`, `src/components/CourseTile.tsx` | Visual treatment in tiles. |
| Media items/assets + event fields | Docs-only | `supabase/migrations/initial_schema.sql`, `migrations/add_event_fields.sql`, `src/lib/supabase/types.ts` | No UI usage found. |

### Content and Storage
| Feature | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Supabase storage upload workflow (docs) | Docs-only | `docs/SUPABASE_UPLOAD_GUIDE.md` | Manual upload steps documented. |
| Azure Blob upload signing API | Blocked | `api/uploads/sign.js`, `api/uploads/delete.js` | Depends on missing `src/server/azure/blobSign.js`. |
| Frontend storage provider | Partial | `src/lib/storageProvider.ts` | Calls the upload API endpoints. |

### AI and Chat
| Feature | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Voiceflow KfBot | Disabled | `src/config/features.ts`, `src/bot/KfBot.tsx` | Component exists but not mounted. |
| Chat support UI | Partial | `src/components/Chat/*`, `src/components/Sidebar/Sidebar.tsx` | No route implementation. |

### Marketplace and Forms (Non-MVP)
| Feature | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Growth areas marketplace | Disabled | `src/config/features.ts`, `src/AppRouter.tsx` | Redirected to `/404`. |
| Other marketplaces (financial, non-financial, knowledge hub, business directory) | Disabled | `src/config/features.ts`, `src/AppRouter.tsx` | Redirected to `/courses` or `/404`. |
| Advanced forms (dashboard forms) | Disabled | `src/config/features.ts`, `src/components/Sidebar/Sidebar.tsx`, `src/AppRouter.tsx` | Links exist; routes redirect to `/404`. |

### APIs and Integrations
| Feature | Status | Evidence | Notes |
| --- | --- | --- | --- |
| API server (uploads, health) | Partial | `api/server.mjs` | Upload endpoints blocked by missing module. |
| Supabase client | Active | `src/lib/supabase/client.ts` | Uses env or default URL/key. |

### DevOps and Deployment
| Feature | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Build tooling (Vite + TS) | Active | `vite.config.ts`, `package.json` | SPA build setup. |
| Docker containerization | Active | `Dockerfile` | Basic container build. |
| CI pipeline | Active | `azure-pipelines.yml` | Azure DevOps pipeline present. |
| Vercel deployment config | Active | `vercel.json` | Hosting config. |
| Kubernetes manifests | Active | `k8s/base/*`, `k8s/overlays/staging/*` | Staging overlay included. |

## Notable Gaps and Risks
- Upload API depends on missing `src/server/azure/blobSign.js`, which blocks Azure Blob signed upload and delete flows.
- Dashboard navigation includes profile/settings/support/chat links, but no routes are implemented beyond overview.
- Admin panel is referenced in PRD (`DTMA Specs/product_requirements_document.md`), but no `/admin` routes or UI are present in `src/AppRouter.tsx`.
- AI chatbot hooks exist in `src/components/HeroSection.tsx`, but the bot component is not mounted and the feature flag is off.
- Course and lesson data are Supabase-dependent; the catalog has no fallback when Supabase is unconfigured.
