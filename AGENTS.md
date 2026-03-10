# AGENTS.md

## Project
DTMA is a full e-learning platform with these product stages:

- Stage00: Landing Page
- Stage01: Course Marketplace
- Stage02A: Learners App
- Stage02B: Instructor/Admin Platform

## Audit Objective
You are assisting with an architecture audit.
Your task is to inspect the repository, identify architecture risks, and produce evidence-based findings.
Do not refactor code unless explicitly instructed in a later task.

## Audit Principles
- Be evidence-based.
- Reference exact files, folders, components, services, or functions.
- Do not make assumptions without repository evidence.
- Prefer concrete findings over generic best-practice commentary.
- Distinguish between confirmed findings and inferred risks.

## Required Outputs
Place all audit outputs under:

docs/arch-audit/

## Severity Model
Use:
- Critical
- High
- Medium
- Low

For every finding include:
- Title
- Severity
- Impact Area
- Evidence
- Why It Matters
- Recommended Action
- Fix Effort (Small / Medium / Large)
- Release Relevance (Blocker / Pre-release / Later)

## Impact Areas
- Architecture
- Security
- Performance
- Maintainability
- Developer Experience
- Release Readiness
- Data Integrity
- Operational Readiness

## Repo Review Rules
- Inspect current structure before proposing changes.
- Look for module boundaries, coupling, duplication, and inconsistencies.
- Assess whether the repo structure matches the product stages.
- Identify release blockers.
- Do not rewrite or re-organize code in audit tasks.

## Preferred Audit Style
- Use markdown headings
- Use bullet lists sparingly
- Use tables for findings summaries
- Include ASCII trees/diagrams where helpful

## Commands
Before drawing conclusions, inspect:
- package.json
- workspace config
- tsconfig / build config
- env config
- Docker / CI files
- app entry points
- route definitions
- API definitions
- DB schema / migrations
- auth / permission logic
- media / storage logic

If available, run:
- install
- lint
- typecheck
- tests

Document any command failures as part of findings.

## Special DTMA Focus Areas
Prioritize review of:
- Stage boundary leakage between Stage00 / 01 / 02A / 02B
- Authentication and authorization boundaries
- Shared component sprawl
- API contract consistency
- Media architecture
- Course / module / quiz domain modeling
- FAQ / Q&A feature placement and extensibility
- Environment / deployment consistency
- Release readiness for MVP closure