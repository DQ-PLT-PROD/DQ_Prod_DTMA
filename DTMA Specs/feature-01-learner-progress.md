
# DTMA Feature Specification 01
## Learner Progress Persistence (Backend)

### Status
Planned – Jan 16 Delivery

### Owner
One Developer (End-to-End Ownership)

---

## 0. Objective

Implement **durable learner progress tracking** so that lesson and course progress is **persisted server-side** (Supabase) and restored consistently across sessions and devices.

### Success Statement
A learner can start a course, leave, sign in on another device, and **resume at the correct lesson and position**, with completion states reflected accurately.

---

## 1. Scope

### In Scope
- Persist lesson progress per authenticated learner
- Restore progress on learning page load
- Track:
  - last accessed lesson per course
  - per-lesson completion state
  - video position (seconds or percent, if available)

### Out of Scope (Explicit)
- XP, badges, leaderboards
- Instructor analytics or reporting
- AI recommendations
- Offline-first sync beyond basic fallback
- Quiz attempt analytics (only completion flag if needed)

---

## 2. User Stories

1. **Resume Learning**  
   As a learner, when I reopen a course, I resume where I left off.

2. **Cross-Device Continuity**  
   As a learner, my progress is the same across devices after login.

3. **Completion Persistence**  
   As a learner, completed lessons remain completed after refresh or logout.

---

## 3. Functional Requirements

### FR1: Progress Write Events
Progress must be written to the backend on:
- Lesson open (update `last_accessed_at`)
- Video progress update (pause/seek/heartbeat if supported)
- Lesson completion

Recommended frequency:
- Every 15–30 seconds OR on pause/seek/navigation.

---

### FR2: Progress Read on Learning Load
When the learning page loads:
- Fetch learner progress for the course
- Determine resume lesson:
  - If last accessed lesson exists → resume it
  - Else → default to first lesson
- Resume video playback at saved position if supported

---

### FR3: Per-Lesson Completion State
The course outline must reflect:
- completed lessons
- current lesson
- not-started lessons

---

### FR4: Fallback Behavior
If backend progress fetch fails:
- Fallback to existing localStorage progress (if present)
- Learning must not crash or block
- Log a non-blocking warning

---

## 4. Data Model (Supabase)

### Preferred Table: `learner_lesson_progress`

| Field | Type | Notes |
|------|-----|------|
| id | UUID (PK) | |
| user_id | string / uuid | Must match existing users table |
| course_id | string / uuid | |
| lesson_id | string / uuid | |
| status | enum/string | `not_started`, `in_progress`, `completed` |
| progress_percent | numeric | 0–100, nullable |
| last_position_seconds | numeric | nullable |
| last_accessed_at | timestamp | default now() |
| completed_at | timestamp | nullable |
| updated_at | timestamp | default now() |

**Constraints**
- Unique `(user_id, lesson_id)` or `(user_id, course_id, lesson_id)`
- Index `(user_id, course_id)`
- Index `(user_id, course_id, last_accessed_at desc)`

Migration file must be added under `supabase/migrations`.

---

## 5. Access Control

- Only authenticated users can read/write their own progress
- Supabase RLS preferred
- Temporary service-level enforcement acceptable for MVP (log as TODO)

---

## 6. Service Layer (Frontend)

Implement a progress service (e.g. `progressService.ts`) with:

- `getCourseProgress(courseId)`
- `upsertLessonProgress({ courseId, lessonId, status, progressPercent?, lastPositionSeconds? })`
- `markLessonComplete({ courseId, lessonId })`

---

## 7. UI / UX Requirements

- No layout redesign
- Learning screen shows skeleton/loading while fetching progress
- Course outline uses backend progress for completion state
- Video resumes from last saved timestamp when supported

---

## 8. Acceptance Criteria (Definition of Done)

### AC1: Persist & Restore
- Given a learner watches a lesson to ~60s
- When they return later
- Then playback resumes at ~60s (±10s)

### AC2: Completion Persistence
- Completed lessons remain completed after refresh/logout

### AC3: Resume Pointer
- Last accessed lesson auto-opens on learning page load

### AC4: Backend Failure Handling
- Learning page does not crash if Supabase is unavailable
- Local fallback is used if present
- Error is logged

### AC5: No Regression
- Existing learning flow continues to work
- No breaking auth or routing changes

---

## 9. Testing Requirements

### Unit Tests
- Progress upsert payload correctness
- Resume lesson selection logic

### Manual Integration Checks (MVP-Acceptable)
- DB writes occur
- Cross-device resume works
- Completion persists

---

## 10. Rollout

- Feature enabled by default
- Fallback to localStorage retained for resilience
- No new feature flag required

---

## 11. Open Verification Items (Codex Check)

Before finalizing:
1. Confirm canonical `user_id` used in Supabase
2. Confirm `course_id` and `lesson_id` types/naming
3. Locate existing localStorage progress keys for fallback

---

## Completion Definition (One Line)

**Done means:**  
Progress is stored server-side, restored reliably, and learning resumes correctly across sessions and devices.
