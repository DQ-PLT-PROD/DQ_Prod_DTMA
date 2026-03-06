# DTM Instructor Portal — Feature Specification

**Owner**: *Dev TBD*  
**Auth Model**: Supabase Auth for `/instructor/*` (MSAL remains for learner flows)  
**Data Source**: Supabase (all data **must be wired**, no hardcoded overrides)

---

## 0) Mission

Deliver a fully functional **Instructor Portal** for DTMA that enables content creators to:
1. View key content metrics at a glance
2. Manage course classifications
3. Author courses, modules, and lessons
4. Upload and manage media assets

**Primary Constraint**: All views must fetch data from Supabase. Static placeholders are only acceptable for features explicitly marked "Coming Soon."

### 0.1 Admin Authentication Baseline
- Admin entry route: `/admin/login`
- Protected instructor routes: `/instructor/*` (guarded by Supabase session + active `public.admin_memberships` record)
- RBAC source of truth: `public.admin_memberships` (`admin`, `instructor`, `editor`, `viewer`)
- Frontend authorization: CASL ability checks for all content mutations

---

## 1) Feature I1 — Dashboard (Home)

**Route**: `/instructor`

### 1.1 Objective
Provide an at-a-glance summary of the instructor's content.

### 1.2 In Scope
- Metrics grid (wired to Supabase)
- Recent activity / "Continue Editing" section
- Quick action shortcuts

### 1.3 Out of Scope
- Advanced analytics
- Multi-instructor views

### 1.4 Functional Requirements

**FR1: Metrics Grid**
| Metric | Data Source | Status |
|--------|-------------|--------|
| Active Courses | `lms_courses` WHERE `status = 'published'` | Wired |
| Draft Courses | `lms_courses` WHERE `status = 'draft'` | Wired |
| Active Students | `user_enrollments` count | Coming Soon |
| Completion Rate | TBD calculation | Coming Soon |

- Draft Courses: Clicking opens filtered view or navigates to Courses tab with filter.

**FR2: Recent Activity / Continue Editing**
- Display 3–5 most recently modified items (Courses, Modules, Lessons).
- Query: Fetch top 5 by `updated_at` DESC from each table, merge & sort.
- Each item shows:
  - Icon (type indicator)
  - Title
  - Context (e.g., "Draft • 2h ago")
- Action: Click navigates to **Edit** page.

**FR3: Quick Actions**
- "Create Course" → `/instructor/course-management/course/new`
- "Manage Courses" → `/instructor/course-management?tab=courses`

### 1.5 Acceptance Criteria
- [ ] Metrics display live data from Supabase.
- [ ] "Coming Soon" metrics are visually indicated (badge or greyed out).
- [ ] Recent Activity section shows real items.

---

## 2) Feature I2 — Course Management (Tabbed Interface)

**Route**: `/instructor/course-management`

### 2.1 Objective
Centralize all content authoring: Courses, Modules, Lessons, Classifications, and Media.

### 2.2 Critical Design Rules
1. **CTAs**: All "Add New" or primary action buttons **must reside within the tab content**, not in the global page header.
2. **Tab Order**: Courses → Modules → Lessons → Classifications → Media Library.

### 2.3 Current Tab Order (to be corrected)
```
Classifications | Courses | Lessons | Modules | Learning Paths
```
**Required Tab Order:**
```
Courses | Modules | Lessons | Classifications | Media Library
```

---

### 2.4 Tab: Courses

**Order**: 1st

#### 2.4.1 Objective
List and manage courses (Published, Draft, Archived).

#### 2.4.2 Functional Requirements

**FR1: List View**
- Show all courses from `lms_courses`.
- Columns: Title, Status, Actions.
- Courses are the top-level classification. The table must not show Category or Duration.

**FR2: Course Editor Form**
- Route: `/instructor/course-management/course/:id`
- **Fields to RETAIN:**
  - Title (required)
  - Description
  - Status
- **Fields to REMOVE:**
  - Thumbnail / Hero Image
  - Category
  - Duration
  - Provider
  - Delivery Mode
  - Course Type
  - Department
  - Audience
  - SFI / Level Code
  - Intro Video
  - Highlights
  - Outcomes

**FR3: CTA Placement**
- "Add Course" button inside the Courses tab content area, not page header.

#### 2.4.3 Acceptance Criteria
- [ ] Courses list pulls from `lms_courses`.
- [ ] Courses table only shows Title, Status, and Actions.
- [ ] Course forms do not reference categories.

---

### 2.5 Tab: Modules

**Order**: 2nd

#### 2.5.1 Objective
Manage reusable modules that group lessons.

#### 2.5.2 Functional Requirements

**FR1: List View**
- Data Source: `lms_modules` or equivalent.
- Show: Module Title with thumbnail, Course, Length, Status, Actions.

**FR2: Module Editor**
- Route: `/instructor/course-management/module/:id`
- Fields: Module Title, Course Selector, Length, Status, Module Description, Learning Outcomes, Skills Gained, Upon Completion, Thumbnail.
- Thumbnail management must support direct URL entry, Media Library selection, and local upload.

**FR2a: Module Resources**
- Manage learner-facing module resources directly inside the Module Editor.
- Support document upload (for example PDF, worksheet, whitepaper) and manual URL entry.
- Persist resources with an explicit `module_id` relationship so the learner Resources tab reflects module-managed content.

**FR3: Relationships**
- A Module belongs to exactly one Course.
- Database relationship: `modules.course_id -> courses.id`.
- Legacy `course_slug` linkage may remain for compatibility, but `course_id` is the authoritative hierarchy field for modules.

**FR4: CTA Placement**
- "Add Module" inside the Modules tab content area.

#### 2.5.3 Acceptance Criteria
- [ ] Modules list pulls from database.
- [ ] Modules table shows Course, Length, and Status.
- [ ] Can create/edit a module with a required parent course.
- [ ] Module description is editable and appears on the learner module detail page.
- [ ] Learning outcomes, skills gained, and upon completion text are editable per module and appear in the learner Learning Outcomes tab.
- [ ] Resources uploaded in the module editor appear only on that module's learner Resources tab.

---

### 2.6 Tab: Lessons

**Order**: 3rd

#### 2.6.1 Objective
Manage individual lessons.

#### 2.6.2 Functional Requirements

**FR1: List View**
- Data Source: `lessons` table.
- Show: Lesson Title, Video, Order, Duration, Actions.
- Replace the old Type display with a simplified `Video` label.
- Do not show Preview in the lessons table.

**FR2: Lesson Editor**
- Route: `/instructor/course-management/lesson/:id`
- Fields: Lesson Title, Module Selector, Video Upload/Link, Order, Duration.
- Remove Preview controls from the lesson form.

**FR3: Relationships**
- Lessons belong to Modules.
- Database relationship: `lessons.module_id -> modules.id`.
- The UI must derive the course from the selected module.

**FR4: CTA Placement**
- "Add Lesson" inside the Lessons tab content area.

#### 2.6.3 Acceptance Criteria
- [ ] Lessons list pulls from `lessons` table.
- [ ] Lessons table shows only Lesson Title, Video, Order, Duration, and Actions.
- [ ] Lesson create/edit flows require a module selection.

---

### 2.7 Tab: Classifications (Categories)

**Order**: 4th

#### 2.7.1 Objective
Manage Course Categories (6XD Dimensions) and Difficulty Levels.

#### 2.7.2 Functional Requirements

**FR1: Categories Management**
- Display single unified list (no separate "Standard" vs "Custom" sections).
- **Actions:**
  - Add new category (Button: "Add Category").
  - Edit existing category (inline or modal).
- **Warning System:**
  - When editing a category name, display a **confirmation modal** with warning:
    > "Changing this category will affect X courses, Y modules, and Z lessons."
  - Query counts before showing modal.

**FR2: Difficulty Levels**
- Section visible but marked **Coming Soon**.

**FR3: CTA Placement**
- "Add Category" inside the Classifications tab content area.

#### 2.7.3 Acceptance Criteria
- [ ] Can add and edit categories.
- [ ] Warning modal shows impact counts.
- [ ] Difficulty Levels section shows "Coming Soon".

---

### 2.8 Tab: Media Library

**Order**: 5th

#### 2.8.1 Objective
Manage media assets stored in Supabase Storage.

#### 2.8.2 Functional Requirements

**FR1: Storage Buckets**
- Images (thumbnails, hero images)
- Videos (lesson videos, intros)
- Documents (PDFs, resources)

**FR2: Operations**
- Upload file to appropriate bucket.
- List existing files with previews/icons.
- Delete file (with confirmation).
- Copy public URL.

**FR3: CTA Placement**
- "Upload Media" inside the Media Library tab content area.

#### 2.8.3 Acceptance Criteria
- [ ] Can upload, list, delete files from Supabase Storage.
- [ ] Three bucket types supported.

---

## 3) Non-Functional Requirements

### 3.1 Data Wiring
- All displayed counts, lists, and forms must fetch from Supabase.
- No hardcoded demo data in production views.

### 3.2 UX
- Loading skeletons for async data.
- Toast notifications for success/error states.
- Confirmation modals for destructive actions (delete, category rename).

### 3.3 Security
- No service-role keys in browser code.
- RLS is required on `courses`, `lessons`, `modules`, `course_categories`, and `storage.objects` (`lms-content`).
- Admin authorization decisions must not rely on localStorage role toggles.

---

## 4) Implementation Cleanup Checklist

| Item | Location | Action |
|------|----------|--------|
| Global "Add New" button | `CourseManagementPage.tsx` header | Remove (move to tabs) |
| Tab Order | `CourseManagementPage.tsx` tabs array | Reorder to: Courses, Modules, Lessons, Classifications, Media Library |
| Learning Paths tab | `CourseManagementPage.tsx` | Remove or keep as stub (Coming Soon) |
| Course Form fields | `CourseForm.tsx` | Keep only title, description, and status inputs |
| Course category references | `CourseForm.tsx`, `CoursesSection.tsx` | Remove category from top-level course management |
| Module hierarchy | `ModuleForm.tsx`, `ModulesSection.tsx`, database | Store module parent with `course_id`, expose module status/length, manage learner-facing module copy, and persist module-scoped resources |
| Lesson hierarchy | `LessonForm.tsx`, `LessonsSection.tsx` | Require module selection and remove preview UI |
| Media Library tab | `CourseManagementPage.tsx` | Add new component |
| Instructor route guard | `AppRouter.tsx` | Use Supabase-based `AdminProtectedRoute` |

---

## 5) Acceptance Criteria Summary

- [ ] Dashboard wired with live metrics.
- [ ] Tab order: Courses → Modules → Lessons → Classifications → Media Library.
- [ ] No global CTA button in Course Management header.
- [ ] Course Form cleaned up (specified fields removed).
- [ ] Duration auto-calculates from lessons.
- [ ] Category editing shows impact warning.
- [ ] Media Library operational.

---

## 6) Explicit Deferrals (Do NOT Implement)

- Advanced analytics / Completion Rate calculation
- Active Students calculation
- Learning Paths functionality
- Difficulty Levels management
- Multi-instructor / team views
