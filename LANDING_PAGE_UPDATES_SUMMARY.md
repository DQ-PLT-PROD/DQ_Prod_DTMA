# DTMA Landing Page Updates Summary

## Overview

This document summarizes all the content updates made to the DTMA landing page sections.

---

## 1. Hero Section

**File:** `src/features/landing/components/HeroSection.tsx`

### Headline

```
Master the Skills to Thrive in the Digital Era
```

### Subheadline

```
Acquire the skills and competencies needed to excel in the evolving digital landscape and drive successful transformation.
```

### CTAs

- **Primary CTA:** "Get Started" / "Start Course" / "Resume Course" (dynamic based on user state)
- **Secondary CTA:** "Explore Courses" (scrolls to categories section)

---

## 2. Empower Your Digital Journey Section

**File:** `src/features/landing/components/ProofAndTrust.tsx`

### Headline

```
Empower Your Digital Journey with DTMA
```

### Subheadline

```
Transform your capabilities and stay ahead with learning designed for today's fast-changing digital environment.
```

### Content Blocks (4 items)

1. **Practical, Applicable Skills**
   - Learn actionable skills and frameworks you can apply directly to your work. Start implementing right away.

2. **Industry-Relevant Curriculum**
   - Stay ahead with a curriculum crafted for real-world success. Guided by DQ's 15+ years of expertise.

3. **Practical Toolkits & Frameworks**
   - Use practical toolkits and frameworks that make decision-making easier. Deliver more effectively.

4. **Stay Future-Ready**
   - Build continuous capability and stay ahead in the AI-driven digital world. Remain competitive.

### Additional Content

- Image: Leaders collaborating
- Sub-section: "Designed for Professionals Navigating Digital Change"
- Tagline: "Built from real-world transformation experience."

---

## 3. Explore Our Courses Section

**File:** `src/features/landing/components/CourseCatalogSection.tsx`

### Headline

```
Explore Our Courses
```

### Subheadline

```
Find the right course for you from a curated selection of practical, role-based learning paths designed to enhance your skills and drive digital success.
```

### Features

- Dynamic category filters (Popular + topic-based categories)
- Course cards with:
  - Thumbnail/video preview
  - Category name
  - Level tag
  - Lesson count
  - Duration
  - Short description
  - CTA button (Enroll/Start/Resume)

### CTA

- **Button:** "Browse Full Course Catalog" (links to /courses)

---

## 4. Explore Digital Transformation with 6XD Section

**File:** `src/features/landing/components/SixPerspectivesSection.tsx`

### Headline

```
Explore Digital Transformation with 6XD
```

### Subheadline

```
Built on the 6XD framework, our courses equip you with the skills to lead and succeed in digital transformation.
```

### Six Perspectives

1. **Digital Economy**
   - Understand how to leverage emerging technologies to drive growth in the digital economy.

2. **Digital Cognitive Organizations**
   - Master the design and management of intelligent organizations using AI and automation.

3. **Digital Business Platform (DBP)**
   - Decode the platform models and ecosystems that underpin modern digital businesses.

4. **Digital Transformation**
   - Gain the skills needed to lead and implement digital transformation strategies within organizations.

5. **Digital Workers & Workspaces**
   - Build and manage a digitally empowered workforce with flexible, collaborative work environments.

6. **Digital Accelerators & Tools**
   - Learn the tools and accelerators that make transformation processes faster and more efficient.

### CTAs

- **Primary CTA:** "Explore Insights" (links to Digital Qatalyst insights)
- **Secondary CTA:** "Read 6XD Book" (links to 6XD book page)

---

## 5. Your Path to Digital Mastery Section

**File:** `src/features/landing/components/HowYouLearn.tsx`

### Headline

```
Your Path to Digital Mastery with DTMA
```

### Subheadline

```
Experience a seamless learning journey with practical, on-the-go lessons, real-world applications, and certifications to showcase your growth.
```

### Learning Steps (4 steps)

1. **Learn** (Step 01)
   - Short, practical lessons with actionable examples.

2. **Practice** (Step 02)
   - Hands-on exercises that mirror your daily work challenges.

3. **Apply** (Step 03)
   - Bring a small project from your team to life, using your new skills.

4. **Recognition** (Step 04)
   - Earn a badge to demonstrate your mastery in the AI-driven digital era.

---

## Navigation Updates

**File:** `src/components/Header/components/ExploreDropdown.tsx`

### Menu Changes

- Changed "Explore Courses" dropdown label to "Courses"
- Maintained all category dropdown functionality

---

## Page Structure Order

**File:** `src/features/landing/pages/HomePage.tsx`

### Section Flow

1. Hero Section
2. Empower Your Digital Journey (ProofAndTrust)
3. Explore Our Courses (CourseCatalogSection)
4. Explore Digital Transformation with 6XD (SixPerspectivesSection)
5. Your Path to Digital Mastery (HowYouLearn)
6. Call to Action + Footer

### Removed Sections

- ~~Dive Deep into 6X Perspectives (SixXDDeepDiveSection)~~ - Removed as requested

---

## Key Design Principles Applied

1. **Concise Messaging:** All descriptions follow a two-sentence format for consistency
2. **Action-Oriented:** Emphasis on practical application and real-world use
3. **Clear CTAs:** Multiple strategic call-to-action buttons throughout
4. **Progressive Disclosure:** Information flows from overview to specifics
5. **Role-Based Focus:** Content emphasizes practical, role-based learning paths
6. **Future-Ready Positioning:** Consistent messaging about AI-driven digital era

---

## Files Modified

1. `src/features/landing/components/HeroSection.tsx`
2. `src/features/landing/components/ProofAndTrust.tsx`
3. `src/features/landing/components/CourseCatalogSection.tsx`
4. `src/features/landing/components/SixPerspectivesSection.tsx`
5. `src/features/landing/components/HowYouLearn.tsx`
6. `src/components/Header/components/ExploreDropdown.tsx`
7. `src/features/landing/pages/HomePage.tsx`

---

## Next Steps / Recommendations

1. **Test Responsiveness:** Verify all sections display correctly on mobile, tablet, and desktop
2. **Performance Check:** Ensure page load times are optimal
3. **A/B Testing:** Consider testing different CTA button text variations
4. **Analytics:** Set up tracking for CTA clicks and section engagement
5. **Content Updates:** Course descriptions in database could be enhanced to match the new messaging style

---

_Document created: March 4, 2026_
_Branch: feature/content/landingpage-Carimi_
