
---
name: document-hygiene
description: Enforces strict documentation placement rules and provides tools to automatically locate or categorize documents.
---

# Goal
Maintain a pristine `docs/` structure by enforcing strict categorization. Prevent "Drawer Entropy" where files are dumped in root or incorrect folders.

# The Rules

## 1. The `docs/` Root is Sacred
⛔ **NEVER** create a file directly in `docs/`.
✅ **ALWAYS** place files in a subcategory.

## 2. Category Map

| Subdirectory | Content Type | Examples |
|--------------|--------------|----------|
| `docs/architecture/` | High-level system design | `auth_flow.md`, `db_schema.md` |
| `docs/features/` | Feature specific specs/plans | `features/courses/spec.md` |
| `docs/guides/` | Developer how-to & setup | `setup_guide.md`, `testing_guide.md` |
| `docs/reports/` | Logs, audits, status reports | `security_audit_jan29.md` |
| `docs/planning/` | Roadmaps, MVP definition | `mvp_roadmap.md` |
| `docs/specs/` | General/Cross-cutting Specs | `api_standard.md` |
| `docs/reference/` | Static data lists | `country_codes.md` |

## 3. Workflow for Managing Docs

### A. Editing an Existing Document
**Goal**: Find the right file instead of creating a duplicate.

1.  **Search First**:
    ```bash
    python .agent/skills/document-hygiene/scripts/doc_manager.py find "search term"
    ```
2.  **Edit**: Open the path returned by the script.

### B. Creating a New Document
**Goal**: Enforce correct placement automatically.

1.  **Draft**: Prepare your content.
2.  **Decide Category**: Consult the Category Map.
3.  **Validate Path**:
    ```bash
    python .agent/skills/document-hygiene/scripts/doc_manager.py check "docs/proposed/path.md"
    ```
    *(Note: This logic is also enforced by `.agent/dependency_check.py`)*

# Scripts

## `doc_manager.py`
A utility to manage the documentation lifecycle.

### Usage
```bash
# Find a document by keyword (fuzzy match)
python .agent/skills/document-hygiene/scripts/doc_manager.py find "instructor auth"

# Check if a proposed path is valid
python .agent/skills/document-hygiene/scripts/doc_manager.py check "docs/random.md"
```
