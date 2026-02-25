<<<<<<< HEAD

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
=======
# DTMA Feature Specification 02
## Enrollment & Access Gating (Optimized - Module-Aware)

### Status
Updated – February 2026 (Optimized for Module Intro Support)

### Owner
One Developer (End-to-End Ownership)

**Source Code**: 
- `api/middleware/lessonAccess.mjs` (Server-side access control)
- `src/features/courses/components/guards/EnrollmentGuard.tsx` (Client-side guard)
- `src/features/learning/pages/LearningScreen.tsx` (Learning interface)

**Dependencies**: `Supabase`, `AuthContext`, `Lesson Access API`

---

## 0. Objective

Implement a **flexible enrollment and access control model** that reserves valuable course content for enrolled users while providing strategic preview access to:
- Course Hero/Intro content
- Module introductory content (when modules exist)
- Explicitly marked preview lessons

This approach balances content protection with user engagement, allowing visitors to understand course structure and value before enrolling.

### Success Statement
A learner can explore course and module introductions, understand the learning path, and upon enrollment, access all protected lessons consistently across sessions and devices.

---

## 1. Scope

### In Scope
- Course enrollment persistence per authenticated learner
- Flexible preview access model (Course Hero + Module Intros + Preview Lessons)
- Module-aware access control logic
- Backend-enforced entitlement checks
- Deep link handling for protected content
- Graceful degradation for courses without modules

### Out of Scope (Explicit)
- Payments or subscriptions
- Pricing plans
- Refunds, renewals, or cancellations
- Role-based instructor permissions (handled separately)
- Admin UI for enrollment management
- Time-based access (free trials, audit mode)
- Complex unlock sequences (prerequisite chains)
>>>>>>> a0fc567 (feat: Add optimized enrollment gating with module support)

---

## B. Definitions

<<<<<<< HEAD
| Term | Definition |
|Or Use Case| Description |
|---|---|
| **Visitor** | An unauthenticated user (guest) browsing the site. |
| **Unenrolled User** | An authenticated (logged-in) user who does NOT have an active enrollment record for the specific course being viewed. |
| **Enrolled User** | An authenticated user with a valid, active enrollment record in the `user_enrollments` table for the specific course. |
| **Course Hero Intro** | The primary introductory content (usually a video or text summary) displayed in the "Hero" section of the Course Details page. |
| **Module Intro** | Descriptive or introductory content attached specifically to a "Module" (a grouping of lessons), distinct from the lessons themselves. |
| **Protected Lesson** | Any standard lesson content (video, text, quiz) that is not explicitly flagged as a preview. |
=======
### 2.1 Visitor / Unenrolled Interaction

**US 1.1 Course Intro**  
As a Visitor or Unenrolled User, I want to view the Course Hero Intro so that I can understand the course value proposition before enrolling.

**US 1.2 Module Intro**  
As a Visitor or Unenrolled User, I want to view the introductory content of a specific Module (if available) so that I can understand the structure and topic of that section.

**US 1.3 Blocked Access**  
As an Unenrolled User, I cannot access full lesson content or take assessments, ensuring I must enroll to learn.

**US 1.4 Deep Link Handling**  
As a Visitor, when I access a direct link to protected content, I am redirected to the course details page with a clear enrollment CTA.

### 2.2 Enrolled Interaction

**US 2.1 Full Access**  
As an Enrolled User, I have unrestricted access to all Heroes, Module Intros, Lessons, Resources, and Assessments for my enrolled course.

**US 2.2 Persistence**  
As an Enrolled User, my access is recognized immediately across sessions and devices.
>>>>>>> a0fc567 (feat: Add optimized enrollment gating with module support)

---

## C. User Stories

<<<<<<< HEAD
### 1. Visitor / Unenrolled Interaction
- **US 1.1 Course Intro**: As a Visitor or Unenrolled User, I want to view the Course Hero Intro so that I can understand the course value proposition before enrolling.
- **US 1.2 Module Intro**: As a Visitor or Unenrolled User, I want to view the introductory content of a specific Module (if available) so that I can understand the structure and topic of that section.
- **US 1.3 Blocked Access**: As an Unenrolled User, I cannot access full lesson content or take assessments, ensuring I must enroll to learn.

### 2. Enrolled Interaction
- **US 2.1 Full Access**: As an Enrolled User, I have unrestricted access to all Heroes, Module Intros, Lessons, Resources, and Assessments for my enrolled course.
- **US 2.2 Persistence**: As an Enrolled User, my access is recognized immediately across sessions and devices.
=======
### FR1: Enrollment Creation
- Enrollment must be created when:
  - User explicitly clicks an "Enroll" CTA
  - User completes payment flow (if applicable)
- Enrollment record must be persisted server-side in `user_enrollments` table
- Enrollment status must be immediately reflected in access checks

### FR2: Access Rules (Optimized)
>>>>>>> a0fc567 (feat: Add optimized enrollment gating with module support)

#### Public Content Boundaries
The following content MUST be accessible to Visitors and Unenrolled Users:

<<<<<<< HEAD
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
=======
1. **Course Metadata**: Title, Description, Syllabus Outline, Instructor Info
2. **Course Hero Content**: Main intro video/image and text in course header
3. **Module Intro Content**:
   - **Condition**: IF the course is structured into Modules AND a module has specific `intro_content` or `intro_video_url`
   - **Logic**: This specific content block is publicly accessible
   - **Rationale**: Allows users to understand module structure and topics

#### Protected Content
The following content MUST be blocked for Visitors and Unenrolled Users:
>>>>>>> a0fc567 (feat: Add optimized enrollment gating with module support)

1. **Standard Lessons**: Full video/text of a lesson (unless individually flagged as `is_preview`)
2. **Quizzes & Assessments**: All evaluative content
3. **Downloadable Resources**: Files attached to protected lessons
4. **Completion Tracking**: Progress data and certificates

#### Preview Lessons
- Individual lessons can be marked with `is_preview = true`
- Preview lessons are accessible without enrollment
- Typically used for: Course intros, sample lessons, promotional content

<<<<<<< HEAD
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
=======
### FR3: Access Enforcement Points
Access checks must be enforced at:
- **Route Level**: `EnrollmentGuard` component for protected routes
- **API Level**: `lessonAccess.mjs` middleware for content endpoints
- **UI Level**: Visual indicators (lock icons, enrollment CTAs)
- **Deep Links**: Redirect to course details when accessing protected content directly
>>>>>>> a0fc567 (feat: Add optimized enrollment gating with module support)

### FR4: Module Support

<<<<<<< HEAD
## F. Edge Cases

1.  **Modules without Intros**:
    - If a module has no dedicated intro content, the system simply displays the lesson list. No special "empty" intro state is shown to unenrolled users.
2.  **Flat Courses (No Modules)**:
    - The "Module Intro" rule simply does not apply. Only Course Hero and `is_preview` lessons are accessible.
3.  **Partially Populated Intros**:
    - If only some modules have intros, only those specific intros are public. Consistency is the responsibility of the content creator.
4.  **Enrollment Latency**:
    - If a user enrolls but the client state hasn't refreshed, access might be temporarily blocked. The UI should optimistically update or force a re-fetch of enrollment status upon successful enrollment.
=======
#### Data Model
- Courses MAY be organized into modules/sections
- Each module MAY have:
  - `intro_content` (text/markdown)
  - `intro_video_url` (video URL)
  - `intro_poster_url` (video poster image)
- Modules group related lessons together

#### Access Logic
```
IF User.isEnrolled(Course) THEN
  Allow Access (All Content)
ELSE
  IF Content == Course_Hero THEN
    Allow Access
  ELSE IF Content == Module_Intro THEN
    Allow Access (if module has intro content)
  ELSE IF Content.is_preview == TRUE THEN
    Allow Access
  ELSE
    Block Access + Show "Enroll" CTA
  END IF
END IF
```

### FR5: Graceful Handling
- If enrollment lookup fails:
  - Block protected content
  - Show clear CTA or message (Enroll / Access Required)
  - Do not crash learning flow
- If modules don't exist:
  - Fall back to flat course structure
  - Only Course Hero and preview lessons are accessible
- If module has no intro:
  - Simply display lesson list
  - No special "empty" intro state shown
>>>>>>> a0fc567 (feat: Add optimized enrollment gating with module support)

---

## G. Data & Content Model Assumptions

<<<<<<< HEAD
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
=======
### Table: `user_enrollments`

| Field | Type | Notes |
|------|-----|------|
| id | UUID (PK) | |
| user_id | string / uuid | Must match users table |
| course_slug | string | References courses.slug |
| enrolled_at | timestamp | default now() |
| status | enum | `active`, `revoked`, `expired` |
| enrollment_method | string | `manual`, `payment`, `admin` |

**Constraints**
- Unique `(user_id, course_slug)`
- Index `(user_id)`
- Index `(course_slug)`

### Table: `lessons` (Updated)

| Field | Type | Notes |
|------|-----|------|
| id | UUID (PK) | |
| course_slug | string | References courses.slug |
| module_id | UUID (nullable) | References modules.id |
| title | string | |
| type | enum | `intro`, `standard`, `outro`, `quiz` |
| order_index | numeric | |
| is_preview | boolean | Default false |
| video_url | string (nullable) | |
| content | text (nullable) | |
| ... | | |

### Table: `modules` (New - Optional)

| Field | Type | Notes |
|------|-----|------|
| id | UUID (PK) | |
| course_slug | string | References courses.slug |
| title | string | Module name |
| description | text (nullable) | Module description |
| order_index | numeric | Display order |
| intro_content | text (nullable) | Markdown/HTML intro content |
| intro_video_url | string (nullable) | Intro video URL |
| intro_poster_url | string (nullable) | Video poster image |
| created_at | timestamp | |
| updated_at | timestamp | |

**Constraints**
- Unique `(course_slug, order_index)`
- Index `(course_slug)`

**Note**: Modules are optional. Courses can exist without modules (flat structure).

---

## 5. Access Control Implementation

### Server-Side (API)
- `api/middleware/lessonAccess.mjs` enforces access rules
- Functions:
  - `checkLessonAccess(userId, courseSlug, lessonId)` - Check single lesson
  - `checkModuleAccess(userId, courseSlug, moduleId)` - Check module intro access
  - `getCourseAccessSummary(userId, courseSlug)` - Get all access info

### Client-Side (UI)
- `EnrollmentGuard` component protects routes
- `PreviewContentGate` component wraps video players
- Visual indicators: Lock icons, "Enroll to Access" overlays
- Optimistic UI updates after enrollment

### RLS Policies
- Supabase RLS policies enforce database-level security
- Users can only read their own enrollment records
- Public read access for course/lesson metadata
- Protected access for lesson content

---

## 6. UI / UX Requirements

### Enrollment CTA
- Clear "Enroll" or "Start Course" CTA on:
  - Course details page (hero section)
  - Access-blocked lesson screen
  - Module intro sections (for unenrolled users)

### Blocked Access State
- Friendly message explaining access restriction
- Visual overlay on video player for protected content
- CTA to enroll prominently displayed
- No broken navigation or blank screens

### Module Intro Display
- Module intros shown in course outline
- Play button for intro videos (accessible to all)
- Clear visual distinction between intro and lessons
- Smooth transition from intro to first lesson (for enrolled users)

### Deep Link Behavior
- Direct links to protected lessons redirect to course details
- Toast/notification: "Enrollment required to access this lesson"
- Preserve intended destination for post-enrollment redirect

---

## 7. Acceptance Criteria (Definition of Done)

### AC1: Enrollment Persistence
- Given a learner enrolls in a course
- When they refresh or log in on another device
- Then they remain enrolled and can access all content

### AC2: Access Enforcement
- Non-enrolled users cannot access full lessons
- Enrolled users can access all lessons
- Server-side API enforces access rules

### AC3: Preview Access
- Course Hero content accessible without enrollment
- Module intro content accessible without enrollment (if exists)
- Preview lessons accessible without enrollment
- All other content requires enrollment

### AC4: Module Support
- Courses with modules display module structure
- Module intros are publicly accessible
- Courses without modules work correctly (flat structure)
- No errors when modules don't have intro content

### AC5: Deep Link Handling
- Direct links to protected content redirect appropriately
- Clear messaging about enrollment requirement
- No broken states or error pages

### AC6: Failure Handling
- Enrollment lookup failure does not crash learning
- Protected content remains blocked on error
- Clear error messages for users

### AC7: No Regression
- Existing preview flows still work
- No auth or routing regressions
- Performance remains acceptable

---

## 8. Edge Cases

### Modules without Intros
- If a module has no dedicated intro content, the system simply displays the lesson list
- No special "empty" intro state is shown to unenrolled users
- First lesson in module may be marked as preview if desired

### Flat Courses (No Modules)
- The "Module Intro" rule simply does not apply
- Only Course Hero and `is_preview` lessons are accessible
- Existing behavior is preserved

### Partially Populated Intros
- If only some modules have intros, only those specific intros are public
- Consistency is the responsibility of the content creator
- System handles mixed scenarios gracefully

### Enrollment Latency
- If a user enrolls but client state hasn't refreshed, access might be temporarily blocked
- UI should optimistically update or force a re-fetch of enrollment status upon successful enrollment
- Server-side checks are authoritative

### Mixed Content (Modules)
- Given a course has 3 Modules, and Module 2 has a special "Overview Video"
- When I view Module 2 as a guest
- Then I can watch the "Overview Video"
- But I cannot watch "Lesson 2.1" inside that module

---

## 9. Telemetry / Analytics

### Events to Track

**Event**: `preview_content_viewed`  
**Props**: `content_type` (Hero | ModuleIntro | PreviewLesson), `course_id`, `module_id`

**Event**: `access_denied_gating`  
**Props**: `target_resource`, `user_status` (Visitor | Unenrolled), `course_id`, `lesson_id`

**Event**: `enrollment_conversion`  
**Props**: `source` (triggering element, e.g., "locked lesson click" vs "hero enroll button"), `course_id`

**Event**: `module_intro_completed`  
**Props**: `course_id`, `module_id`, `user_status` (Visitor | Enrolled)

---

## 10. Non-Functional Requirements

### Performance
- Enrollment check must be instantaneous (cached in session/client state)
- Prevent UI flicker (showing content then hiding it)
- Module intro videos should load quickly (optimized encoding)

### Security
- API endpoints for fetching lesson content MUST verify enrollment server-side
- Frontend gating is visual only; backend gating is security
- RLS policies enforce database-level access control

### Caching
- Public content (Hero, Module Intros) should be heavily cached
- Content doesn't vary by user, so CDN caching is appropriate
- Enrollment status cached in client session

### Accessibility
- All CTAs keyboard accessible
- Screen reader friendly messaging for blocked content
- Video players support captions and keyboard controls

---

## 11. Testing Requirements

### Unit Tests
- Enrollment creation logic
- Enrollment lookup logic
- Access rule evaluation (with/without modules)
- Module intro access checks

### Integration Tests
- Enroll → access full content
- Logout/login → access still allowed
- Non-enrolled → blocked from protected lessons
- Module intro accessible without enrollment
- Deep link redirect behavior

### Manual Testing Scenarios
1. **Visitor explores course**: Can view hero and module intros, blocked from lessons
2. **User enrolls**: Immediate access to all content
3. **Enrolled user returns**: Access persists across sessions
4. **Deep link to protected lesson**: Redirects to course details
5. **Course without modules**: Works correctly (flat structure)
6. **Module without intro**: No errors, shows lesson list

---

## 12. Migration Path

### Phase 1: Database Schema (Optional - if modules needed)
- Create `modules` table
- Add `module_id` to `lessons` table
- Add module intro fields (`intro_content`, `intro_video_url`)
- Migrate existing courses (if applicable)

### Phase 2: Access Control Logic
- Update `lessonAccess.mjs` to support module intro checks
- Add `checkModuleAccess()` function
- Update `getCourseAccessSummary()` to include module info

### Phase 3: UI Components
- Update `CourseOutline` to display modules
- Add `ModuleIntro` component
- Update `PreviewContentGate` to handle module intros
- Update enrollment CTAs

### Phase 4: Testing & Rollout
- Run test suite
- Manual QA on staging
- Gradual rollout to production
- Monitor analytics for engagement

---

## 13. Open Verification Items

Before finalizing:
1. ✅ Confirm canonical `user_id` used across auth and Supabase
2. ✅ Identify how preview lessons are flagged (`is_preview` field)
3. ✅ Confirm lesson fetch boundaries in learning flow
4. ⏳ Decide if modules table is needed now or deferred
5. ⏳ Define module intro content format (video, text, or both)

---

## 14. Completion Definition

**Done means:**  
- Enrollment is persisted server-side and consistently governs access to full course content
- Course Hero and Module Intros are accessible to all users (when present)
- Protected lessons require enrollment
- Deep links to protected content redirect appropriately
- System handles courses with and without modules gracefully
- No regressions in existing functionality

---

## Appendix A: Logic Summary

```
IF User.isEnrolled(Course) THEN
  Allow Access (All Content)
ELSE
  IF Content == Course_Hero THEN
    Allow Access
  ELSE IF Content == Module_Intro AND Module.has_intro_content THEN
    Allow Access
  ELSE IF Content.is_preview == TRUE THEN
    Allow Access
  ELSE
    Block Access + Show "Enroll" CTA
  END IF
END IF
```

---

## Appendix B: API Endpoints

### GET `/api/courses/:courseSlug/access-summary`
Returns access summary for all lessons and modules in a course.

**Response**:
```json
{
  "success": true,
  "courseSlug": "perfecting-life-transactions",
  "userId": "user-123",
  "isEnrolled": false,
  "modules": [
    {
      "id": "module-1",
      "title": "Introduction to PLT",
      "hasIntro": true,
      "introAccessible": true,
      "lessons": [...]
    }
  ],
  "lessons": [...],
  "summary": {
    "totalLessons": 20,
    "previewLessons": 3,
    "accessibleLessons": 5,
    "blockedLessons": 15
  }
}
```

### GET `/api/courses/:courseSlug/modules/:moduleId/intro`
Returns module intro content (accessible to all users).

### GET `/api/courses/:courseSlug/lessons/:lessonId`
Returns lesson content (enforces enrollment check).

---

**Last Updated**: February 9, 2026  
**Version**: 2.0 (Optimized - Module-Aware)
>>>>>>> a0fc567 (feat: Add optimized enrollment gating with module support)
