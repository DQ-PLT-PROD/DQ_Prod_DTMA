# DTMA Profile Enrichment Plan

## 1) DB Migration Plan
- Add columns to `public.users`:
- `display_name` TEXT NULL
- `preferred_email` TEXT NULL
- `phone_number` TEXT NULL
- `country` TEXT NULL
- `timezone` TEXT NULL
- `seniority_level` TEXT NULL
- `weekly_learning_capacity` TEXT NULL
- `transformation_experience` TEXT NULL
- Consider constraints:
- Add `CHECK` constraints for enumerated fields now if you want DB-level validation. Suggested values:
- `seniority_level IN ('entry','mid','senior','executive')`
- `weekly_learning_capacity IN ('1-2h','3-5h','5+h')`
- `transformation_experience IN ('none','participated','led_initiatives','enterprise_wide')`
- If you want to move fast, defer constraints to avoid breaking existing data; enforce in UI first and add constraints later.
- RLS implications:
- Current migrations do not define `users` RLS. Adding columns does not change this, but profile reads/writes still depend on existing DB/RLS configuration. If RLS is enabled, anon client writes may fail. Note this as a risk; do not change architecture in this phase.

## 2) Frontend Plan
- Update `src/features/portal/pages/ProfilePage.tsx`:
- Add a “Basic Information” section above learning profile fields.
- Fields and UI behavior:
- `display_name`: editable text input, required for save if empty and should be used for greeting.
- `email`: read-only display (from AuthContext user email or `databaseUser.email`).
- `preferred_email`: optional text input with basic email validation.
- `phone_number`: optional text input; minimal validation (digits, +, spaces, hyphen) or defer to server.
- `country`: optional select or text input; for MVP, text input is acceptable.
- `timezone`: optional select; for MVP, allow text input or limited list.
- Learning profile additions:
- `seniority_level`: required select (Entry, Mid, Senior, Executive).
- `weekly_learning_capacity`: optional select (1–2h, 3–5h, 5+h).
- `transformation_experience`: required only if `role_track === 'leader'`. Hide/disable otherwise and clear value if user switches away from leader.
- Validation rules:
- Block Save if `role_track` missing, `seniority_level` missing, or `transformation_experience` missing when leader.
- Enforce goals max 8 and preferences max 12 as today.
- Optional: validate `preferred_email` format only when provided.
- Preserve existing behavior:
- Do not re-trigger onboarding; profile save should not update `onboarding_completed`.

## 3) Service Plan
- Update `src/features/learner/services/learnerProfileService.ts`:
- Extend `LearnerProfile` with new fields from `users` table.
- Extend `UpsertProfileInput` to include new fields.
- Update `PROFILE_SELECT` to include new columns.
- Update `mapRowToProfile` to map new fields.
- Update `upsertProfile` to set only provided fields and leave others unchanged.
- Data shape mapping:
- `displayName` ? `users.display_name`
- `preferredEmail` ? `users.preferred_email`
- `phoneNumber` ? `users.phone_number`
- `country` ? `users.country`
- `timezone` ? `users.timezone`
- `seniorityLevel` ? `users.seniority_level`
- `weeklyLearningCapacity` ? `users.weekly_learning_capacity`
- `transformationExperience` ? `users.transformation_experience`
- Keep `roleTrack`, `goals`, `preferences`, `onboardingCompleted` as-is.

## 4) Onboarding Plan
- Defer enrichment fields to the profile page for MVP.
- Keep onboarding focused on role track, goals, preferences, and completion flag.
- Optional: If you want a faster onboarding match, you can add `seniority_level` only if it is critical, but that adds steps and risk; recommend defer.

## 5) Greeting Plan
- Update `src/components/Header/ProfileDropdown.tsx` to use DB `display_name` when available, with fallback to MSAL/AuthContext name.
- Implementation approach:
- Add `display_name` to the AuthContext database user (already loaded as `databaseUser`).
- If `display_name` is present, use it in greeting; else use MSAL-derived first name.
- Keep initials logic consistent with display name when available.

## 6) Manual Verification Checklist
- Sign in, open `/portal/profile`, confirm Basic Information section renders and pre-fills from DB if present.
- Update `display_name` and save; reload page and confirm it persists.
- Confirm greeting shows `display_name` after save; fallback to MSAL name if empty.
- Set `role_track = leader` and verify `transformation_experience` becomes required.
- Switch `role_track` away from leader and confirm transformation experience is cleared or not required.
- Validate goals and preferences max limits still enforced.
- Confirm `seniority_level` is required and blocks save when missing.
- Confirm save shows success toast and persists across refresh.
- Confirm onboarding flow still works and does not get re-triggered by profile saves.
