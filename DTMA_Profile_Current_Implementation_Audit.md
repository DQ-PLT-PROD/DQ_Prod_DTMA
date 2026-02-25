## 1) Executive Verdict
- State: Partial
- Confidence: High
- Profile UI exists for role track, goals, and preferences, but there is no Basic Information section (name/email/phone/etc.) in the profile page. (`src/features/portal/pages/ProfilePage.tsx`)
- Onboarding collects role track, goals, and preferences and marks onboarding complete, but it does not capture other enriched profile fields. (`src/features/dashboard/pages/onboarding/index.tsx`)
- Learner profile data is stored on the `users` table via `azure_user_id` and updated through a Supabase anon client in the browser. (`src/features/learner/services/learnerProfileService.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/types.ts`)
- The header greeting uses the MSAL user name (claims/Graph) and not a profile-managed display name. (`src/components/Header/ProfileDropdown.tsx`, `src/features/auth/context/AuthContext.tsx`)
- There is no `learner_profiles` table or profile-specific RLS policy in migrations; profile security depends on current DB/RLS settings. (`supabase/migrations/043_add_learner_profile_fields.sql`, `supabase/migrations/036_simple_policy.sql`)
- Profile save uses an update-by-`azure_user_id` and assumes the user row already exists (from MSAL sync). (`src/features/learner/services/learnerProfileService.ts`, `src/features/auth/services/userService.ts`)
- Goals and preferences limits are enforced in UI (max 8/12) but not enforced at the DB level. (`src/features/portal/pages/ProfilePage.tsx`, `src/features/learner/constants/profileOptions.ts`)
- Onboarding gating is implemented via an AuthContext redirect using `onboarding_completed`, not a `profile_completed` flag. (`src/features/auth/context/AuthContext.tsx`)

## 2) UI Surface Area Inventory
- Profile page: Route `/portal/profile` renders `ProfilePage` with role track, goals, preferences, and Save button. (`src/AppRouter.tsx`, `src/features/portal/pages/ProfilePage.tsx`)
- Onboarding page: Route `/portal/onboarding` renders `LearnerOnboarding` in portal layout; `/dashboard/onboarding` redirects to `/portal/onboarding`. (`src/AppRouter.tsx`, `src/features/dashboard/pages/DashboardRouter.tsx`, `src/features/dashboard/pages/onboarding/index.tsx`)
- Header greeting: Profile dropdown renders “Hi, <first name>” from AuthContext user. (`src/components/Header/ProfileDropdown.tsx`, `src/components/Header/Header.tsx`, `src/features/portal/layout/PortalLayout.tsx`)

## 3) Current Data Model (DB)
- Primary table: `public.users` contains learner profile fields. (`src/lib/supabase/types.ts`)
- Columns used:
- role_track: `users.role_track` (TEXT, constrained to `digital_worker|leader`). (`supabase/migrations/043_add_learner_profile_fields.sql`)
- goals: `users.goals` (JSONB). (`supabase/migrations/043_add_learner_profile_fields.sql`)
- preferences/interests: `users.preferences` (JSONB). (`supabase/migrations/043_add_learner_profile_fields.sql`)
- onboarding completion: `users.onboarding_completed` and `users.onboarding_completed_at`. (`supabase/migrations/043_add_learner_profile_fields.sql`)
- display name: `users.name` (stored during MSAL sync). (`src/features/auth/services/userService.ts`, `src/lib/supabase/types.ts`)
- Relevant migrations:
- `supabase/migrations/043_add_learner_profile_fields.sql`: adds role_track, goals, preferences, onboarding flags, and a check constraint.
- No migration in repo creates the `users` table; it exists in generated types, but table creation is not present in `supabase/migrations`. (`src/lib/supabase/types.ts`)
- RLS policies:
- No RLS policy targeting `public.users` is present in `supabase/migrations`. (`supabase/migrations/036_simple_policy.sql`, `supabase/migrations/043_add_learner_profile_fields.sql`)
- Several other tables use `auth.uid()`-based policies, but there is no analogous policy for `users`. (`supabase/migrations/027_add_progress_tracking_tables.sql`, `supabase/migrations/044_add_quiz_xp_badges.sql`)

## 4) Service Layer & API Contracts
- `getLearnerProfile(azureUserId: string)` ? `{ profile, error }`: selects profile fields from `users` by `azure_user_id`. (`src/features/learner/services/learnerProfileService.ts`)
- `getProfile(azureUserId: string)` ? `LearnerProfile | null`: wrapper for `getLearnerProfile`. (`src/features/learner/services/learnerProfileService.ts`)
- `upsertProfile(azureUserId: string, input)` ? `LearnerProfile | null`: updates `users` by `azure_user_id`, sets `updated_at`, and optionally `onboarding_completed` + timestamp. (`src/features/learner/services/learnerProfileService.ts`)
- `upsertLearnerProfile(azureUserId: string, input)` ? alias of `upsertProfile`. (`src/features/learner/services/learnerProfileService.ts`)
- User sync services used to create the `users` row:
- `syncUserWithDatabase`, `getUserByAzureId`, `updateUserProfile`, `updateUserLastLogin`. (`src/features/auth/services/userService.ts`)
- Supabase client is created with anon key and used in the browser; no backend proxy is used for profile calls. (`src/lib/supabase/client.ts`, `src/features/learner/services/learnerProfileService.ts`)

## 5) Auth & Identity Mapping (Critical)
- MSAL configuration uses `PublicClientApplication` with localStorage cache and OpenID scopes. (`src/services/auth/msal.ts`)
- MSAL identity is derived from `account.idTokenClaims` and Graph `User.Read` fetch in `AuthContext`. (`src/features/auth/context/AuthContext.tsx`)
- The DB identifier is `azure_user_id`, set from `account.localAccountId || account.homeAccountId`. (`src/features/auth/context/AuthContext.tsx`, `src/features/auth/services/userService.ts`)
- The frontend writes/reads `users` directly via the Supabase anon client; there is no backend proxy for profile. (`src/lib/supabase/client.ts`, `src/features/learner/services/learnerProfileService.ts`, `src/features/auth/services/userService.ts`)
- Security note: no `users` RLS policy is present in migrations, and `learnerProfileService` explicitly avoids `auth.uid()` (comment in migration). If RLS is enabled on `users`, anon writes may fail. (`supabase/migrations/043_add_learner_profile_fields.sql`, `supabase/migrations/036_simple_policy.sql`)

## 6) Functional End-to-End Flow (What happens today)
- On page load: `ProfilePage` reads `databaseUser.azure_user_id` from AuthContext and fetches profile via `getLearnerProfile`, then populates role track, goals, and preferences. (`src/features/portal/pages/ProfilePage.tsx`, `src/features/learner/services/learnerProfileService.ts`)
- On edit: role track is a single select; goals and preferences are multi-select chip lists with max limits enforced in UI. (`src/features/portal/pages/ProfilePage.tsx`, `src/features/learner/constants/profileOptions.ts`)
- On save: `upsertLearnerProfile` is called with roleTrack/goals/preferences and success/error toasts are shown. (`src/features/portal/pages/ProfilePage.tsx`, `src/features/learner/services/learnerProfileService.ts`, `src/components/ui/Toast.tsx`)
- On refresh: profile fetch runs again (keyed to `azure_user_id`) and reloads the stored values. (`src/features/portal/pages/ProfilePage.tsx`)
- Error handling: fetch errors display a toast; save errors display a toast and do not navigate. (`src/features/portal/pages/ProfilePage.tsx`)
- Onboarding flow: `LearnerOnboarding` preloads existing profile, enforces min goals (3) and max limits, and writes onboarding completion with the same `users` record. (`src/features/dashboard/pages/onboarding/index.tsx`, `src/features/learner/services/learnerProfileService.ts`)

## 7) Gap List vs Enriched MVP Profile
| Enriched MVP Field/Behavior | Status (Present/Partial/Missing) | Evidence | Notes |
|---|---|---|---|
| Basic Information section existence | Missing | `src/features/portal/pages/ProfilePage.tsx` | Profile page only includes role track, goals, preferences. |
| display_name persisted and used in greeting | Partial | `src/components/Header/ProfileDropdown.tsx`, `src/features/auth/context/AuthContext.tsx`, `src/features/auth/services/userService.ts` | Greeting uses MSAL/Graph name via AuthContext; no profile edit or display_name field in UI. |
| email read-only behavior | Missing | `src/features/portal/pages/ProfilePage.tsx` | Email not shown on profile page. |
| preferred_email support | Missing | `src/lib/supabase/types.ts` | No column or UI field. |
| phone/country/timezone support | Missing | `src/lib/supabase/types.ts` | No columns or UI fields. |
| role_track persisted | Present | `src/features/portal/pages/ProfilePage.tsx`, `src/features/learner/services/learnerProfileService.ts`, `supabase/migrations/043_add_learner_profile_fields.sql` | Stored on `users.role_track`. |
| goals persisted (max 8 enforced) | Present | `src/features/portal/pages/ProfilePage.tsx`, `src/features/learner/constants/profileOptions.ts`, `src/features/learner/services/learnerProfileService.ts` | UI enforces max 8. |
| interests/preferences persisted (max 12 enforced) | Present | `src/features/portal/pages/ProfilePage.tsx`, `src/features/learner/constants/profileOptions.ts`, `src/features/learner/services/learnerProfileService.ts` | UI enforces max 12. |
| seniority_level | Missing | `src/lib/supabase/types.ts` | No column or UI field. |
| weekly_learning_capacity | Missing | `src/lib/supabase/types.ts` | No column or UI field. |
| transformation_experience conditional for Leader | Missing | `src/features/portal/pages/ProfilePage.tsx` | No conditional fields present. |
| profile_completed flag and gating logic | Missing | `src/features/auth/context/AuthContext.tsx`, `src/features/learner/services/learnerProfileService.ts` | Only `onboarding_completed` is used for gating. |

## 8) Recommendations (Max 10)
- Add enriched profile fields to DB via a new migration (display_name/preferred_email/phone/country/timezone/seniority_level/weekly_learning_capacity/transformation_experience/profile_completed) and update generated types. (`supabase/migrations/*`, `src/lib/supabase/types.ts`)
- Extend `learnerProfileService` to read/write new profile columns, including `profile_completed` logic. (`src/features/learner/services/learnerProfileService.ts`)
- Add a “Basic Information” section to the profile UI to show and update display name and other new fields; keep email read-only. (`src/features/portal/pages/ProfilePage.tsx`)
- Decide the canonical source for the greeting (MSAL user vs DB display_name) and update `ProfileDropdown` accordingly. (`src/components/Header/ProfileDropdown.tsx`, `src/features/auth/context/AuthContext.tsx`)
- Add validation rules for new fields (e.g., phone, timezone, weekly capacity) in UI and service layer. (`src/features/portal/pages/ProfilePage.tsx`, `src/features/learner/services/learnerProfileService.ts`)
- Introduce a `profile_completed` gate if required, separate from onboarding, and wire it into the existing AuthContext redirect flow. (`src/features/auth/context/AuthContext.tsx`)
- Define an RLS or backend-proxy strategy for profile updates to avoid direct anon writes or mismatched auth.uid() policies. (`supabase/migrations/*`, `src/lib/supabase/client.ts`)
- Add consistent read-only display of account email (from DB or MSAL) to reduce confusion between Auth and profile data. (`src/features/portal/pages/ProfilePage.tsx`)
- Document identity mapping and required claims in the profile spec, referencing `azure_user_id` usage. (`src/features/auth/context/AuthContext.tsx`, `src/features/auth/services/userService.ts`)
- Add a dedicated service method to update only enriched profile fields and avoid overwriting onboarding state. (`src/features/learner/services/learnerProfileService.ts`)
