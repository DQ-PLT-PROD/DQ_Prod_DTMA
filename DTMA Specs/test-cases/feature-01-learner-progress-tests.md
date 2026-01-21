# Test Cases: Feature 01 - Learner Progress Persistence

**Feature Spec**: [feature-01-learner-progress.md](../feature-01-learner-progress.md)

## Test Strategy
These test cases cover the functional requirements (FR) and acceptance criteria (AC) defined in the feature specification.

## 1. Unit Tests (Frontend Service)

### TC-01: Upsert Lesson Progress
**Objective**: Verify `progressService.upsertLessonProgress` sends correct payload.
- **Pre-conditions**: Mock authenticated user.
- **Input**:
  - `courseId`: "course-123"
  - `lessonId`: "lesson-abc"
  - `status`: "in_progress"
  - `progressPercent`: 50
  - `lastPositionSeconds`: 120
- **Expected Output**:
  - `supabase.from('learner_lesson_progress').upsert()` is called.
  - Payload matches input values + `user_id`.
  - `updated_at` is current timestamp.

### TC-02: Get Course Progress
**Objective**: Verify `progressService.getCourseProgress` retrieves and maps data correctly.
- **Pre-conditions**: Mock Supabase response with known progress rows.
- **Input**: `courseId` = "course-123"
- **Expected Output**:
  - Returns array of progress objects.
  - Handles empty response gracefully (returns empty array/null).

### TC-03: Resume Lesson Calculation
**Objective**: Verify logic to determine the "Resume" lesson.
- **Scenario A**: User has progress on Lesson 3 (last accessed).
  - **Expected**: Returns Lesson 3.
- **Scenario B**: User has NO progress.
  - **Expected**: Returns Lesson 1 (default).
- **Scenario C**: User completed Course.
  - **Expected**: Returns Lesson 1 or specific "completed" state handling.

## 2. Integration / E2E Tests (Manual/Automated)

### TC-04: Persist Progress on Video Pause
**Objective**: Verify progress is saved when video is paused.
- **Steps**:
  1. Open Course X, Lesson Y.
  2. Play video to 01:00.
  3. Pause video.
  4. Check Supabase `learner_lesson_progress` table for this user/lesson.
- **Expected Result**:
  - Row exists.
  - `last_position_seconds` is approx 60.
  - `status` is `in_progress`.

### TC-05: Cross-Device Continuity
**Objective**: Verify progress syncs across sessions.
- **Steps**:
  1. Login on Device A (or Browser A).
  2. Watch Lesson Z to 50%.
  3. Login on Device B (or Browser B).
  4. Open Course.
- **Expected Result**:
  - Lesson Z is marked "In Progress".
  - "Resume Learning" button points to Lesson Z.
  - Video player starts at 50% mark.

### TC-06: Lesson Completion
**Objective**: Verify lesson is marked complete.
- **Steps**:
  1. Complete the lesson (watch to end or click "Mark Complete").
  2. Refresh page.
- **Expected Result**:
  - Lesson shows "Completed" checkmark/status in outline.
  - `status` in DB is `completed`.
  - `completed_at` timestamp is set.

### TC-07: Offline/Failure Fallback (Resiliency)
**Objective**: Verify app doesn't crash if backend fails.
- **Steps**:
  1. Simulate network failure (Customer blocked / Offline).
  2. Attempt to load course learning page.
- **Expected Result**:
  - Page loads (possibly with cached/local state).
  - Error logged to console/monitoring.
  - User can still play video/content (graceful degradation).
