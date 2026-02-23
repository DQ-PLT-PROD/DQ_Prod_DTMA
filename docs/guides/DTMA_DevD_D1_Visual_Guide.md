# Dev D Feature D1 - Visual Implementation Guide

## 🎨 Component Structure

```
PublicLandingPage
│
├── Header Section
│   ├── Title: "Featured Courses"
│   └── Subtitle: "Discover our flagship courses..."
│
├── Loading State (FR3)
│   └── 6 Skeleton Cards
│       ├── Image skeleton (aspect-video)
│       ├── Category/Level skeletons
│       ├── Title skeletons (2 lines)
│       ├── Description skeletons (2 lines)
│       └── Meta skeleton
│
├── Error State (FR3)
│   ├── Error Icon (red circle)
│   ├── "Unable to Load Courses"
│   ├── Error message
│   └── "Try Again" button
│
├── Empty State (FR3)
│   ├── BookOpen Icon (gray circle)
│   ├── "No Featured Courses Available"
│   ├── "Check back soon..."
│   └── "Browse All Courses" button
│
├── Course Grid (Success State)
│   ├── FeaturedCourseCard #1
│   ├── FeaturedCourseCard #2
│   ├── FeaturedCourseCard #3
│   ├── FeaturedCourseCard #4
│   ├── FeaturedCourseCard #5
│   └── FeaturedCourseCard #6
│
└── CTA Section
    ├── "Browse All Courses" (primary)
    └── "Get Started" (secondary)
```

---

## 🎴 FeaturedCourseCard Anatomy

```
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │     Course Hero Image         │  │
│  │     (aspect-video)            │  │
│  │                               │  │
│  │  ┌──────────────────┐         │  │
│  │  │ DIGITAL LEADERS  │ Badge   │  │
│  │  └──────────────────┘         │  │
│  └───────────────────────────────┘  │
│                                     │
│  LEADERSHIP          [Beginner]     │
│                                     │
│  Digital Transformation 101         │
│  ─────────────────────────────      │
│                                     │
│  Learn the fundamentals of          │
│  digital transformation...          │
│                                     │
│  Instructor: DTMA Academy           │
│                                     │
│  ─────────────────────────────────  │
│  🕐 2 hr        📚 8 Lessons        │
└─────────────────────────────────────┘
```

---

## 🎯 State Transitions

```
Initial Load
    ↓
[Loading State]
    ↓
API Call: fetchCourses()
    ↓
    ├─→ Success → [Course Grid]
    ├─→ Empty → [Empty State]
    └─→ Error → [Error State]
```

---

## 📱 Responsive Breakpoints

### Mobile (< 640px)

```
┌─────────────┐
│   Course 1  │
├─────────────┤
│   Course 2  │
├─────────────┤
│   Course 3  │
└─────────────┘
```

### Tablet (640px - 1024px)

```
┌──────────┬──────────┐
│ Course 1 │ Course 2 │
├──────────┼──────────┤
│ Course 3 │ Course 4 │
├──────────┼──────────┤
│ Course 5 │ Course 6 │
└──────────┴──────────┘
```

### Desktop (> 1024px)

```
┌────────┬────────┬────────┐
│ Course │ Course │ Course │
│   1    │   2    │   3    │
├────────┼────────┼────────┤
│ Course │ Course │ Course │
│   4    │   5    │   6    │
└────────┴────────┴────────┘
```

---

## 🎨 Color Palette

### Primary Colors

- **Blue Primary:** `#1839AD` (brand blue)
- **Dark Text:** `#030C2B` (headings)
- **Gray Text:** `#6B7280` (body text)

### Background Colors

- **Section BG:** `#F9FAFB` (gray-50)
- **Card BG:** `#FFFFFF` (white)
- **Skeleton:** `#E5E7EB` (gray-200)

### Accent Colors

- **Category:** `#2563EB` (blue-600)
- **Level Tag:** `#6B7280` (gray-500)
- **Audience Badge:** `#7C3AED` (purple-700)

### Interactive States

- **Hover:** Scale 105%, shadow-xl
- **Active:** Blue-700 (#1D4ED8)

---

## 🔄 Hover Interactions

### Course Card Hover

```
Normal State:
- Scale: 100%
- Shadow: sm
- Title: gray-900

Hover State:
- Scale: 105%
- Shadow: xl
- Title: blue-700
- Transition: 300ms ease-out
```

### Button Hover

```
Primary Button:
- Normal: bg-blue-600
- Hover: bg-blue-700

Secondary Button:
- Normal: border-blue-600, bg-white
- Hover: bg-blue-50
```

---

## 📊 Data Flow Diagram

```
User Visits Landing Page
         ↓
PublicLandingPage Component Mounts
         ↓
useEffect Hook Triggers
         ↓
setLoading(true)
         ↓
fetchCourses() API Call
         ↓
    ┌────┴────┐
    ↓         ↓
Success    Error
    ↓         ↓
Filter     setError()
    ↓         ↓
Slice(6)   Display Error
    ↓
Map to FeaturedCourse
    ↓
setFeaturedCourses()
    ↓
setLoading(false)
    ↓
Render Course Grid
```

---

## 🧩 Component Props

### PublicLandingPage

```typescript
// No props - self-contained component
export const PublicLandingPage: React.FC = () => { ... }
```

### FeaturedCourseCard

```typescript
interface Props {
  course: FeaturedCourse; // Course data
  onClick: () => void; // Click handler
}
```

### CourseCardSkeleton

```typescript
// No props - static skeleton
const CourseCardSkeleton: React.FC = () => { ... }
```

---

## 🎬 Animation Timing

### Skeleton Pulse

- **Animation:** `animate-pulse`
- **Duration:** 2s
- **Easing:** ease-in-out
- **Iteration:** infinite

### Card Hover

- **Property:** transform, box-shadow
- **Duration:** 300ms
- **Easing:** ease-out
- **Delay:** 0ms

### Title Color Change

- **Property:** color
- **Duration:** 300ms
- **Easing:** ease-out
- **Delay:** 0ms

---

## 📐 Spacing & Layout

### Section Padding

- **Vertical:** py-16 (4rem) on mobile, py-20 (5rem) on desktop
- **Horizontal:** px-4 (1rem) on mobile, px-6 (1.5rem) on tablet, px-8 (2rem) on desktop

### Card Spacing

- **Gap:** 1.5rem (24px) between cards
- **Internal Padding:** 1.25rem (20px)

### Typography

- **Heading:** 3xl (1.875rem) on mobile, 4xl (2.25rem) on desktop
- **Card Title:** xl (1.25rem)
- **Body Text:** sm (0.875rem)
- **Meta Text:** xs (0.75rem)

---

## 🔍 Accessibility Features

### Semantic HTML

- `<section>` for main container
- `<h2>` for section heading
- `<h3>` for card titles
- `<button>` for interactive elements

### ARIA Labels

- Course cards are clickable divs (consider button wrapper)
- Error/empty states have descriptive text
- Icons have descriptive context

### Keyboard Navigation

- All interactive elements are focusable
- Tab order follows visual order
- Enter/Space activate buttons

### Screen Reader Support

- Alt text on images
- Descriptive button labels
- Status messages for loading/error states

---

## 🎯 Performance Metrics

### Target Metrics

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Optimization Strategies

1. Skeleton loaders prevent layout shift
2. Aspect ratio boxes maintain space
3. Images use native lazy loading
4. Minimal JavaScript execution

---

## 🧪 Testing Scenarios

### Happy Path

1. Page loads → Shows skeletons
2. API returns 6+ featured courses → Shows 6 courses
3. Click course card → Navigates to details
4. Click "Browse All" → Navigates to catalog

### Edge Cases

1. API returns 0 courses → Shows empty state
2. API returns < 6 courses → Shows all available
3. API fails → Shows error state
4. Slow network → Shows skeletons longer

### Error Recovery

1. Click "Try Again" → Reloads page
2. Click "Browse All Courses" → Navigates away

---

## 📱 Mobile-First Design

### Mobile Optimizations

- Single column layout
- Larger touch targets (min 44x44px)
- Simplified hover effects (tap instead)
- Reduced padding for smaller screens

### Tablet Enhancements

- Two column grid
- Increased spacing
- Hover effects enabled

### Desktop Features

- Three column grid
- Full hover interactions
- Maximum content width (7xl)

---

This visual guide provides a comprehensive overview of the D1 Landing Page implementation, covering structure, styling, interactions, and technical details.
