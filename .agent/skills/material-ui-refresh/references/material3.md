# Material 3 and MUI reference (curated)

## Material 3 foundations (quick summary)
- Color roles: primary/on-primary/primary-container/on-primary-container, secondary/on-secondary/secondary-container/on-secondary-container, tertiary/on-tertiary/tertiary-container/on-tertiary-container, error/on-error/error-container/on-error-container, background/on-background, surface/on-surface, surface-variant/on-surface-variant, outline, inverse-surface, inverse-on-surface
- Typography scale: Display (large/medium/small), Headline (large/medium/small), Title (large/medium/small), Body (large/medium/small), Label (large/medium/small)
- Shape scale: none, extra small, small, medium, large, extra large, full
- Elevation: prefer low elevation and tonal surfaces; keep shadows subtle
- Spacing: 8dp grid with 4dp micro adjustments; min touch target 48dp (48px)
- Motion: use short, purposeful motion; avoid excessive animation

## MUI mapping notes
- Theme keys: palette, typography, shape, shadows, spacing, transitions, breakpoints
- Component overrides: theme.components.MuiButton, MuiCard, MuiTextField, MuiAppBar, MuiDialog, MuiList, MuiChip, MuiTabs, MuiMenu
- If the project already uses MUI CSS variables, follow that theme provider; otherwise use createTheme
- Use CssBaseline for base styles and to set the global font and background
- For gradient accents, use sx with linear-gradient and keep contrast legible

## Material compliance checklist (for new UI work)
- Tokens: use theme tokens for color, elevation, shape, spacing, and typography
- Touch targets: minimum 48px height/width for primary actions
- Focus: visible focus ring on interactive elements (focus-visible)
- Elevation: use low/medium elevation; avoid heavy shadows
- Surfaces: prefer surface/variant containers over raw white blocks
- Contrast: meet WCAG AA for text and key UI states
- Motion: short, purposeful transitions (avoid excessive animation)

## Sources
- https://m3.material.io/
- https://m3.material.io/styles/color/overview
- https://m3.material.io/styles/typography/overview
- https://m3.material.io/styles/shape/overview
- https://m3.material.io/styles/motion/overview
- https://m3.material.io/foundations/layout/overview
- https://mui.com/material-ui/customization/theming/
- https://mui.com/material-ui/customization/theme-components/
- https://mui.com/material-ui/customization/palette/
- https://mui.com/material-ui/customization/typography/
- https://mui.com/material-ui/customization/shadows/
- https://mui.com/material-ui/customization/border-radius/
