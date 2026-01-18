---
name: feature-architect
description: Enforces the Web Dev Simplified "Feature-Based Architecture" to prevent circular dependencies and spaghetti code.
---

# Goal
Refactor or audit the repository to strictly follow Feature-Based Architecture, ensuring that features remain decoupled and independent.

# Usage
Use this skill when the user asks to "fix the folder structure," "audit dependencies," or "implement the feature-based pattern."

# The Architecture Rules
This architecture divides code into three distinct zones with strict **One-Way Data Flow**:

1.  **🟦 SHARED (Global)**
    * **Paths:** `src/components`, `src/hooks`, `src/utils`, `src/lib`, `src/api`
    * **Rule:** Can ONLY import from other `SHARED` folders.
    * **Forbidden:** Cannot import from `features` or `app`.

2.  **🟩 FEATURES (Domain)**
    * **Paths:** `src/features/<feature-name>` (e.g., `src/features/auth`, `src/features/products`)
    * **Rule:** Can import from `SHARED`.
    * **Rule:** Can import from *itself*.
    * **Forbidden:** Cannot import from **other** features (e.g., `products` cannot import `auth`).

3.  **🟥 APP (Composition)**
    * **Paths:** `src/app`, `src/pages`, `src/routes`
    * **Rule:** The "glue" code. Can import from `SHARED` and `FEATURES`.

# Steps
1.  **Audit**: Run `scripts/audit.py` to scan for architectural violations.
2.  **Report**: Present the violations to the user, grouped by type:
    * 🚨 **Cross-Feature Contamination**: A feature importing another feature.
    * 🚨 **Upward Dependency**: Shared code importing a feature.
3.  **Refactor Strategy**:
    * If **Feature A** needs **Feature B**: Suggest moving the shared logic to `src/lib` (Shared).
    * If **Shared** needs **Feature A**: This is a design flaw. Suggest dependency injection or passing data as props.
4.  **Cleanup**: Run `scripts/cleanup.py` to remove empty folders and zero-byte files automatically.

# Constraints
- Do NOT hallucinate imports; verify file existence.
- When refactoring, always ask for confirmation before moving files.
- Prefer duplicating simple types over creating tight coupling between features.
- **CLEANUP RULE:** After moving files, you MUST run `scripts/cleanup.py`. Do not leave empty folders or zero-byte files behind.