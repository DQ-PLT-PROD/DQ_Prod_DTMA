---
name: material-ui-refresh
description: Modernize existing web UI/UX to a Google Material Design 3 look using MUI (Material UI) v5 components and theming. Use when asked to refresh, redesign, or implement MUI-based components, layouts, or styling for a Material look and feel.
---

# Goal
Deliver a cohesive Material Design 3 visual system implemented with MUI, modernizing the product without changing core IA or flows unless explicitly requested.

# Workflow
1. Audit and scope
   - Inventory key screens, shared components, and current styles
   - Identify pain points (clunky layout, inconsistent spacing, weak hierarchy)
   - Record constraints: brand colors/fonts, accessibility targets, supported browsers, existing UI libraries

2. Establish Material and brand baseline
   - Default to Material Design 3 unless the product is locked to Material 2
   - Default palette: blue primary with subtle gradient accents; rest minimal white/black
   - Define tokens in the MUI theme: palette roles, typography scale, elevation, shape, spacing, motion
   - Map brand colors to Material roles and verify contrast
   - Choose density and touch targets (min 48px)

3. Map components and patterns
   - Map existing components to Material equivalents (app bar, navigation, cards, buttons, inputs, chips, dialogs, menus, lists)
   - Specify states (hover, focus, pressed, disabled) and focus outlines
   - Define consistent icon style and grid alignment

4. Update layout and hierarchy
   - Apply 8dp grid and consistent padding/margins
   - Clarify hierarchy with typography and surface elevation
   - Adjust page structure for responsive breakpoints

5. Implement changes in MUI
   - Use `createTheme` + `ThemeProvider` + `CssBaseline` to centralize tokens
   - Set `palette`, `typography`, `shape`, `shadows`, `spacing`, `transitions`
   - Use `components` overrides for consistent M3 styling (buttons, inputs, cards, app bar, dialogs, lists)
   - Prefer MUI system props (`sx`, `Stack`, `Box`) and existing layout structure
   - Avoid new dependencies unless explicitly approved

6. Enforce Material compliance for new UI work
   - Require new components to use theme tokens for color, elevation, shape, and spacing
   - Prefer MUI primitives; if custom, mirror M3 patterns and states
   - Avoid hardcoded colors, radii, or shadows unless they map to tokens
   - Use 8dp spacing grid and 48px minimum touch targets
   - Define focus-visible styles on interactive elements

7. Validate
   - Check contrast (WCAG AA), keyboard navigation, and focus visibility
   - Verify spacing consistency and motion timing
   - Capture before/after notes for review

# Deliverables
- Token map (color roles, typography, elevation, shape, spacing, motion)
- Component inventory with Material mapping and state specs
- Summary of screens/components updated and any tradeoffs

# References
- See `references/material3.md` for Material 3 foundations and MUI theming links

# Constraints
- Preserve information architecture and core flows unless the user asks to change them
- Keep existing brand intent; adapt to Material roles instead of overwriting brand
- Keep the palette minimal: blue primary/gradient accents with white and black surfaces
- Do not delete components, routes, or features without approval
- Use MUI v5 and the project's existing styling system unless a new one is requested
- Do not add non-MUI UI libraries without approval
- For any new or modified UI, use Material tokens/theme for color, elevation, shape, and spacing (no ad-hoc values)
