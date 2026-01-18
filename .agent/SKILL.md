---
name: feature-architect
description: Enforces the Web Dev Simplified "Feature-Based Architecture" to prevent circular dependencies and spaghetti code.
---

# Goal
Refactor or audit the repository to strictly follow Feature-Based Architecture, ensuring that features remain decoupled and independent.

# Usage
Use this skill when the user asks to "fix the folder structure," "audit dependencies," or "implement the feature-based pattern."

**IMPORTANT - Proactive Analysis:** When encountering **any new file, folder, or component** (whether creating or modifying), automatically verify its compliance with the Feature-Based Architecture rules below. This includes:
- New components being added to the codebase
- New imports being added to existing files
- New features being created
- Any file moves or refactoring

# The Architecture Rules
This architecture divides code into three distinct zones with strict **One-Way Data Flow**:

```
┌─────────────────────────────────────────────────────┐
│                 🟥 APP (Composition)                 │
│     src/app, src/pages, src/routes, AppRouter.tsx   │
│          Can import from SHARED and FEATURES        │
└──────────────────────────┬──────────────────────────┘
                           │ imports ↓
┌──────────────────────────▼──────────────────────────┐
│                  🟩 FEATURES (Domain)               │
│              src/features/<feature-name>            │
│   Can import from SHARED and from itself only       │
│       ❌ CANNOT import from other features          │
└──────────────────────────┬──────────────────────────┘
                           │ imports ↓
┌──────────────────────────▼──────────────────────────┐
│                   🟦 SHARED (Global)                │
│  src/components, src/hooks, src/utils, src/lib,    │
│  src/api, src/types, src/services, src/constants   │
│   Can ONLY import from other SHARED folders         │
│      ❌ CANNOT import from features or app          │
└─────────────────────────────────────────────────────┘
```

## 1. 🟦 SHARED (Global)
* **Paths:** `src/components`, `src/hooks`, `src/utils`, `src/lib`, `src/api`, `src/types`, `src/services`, `src/constants`
* **Rule:** Can ONLY import from other `SHARED` folders.
* **Forbidden:** Cannot import from `features` or `app`.
* **Examples of SHARED code:**
  - `src/lib/auth/` - AuthContext, useAuth (cross-cutting concerns)
  - `src/lib/supabase/` - Database client
  - `src/components/ui/` - Generic UI components (Button, Toast, Modal)

## 2. 🟩 FEATURES (Domain)
* **Paths:** `src/features/<feature-name>` (e.g., `src/features/auth`, `src/features/courses`)
* **Rule:** Can import from `SHARED`.
* **Rule:** Can import from *itself* (internal components, hooks, services).
* **Forbidden:** Cannot import from **other** features (e.g., `courses` cannot import `portal`).
* **Internal structure:**
  ```
  src/features/<name>/
  ├── components/      # Feature-specific UI
  ├── hooks/           # Feature-specific hooks
  ├── services/        # Feature-specific API/logic
  ├── pages/           # Feature-specific pages
  └── constants/       # Feature-specific constants
  ```

## 3. 🟥 APP (Composition)
* **Paths:** `src/app`, `src/pages`, `src/routes`, `AppRouter.tsx`, `App.tsx`
* **Rule:** The "glue" code. Can import from `SHARED` and `FEATURES`.
* **Role:** Wires features together, defines routes, composes layouts.

# Steps
1.  **Audit**: Run `scripts/audit.py` to scan for architectural violations.
2.  **Deep Audit**: Also scan for **relative imports** (audit.py may miss these):
    - `from '../features/...'` in SHARED code = 🚨 Pollution
    - `from '../../<other-feature>/...'` in a feature = 🚨 Cross-Feature
3.  **Report**: Present the violations to the user, grouped by type:
    * 🚨 **Cross-Feature Contamination**: A feature importing another feature.
    * 🚨 **Upward Dependency**: Shared code importing a feature.
4.  **Refactor Strategy**:
    * If **Feature A** needs **Feature B**: Suggest moving the shared logic to `src/lib` (Shared).
    * If **Shared** needs **Feature A**: This is a design flaw. Suggest dependency injection or passing data as props.
5.  **Cleanup**: Run `scripts/cleanup.py` to remove empty folders and zero-byte files automatically.

# Proactive Integration Checklist
When creating or modifying ANY file, ask yourself:

| Question | If YES |
|----------|--------|
| Is this file in SHARED importing from `features/`? | 🚨 **STOP** - Move the feature code to SHARED or refactor |
| Is this feature importing from another feature? | 🚨 **STOP** - Move shared logic to `src/lib/` |
| Is this a cross-cutting concern used by 2+ features? | Consider promoting to `src/lib/` |
| Is this a page composition component using multiple features? | Move to APP layer or the owning feature's `pages/` |

# Common Patterns

## Promoting to SHARED
When a feature's code is needed by multiple features:
```bash
# Create the shared module
mkdir -p src/lib/<module-name>

# Move files and update imports
# Update all consumers to use @/lib/<module-name>
```

## Barrel Exports
Each shared module should have an `index.ts` for clean imports:
```typescript
// src/lib/auth/index.ts
export { AuthProvider, useAuth } from './AuthContext';
export type { DatabaseUser, UserProfile } from './userService';
```

# Constraints
- Do NOT hallucinate imports; verify file existence.
- When refactoring, always ask for confirmation before moving files.
- Prefer duplicating simple types over creating tight coupling between features.
- **CLEANUP RULE:** After moving files, you MUST run `scripts/cleanup.py`. Do not leave empty folders or zero-byte files behind.
- **IMPORT STYLE:** Use `@/` alias imports (e.g., `@/lib/auth`) for cross-layer imports instead of deep relative paths.

# Quick Reference

| From | Can Import From |
|------|-----------------|
| APP | SHARED ✅, FEATURES ✅ |
| FEATURE | SHARED ✅, Same Feature ✅, Other Features ❌ |

# 🗺️ Project Next Steps
> Generated after Feature-Based Architecture Refactoring (Jan 2026)

## 🏗️ 1. Immediate Technical Cleanup
- **Directory Cleanup**: Run `scripts/cleanup.py` to remove empty folders left behind by the refactor.
  - *Note: Previous attempt failed due to Python environment issues. Ensure Python 3.x is in PATH.*
- **Regression Testing**: Manually verify the following flows which were heavily affected by the refactor:
  - User Enrollment (Free & Paid paths)
  - Course Player Access (Gate checks)
  - Payment Redirects (Stripe integration)

## 🚀 2. Resume Feature Work
These active tasks were paused to resolve the build errors:
1.  **Enrollment Access & UI Fixes**:
    - Restrict portal access to enrolled users.
    - Enhance enrollment modal copy.
    - Fix learning page timestamps.
2.  **Mobile Navigation**:
    - Refine mobile drawer categories.
    - Ensure profile accessibility.

## 🔮 3. Future Architectural Improvements
- **Strict Linting**: Add ESLint rules to enforce the `@/lib` vs `@/features` import constraints automatically.
- **Unit Tests**: Add tests for the newly moved `src/lib/enrollment` and `src/lib/payment` services.
