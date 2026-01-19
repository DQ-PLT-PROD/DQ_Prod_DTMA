# Digital Qatalyst implementation of Material Design 3

> **The Single Source of Truth for UI/UX**

## 1. Governance & Principles
This Design System is built on **Google Material Design 3 (M3)**.

### Core Principles
1.  **Tokens are Truth**: Never use hardcoded values (hex, px) in feature code. Always use semantic tokens (e.g., `bg-primary`, `text-body-lg`).
2.  **Accessibility First**: All interactive elements must have a touch target of at least **44x44px**. Contrast must meet WCAG AA (4.5:1).
3.  **Atomic Structure**: Components are built from Atoms -> Molecules -> Organisms.

### Versioning
We follow Semantic Versioning (SemVer) for the design system.
- **MAJOR**: Breaking changes to token names or removal of components.
- **MINOR**: New components or non-breaking visual updates.
- **PATCH**: Bug fixes or minor polish.

## 2. Token Taxonomy
We use a 3-tier token system:

1.  **Reference Tokens**: The raw palette (e.g., `md-ref-palette-primary-40`). Defined in Tailwind theme.
2.  **System Tokens**: Semantic roles (e.g., `primary`, `on-surface`). **Use these in your code.**
3.  **Component Tokens**: Specific overrides (e.g., `card-bg`).

## 3. Contribution Guide
### How to add a new component
1.  Check if it exists in M3 specs.
2.  Build it using existing **Atoms** (Buttons, Cards, Icons).
3.  Ensure it supports all M3 states: `enabled`, `hover`, `focus`, `pressed`, `disabled`.
4.  Add it to `src/components/ui`.

## 4. Component Status
| Component | Level | Status | M3 Compliant? |
| :--- | :--- | :--- | :--- |
| **Buttons** | Molecule | 🚧 In Progress | Partial |
| **Inputs** | Molecule | 🔴 Todo | No |
| **Cards** | Molecule/Org | 🔴 Todo | No |
| **Dialogs** | Organism | 🔴 Todo | No |
| **Navigation** | Organism | 🟡 Partial | No |
