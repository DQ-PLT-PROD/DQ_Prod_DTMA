# DTMA Profile Tabbed UX Refactor Report

## Summary
Implemented an end-to-end refactor of the Learner Profile experience to the new tabbed UX with accordion sections, tab/global completion, and tab-level save flows backed by existing Supabase profile persistence (`public.users` keyed by `azure_user_id`).

## Files Changed
- `src/features/portal/pages/ProfilePage.tsx`
- `src/features/portal/components/profile/ProfilePageContainer.tsx`
- `src/features/portal/components/profile/ProfileTabs.tsx`
- `src/features/portal/components/profile/ProfileSectionAccordion.tsx`
- `src/features/portal/utils/profileCompletion.ts`
- `src/features/learner/components/ChipMultiSelect.tsx`
- `src/features/learner/constants/profileOptions.ts`
- `src/features/dashboard/pages/onboarding/index.tsx`
- `src/features/portal/pages/InProgressPage.tsx`

## Migration(s) Added
No new migration was added.

Reason: required profile fields already exist from:
- `supabase/migrations/043_add_learner_profile_fields.sql`
- `supabase/migrations/045_add_profile_enrichment_fields.sql`

## Key Decisions
- Kept existing persistence model and service pattern:
  - Still uses `learnerProfileService` (`getLearnerProfile` / `upsertLearnerProfile`).
  - No service-role key usage introduced.
  - Identity is still mapped via `azure_user_id` from current auth context.
- Implemented tabbed UX structure:
  - Tabs: Profile Summary, Personal Details, Learning Identity, Goals & Interests.
  - Accordion sections under editable tabs with Required/Optional/Conditional labels.
- Implemented completion engine:
  - Section completion with required/optional semantics.
  - Tab completion weighted toward required sections.
  - Global completion percent and missing required fields count.
  - Quick links in Summary tab jump to incomplete required sections.
- Implemented tab-level save model:
  - Save button per editable tab.
  - Validation scoped to active tab.
  - Success/error toast feedback.
- Validation updates implemented:
  - `display_name` required.
  - `role_track` required.
  - `seniority_level` required.
  - `goals` min 1, max 8.
  - `preferences` (areas of interest) max 12.
  - `transformation_experience` required if role track is Leader.
  - Identity email remains read-only with helper text.
  - Onboarding goal validation messaging aligned to min 1 goal.
- Optional greeting hardening:
  - In-progress greeting now prefers DB `display_name` and falls back to MSAL name.
- Onboarding gate safety:
  - No changes to onboarding completion persistence fields.
  - `onboarding_completed` behavior remains intact.

## Manual Verification Checklist
- [ ] Login via Entra and confirm profile page loads.
- [ ] Tabs render and switch correctly.
- [ ] Accordion sections expand/collapse and show Required/Optional labels.
- [ ] Completion badges update on tabs while editing.
- [ ] Summary tab shows global completion % and missing required count.
- [ ] Quick links in Summary navigate to incomplete required sections.
- [ ] Required sections/fields show missing indicators until completed.
- [ ] Save changes on Personal Details persists to DB and survives refresh.
- [ ] Save changes on Learning Identity persists to DB and survives refresh.
- [ ] Save changes on Goals & Interests persists to DB and survives refresh.
- [ ] Leader role makes transformation experience required.
- [ ] Goals max 8 is enforced.
- [ ] Interests max 12 is enforced.
- [ ] Goals minimum 1 is enforced.
- [ ] Email is displayed as read-only with org-managed helper text.
- [ ] No console errors in profile flow.

## Tests Run
- `npm run build` (passed)
