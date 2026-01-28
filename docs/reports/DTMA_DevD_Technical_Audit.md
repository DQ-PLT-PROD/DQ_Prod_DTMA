# DTMA Dev D Technical Audit - Frozen Contracts

**Date:** January 2026  
**Target:** MVP 1.0 (Jan 29, 2026)  
**Scope:** Discovery & Assist Layer Frozen Contracts

---

## Executive Summary

This audit documents the **existing frozen contracts** that Dev D (Discovery & Assist) must consume for the DTMA MVP 1.0. All contracts are **read-only** for Dev D and are owned by other development teams.

**Status:** ✅ All required contracts exist and are functional  
**Gaps Identified:** 2 minor gaps (saved courses persistence, AI deep-linking metadata)  
**Recommendation:** Proceed with implementation using documented workarounds

---

## 1. Course Catalog Service

### 1.1 Overview

**Owner:** Dev A (Content & Curriculum)  
**Status:** ✅ Fully Implemented  
**Location:** `src/features/courses/services/courseService.ts`

### 1.2 API Endpoints

#### `fetchCourses(filters?: CourseCatalogFilters): Promise<Course[]>`

Fetches published courses with optional filtering.

**Parameters:**

```typescript
interface CourseCatalogFilters {
  search?: string; // Text search across title and description
  categories?: string[]; // Filter by category IDs
  audienceLevels?: AudienceLevel[]; // "Digital Leaders" | "Digital Workers"
  topics?: string[]; // Filter by topic tags
  levelTags?: string[]; // Filter by level tags
  industries?: string[]; // Filter by industry
}
```

**Returns:**

```typescript
interface Course {
  id: string;
  slug: string;
  title: string;
```

shortDescription: string;
longDescription?: string;
categoryId: string;
audienceLevel: AudienceLevel;
topicTags: string[];
levelTag: string;
estimatedDurationMinutes: number;
lessonCount: number;
heroImageUrl?: string;
thumbnailUrl?: string;
introVideoUrl?: string;
introVideoPosterUrl?: string;
isFeatured?: boolean;
isComingSoon?: boolean;
status?: "draft" | "published";
rating?: number;
reviewCount?: number;
enrollmentUrl?: string;
learningOutcomes?: string[];
skillsGained?: string[];
uponCompletion?: string;
startDate?: string;
industry?: string;
}

````

**Behavior:**
- Only returns courses with `status = "published"`
- Automatically orders: available courses first (`is_coming_soon = false`), then by creation date
- Includes category name via join with `course_categories` table
- Returns empty array if Supabase not configured

**Example Usage:**
```typescript
// Get all published courses
const courses = await fetchCourses();

// Get filtered courses
const leadershipCourses = await fetchCourses({
  categories: ['leadership'],
  audienceLevels: ['Digital Leaders']
});
````

#### `fetchFullCourse(slug: string): Promise<Course | null>`

Fetches complete course details by slug.

**Parameters:**

- `slug`: Course identifier (e.g., "digital-transformation-101")

**Returns:** Full `Course` object or `null` if not found

**Example Usage:**

```typescript
const course = await fetchFullCourse("digital-transformation-101");
```

#### `fetchCategories(): Promise<Category[]>`

Fetches all course categories.

**Returns:**

```typescript
interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
}
```

**Example Usage:**

```typescript
const categories = await fetchCategories();
```

### 1.3 Database Schema

**Table:** `courses`  
**Access:** Public read-only (RLS enabled)

**Key Fields for Dev D:**

- `title` - Course title for display
- `short_description` - Brief description for cards
- `long_description` - Full description for details page
- `estimated_duration_minutes` - Duration for display
- `lesson_count` - Number of lessons
- `category_id` - Category for filtering
- `audience_level` - Target audience
- `topic_tags` - Array of topic strings
- `level_tag` - Difficulty level
- `is_featured` - Featured flag
- `is_coming_soon` - Coming soon flag
- `status` - Publication status

### 1.4 Dev D Requirements Coverage

| Requirement                  | Status     | Notes                                      |
| ---------------------------- | ---------- | ------------------------------------------ |
| FR1: Course listing          | ✅ Covered | `fetchCourses()` returns published courses |
| FR2: Course details          | ✅ Covered | `fetchFullCourse()` provides all metadata  |
| Title, Description, Duration | ✅ Covered | All fields available in Course type        |
| Instructor name              | ⚠️ Partial | Not in current schema - use placeholder    |
| Category filtering           | ✅ Covered | `categories` filter parameter              |
| Role track filtering         | ✅ Covered | `audienceLevel` filter parameter           |

**Gap:** Instructor name not in schema. **Workaround:** Display "DTMA Academy" as default instructor.

---

## 2. Learner Profile Signals

### 2.1 Overview

**Owner:** Dev A (User Management)  
**Status:** ✅ Fully Implemented  
**Location:** `src/features/learner/services/learnerProfileService.ts`

### 2.2 API Endpoints

#### `getLearnerProfile(azureUserId: string): Promise<LearnerProfileResult>`

Fetches learner profile for recommendations.

**Returns:**

```typescript
interface LearnerProfile {
  azureUserId: string;
  roleTrack: RoleTrack | null; // "digital_worker" | "leader"
  goals: string[]; // Array of goal strings
  preferences: string[]; // Array of preference strings
  onboardingCompleted: boolean;
  onboardingCompletedAt: string | null;
}

interface LearnerProfileResult {
  profile: LearnerProfile | null;
  error: Error | null;
}
```

**Example Usage:**

```typescript
const { profile, error } = await getLearnerProfile(user.azureUserId);

if (profile) {
  // Use profile.roleTrack for recommendations
  // Use profile.goals for goal-based filtering
}
```

### 2.3 Role Track Values

```typescript
type RoleTrack = "digital_worker" | "leader";
```

**Mapping to Course Audience Levels:**

- `"leader"` → Filter courses with `audienceLevel = "Digital Leaders"`
- `"digital_worker"` → Filter courses with `audienceLevel = "Digital Workers"`

### 2.4 Goals and Preferences

**Structure:** Array of strings (free-form)

**Common Goal Examples:**

- "Security"
- "Leadership Development"
- "Digital Transformation"
- "Data Analytics"

**Usage for Recommendations:**

- Match goal strings against course `topicTags` array
- Case-insensitive matching recommended
- Partial string matching for flexibility

### 2.5 Database Schema

**Table:** `users`  
**Access:** RLS protected (user can read own data)

**Key Fields for Dev D:**

- `role_track` - User's role track
- `goals` - Array of goal strings
- `preferences` - Array of preference strings
- `onboarding_completed` - Whether onboarding is done

### 2.6 Dev D Requirements Coverage

| Requirement       | Status     | Notes                         |
| ----------------- | ---------- | ----------------------------- |
| role_track field  | ✅ Covered | Available as `roleTrack`      |
| goals field       | ✅ Covered | Array of strings              |
| preferences field | ✅ Covered | Array of strings              |
| Read-only access  | ✅ Covered | Service provides read methods |

---

## 3. Enrollment State

### 3.1 Overview

**Owner:** Dev A (Enrollment Management)  
**Status:** ✅ Fully Implemented  
**Location:** `src/features/courses/services/enrollmentService.ts`

### 3.2 API Endpoints

#### `getAccessContract(userId: string | null, courseSlug: string): Promise<AccessContract>`

**AUTHORITATIVE** function for determining enrollment status.

**Returns:**

```typescript
interface AccessContract {
  isEnrolled: boolean; // Primary enrollment flag
  enrollmentStatus: "active" | "cancelled" | "expired" | null;
  subscriptionStatus?: "active" | "inactive" | null;
}
```

**Behavior:**

- Returns `isEnrolled: false` for unauthenticated users
- Returns `isEnrolled: true` only if `enrollmentStatus === 'active'`
- Includes subscription status for future use

**Example Usage:**

```typescript
const accessContract = await getAccessContract(user.id, courseSlug);

if (accessContract.isEnrolled) {
  // Show "Continue" CTA
} else {
  // Show "Enroll" CTA
}
```

#### `isUserEnrolled(userId: string, courseSlug: string): Promise<boolean>`

Simplified enrollment check (returns boolean only).

**Example Usage:**

```typescript
const enrolled = await isUserEnrolled(user.id, "digital-transformation-101");
```

### 3.3 CTA Logic for Dev D

**Recommended CTA State Machine:**

```typescript
function getCourseCtaState(accessContract: AccessContract, course: Course) {
  // Coming soon courses
  if (course.isComingSoon) {
    return { label: "Coming Soon", disabled: true, action: null };
  }

  // Enrolled users
  if (accessContract.isEnrolled) {
    return { label: "Continue", disabled: false, action: "navigate-to-player" };
  }

  // Not enrolled
  return { label: "Enroll", disabled: false, action: "navigate-to-enroll" };
}
```

**Note:** Dev D should NOT implement enrollment logic - only display appropriate CTAs.

### 3.4 Database Schema

**Table:** `user_enrollments`  
**Access:** Service role (bypasses RLS for Azure AD users)

**Key Fields:**

- `user_id` - User UUID
- `course_slug` - Course identifier
- `status` - 'active' | 'cancelled' | 'expired'
- `started_at` - Enrollment timestamp
- `progress_pct` - Progress percentage (0-100)

### 3.5 Dev D Requirements Coverage

| Requirement      | Status     | Notes                               |
| ---------------- | ---------- | ----------------------------------- |
| isEnrolled flag  | ✅ Covered | Available in AccessContract         |
| isCompleted flag | ⚠️ Partial | Use `progress_pct === 100` as proxy |
| CTA state logic  | ✅ Covered | Can derive from AccessContract      |
| Read-only access | ✅ Covered | Service provides read methods       |

**Gap:** No explicit `isCompleted` boolean. **Workaround:** Check `progress_pct === 100` or add to future schema.

---

## 4. Saved Courses Contract

### 4.1 Overview

**Owner:** Dev A (User Preferences)  
**Status:** ⚠️ **NOT IMPLEMENTED** - UI exists but no persistence  
**Location:** `src/features/courses/pages/CourseCatalogPage.tsx` (UI only)

### 4.2 Current Implementation

**What Exists:**

- UI state management in `CourseCatalogPage`
- `bookmarkedItems` state (array of course IDs)
- `toggleBookmark` function
- Visual indicators in course cards

**What's Missing:**

- Database table for saved courses
- API endpoints for persistence
- Cross-session persistence

**Current Code:**

```typescript
// In CourseCatalogPage.tsx
const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);

const toggleBookmark = useCallback((itemId: string) => {
  setBookmarkedItems((prev) => {
    return prev.includes(itemId)
      ? prev.filter((id) => id !== itemId)
      : [...prev, itemId];
  });
}, []);
```

### 4.3 Required Contract (Not Yet Implemented)

**Proposed API:**

```typescript
// Save a course
async function saveCourse(userId: string, courseSlug: string): Promise<boolean>;

// Unsave a course
async function unsaveCourse(
  userId: string,
  courseSlug: string
): Promise<boolean>;

// Get saved courses for user
async function getSavedCourses(userId: string): Promise<string[]>;

// Check if course is saved
async function isCourseSaved(
  userId: string,
  courseSlug: string
): Promise<boolean>;
```

**Proposed Database Schema:**

```sql
CREATE TABLE user_saved_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL REFERENCES courses(slug) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_slug)
);

CREATE INDEX idx_user_saved_courses_user_id ON user_saved_courses(user_id);
```

### 4.4 Dev D Requirements Coverage

| Requirement               | Status     | Notes                         |
| ------------------------- | ---------- | ----------------------------- |
| Save course action        | ⚠️ UI Only | No persistence layer          |
| Unsave course action      | ⚠️ UI Only | No persistence layer          |
| Saved state display       | ✅ Covered | UI state works                |
| Cross-session persistence | ❌ Missing | Needs database implementation |

### 4.5 Recommended Workaround for MVP

**Option 1: LocalStorage (Quick MVP)**

```typescript
// Temporary persistence using localStorage
function saveCourseLocal(userId: string, courseSlug: string) {
  const key = `saved_courses_${userId}`;
  const saved = JSON.parse(localStorage.getItem(key) || "[]");
  if (!saved.includes(courseSlug)) {
    saved.push(courseSlug);
    localStorage.setItem(key, JSON.stringify(saved));
  }
}

function getSavedCoursesLocal(userId: string): string[] {
  const key = `saved_courses_${userId}`;
  return JSON.parse(localStorage.getItem(key) || "[]");
}
```

**Option 2: Defer Feature**

- Mark save/unsave buttons as "Coming Soon"
- Focus on other MVP features
- Implement properly post-MVP

**Recommendation:** Use Option 1 (localStorage) for MVP, migrate to database post-launch.

---

## 5. AI Widget Deep-Linking Requirements

### 5.1 Overview

**Requirement:** AI widget needs to deep-link to courses, categories, and pages  
**Status:** ✅ Routing exists, metadata needs enhancement

### 5.2 Available Routes

**Public Routes:**

- `/` - Landing page
- `/courses` - Course catalog
- `/courses/:slug` - Course details page

**Protected Routes (require auth):**

- `/dashboard` - User dashboard
- `/portal/my-courses/in-progress` - In-progress courses
- `/portal/learning/:courseId` - Course player

### 5.3 Deep-Linking Metadata

**What Exists:**

```typescript
// Course metadata available for linking
interface Course {
  slug: string; // For URL construction
  title: string; // For link text
  categoryId: string; // For category filtering
  shortDescription: string; // For context
}

// Category metadata
interface Category {
  slug: string; // For URL construction
  name: string; // For link text
}
```

**Example Deep Links:**

```typescript
// Link to specific course
const courseLink = `/courses/${course.slug}`;

// Link to category-filtered catalog
const categoryLink = `/courses?category=${category.slug}`;

// Link to search results
const searchLink = `/courses?search=${encodeURIComponent(query)}`;
```

### 5.4 AI Widget Intent Mapping

**Recommended Intent → Deep Link Mapping:**

| User Intent                   | Deep Link                        | Data Source                    |
| ----------------------------- | -------------------------------- | ------------------------------ |
| "Show me leadership courses"  | `/courses?category=leadership`   | `fetchCategories()`            |
| "What courses are available?" | `/courses`                       | Static route                   |
| "Tell me about [course name]" | `/courses/{slug}`                | `fetchCourses()` + fuzzy match |
| "How do I enroll?"            | `/courses` + scroll to CTA       | Static route                   |
| "Show my progress"            | `/portal/my-courses/in-progress` | Static route (auth required)   |
| "What is DTMA?"               | `/`                              | Static route                   |

### 5.5 Required Metadata Enhancements

**Gap:** No course keywords/synonyms for fuzzy matching

**Proposed Enhancement:**

```typescript
// Add to Course type (optional for MVP)
interface Course {
  // ... existing fields
  keywords?: string[]; // ["leadership", "management", "team building"]
  synonyms?: string[]; // ["lead", "manage", "supervise"]
}
```

**Workaround for MVP:**

- Use simple string matching on `title` and `shortDescription`
- Maintain manual intent → course mapping in AI widget
- Example: "leadership" → filter by `categoryId === 'leadership'`

### 5.6 Dev D Requirements Coverage

| Requirement              | Status          | Notes                                 |
| ------------------------ | --------------- | ------------------------------------- |
| Deep links to courses    | ✅ Covered      | Use `/courses/{slug}`                 |
| Deep links to catalog    | ✅ Covered      | Use `/courses` with query params      |
| Deep links to categories | ✅ Covered      | Use category filter param             |
| Course search/matching   | ⚠️ Basic        | Text search available, no fuzzy match |
| Intent recognition       | ❌ Not Provided | Dev D must implement                  |

**Recommendation:** Implement simple keyword matching in AI widget, enhance with fuzzy matching post-MVP.

---

## 6. Recommendation Engine Data Requirements

### 6.1 Overview

**Requirement:** Rule-based recommendations using profile + catalog data  
**Status:** ✅ All required data available

### 6.2 Input Signals Available

**From Learner Profile:**

```typescript
{
  roleTrack: "digital_worker" | "leader" | null,
  goals: string[],              // e.g., ["Security", "Leadership"]
  preferences: string[]         // e.g., ["Video-based", "Short courses"]
}
```

**From Course Catalog:**

```typescript
{
  categoryId: string,           // e.g., "leadership"
  audienceLevel: AudienceLevel, // "Digital Leaders" | "Digital Workers"
  topicTags: string[],          // e.g., ["security", "compliance"]
  levelTag: string,             // e.g., "Beginner", "Advanced"
  estimatedDurationMinutes: number,
  isFeatured: boolean
}
```

**From Enrollment State:**

```typescript
{
  isEnrolled: boolean,
  enrollmentStatus: 'active' | 'cancelled' | 'expired' | null
}
```

### 6.3 Recommended Rule Examples

**Rule 1: Role-Based Recommendations**

```typescript
function recommendByRole(profile: LearnerProfile, courses: Course[]): Course[] {
  if (!profile.roleTrack) return [];

  const audienceLevel =
    profile.roleTrack === "leader" ? "Digital Leaders" : "Digital Workers";

  return courses.filter((c) => c.audienceLevel === audienceLevel).slice(0, 3);
}
```

**Rule 2: Goal-Based Recommendations**

```typescript
function recommendByGoals(
  profile: LearnerProfile,
  courses: Course[]
): Course[] {
  if (!profile.goals.length) return [];

  return courses
    .filter((c) =>
      c.topicTags.some((tag) =>
        profile.goals.some((goal) =>
          tag.toLowerCase().includes(goal.toLowerCase())
        )
      )
    )
    .slice(0, 3);
}
```

**Rule 3: Featured Courses Fallback**

```typescript
function recommendFeatured(courses: Course[]): Course[] {
  return courses.filter((c) => c.isFeatured && !c.isComingSoon).slice(0, 3);
}
```

**Rule 4: Composite Recommendation Strategy**

```typescript
function getRecommendations(
  profile: LearnerProfile | null,
  courses: Course[],
  enrollments: string[]
): Array<{ course: Course; reason: string }> {
  // Filter out enrolled courses
  const available = courses.filter((c) => !enrollments.includes(c.slug));

  // Try role-based first
  if (profile?.roleTrack) {
    const roleMatches = recommendByRole(profile, available);
    if (roleMatches.length > 0) {
      return roleMatches.map((c) => ({
        course: c,
        reason: "Based on your role",
      }));
    }
  }

  // Try goal-based
  if (profile?.goals.length) {
    const goalMatches = recommendByGoals(profile, available);
    if (goalMatches.length > 0) {
      return goalMatches.map((c) => ({
        course: c,
        reason: "Based on your goals",
      }));
    }
  }

  // Fallback to featured
  return recommendFeatured(available).map((c) => ({
    course: c,
    reason: "Featured course",
  }));
}
```

### 6.4 Explainability Requirements

**Required "Why" Labels:**

- "Based on your role" - When matched by `roleTrack`
- "Based on your goals" - When matched by `goals`
- "Featured course" - When using featured fallback
- "Popular in [category]" - When using category popularity
- "Recommended for beginners" - When matched by `levelTag`

### 6.5 Dev D Requirements Coverage

| Requirement          | Status     | Notes                          |
| -------------------- | ---------- | ------------------------------ |
| Role track matching  | ✅ Covered | Map to `audienceLevel`         |
| Goal matching        | ✅ Covered | Match against `topicTags`      |
| Enrollment filtering | ✅ Covered | Use `getAccessContract()`      |
| Explainability       | ✅ Covered | All data available for reasons |
| Deterministic output | ✅ Covered | Rule-based, no randomness      |

---

## 7. Gap Summary & Recommendations

### 7.1 Critical Gaps (Blockers)

**None identified.** All core contracts exist and are functional.

### 7.2 Minor Gaps (Workarounds Available)

| Gap                                | Impact | Workaround                     | Priority |
| ---------------------------------- | ------ | ------------------------------ | -------- |
| Instructor name not in schema      | Low    | Use "DTMA Academy" placeholder | P3       |
| No explicit `isCompleted` flag     | Low    | Use `progress_pct === 100`     | P3       |
| Saved courses not persisted        | Medium | Use localStorage for MVP       | P2       |
| No course keywords for AI matching | Low    | Manual intent mapping          | P3       |

### 7.3 Recommendations for Dev D

**Immediate Actions (Pre-Development):**

1. ✅ Use documented APIs as-is
2. ✅ Implement localStorage for saved courses
3. ✅ Create manual intent → course mapping for AI widget
4. ✅ Use "DTMA Academy" as default instructor

**Post-MVP Enhancements (Coordinate with Dev A):**

1. Add `instructor_name` field to courses table
2. Add `is_completed` boolean to user_enrollments table
3. Implement `user_saved_courses` table and API
4. Add `keywords` array to courses for better AI matching

### 7.4 Integration Testing Checklist

**Before Jan 29 Launch:**

- [ ] Verify `fetchCourses()` returns only published courses
- [ ] Confirm `getAccessContract()` correctly identifies enrolled users
- [ ] Test `getLearnerProfile()` with various role tracks
- [ ] Validate deep links work for all course slugs
- [ ] Test recommendation rules with sample profiles
- [ ] Verify localStorage saved courses persist across sessions
- [ ] Test AI widget deep links navigate correctly

---

## 8. Code Examples for Dev D

### 8.1 Landing Page - Featured Courses

```typescript
import { fetchCourses } from "@/features/courses/services/courseService";

export function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    async function loadFeaturedCourses() {
      const allCourses = await fetchCourses();
      const featured = allCourses
        .filter((c) => c.isFeatured && !c.isComingSoon)
        .slice(0, 6);
      setCourses(featured);
    }
    loadFeaturedCourses();
  }, []);

  return (
    <div>
      <h2>Featured Courses</h2>
      <CourseGrid courses={courses} />
    </div>
  );
}
```

### 8.2 Course Catalog - With Filtering

```typescript
import {
  fetchCourses,
  fetchCategories,
} from "@/features/courses/services/courseService";

export function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      const filters = selectedCategory
        ? { categories: [selectedCategory] }
        : undefined;

      const results = await fetchCourses(filters);
      setCourses(results);
    }
    loadCourses();
  }, [selectedCategory]);

  return (
    <div>
      <CategoryFilter onChange={setSelectedCategory} />
      <CourseGrid courses={courses} />
    </div>
  );
}
```

### 8.3 Course Details - CTA Logic

```typescript
import { fetchFullCourse } from "@/features/courses/services/courseService";
import { getAccessContract } from "@/features/courses/services/enrollmentService";
import { useAuth } from "@/components/Header";

export function CourseDetails({ slug }: { slug: string }) {
  const { user, databaseUser } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [accessContract, setAccessContract] = useState<AccessContract | null>(
    null
  );

  useEffect(() => {
    async function loadCourse() {
      const courseData = await fetchFullCourse(slug);
      setCourse(courseData);

      if (databaseUser?.id) {
        const access = await getAccessContract(databaseUser.id, slug);
        setAccessContract(access);
      }
    }
    loadCourse();
  }, [slug, databaseUser?.id]);

  const getCtaLabel = () => {
    if (course?.isComingSoon) return "Coming Soon";
    if (accessContract?.isEnrolled) return "Continue Learning";
    return "Enroll Now";
  };

  const handleCtaClick = () => {
    if (course?.isComingSoon) return;

    if (accessContract?.isEnrolled) {
      // Navigate to course player
      navigate(`/portal/learning/${slug}`);
    } else {
      // Navigate to enrollment (handled by Dev A)
      navigate(`/courses/${slug}/enroll`);
    }
  };

  return (
    <div>
      <h1>{course?.title}</h1>
      <p>{course?.longDescription}</p>
      <button onClick={handleCtaClick} disabled={course?.isComingSoon}>
        {getCtaLabel()}
      </button>
    </div>
  );
}
```

### 8.4 Recommendations - Rule-Based

```typescript
import { fetchCourses } from "@/features/courses/services/courseService";
import { getLearnerProfile } from "@/features/learner/services/learnerProfileService";
import { getUserEnrollments } from "@/features/courses/services/enrollmentService";
import { useAuth } from "@/components/Header";

export function RecommendationsSection() {
  const { databaseUser } = useAuth();
  const [recommendations, setRecommendations] = useState<
    Array<{
      course: Course;
      reason: string;
    }>
  >([]);

  useEffect(() => {
    async function loadRecommendations() {
      if (!databaseUser?.azure_user_id) return;

      // Fetch all required data
      const [allCourses, profileResult, enrollments] = await Promise.all([
        fetchCourses(),
        getLearnerProfile(databaseUser.azure_user_id),
        getUserEnrollments(databaseUser.id),
      ]);

      const profile = profileResult.profile;
      const enrolledSlugs = enrollments.map((e) => e.courseSlug);

      // Filter out enrolled courses
      const available = allCourses.filter(
        (c) => !enrolledSlugs.includes(c.slug)
      );

      // Apply recommendation rules
      const recommended = getRecommendations(profile, available);
      setRecommendations(recommended);
    }

    loadRecommendations();
  }, [databaseUser]);

  function getRecommendations(
    profile: LearnerProfile | null,
    courses: Course[]
  ): Array<{ course: Course; reason: string }> {
    // Rule 1: Role-based
    if (profile?.roleTrack) {
      const audienceLevel =
        profile.roleTrack === "leader" ? "Digital Leaders" : "Digital Workers";

      const roleMatches = courses
        .filter((c) => c.audienceLevel === audienceLevel)
        .slice(0, 3);

      if (roleMatches.length > 0) {
        return roleMatches.map((c) => ({
          course: c,
          reason: "Based on your role",
        }));
      }
    }

    // Rule 2: Goal-based
    if (profile?.goals && profile.goals.length > 0) {
      const goalMatches = courses
        .filter((c) =>
          c.topicTags.some((tag) =>
            profile.goals.some((goal) =>
              tag.toLowerCase().includes(goal.toLowerCase())
            )
          )
        )
        .slice(0, 3);

      if (goalMatches.length > 0) {
        return goalMatches.map((c) => ({
          course: c,
          reason: "Based on your goals",
        }));
      }
    }

    // Rule 3: Featured fallback
    return courses
      .filter((c) => c.isFeatured && !c.isComingSoon)
      .slice(0, 3)
      .map((c) => ({
        course: c,
        reason: "Featured course",
      }));
  }

  return (
    <div>
      <h2>Recommended for You</h2>
      {recommendations.map(({ course, reason }) => (
        <CourseCard key={course.slug} course={course} badge={reason} />
      ))}
    </div>
  );
}
```

### 8.5 AI Widget - Intent Handling

```typescript
interface Intent {
  pattern: RegExp;
  response: string;
  deepLink?: string;
}

const intents: Intent[] = [
  {
    pattern: /what is dtma|about dtma/i,
    response:
      "DTMA (Digital Transformation Management Academy) is a learning platform for digital transformation. Browse our courses to get started!",
    deepLink: "/courses",
  },
  {
    pattern: /leadership courses|leader.*course/i,
    response:
      "We have several leadership courses available. Check them out here:",
    deepLink: "/courses?category=leadership",
  },
  {
    pattern: /how.*enroll|sign up|register/i,
    response:
      "To enroll in a course, browse our catalog, select a course, and click 'Enroll Now'. You'll need to sign in first.",
    deepLink: "/courses",
  },
  {
    pattern: /my progress|my courses/i,
    response: "You can view your course progress in your dashboard:",
    deepLink: "/portal/my-courses/in-progress",
  },
  {
    pattern: /available courses|course list|what courses/i,
    response: "Browse all available courses in our catalog:",
    deepLink: "/courses",
  },
];

export function AIWidget() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{
      text: string;
      sender: "user" | "ai";
      link?: string;
    }>
  >([]);

  const handleSubmit = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);

    // Find matching intent
    const match = intents.find((intent) => intent.pattern.test(input));

    if (match) {
      setMessages((prev) => [
        ...prev,
        {
          text: match.response,
          sender: "ai",
          link: match.deepLink,
        },
      ]);
    } else {
      // Fallback response
      setMessages((prev) => [
        ...prev,
        {
          text: "I can help you find courses and answer questions about DTMA. Try asking about available courses or how to enroll!",
          sender: "ai",
          link: "/courses",
        },
      ]);
    }

    setInput("");
  };

  return (
    <div className="ai-widget">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
            {msg.link && (
              <a href={msg.link} className="deep-link">
                View →
              </a>
            )}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Ask me anything..."
      />
    </div>
  );
}
```

---

## 9. API Reference Quick Guide

### Course Catalog Service

```typescript
// Location: src/features/courses/services/courseService.ts

fetchCourses(filters?: CourseCatalogFilters): Promise<Course[]>
fetchFullCourse(slug: string): Promise<Course | null>
fetchCategories(): Promise<Category[]>
```

### Learner Profile Service

```typescript
// Location: src/features/learner/services/learnerProfileService.ts

getLearnerProfile(azureUserId: string): Promise<LearnerProfileResult>
```

### Enrollment Service

```typescript
// Location: src/features/courses/services/enrollmentService.ts

getAccessContract(userId: string | null, courseSlug: string): Promise<AccessContract>
isUserEnrolled(userId: string, courseSlug: string): Promise<boolean>
getUserEnrollments(userId: string): Promise<CourseEnrollment[]>
```

### Authentication Context

```typescript
// Location: src/components/Header/context/AuthContext.tsx

const { user, databaseUser, isLoading } = useAuth();

// user: UserProfile | null - Azure AD user info
// databaseUser: DatabaseUser | null - Supabase user record
// isLoading: boolean - Auth state loading
```

---

## 10. Contact & Support

**For Contract Questions:**

- Course Catalog: Dev A (Content Team)
- Enrollment State: Dev A (Enrollment Team)
- Learner Profile: Dev A (User Management Team)

**For Integration Issues:**

- Slack: #dev-d-discovery
- Email: dev-team@dtma.com

**Documentation Updates:**

- This document: `docs/DTMA_DevD_Technical_Audit.md`
- Last updated: January 2026
- Version: 1.0

---

## Appendix A: Database Schema Reference

### Courses Table

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  category_id TEXT,
  audience_level TEXT,
  topic_tags TEXT[],
  level_tag TEXT,
  estimated_duration_minutes NUMERIC,
  lesson_count NUMERIC,
  hero_image_url TEXT,
  thumbnail_url TEXT,
  intro_video_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_coming_soon BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Users Table (Profile Fields)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  azure_user_id TEXT UNIQUE NOT NULL,
  role_track TEXT,  -- 'digital_worker' | 'leader'
  goals TEXT[],
  preferences TEXT[],
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### User Enrollments Table

```sql
CREATE TABLE user_enrollments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  course_slug TEXT REFERENCES courses(slug),
  status TEXT DEFAULT 'active',  -- 'active' | 'cancelled' | 'expired'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  progress_pct NUMERIC DEFAULT 0,
  enrollment_method TEXT DEFAULT 'explicit',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

**End of Technical Audit**
