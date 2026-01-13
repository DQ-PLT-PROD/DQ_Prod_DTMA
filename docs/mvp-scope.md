# MVP Active Features Documentation

## 🎯 Goal
This document outlines the features currently active in the MVP (Minimum Viable Product) scope, which focuses exclusively on the **Course Marketplace** and its supporting features. All other features have been deactivated via feature flags.

## 🟢 Active Features
The following features are fully active and available to users:

### 1. Landing Page
- Adjusted to focus on course marketplace messaging.
- **HeroSection**: "Your Path to AI Skills"
- **ProofAndTrust**: Stats and testimonials.
- **D6 Categories Section**: Used for course segmentation.
- **Featured Courses**: Carousel of top courses.
- **Call-to-Action**: Sign-up/Get Started flows.

### 2. Course Marketplace
- **Route**: `/marketplace/courses`
- **Capabilities**:
  - Full course catalog and browsing.
  - Detailed course pages (`/courses/:itemId`).
  - Quick View Modal.
  - Course Bookmarking.

### 3. Learning Experience
- **Route**: `/learning`
- **Capabilities**: In-course video player and lesson navigation.

### 4. User Dashboard (Core Only)
- **Routes**:
  - `/dashboard/overview`: Learning progress and stats.
  - `/dashboard/profile`: User profile management.
  - `/dashboard/settings`: Account settings.
  - `/dashboard/support`: Basic support interface.
- **Deactivated**: Documents, Reporting Obligations, Service Requests (unless critical).

### 5. Authentication
- Azure AD B2C with MSAL integration.

### 6. Admin UI (Core Only)
- Course Media and content management features.

---

## 🔴 Deactivated Features
The following features are code-complete but hidden via `src/config/features.ts`:

- **Growth Areas Marketplace**: `/growth-areas-marketplace` & `/growth-areas`
- **Secondary Marketplaces**:
  - Financial Services (`/marketplace/financial`)
  - Non-Financial Services (`/marketplace/non-financial`)
  - Knowledge Hub (`/marketplace/knowledge-hub`)
  - Business Directory (`/business-directory-marketplace`)
- **Advanced Forms**: Most of the 12 specialized forms (e.g., funding, loans) are disabled.
- **AI Chatbot**: Voiceflow KfBot integration is present but turned off.

## ⚙️ Configuration
Feature flags are managed in `src/config/features.ts`:

```typescript
export const FEATURES = {
  COURSE_MARKETPLACE: true,
  LEARNING_EXPERIENCE: true,
  USER_DASHBOARD_CORE: true,
  ADMIN_COURSE_MANAGEMENT: true,
  AUTHENTICATION: true,

  GROWTH_AREAS: false,        // Set to true to re-enable
  OTHER_MARKETPLACES: false,  // Set to true to re-enable
  ADVANCED_FORMS: false,      // Set to true to re-enable
  AI_CHATBOT: false,          // Set to true to re-enable
};
```

To re-enable a feature, simply change its flag to `true` in this file.
