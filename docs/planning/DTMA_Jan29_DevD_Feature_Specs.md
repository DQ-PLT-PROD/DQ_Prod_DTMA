# DTMA Jan 29 – Dev D Feature Specifications (Discovery, AI & Recommendations)

Owner: **Dev D** (End-to-End)  
Target: **2026-01-29 (MVP 1.0)**  
Auth model: **Azure Entra ID (MSAL)**  
AI scope: **Rule-based / Informational only (no ML, no RAG)**

---

## 0) Mission for Dev D

Deliver the **discovery and assist layer** of DTMA:
- Public landing page
- Course discovery & selection
- AI Widget (informational, rule-based)
- Thin course insights & recommendations

This slice must:
- Work independently of enrollment, payments, or instructor workflows
- Consume frozen contracts only (catalog, profile signals, enrollment flags)
- Be safe to demo and easy to evolve later

---

## 1) Feature D1 — Landing Page (Course Discovery Entry)

### 1.1 Objective
Provide a clear public entry point for DTMA that:
- Explains what DTMA is
- Surfaces available courses
- Funnels users into course details or onboarding

### 1.2 In Scope
- Public landing page route (unauthenticated)
- High-level DTMA value proposition
- Featured / popular courses (static or rule-based)
- Primary CTAs:
  - “Browse courses”
  - “Get started” / “Sign in”

### 1.3 Out of Scope
- Personalization
- A/B testing
- Marketing analytics
- Paid conversion optimization

### 1.4 Functional Requirements
**FR1: Course listing**
- Render a list of published courses only
- Use existing catalog service / endpoint

**FR2: Navigation**
- Course card → course details page
- CTA → login or onboarding

**FR3: Fallbacks**
- Loading skeletons
- Empty state if no courses exist

### 1.5 Acceptance Criteria (Done)
- [ ] Landing page loads without auth
- [ ] Only published courses are visible
- [ ] CTAs navigate correctly
- [ ] No mocked course data remains

---

## 2) Feature D2 — Course Discovery & Selection

### 2.1 Objective
Allow users to browse and evaluate courses before enrolling.

### 2.2 In Scope
- Course catalog page
- Course details page
- Basic filtering (category, role track if available)
- Save course action (delegates persistence to Dev A contract)

### 2.3 Out of Scope
- Advanced search
- Personalized ranking
- Reviews & ratings

### 2.4 Functional Requirements
**FR1: Catalog**
- Fetch courses from backend
- Filter by:
  - category (if available)
  - role track alignment (if profile exists)

**FR2: Course details**
- Title
- Description
- Duration
- Instructor name (if available)
- CTA states:
  - “Enroll” (if not enrolled)
  - “Continue” (if enrolled)
  - “View” (if completed)

**FR3: Save Course**
- Save/unsave action available
- UI reflects saved state
- Persistence delegated to shared saved-courses contract

### 2.5 Acceptance Criteria (Done)
- [ ] Catalog and details pages are backend-driven
- [ ] CTAs reflect enrollment state (read-only)
- [ ] Save/unsave works end-to-end
- [ ] No enrollment or payment logic implemented here

---

## 3) Feature D3 — AI Widget (Informational MVP)

### 3.1 Objective
Provide an AI-powered assist widget that:
- Answers basic questions about DTMA and courses
- Guides users to relevant pages
- Does **not** rely on AI infrastructure maturity

### 3.2 In Scope
- Chat-style widget UI
- Rule-based responses (decision tree or lookup table)
- Static knowledge base:
  - “What is DTMA?”
  - “How do I enroll?”
  - “Which courses are available?”
- Deep links to catalog, course pages, support

### 3.3 Out of Scope
- RAG
- Vector search
- User personalization
- Learning context awareness

### 3.4 Functional Requirements
**FR1: Widget behavior**
- Toggle open/close
- Non-blocking UI
- Stateless (per-session only)

**FR2: Response engine**
- If user input matches known intents → predefined response
- Else → fallback response (“Here’s where you can browse courses…”)

**FR3: Escalation**
- Provide link to support/contact

### 3.5 Acceptance Criteria (Done)
- [ ] Widget loads on landing + catalog pages
- [ ] Answers at least 10 predefined intents
- [ ] Provides deep links
- [ ] Clearly labeled as “Beta / Assist”

---

## 4) Feature D4 — Course Insights & Recommendations (Thin Profile)

### 4.1 Objective
Surface **explainable, rule-based recommendations** using thin profile signals.

### 4.2 In Scope
- Rule-based recommendation logic
- “Recommended for you” section (landing or dashboard)
- “Why recommended” explanation text

### 4.3 Out of Scope
- ML models
- Behavioral analytics
- Implicit tracking

### 4.4 Input Signals (Read-Only)
- Profile:
  - role_track
  - goals/preferences
- Course metadata:
  - category
  - difficulty
  - duration
- Enrollment state (optional)

### 4.5 Recommendation Rules (Examples)
- If role_track = “Leader” → prioritize leadership courses
- If goal includes “Security” → surface security-tagged courses
- If enrolled in course A → recommend course B (static mapping)

### 4.6 Functional Requirements
**FR1: Recommendation block**
- Max 3–5 courses
- Deterministic output for same inputs

**FR2: Explainability**
- Each recommendation includes a short “Why” label:
  - “Based on your role”
  - “Based on your goals”

**FR3: Feedback (optional MVP)**
- Save/dismiss action (no learning loop yet)

### 4.7 Acceptance Criteria (Done)
- [ ] Recommendations render using real profile + catalog data
- [ ] Each recommendation has an explanation
- [ ] No hidden AI logic or opaque scoring

---

## 5) Data & Contracts (Dev D must not own)

Dev D **consumes but does not implement**:
- Course catalog service
- Enrollment state (`isEnrolled`, `isCompleted`)
- Learner profile (role_track, goals)
- Saved courses persistence

All contracts must be treated as read-only.

---

## 6) Non-Functional Requirements

### Performance
- Landing page LCP < 2.5s
- AI widget responses < 300ms (rule-based)

### UX
- No blocking modals
- Graceful empty states
- Clear labels for beta/assist features

### Security
- No service-role keys in browser
- No sensitive data exposed in AI responses

---

## 7) “Done” Checklist for Dev D
- [ ] Landing page is live and backend-driven
- [ ] Course catalog & details pages work end-to-end
- [ ] AI widget answers predefined intents and deep-links correctly
- [ ] Rule-based recommendations render with explanations
- [ ] No payments, uploads, or ML logic included

---

## 8) Explicit Deferrals (Do NOT implement)
- RAG / embeddings
- AI personalization
- Payment logic
- Instructor publishing
- Analytics

---

## Completion Definition (One Line)

**Done means:**  
Users can discover courses, understand value, get guided help, and see explainable recommendations without blocking or depending on other core flows.
