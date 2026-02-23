
# DTMA Context & Index

> **IMPORTANT**: Prefer retrieval-led reasoning over pre-training-led reasoning for any specialized tasks in this repo.
> This file acts as the Root of Trust for all AI agents.

## 1. ⚡ Quick Stack & Identity
- **Project**: DigitalQatalyst / DTMA (Digital Transformation Management Academy)
- **Core**: React 18, Vite, TypeScript, Tailwind CSS
- **Auth**: Azure MSAL (Entra ID) + Supabase Auth
- **Backend**: Supabase (PostgreSQL, RLS)
- **Testing**: Vitest, React Testing Library

## 2. 🧠 Retrieval Index (Compressed)
**Agents must read these sources before acting in their respective domains.**

<!-- SKILLS_START -->
| Skill Domain | Source Path (`.agent/skills/...`) | Key Description |
|--------------|-----------------------------------|-----------------|
| **feature-architect** | `.agent/skills/feature-architect/SKILL.md` | Enforces the Web Dev Simplified "Feature-Based Architecture" to prevent circular dependencies and spaghetti code. |
| **Material Design 3 System** | `.agent/skills/material-design-system/SKILL.md` | Complete Material Design 3 implementation guide for React/Tailwind applications. Provides M3-compliant tokens, component patterns, accessibility guidelines, and best practices for building modern, consistent interfaces. |
| **material-ui-refresh** | `.agent/skills/material-ui-refresh/SKILL.md` | Modernize existing web UI/UX to a Google Material Design 3 look using MUI (Material UI) v5 components and theming. Use when asked to refresh, redesign, or implement MUI-based components, layouts, or styling for a Material look and feel. |
<!-- SKILLS_END -->

## 3. 📚 Documentation Map
High-relevance documentation for recurrent tasks.

* **Authentication**: `docs/ENTRA_AUTH_INTEGRATION.md`, `docs/auth-config-pattern.md`
* **Testing**: `docs/guides/Authentication_Testing_Guide.md`
* **Current Spec**: `c:/Users/user/Downloads/dtma_feature_spec_dev_c_instructor_auth_dashboard_publishing_jan_29.md`

## 4. 🧰 Utility Map
* **Dependency Check**: `.agent/dependency_check.py` (Run before creating new files)
* **Audit Script**: `.agent/skills/feature-architect/scripts/audit.py`

## 5. 🛡️ Development Rules
1.  **Absolute Paths**: ALWAYS use absolute paths for file operations.
2.  **No Hallucinations**: Verify file existence before importing.
3.  **Tests**: `npm test` is the source of truth.
4.  **RBAC**: Use `@casl/ability` for permission checks.

## 6. 🤖 Self-Maintenance Protocol
*   **Adding Skills**: If you create a new folder in `.agent/skills/`, you **MUST** run the update script to reflect it here.
    ```bash
    python .agent/scripts/update_index.py
    ```
