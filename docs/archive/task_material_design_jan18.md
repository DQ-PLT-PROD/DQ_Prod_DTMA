# Material Look & Feel Implementation Tasks

## Scope
- Apply a Material Design inspired look and feel (minimal white/black with blue/gradient accents).
- Preserve information architecture and core flows.
- Focus on shared styles and core UI components first.

## Tasks
- [x] 1) Audit current UI tokens and shared components
- [x] 2) Define Material-like design tokens in `src/index.css` and update `tailwind.config.js`
- [x] 3) Refresh shared components (Button, Badge, Tag, Modal styles)
- [x] 4) Update key layout surfaces (Header, cards, containers)
- [x] 5) QA pass: contrast, focus states, spacing consistency

## Change Log
- 2026-01-18: Task file created; initial audit complete.
- 2026-01-18: Applied Material tokens, updated shared components and key layout surfaces.
- 2026-01-18: Fixed enrollment service test import/expectation; verified lint and tests.

## Report
- Design tokens: added Material-inspired CSS variables for palette, surfaces, elevations, and radii; set global typography to Roboto.
- Component refresh: buttons, badges/tags, toasts, modals, and enrollment CTAs updated to use new tokens, elevations, and focus states.
- Layout surfaces: header/footer, page layout cards, sidebar, dropdowns, and mobile drawer aligned to Material surfaces and borders.
- Loading states: loaders and skeletons updated to match Material surfaces and primary accent.
- Visual direction: minimal white/black base with blue/gradient accents preserved across core surfaces.

## Tests
- `npm run lint` (pass)
- `npm run test:run` (pass; expected stderr log from negative-case enrollment test)
