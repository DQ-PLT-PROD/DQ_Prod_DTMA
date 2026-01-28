# DTMA Dev D - Quick Reference Guide

**Target:** MVP 1.0 (Jan 29, 2026)  
**Full Audit:** See `DTMA_DevD_Technical_Audit.md`

---

## ✅ Contract Status Summary

| Contract                | Status     | Owner | Notes                    |
| ----------------------- | ---------- | ----- | ------------------------ |
| Course Catalog Service  | ✅ Ready   | Dev A | Fully functional         |
| Learner Profile Signals | ✅ Ready   | Dev A | Fully functional         |
| Enrollment State        | ✅ Ready   | Dev A | Fully functional         |
| Saved Courses           | ⚠️ UI Only | Dev A | Use localStorage for MVP |

---

## 🚀 Quick Start APIs

### Get Published Courses

```typescript
import { fetchCourses } from "@/features/courses/services/courseService";

const courses = await fetchCourses();
const filtered = await fetchCourses({ categories: ["leadership"] });
```

### Check Enrollment Status

```typescript
import { getAccessContract } from "@/features/courses/services/enrollmentService";

const access = await getAccessContract(userId, courseSlug);
if (access.isEnrolled) {
  // Show "Continue" CTA
}
```

### Get User Profile for Recommendations

```typescript
import { getLearnerProfile } from "@/features/learner/services/learnerProfileService";

const { profile } = await getLearnerProfile(azureUserId);
// profile.roleTrack: "digital_worker" | "leader"
// profile.goals: string[]
```

---

## 📋 CTA State Logic

```typescript
function getCtaState(course: Course, access: AccessContract) {
  if (course.isComingSoon) return "Coming Soon";
  if (access.isEnrolled) return "Continue Learning";
  return "Enroll Now";
}
```

---

## 🎯 Recommendation Rules

1. **Role-based:** Match `profile.roleTrack` to `course.audienceLevel`
2. **Goal-based:** Match `profile.goals` to `course.topicTags`
3. **Featured fallback:** Use `course.isFeatured` courses

**Explainability:**

- "Based on your role"
- "Based on your goals"
- "Featured course"

---

## 🤖 AI Widget Deep Links

| Intent               | Deep Link                        |
| -------------------- | -------------------------------- |
| "Show courses"       | `/courses`                       |
| "Leadership courses" | `/courses?category=leadership`   |
| "Course details"     | `/courses/{slug}`                |
| "My progress"        | `/portal/my-courses/in-progress` |

---

## ⚠️ Known Gaps & Workarounds

1. **Saved Courses:** Use localStorage (no database yet)
2. **Instructor Name:** Use "DTMA Academy" placeholder
3. **isCompleted Flag:** Use `progress_pct === 100`
4. **Course Keywords:** Manual intent mapping in AI widget

---

## 📞 Support

- Full Documentation: `docs/DTMA_DevD_Technical_Audit.md`
- Slack: #dev-d-discovery
- Questions: Contact Dev A teams for contract clarifications
