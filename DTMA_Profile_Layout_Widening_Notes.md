# DTMA Profile Layout Widening Notes

## Files Changed
- `src/features/portal/components/profile/ProfilePageContainer.tsx`
- `src/features/portal/components/profile/ProfileTabs.tsx`
- `src/features/portal/components/profile/ProfileSectionAccordion.tsx`

## Width Constraints Removed / Adjusted
- In `src/features/portal/components/profile/ProfilePageContainer.tsx`:
  - Removed centered narrow wrapper: `mx-auto max-w-4xl`.
  - Replaced with wide page wrapper: `w-full px-4 py-4 md:px-6 lg:px-8 xl:px-10`.
  - Added high-width cap for large screens: `w-full max-w-[1400px]` (left-aligned, not centered).
  - Removed outer full-page card styling (`rounded-xl border bg-white p-6`) so page no longer appears as a floating centered panel.
  - Kept loading state in its own bordered block for visual consistency.
- In `src/features/portal/components/profile/ProfileTabs.tsx`:
  - Made tabs container full width: `w-full`.
  - Removed `min-w-max` constraint on tab row.
  - Tabs now use `md:flex-1` so they stretch across the available content width on larger screens.
- In `src/features/portal/components/profile/ProfileSectionAccordion.tsx`:
  - Added explicit `w-full` to section wrapper.

## Before / After Manual Verification
- Before:
  - Profile content sat inside a narrow centered panel (`max-w-4xl` + `mx-auto`), creating a floating-card feel.
  - Tabs did not strongly fill horizontal space.
- After:
  - Profile now uses most of the portal content area width with responsive horizontal padding.
  - Tabs stretch across the main content area (especially on md+ screens).
  - Accordion sections render full-width in the wider canvas.
  - Save action remains bottom-right within the main profile content area.

## Responsive Checks
- Desktop: profile canvas appears wide (no small centered panel).
- Tablet/mobile: layout remains responsive with horizontal scroll support for tabs when needed.
