
# feature-02-enrollment-gating — Optimized Specs

## A. Purpose & Scope
This specification defines the access control (gating) logic for the Learning Platform. It ensures that valuable course content is reserved for enrolled users while implementing a flexible "introductory preview" model that allows visitors and unenrolled users to view specific introductory materials at both the Course and Module levels.

### In Scope
- Access control logic for Visitors, Unenrolled Users, and Enrolled Learners.
- Definition of "Public" vs "Protected" content boundaries.
- Handling of Course Hero Intros and Module Intro content.
- Deep link behavior for protected content.

### Out of Scope
- Payment processing, subscriptions, and pricing.
- Role-based permissions for Instructors/Admins (handled separately).
- Detailed UI design of the enrollment/intro cards.

---

## B. Definitions

| Term | Definition |
|Or Use Case| Description |
|---|---|
| **Visitor** | An unauthenticated user (guest) browsing the site. |
| **Unenrolled User** | An authenticated (logged-in) user who does NOT have an active enrollment record for the specific course being viewed. |
| **Enrolled User** | An authenticated user with a valid, active enrollment record in the `user_enrollments` table for the specific course. |
| **Course Hero Intro** | The primary introductory content (usually a video or text summary) displayed in the "Hero" section of the Course Details page. |
| **Module Intro** | Descriptive or introductory content attached specifically to a "Module" (a grouping of lessons), distinct from the lessons themselves. |
| **Protected Lesson** | Any standard lesson content (video, text, quiz) that is not explicitly flagged as a preview. |

---

## C. User Stories

### 1. Visitor / Unenrolled Interaction
- **US 1.1 Course Intro**: As a Visitor or Unenrolled User, I want to view the Course Hero Intro so that I can understand the course value proposition before enrolling.
- **US 1.2 Module Intro**: As a Visitor or Unenrolled User, I want to view the introductory content of a specific Module (if available) so that I can understand the structure and topic of that section.
- **US 1.3 Blocked Access**: As an Unenrolled User, I cannot access full lesson content or take assessments, ensuring I must enroll to learn.

### 2. Enrolled Interaction
- **US 2.1 Full Access**: As an Enrolled User, I have unrestricted access to all Heroes, Module Intros, Lessons, Resources, and Assessments for my enrolled course.
- **US 2.2 Persistence**: As an Enrolled User, my access is recognized immediately across sessions and devices.

---

## D. Business Rules / Access Rules

### Rule 1: Public Content Boundaries
The following content MUST be accessible to **Visitors** and **Unenrolled Users**:
1.  **Course Metadata**: Title, Description, Syllabus Outline, Instructor Info.
2.  **Course Hero Content**: The main intro video/image and text in the course header.
3.  **Module Intro Content**: 
    - **Condition**: IF the course is structured into Modules AND a module has specific `intro_content` (or equivalent field).
    - **Logic**: This specific content block is open.

### Rule 2: Protected Content
The following content MUST be blocked for **Visitors** and **Unenrolled Users**:
1.  **Standard Lessons**: Full video/text of a lesson (unless individually flagged as `is_preview`).
2.  **Quizzes & Assessments**: All evaluative content.
3.  **Downloadable Resources**: Files attached to protected lessons.

### Rule 3: Deep Linking
- If a Visitor/Unenrolled User navigates directly (via URL) to a **Protected Lesson**:
    - They MUST be redirected to the Course Details page (or a specific "Enrollment Required" interstitial).
    - A "Permission Denied" or "Enroll to Access" message SHOULD be displayed.
- If they navigate to a **Module** page:
    - They MUST see the Module Intro (if exists).
    - They MUST see the list of lessons (titles/metadata).
    - They MUST NOT be able to click through to individual protected lessons without hitting the gate.

### Logic Summary
```text
IF User.isEnrolled(Course) THEN
  Allow Access (All)
ELSE
  IF Content == Course_Hero OR Content == Module_Intro OR Content.is_preview == TRUE THEN
    Allow Access
  ELSE
    Block Access + Show "Enroll" CTA
```

---

## E. Acceptance Criteria

### Scenario 1: Unenrolled User Views Course
- **GIVEN** I am a user without an enrollment record
- **WHEN** I visit the Course Details page
- **THEN** I can play the Hero Video
- **AND** I can see the list of Modules
- **AND** I can read the specific "Intro" text/video of any Module
- **BUT** clicking a Lesson redirects me or shows a lock icon.

### Scenario 2: Deep Link to Protected Content
- **GIVEN** I am unauthenticated (Visitor)
- **WHEN** I paste a URL to a specific protected lesson ID
- **THEN** I am redirected to the Course Overview (or Login/Enroll page)
- **AND** I do not see the lesson content.

### Scenario 3: Mixed Content (Modules)
- **GIVEN** A course has 3 Modules, and Module 2 has a special "Overview Video"
- **WHEN** I view Module 2 as a guest
- **THEN** I can watch the "Overview Video"
- **BUT** I cannot watch "Lesson 2.1" inside that module.

---

## F. Edge Cases

1.  **Modules without Intros**:
    - If a module has no dedicated intro content, the system simply displays the lesson list. No special "empty" intro state is shown to unenrolled users.
2.  **Flat Courses (No Modules)**:
    - The "Module Intro" rule simply does not apply. Only Course Hero and `is_preview` lessons are accessible.
3.  **Partially Populated Intros**:
    - If only some modules have intros, only those specific intros are public. Consistency is the responsibility of the content creator.
4.  **Enrollment Latency**:
    - If a user enrolls but the client state hasn't refreshed, access might be temporarily blocked. The UI should optimistically update or force a re-fetch of enrollment status upon successful enrollment.

---

## G. Data & Content Model Assumptions

To support this specification, the data model requires:

1.  **Courses Relationship**: `user_enrollments` table linking `user_id` and `course_slug`.
2.  **Module Structure** (Assumption):
    - A `modules` entity exists (or logically grouped lessons).
    - A field `intro_content` / `status` / `is_preview` exists on the Module or Lesson Group.
    - *Alternatively*, if Modules are just "Sections", the first lesson of a section could be flagged `is_preview` to serve as the intro.
3.  **Lesson Flags**:
    - `is_preview` (boolean): Existing flag on `lessons` table to allow specific individual lessons to be open.

---

## H. Telemetry / Analytics

- **Event**: `preview_content_viewed`
    - Props: `content_type` (Hero | ModuleIntro), `course_id`, `module_id`
- **Event**: `access_denied_gating`
    - Props: `target_resource`, `user_status` (Visitor | Unenrolled)
- **Event**: `enrollment_conversion`
    - Props: `source` (triggering element, e.g., "locked lesson click" vs "hero enroll button")

---

## I. Non-Functional Requirements

1.  **Performance**: Enrollment check must be instantaneous (cached in session/client state) to prevent UI flicker (showing content then hiding it).
2.  **Security**: The API endpoint for fetching lesson content (video URLs, etc.) MUST verify enrollment server-side. Frontend gating is visual only; backend gating is security.
3.  **Caching**: Public content (Hero, Intros) should be heavily cached as it doesn't vary by user.

---

## J. Out of Scope / Deferred
- "Free Trial" logic (time-based access).
- "Audit Mode" (viewing all content without certificate).
- Complex unlock sequences (Lesson 1 must be done before Lesson 2).
