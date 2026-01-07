# DTMA Academy - Test Specification Document

**Version:** 1.0  
**Last Updated:** January 5, 2026  
**Testing Framework:** Playwright (E2E) + Vitest (Unit/Integration)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Testing Setup](#2-testing-setup)
3. [Test Categories](#3-test-categories)
4. [Landing Page Tests](#4-landing-page-tests)
5. [Course Catalog Tests](#5-course-catalog-tests)
6. [Course Details Tests](#6-course-details-tests)
7. [Learning Experience Tests](#7-learning-experience-tests)
8. [User Dashboard Tests](#8-user-dashboard-tests)
9. [Authentication Tests](#9-authentication-tests)
10. [Data Layer Tests](#10-data-layer-tests)
11. [Accessibility Tests](#11-accessibility-tests)
12. [Performance Tests](#12-performance-tests)
13. [Test Data Management](#13-test-data-management)

---

## 1. Overview

This document defines the test specifications for DTMA Academy, covering all core flows identified in the Product Requirements Document. Tests are organized by feature area and test type.

### Testing Pyramid

```
         ╭───────────────╮
        │    E2E Tests   │  ← Few, slow, high confidence
       ╱─────────────────╲
      │ Integration Tests │  ← Moderate count
     ╱───────────────────────╲
    │      Unit Tests        │  ← Many, fast, focused
   ╰─────────────────────────╯
```

### Coverage Goals

| Test Type | Target Coverage | Focus Areas |
|:----------|:---------------:|:------------|
| **Unit Tests** | 80% | Utility functions, hooks, components |
| **Integration Tests** | 60% | API calls, data flow, state management |
| **E2E Tests** | Core Flows | Critical user journeys |

---

## 2. Testing Setup

### Required Dependencies

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D @playwright/test
npm install -D msw  # Mock Service Worker for API mocking
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### Vitest Configuration (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
});
```

### Playwright Configuration (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 3. Test Categories

### Test ID Convention

```
[FEATURE]-[TYPE]-[NUMBER]

FEATURE: LP (Landing), CC (Catalog), CD (Details), LE (Learning), 
         UD (Dashboard), AU (Auth), DL (Data Layer)
TYPE:    E2E, INT, UNIT
NUMBER:  Sequential (001, 002, ...)

Example: CC-E2E-001 = Course Catalog E2E Test #1
```

---

## 4. Landing Page Tests

### E2E Tests

#### LP-E2E-001: Landing Page Loads Successfully
```typescript
// tests/e2e/landing.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('LP-E2E-001: should load landing page with all sections', async ({ page }) => {
    await page.goto('/');
    
    // Hero section visible
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/AI|Digital|Skills/i);
    
    // CTA button present
    await expect(page.getByRole('button', { name: /get started|start learning/i })).toBeVisible();
    
    // Featured courses section
    await expect(page.locator('[data-testid="featured-courses"]')).toBeVisible();
    
    // Proof and trust section
    await expect(page.locator('[data-testid="proof-trust"]')).toBeVisible();
  });

  test('LP-E2E-002: should navigate to courses from CTA', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: /get started|explore courses/i }).click();
    
    await expect(page).toHaveURL(/\/courses/);
  });

  test('LP-E2E-003: featured course cards are clickable', async ({ page }) => {
    await page.goto('/');
    
    const firstCourse = page.locator('[data-testid="course-tile"]').first();
    await firstCourse.click();
    
    await expect(page).toHaveURL(/\/courses\/.+/);
  });

  test('LP-E2E-004: should display correct stats in proof section', async ({ page }) => {
    await page.goto('/');
    
    const proofSection = page.locator('[data-testid="proof-trust"]');
    await expect(proofSection).toContainText(/courses|learners|completion/i);
  });
});
```

#### LP-E2E-005: Mobile Responsiveness
```typescript
test('LP-E2E-005: should be responsive on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  
  // Hero still visible
  await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
  
  // Mobile menu button visible
  await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
  
  // Desktop nav hidden
  await expect(page.locator('[data-testid="desktop-nav"]')).toBeHidden();
});
```

### Unit Tests

#### LP-UNIT-001: HeroSection Component
```typescript
// src/components/HeroSection.test.tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  test('LP-UNIT-001: renders headline and CTA', () => {
    render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('LP-UNIT-002: CTA shows correct text for anonymous user', () => {
    render(
      <BrowserRouter>
        <HeroSection isAuthenticated={false} />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('button')).toHaveTextContent(/get started/i);
  });

  test('LP-UNIT-003: CTA shows correct text for authenticated user', () => {
    render(
      <BrowserRouter>
        <HeroSection isAuthenticated={true} hasStartedCourse={true} />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('button')).toHaveTextContent(/resume|continue/i);
  });
});
```

---

## 5. Course Catalog Tests

### E2E Tests

#### CC-E2E-001: Catalog Page Loads
```typescript
// tests/e2e/catalog.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Course Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/courses');
  });

  test('CC-E2E-001: should display course catalog with courses', async ({ page }) => {
    // Wait for courses to load
    await page.waitForSelector('[data-testid="course-card"]');
    
    // At least one course visible
    const courses = page.locator('[data-testid="course-card"]');
    await expect(courses.first()).toBeVisible();
    
    // Filter sidebar visible
    await expect(page.locator('[data-testid="filter-sidebar"]')).toBeVisible();
    
    // Search bar visible
    await expect(page.locator('[data-testid="search-bar"]')).toBeVisible();
  });

  test('CC-E2E-002: should filter courses by category', async ({ page }) => {
    // Get initial course count
    const initialCount = await page.locator('[data-testid="course-card"]').count();
    
    // Apply category filter
    await page.locator('[data-testid="filter-category"]').first().click();
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Course list should update (may be same or fewer)
    const filteredCount = await page.locator('[data-testid="course-card"]').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('CC-E2E-003: should search courses by keyword', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-bar"] input');
    
    await searchInput.fill('digital');
    await searchInput.press('Enter');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Results should contain search term or be empty
    const courses = page.locator('[data-testid="course-card"]');
    const count = await courses.count();
    
    if (count > 0) {
      const firstCourseTitle = await courses.first().locator('[data-testid="course-title"]').textContent();
      expect(firstCourseTitle?.toLowerCase()).toContain('digital');
    }
  });

  test('CC-E2E-004: should filter by difficulty level', async ({ page }) => {
    await page.locator('[data-testid="filter-difficulty"]').getByText('Beginner').click();
    
    await page.waitForTimeout(500);
    
    // All visible courses should show beginner badge
    const courses = page.locator('[data-testid="course-card"]');
    const count = await courses.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const levelBadge = courses.nth(i).locator('[data-testid="level-badge"]');
      await expect(levelBadge).toContainText(/beginner/i);
    }
  });

  test('CC-E2E-005: should filter by industry', async ({ page }) => {
    // Expand industry filter if collapsed
    await page.locator('[data-testid="filter-industry-header"]').click();
    
    // Select an industry
    await page.locator('[data-testid="filter-industry"]').first().click();
    
    await page.waitForTimeout(500);
    
    // Should show filtered results or empty state
    const courses = page.locator('[data-testid="course-card"]');
    const emptyState = page.locator('[data-testid="no-results"]');
    
    const hasResults = await courses.count() > 0;
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    
    expect(hasResults || hasEmptyState).toBe(true);
  });

  test('CC-E2E-006: should clear all filters', async ({ page }) => {
    // Apply a filter
    await page.locator('[data-testid="filter-difficulty"]').getByText('Advanced').click();
    await page.waitForTimeout(300);
    
    // Clear filters
    await page.locator('[data-testid="clear-filters"]').click();
    await page.waitForTimeout(300);
    
    // All courses should be visible again
    const courses = page.locator('[data-testid="course-card"]');
    await expect(courses.first()).toBeVisible();
  });

  test('CC-E2E-007: should open quick view modal', async ({ page }) => {
    const firstCourse = page.locator('[data-testid="course-card"]').first();
    
    // Hover to reveal quick view button
    await firstCourse.hover();
    await firstCourse.locator('[data-testid="quick-view-button"]').click();
    
    // Modal should appear
    await expect(page.locator('[data-testid="quick-view-modal"]')).toBeVisible();
    
    // Modal should have course details
    await expect(page.locator('[data-testid="quick-view-modal"]')).toContainText(/description|duration|lessons/i);
  });

  test('CC-E2E-008: should display "Coming Soon" courses differently', async ({ page }) => {
    const comingSoonCourse = page.locator('[data-testid="course-card"][data-coming-soon="true"]').first();
    
    if (await comingSoonCourse.isVisible()) {
      // Should have coming soon badge
      await expect(comingSoonCourse.locator('[data-testid="coming-soon-badge"]')).toBeVisible();
      
      // Should not have enroll CTA
      await expect(comingSoonCourse.locator('[data-testid="enroll-button"]')).toBeHidden();
    }
  });
});
```

### Integration Tests

#### CC-INT-001: Course Fetching
```typescript
// tests/integration/catalog.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getCourses, getCoursesByCategory } from '@/services/courseService';

describe('Course Catalog Data Layer', () => {
  it('CC-INT-001: should fetch all published courses', async () => {
    const courses = await getCourses();
    
    expect(Array.isArray(courses)).toBe(true);
    expect(courses.length).toBeGreaterThan(0);
    
    // All courses should have required fields
    courses.forEach(course => {
      expect(course).toHaveProperty('id');
      expect(course).toHaveProperty('slug');
      expect(course).toHaveProperty('title');
      expect(course.status).toBe('published');
    });
  });

  it('CC-INT-002: should filter courses by category', async () => {
    const allCourses = await getCourses();
    const categorySlug = allCourses[0]?.category_id;
    
    if (categorySlug) {
      const filteredCourses = await getCoursesByCategory(categorySlug);
      
      filteredCourses.forEach(course => {
        expect(course.category_id).toBe(categorySlug);
      });
    }
  });

  it('CC-INT-003: should return courses with lessons count', async () => {
    const courses = await getCourses();
    
    courses.forEach(course => {
      expect(course).toHaveProperty('lesson_count');
      expect(typeof course.lesson_count).toBe('number');
    });
  });
});
```

---

## 6. Course Details Tests

### E2E Tests

#### CD-E2E-001: Course Details Page Loads
```typescript
// tests/e2e/course-details.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Course Details Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to catalog first, then to a specific course
    await page.goto('/courses');
    await page.waitForSelector('[data-testid="course-card"]');
    await page.locator('[data-testid="course-card"]').first().click();
    await page.waitForURL(/\/courses\/.+/);
  });

  test('CD-E2E-001: should display course hero section', async ({ page }) => {
    await expect(page.locator('[data-testid="course-hero"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-category-badge"]')).toBeVisible();
  });

  test('CD-E2E-002: should display summary card with metadata', async ({ page }) => {
    const summaryCard = page.locator('[data-testid="summary-card"]');
    
    await expect(summaryCard).toBeVisible();
    await expect(summaryCard.locator('[data-testid="duration"]')).toBeVisible();
    await expect(summaryCard.locator('[data-testid="lesson-count"]')).toBeVisible();
    await expect(summaryCard.locator('[data-testid="level"]')).toBeVisible();
  });

  test('CD-E2E-003: should have working tab navigation', async ({ page }) => {
    const tabNav = page.locator('[data-testid="tab-navigation"]');
    
    // About tab (default)
    await expect(tabNav.getByRole('tab', { name: /about/i })).toHaveAttribute('aria-selected', 'true');
    
    // Switch to Curriculum tab
    await tabNav.getByRole('tab', { name: /curriculum/i }).click();
    await expect(page.locator('[data-testid="curriculum-content"]')).toBeVisible();
    
    // Switch to Outcomes tab
    await tabNav.getByRole('tab', { name: /outcomes/i }).click();
    await expect(page.locator('[data-testid="outcomes-content"]')).toBeVisible();
    
    // Switch to Resources tab
    await tabNav.getByRole('tab', { name: /resources/i }).click();
    await expect(page.locator('[data-testid="resources-content"]')).toBeVisible();
  });

  test('CD-E2E-004: should display curriculum with ordered lessons', async ({ page }) => {
    await page.getByRole('tab', { name: /curriculum/i }).click();
    
    const lessons = page.locator('[data-testid="lesson-item"]');
    await expect(lessons.first()).toBeVisible();
    
    // Lessons should have order numbers
    const lessonNumbers = await lessons.locator('[data-testid="lesson-number"]').allTextContents();
    const numbers = lessonNumbers.map(n => parseInt(n));
    
    // Verify ascending order
    for (let i = 1; i < numbers.length; i++) {
      expect(numbers[i]).toBeGreaterThanOrEqual(numbers[i - 1]);
    }
  });

  test('CD-E2E-005: should display learning outcomes', async ({ page }) => {
    await page.getByRole('tab', { name: /outcomes/i }).click();
    
    const outcomes = page.locator('[data-testid="learning-outcome"]');
    await expect(outcomes.first()).toBeVisible();
    
    // Should have multiple outcomes
    const count = await outcomes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('CD-E2E-006: should display downloadable resources', async ({ page }) => {
    await page.getByRole('tab', { name: /resources/i }).click();
    
    const resources = page.locator('[data-testid="resource-item"]');
    
    if (await resources.count() > 0) {
      const firstResource = resources.first();
      await expect(firstResource.locator('[data-testid="resource-title"]')).toBeVisible();
      await expect(firstResource.locator('[data-testid="download-button"]')).toBeVisible();
    }
  });

  test('CD-E2E-007: should have enroll/start CTA button', async ({ page }) => {
    const ctaButton = page.locator('[data-testid="course-cta"]');
    
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveText(/start|enroll|begin/i);
  });

  test('CD-E2E-008: should display related courses section', async ({ page }) => {
    const relatedSection = page.locator('[data-testid="related-courses"]');
    
    await expect(relatedSection).toBeVisible();
    
    const relatedCards = relatedSection.locator('[data-testid="course-card"]');
    const count = await relatedCards.count();
    
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(3);
  });

  test('CD-E2E-009: should navigate to learning page on CTA click', async ({ page }) => {
    await page.locator('[data-testid="course-cta"]').click();
    
    // Should either go to learning or prompt auth
    const url = page.url();
    const isLearning = url.includes('/learning');
    const isAuthPrompt = await page.locator('[data-testid="auth-modal"]').isVisible().catch(() => false);
    
    expect(isLearning || isAuthPrompt).toBe(true);
  });
});
```

### Integration Tests

#### CD-INT-001: Course Details Fetching
```typescript
// tests/integration/course-details.test.ts
import { describe, it, expect } from 'vitest';
import { getCourseBySlug, getLessonsByCourse, getResourcesByCourse } from '@/services/courseService';

describe('Course Details Data Layer', () => {
  const testSlug = 'professional-learning-transformation';

  it('CD-INT-001: should fetch course by slug', async () => {
    const course = await getCourseBySlug(testSlug);
    
    expect(course).not.toBeNull();
    expect(course?.slug).toBe(testSlug);
    expect(course?.title).toBeTruthy();
    expect(course?.long_description).toBeTruthy();
  });

  it('CD-INT-002: should fetch lessons for course', async () => {
    const lessons = await getLessonsByCourse(testSlug);
    
    expect(Array.isArray(lessons)).toBe(true);
    
    if (lessons.length > 0) {
      // Lessons should be ordered
      for (let i = 1; i < lessons.length; i++) {
        expect(lessons[i].order_index).toBeGreaterThanOrEqual(lessons[i - 1].order_index);
      }
      
      // Each lesson should have required fields
      lessons.forEach(lesson => {
        expect(lesson).toHaveProperty('title');
        expect(lesson).toHaveProperty('type');
        expect(['intro', 'standard', 'outro', 'quiz']).toContain(lesson.type);
      });
    }
  });

  it('CD-INT-003: should fetch resources for course', async () => {
    const resources = await getResourcesByCourse(testSlug);
    
    expect(Array.isArray(resources)).toBe(true);
    
    resources.forEach(resource => {
      expect(resource).toHaveProperty('title');
      expect(resource).toHaveProperty('type');
      expect(resource).toHaveProperty('resource_url');
    });
  });

  it('CD-INT-004: should return null for non-existent course', async () => {
    const course = await getCourseBySlug('non-existent-course-slug');
    
    expect(course).toBeNull();
  });
});
```

---

## 7. Learning Experience Tests

### E2E Tests

#### LE-E2E-001: Learning Page Components
```typescript
// tests/e2e/learning.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Learning Experience', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a course and start learning
    await page.goto('/learning');
  });

  test('LE-E2E-001: should display video player', async ({ page }) => {
    const videoPlayer = page.locator('[data-testid="video-player"]');
    
    await expect(videoPlayer).toBeVisible();
  });

  test('LE-E2E-002: should display lesson sidebar', async ({ page }) => {
    const sidebar = page.locator('[data-testid="lesson-sidebar"]');
    
    await expect(sidebar).toBeVisible();
    
    const lessonItems = sidebar.locator('[data-testid="lesson-item"]');
    await expect(lessonItems.first()).toBeVisible();
  });

  test('LE-E2E-003: should show progress bar', async ({ page }) => {
    const progressBar = page.locator('[data-testid="progress-bar"]');
    
    await expect(progressBar).toBeVisible();
  });

  test('LE-E2E-004: should navigate between lessons', async ({ page }) => {
    const sidebar = page.locator('[data-testid="lesson-sidebar"]');
    const lessonItems = sidebar.locator('[data-testid="lesson-item"]');
    
    // Click second lesson
    if (await lessonItems.count() > 1) {
      await lessonItems.nth(1).click();
      
      // Lesson should be marked as active
      await expect(lessonItems.nth(1)).toHaveAttribute('data-active', 'true');
    }
  });

  test('LE-E2E-005: should have video playback controls', async ({ page }) => {
    const videoPlayer = page.locator('[data-testid="video-player"]');
    
    // Play button
    await expect(videoPlayer.locator('[data-testid="play-button"]')).toBeVisible();
    
    // Volume control
    await expect(videoPlayer.locator('[data-testid="volume-control"]')).toBeVisible();
    
    // Progress/seek bar
    await expect(videoPlayer.locator('[data-testid="seek-bar"]')).toBeVisible();
  });

  test('LE-E2E-006: should collapse sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Sidebar should be hidden by default on mobile
    const sidebar = page.locator('[data-testid="lesson-sidebar"]');
    
    // Toggle button should be visible
    const toggleButton = page.locator('[data-testid="sidebar-toggle"]');
    await expect(toggleButton).toBeVisible();
    
    // Click to show sidebar
    await toggleButton.click();
    await expect(sidebar).toBeVisible();
  });

  test('LE-E2E-007: should display resource panel when available', async ({ page }) => {
    // Check if resources are available for current lesson
    const resourcePanel = page.locator('[data-testid="resource-panel"]');
    
    if (await resourcePanel.isVisible()) {
      const downloadButton = resourcePanel.locator('[data-testid="download-button"]');
      await expect(downloadButton.first()).toBeVisible();
    }
  });

  test('LE-E2E-008: should mark lesson complete', async ({ page }) => {
    const sidebar = page.locator('[data-testid="lesson-sidebar"]');
    const firstLesson = sidebar.locator('[data-testid="lesson-item"]').first();
    
    // Simulate video completion (if mock controls available)
    await page.locator('[data-testid="mark-complete"]').click().catch(() => {
      // Button may not exist, video auto-completes
    });
    
    // Check for completion indicator
    await expect(firstLesson.locator('[data-testid="complete-check"]')).toBeVisible();
  });
});
```

### Quiz Tests

#### LE-E2E-009: Quiz Functionality
```typescript
test.describe('Learning Experience - Quiz', () => {
  test('LE-E2E-009: should display quiz questions', async ({ page }) => {
    await page.goto('/learning');
    
    // Navigate to quiz lesson if available
    const quizLesson = page.locator('[data-testid="lesson-item"][data-type="quiz"]').first();
    
    if (await quizLesson.isVisible()) {
      await quizLesson.click();
      
      // Quiz container should appear
      await expect(page.locator('[data-testid="quiz-container"]')).toBeVisible();
      
      // Question should be visible
      await expect(page.locator('[data-testid="quiz-question"]')).toBeVisible();
      
      // Options should be visible
      const options = page.locator('[data-testid="quiz-option"]');
      expect(await options.count()).toBeGreaterThan(1);
    }
  });

  test('LE-E2E-010: should validate quiz answer', async ({ page }) => {
    await page.goto('/learning');
    
    const quizLesson = page.locator('[data-testid="lesson-item"][data-type="quiz"]').first();
    
    if (await quizLesson.isVisible()) {
      await quizLesson.click();
      
      // Select an option
      await page.locator('[data-testid="quiz-option"]').first().click();
      
      // Submit answer
      await page.locator('[data-testid="submit-answer"]').click();
      
      // Should show feedback (correct/incorrect)
      await expect(page.locator('[data-testid="quiz-feedback"]')).toBeVisible();
    }
  });
});
```

---

## 8. User Dashboard Tests

### E2E Tests

#### UD-E2E-001: Dashboard Access Control
```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Dashboard', () => {
  test('UD-E2E-001: should redirect unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard/overview');
    
    // Should redirect to login or show auth prompt
    const isLoginPage = page.url().includes('login') || page.url().includes('auth');
    const hasAuthModal = await page.locator('[data-testid="auth-modal"]').isVisible().catch(() => false);
    const redirectedHome = page.url() === new URL('/', page.url()).href;
    
    expect(isLoginPage || hasAuthModal || redirectedHome).toBe(true);
  });

  test.describe('Authenticated User', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication state
      await page.addInitScript(() => {
        localStorage.setItem('msal.account.keys', JSON.stringify(['test-account']));
        localStorage.setItem('msal.account.test-account', JSON.stringify({
          homeAccountId: 'test-account',
          environment: 'login.microsoftonline.com',
          name: 'Test User',
          username: 'test@example.com',
        }));
      });
    });

    test('UD-E2E-002: should display dashboard overview', async ({ page }) => {
      await page.goto('/dashboard/overview');
      
      // Welcome message
      await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
      
      // Progress section
      await expect(page.locator('[data-testid="learning-progress"]')).toBeVisible();
    });

    test('UD-E2E-003: should navigate between dashboard sections', async ({ page }) => {
      await page.goto('/dashboard/overview');
      
      // Navigate to Profile
      await page.locator('[data-testid="nav-profile"]').click();
      await expect(page).toHaveURL(/\/dashboard\/profile/);
      
      // Navigate to Settings
      await page.locator('[data-testid="nav-settings"]').click();
      await expect(page).toHaveURL(/\/dashboard\/settings/);
      
      // Navigate to Support
      await page.locator('[data-testid="nav-support"]').click();
      await expect(page).toHaveURL(/\/dashboard\/support/);
    });

    test('UD-E2E-004: should display enrolled courses', async ({ page }) => {
      await page.goto('/dashboard/overview');
      
      const enrolledCourses = page.locator('[data-testid="enrolled-courses"]');
      
      if (await enrolledCourses.isVisible()) {
        const courseCards = enrolledCourses.locator('[data-testid="course-card"]');
        await expect(courseCards.first()).toBeVisible();
      }
    });

    test('UD-E2E-005: should display user profile information', async ({ page }) => {
      await page.goto('/dashboard/profile');
      
      await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-email"]')).toBeVisible();
    });
  });
});
```

---

## 9. Authentication Tests

### E2E Tests

#### AU-E2E-001: Sign In Flow
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('AU-E2E-001: should show sign in button for anonymous users', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible();
  });

  test('AU-E2E-002: should open auth modal on sign in click', async ({ page }) => {
    await page.goto('/');
    
    await page.locator('[data-testid="sign-in-button"]').click();
    
    // Check for redirect to Azure AD or modal
    const isAzureRedirect = page.url().includes('login.microsoftonline.com');
    const hasAuthModal = await page.locator('[data-testid="auth-modal"]').isVisible().catch(() => false);
    
    expect(isAzureRedirect || hasAuthModal).toBe(true);
  });

  test('AU-E2E-003: should show user menu when authenticated', async ({ page }) => {
    // Mock auth state
    await page.addInitScript(() => {
      localStorage.setItem('msal.account.keys', JSON.stringify(['test-account']));
    });
    
    await page.goto('/');
    
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="sign-in-button"]')).toBeHidden();
  });

  test('AU-E2E-004: should have sign out option in user menu', async ({ page }) => {
    // Mock auth state
    await page.addInitScript(() => {
      localStorage.setItem('msal.account.keys', JSON.stringify(['test-account']));
    });
    
    await page.goto('/');
    
    await page.locator('[data-testid="user-menu"]').click();
    await expect(page.locator('[data-testid="sign-out-button"]')).toBeVisible();
  });

  test('AU-E2E-005: protected route should require auth', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should not be on dashboard
    const onDashboard = page.url().includes('/dashboard');
    const hasAuthPrompt = await page.locator('[data-testid="auth-modal"]').isVisible().catch(() => false);
    const redirected = !page.url().includes('/dashboard');
    
    expect(hasAuthPrompt || redirected || !onDashboard).toBe(true);
  });
});
```

### Integration Tests

#### AU-INT-001: User Sync
```typescript
// tests/integration/auth.test.ts
import { describe, it, expect, vi } from 'vitest';
import { syncUserToSupabase } from '@/services/userService';

describe('Authentication Data Sync', () => {
  it('AU-INT-001: should sync Azure AD user to Supabase', async () => {
    const mockAzureUser = {
      homeAccountId: 'test-id-123',
      username: 'test@example.com',
      name: 'Test User',
    };
    
    const result = await syncUserToSupabase(mockAzureUser);
    
    expect(result).not.toBeNull();
    expect(result?.email).toBe('test@example.com');
    expect(result?.azure_user_id).toBe('test-id-123');
  });

  it('AU-INT-002: should update existing user on re-login', async () => {
    const existingUser = {
      homeAccountId: 'existing-user-123',
      username: 'existing@example.com',
      name: 'Updated Name',
    };
    
    const result = await syncUserToSupabase(existingUser);
    
    expect(result?.name).toBe('Updated Name');
  });
});
```

---

## 10. Data Layer Tests

### Unit Tests

#### DL-UNIT-001: Course Type Validation
```typescript
// tests/unit/types.test.ts
import { describe, it, expect } from 'vitest';
import type { Course, Lesson, Quiz } from '@/types';

describe('Data Types', () => {
  it('DL-UNIT-001: course object should match schema', () => {
    const course: Course = {
      id: '123',
      slug: 'test-course',
      title: 'Test Course',
      short_description: 'A test course',
      status: 'published',
      is_featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    expect(course.id).toBeDefined();
    expect(course.slug).toBeDefined();
    expect(course.title).toBeDefined();
  });

  it('DL-UNIT-002: lesson type should be valid', () => {
    const validTypes = ['intro', 'standard', 'outro', 'quiz'];
    
    const lesson: Lesson = {
      id: '456',
      course_slug: 'test-course',
      title: 'Test Lesson',
      type: 'standard',
      order_index: 1,
    };
    
    expect(validTypes).toContain(lesson.type);
  });
});
```

#### DL-UNIT-003: Utility Functions
```typescript
// tests/unit/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDuration, slugify, truncateText } from '@/utils';

describe('Utility Functions', () => {
  it('DL-UNIT-003: formatDuration should format minutes correctly', () => {
    expect(formatDuration(60)).toBe('1h 0m');
    expect(formatDuration(90)).toBe('1h 30m');
    expect(formatDuration(30)).toBe('30m');
  });

  it('DL-UNIT-004: slugify should create URL-safe slugs', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('Test Course 123')).toBe('test-course-123');
    expect(slugify('AI & Machine Learning')).toBe('ai-machine-learning');
  });

  it('DL-UNIT-005: truncateText should truncate with ellipsis', () => {
    const longText = 'This is a very long text that should be truncated';
    
    expect(truncateText(longText, 20)).toBe('This is a very long...');
    expect(truncateText('Short', 20)).toBe('Short');
  });
});
```

---

## 11. Accessibility Tests

### E2E Tests

#### A11Y-E2E-001: Keyboard Navigation
```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('A11Y-E2E-001: landing page should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toHaveLength(0);
  });

  test('A11Y-E2E-002: course catalog should be keyboard navigable', async ({ page }) => {
    await page.goto('/courses');
    
    // Tab to first course card
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to activate with Enter
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('A11Y-E2E-003: modals should trap focus', async ({ page }) => {
    await page.goto('/courses');
    
    // Open quick view modal
    await page.locator('[data-testid="course-card"]').first().hover();
    await page.locator('[data-testid="quick-view-button"]').first().click();
    
    const modal = page.locator('[data-testid="quick-view-modal"]');
    await expect(modal).toBeVisible();
    
    // Tab should cycle within modal
    await page.keyboard.press('Tab');
    const focusedInModal = await page.locator('[data-testid="quick-view-modal"] :focus').count();
    expect(focusedInModal).toBeGreaterThan(0);
  });

  test('A11Y-E2E-004: images should have alt text', async ({ page }) => {
    await page.goto('/courses');
    
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt).toBe(0);
  });

  test('A11Y-E2E-005: form inputs should have labels', async ({ page }) => {
    await page.goto('/courses');
    
    const searchInput = page.locator('[data-testid="search-bar"] input');
    const hasLabel = await searchInput.getAttribute('aria-label') || 
                     await page.locator(`label[for="${await searchInput.getAttribute('id')}"]`).count() > 0;
    
    expect(hasLabel).toBeTruthy();
  });
});
```

---

## 12. Performance Tests

### E2E Tests

#### PERF-E2E-001: Page Load Times
```typescript
// tests/e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('PERF-E2E-001: landing page should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('PERF-E2E-002: catalog should load within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/courses');
    await page.waitForSelector('[data-testid="course-card"]');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  test('PERF-E2E-003: course details should load within 2 seconds', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForSelector('[data-testid="course-card"]');
    
    const startTime = Date.now();
    await page.locator('[data-testid="course-card"]').first().click();
    await page.waitForSelector('[data-testid="course-hero"]');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  test('PERF-E2E-004: no memory leaks on navigation', async ({ page }) => {
    await page.goto('/');
    
    const initialMetrics = await page.evaluate(() => performance.memory?.usedJSHeapSize);
    
    // Navigate multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/courses');
      await page.goto('/');
    }
    
    const finalMetrics = await page.evaluate(() => performance.memory?.usedJSHeapSize);
    
    if (initialMetrics && finalMetrics) {
      // Memory should not grow more than 50%
      expect(finalMetrics).toBeLessThan(initialMetrics * 1.5);
    }
  });
});
```

---

## 13. Test Data Management

### Test Fixtures

```typescript
// tests/fixtures/courses.ts
export const mockCourses = [
  {
    id: 'test-course-1',
    slug: 'test-digital-transformation',
    title: 'Test Digital Transformation',
    short_description: 'A test course for automated testing',
    long_description: 'Detailed description for testing purposes',
    category_id: 'leadership',
    audience_level: 'Digital Leaders',
    level_tag: 'Intermediate',
    estimated_duration_minutes: 120,
    lesson_count: 5,
    status: 'published',
    is_featured: true,
  },
  {
    id: 'test-course-2',
    slug: 'test-ai-fundamentals',
    title: 'Test AI Fundamentals',
    short_description: 'Another test course',
    long_description: 'AI testing course details',
    category_id: 'technology',
    audience_level: 'Digital Workers',
    level_tag: 'Beginner',
    estimated_duration_minutes: 60,
    lesson_count: 3,
    status: 'published',
    is_featured: false,
  },
];

export const mockLessons = [
  {
    id: 'lesson-1',
    course_slug: 'test-digital-transformation',
    title: 'Introduction',
    type: 'intro',
    order_index: 1,
    estimated_duration_minutes: 5,
  },
  {
    id: 'lesson-2',
    course_slug: 'test-digital-transformation',
    title: 'Core Concepts',
    type: 'standard',
    order_index: 2,
    estimated_duration_minutes: 15,
  },
];
```

### MSW Handlers (API Mocking)

```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw';
import { mockCourses, mockLessons } from '../fixtures/courses';

export const handlers = [
  rest.get('*/rest/v1/courses*', (req, res, ctx) => {
    return res(ctx.json(mockCourses));
  }),
  
  rest.get('*/rest/v1/lessons*', (req, res, ctx) => {
    const courseSlug = req.url.searchParams.get('course_slug');
    const filtered = mockLessons.filter(l => l.course_slug === courseSlug);
    return res(ctx.json(filtered));
  }),
];
```

---

## Test Summary Matrix

| Area | E2E | Integration | Unit | Priority |
|:-----|:---:|:-----------:|:----:|:--------:|
| Landing Page | 5 | - | 3 | High |
| Course Catalog | 8 | 3 | - | High |
| Course Details | 9 | 4 | - | High |
| Learning Experience | 10 | - | - | High |
| User Dashboard | 5 | - | - | Medium |
| Authentication | 5 | 2 | - | High |
| Data Layer | - | - | 5 | Medium |
| Accessibility | 5 | - | - | Medium |
| Performance | 4 | - | - | Low |

**Total Tests:** 63

---

## Running Tests

```bash
# Run all unit/integration tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test file
npm run test -- catalog.spec.ts

# Run tests matching pattern
npm run test -- -t "should filter"
```
