# DTMA Academy Production Authentication Testing Guide

**Version:** 1.0  
**Last Updated:** January 5, 2026  
**Purpose:** Testing authentication on deployed production environment

---

## Table of Contents

1. [Production Environment Overview](#1-production-environment-overview)
2. [Pre-Deployment Checklist](#2-pre-deployment-checklist)
3. [Production Manual Testing](#3-production-manual-testing)
4. [Production Automated Testing](#4-production-automated-testing)
5. [Production Monitoring](#5-production-monitoring)
6. [Troubleshooting Production Issues](#6-troubleshooting-production-issues)
7. [Performance Testing](#7-performance-testing)
8. [Security Validation](#8-security-validation)

---

## 1. Production Environment Overview

### 1.1 Current Production Setup

Based on your `.env` file, your production environment is:

- **Production URL**: `https://dq-prod-dtma.vercel.app/`
- **Azure AD Tenant**: `2d664c1c-c510-4764-af80-fe7c49c1e192`
- **Azure Subdomain**: `dqproddev.ciamlogin.com`
- **Supabase**: `https://ugmybskacomcdgdngolz.supabase.co`

### 1.2 Production Testing URLs

- **Main Application**: `https://dq-prod-dtma.vercel.app/`
- **Debug Panel**: `https://dq-prod-dtma.vercel.app/auth-debug`
- **Course Catalog**: `https://dq-prod-dtma.vercel.app/courses`
- **Protected Dashboard**: `https://dq-prod-dtma.vercel.app/dashboard`

---

## 2. Pre-Deployment Checklist

### 2.1 Azure AD Configuration Verification

Before testing, ensure Azure AD is configured for production:

1. **Redirect URIs in Azure AD App Registration:**
   ```
   ✅ https://dq-prod-dtma.vercel.app/
   ✅ https://dq-prod-dtma.vercel.app/auth-debug
   ```

2. **Logout URLs:**
   ```
   ✅ https://dq-prod-dtma.vercel.app/
   ```

3. **API Permissions:**
   ```
   ✅ openid
   ✅ profile  
   ✅ email
   ✅ User.Read (optional for Graph API)
   ```

### 2.2 Supabase Production Setup

1. **Run the database setup script:**
   ```sql
   -- In Supabase SQL Editor, run:
   -- File: database/scripts/supabase_auth_setup.sql
   ```

2. **Verify RLS policies are enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('users', 'user_business_profiles', 'user_sessions');
   ```

3. **Check environment variables are set in production:**
   - Vercel dashboard → Project → Settings → Environment Variables
   - Ensure all `VITE_*` variables are configured

---

## 3. Production Manual Testing

### 3.1 Quick Production Health Check

#### Step 1: Access Production Debug Panel
```
🌐 Navigate to: https://dq-prod-dtma.vercel.app/auth-debug
```

**Expected Results:**
- ✅ Page loads without errors
- ✅ All environment variables show green checkmarks
- ✅ Current origin shows production URL
- ✅ Azure configuration shows "set" status

#### Step 2: Test Supabase Connection
```
1. Click "Test Supabase" button
2. Wait for test results (up to 30 seconds)
3. Verify success status
```

**Expected Results:**
- ✅ Connection: OK
- ✅ User Creation: OK  
- ✅ Cleanup: OK
- ✅ "All Supabase tests passed successfully!"

### 3.2 Complete Production Authentication Flow

#### Test Case 1: New User Registration (Production)
```
1. Open incognito/private browser window
2. Navigate to: https://dq-prod-dtma.vercel.app/
3. Click "Sign In" button
4. Should redirect to: https://dqproddev.ciamlogin.com/...
5. Complete Azure AD registration/login
6. Should redirect back to: https://dq-prod-dtma.vercel.app/learning
7. Verify user profile appears in header
8. Check debug panel for database sync
```

**Verification Steps:**
```
🔍 Check Debug Panel:
- Navigate to: https://dq-prod-dtma.vercel.app/auth-debug
- Verify "Authenticated" status is green
- Verify "Synced with DB" status is green  
- Verify "Has Customer ID" status is green
- Check user information is displayed
- Confirm database user information appears
```

#### Test Case 2: Protected Route Access
```
1. While logged in, navigate to: https://dq-prod-dtma.vercel.app/dashboard
2. Should access dashboard immediately
3. Logout from application
4. Try accessing dashboard again
5. Should redirect to Azure AD login
6. Complete login
7. Should redirect back to dashboard
```

#### Test Case 3: Session Persistence
```
1. Login to production application
2. Close browser completely
3. Open new browser window
4. Navigate to: https://dq-prod-dtma.vercel.app/dashboard
5. Should remain logged in (if within session timeout)
```

### 3.3 Cross-Browser Testing

Test on multiple browsers in production:

#### Chrome Testing
```
1. Open Chrome browser
2. Navigate to: https://dq-prod-dtma.vercel.app/auth-debug
3. Complete authentication flow
4. Document any issues
```

#### Firefox Testing
```
1. Open Firefox browser
2. Navigate to: https://dq-prod-dtma.vercel.app/auth-debug
3. Complete authentication flow
4. Compare behavior with Chrome
```

#### Safari Testing (if available)
```
1. Open Safari browser
2. Navigate to: https://dq-prod-dtma.vercel.app/auth-debug
3. Complete authentication flow
4. Note any Safari-specific issues
```

---

## 4. Production Automated Testing

### 4.1 Playwright Production Configuration

Create `playwright.config.production.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/production',
  fullyParallel: false, // Sequential for production
  retries: 2,
  workers: 1, // Single worker for production testing
  reporter: [['html'], ['json', { outputFile: 'test-results.json' }]],
  use: {
    baseURL: 'https://dq-prod-dtma.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'production-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // No webServer needed - testing deployed app
});
```

### 4.2 Production Test Suite

Create `tests/production/production-auth.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Production Authentication Tests', () => {
  const PRODUCTION_URL = 'https://dq-prod-dtma.vercel.app';
  
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should load production debug panel', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/auth-debug`);
    
    // Check page loads
    await expect(page.locator('h2:has-text("Authentication Debug Panel")')).toBeVisible();
    
    // Check environment status
    await expect(page.locator('text=Environment Configuration')).toBeVisible();
    
    // Verify production URL is detected
    await expect(page.locator('text=dq-prod-dtma.vercel.app')).toBeVisible();
  });

  test('should show correct Azure AD configuration', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/auth-debug`);
    
    // Check Azure configuration
    await expect(page.locator('text=Azure Client ID')).toBeVisible();
    await expect(page.locator('text=✅ Set')).toBeVisible();
    
    // Check Supabase configuration  
    await expect(page.locator('text=Supabase URL')).toBeVisible();
    await expect(page.locator('text=✅ Set')).toBeVisible();
  });

  test('should test Supabase connection in production', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/auth-debug`);
    
    // Click test Supabase
    await page.click('button:has-text("Test Supabase")');
    
    // Wait for results (longer timeout for production)
    await page.waitForSelector('text=Supabase Test Results', { timeout: 30000 });
    
    // Check for success
    await expect(page.locator('text=✅ Success')).toBeVisible();
  });

  test('should redirect to Azure AD for authentication', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/dashboard`);
    
    // Should redirect to Azure AD
    await page.waitForURL(/dqproddev\.ciamlogin\.com/, { timeout: 10000 });
    
    // Check for Azure AD login page elements
    await expect(page.locator('input[type="email"], input[name="loginfmt"]')).toBeVisible();
  });

  test('should handle unauthenticated access correctly', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/`);
    
    // Should show sign in button
    await expect(page.locator('text=Sign In')).toBeVisible();
    
    // Should not show user profile
    await expect(page.locator('[data-testid="user-profile"]')).not.toBeVisible();
  });

  test('should load course catalog without authentication', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/courses`);
    
    // Should load course catalog
    await expect(page.locator('h1, h2')).toContainText(['Courses', 'Course Catalog']);
    
    // Should still show sign in option
    await expect(page.locator('text=Sign In')).toBeVisible();
  });
});
```

### 4.3 Run Production Tests

```bash
# Run production tests
npx playwright test --config=playwright.config.production.ts

# Run with headed browser to see what's happening
npx playwright test --config=playwright.config.production.ts --headed

# Run specific test
npx playwright test tests/production/production-auth.spec.ts --config=playwright.config.production.ts

# Generate report
npx playwright show-report
```

---

## 5. Production Monitoring

### 5.1 Real-Time Monitoring Setup

#### Browser Console Monitoring
```javascript
// Open browser console on production site
// Monitor for these log patterns:

// ✅ Successful authentication
console.log('✅ User authenticated successfully');

// 🔄 Database sync
console.log('🔄 Syncing user with database');

// ❌ Errors to watch for
console.error('❌ Authentication failed');
console.error('❌ Database sync failed');
```

#### Network Monitoring
```
1. Open Developer Tools → Network tab
2. Perform authentication flow
3. Monitor requests to:
   - dqproddev.ciamlogin.com (Azure AD)
   - ugmybskacomcdgdngolz.supabase.co (Database)
   - dq-prod-dtma.vercel.app (Application)
```

### 5.2 Production Health Endpoints

Create monitoring URLs to check regularly:

```bash
# Health check endpoints
curl -I https://dq-prod-dtma.vercel.app/
curl -I https://dq-prod-dtma.vercel.app/auth-debug
curl -I https://dq-prod-dtma.vercel.app/courses

# Expected: 200 OK responses
```

### 5.3 Database Monitoring

Monitor Supabase for authentication activity:

```sql
-- Check recent user registrations
SELECT 
  email, 
  name, 
  created_at, 
  last_login 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Check active sessions
SELECT 
  COUNT(*) as active_sessions,
  COUNT(DISTINCT user_id) as unique_users
FROM user_sessions 
WHERE is_active = true;

-- Check authentication errors (if logging implemented)
SELECT 
  COUNT(*) as login_attempts_today
FROM user_sessions 
WHERE login_time >= CURRENT_DATE;
```

---

## 6. Troubleshooting Production Issues

### 6.1 Common Production Issues

#### Issue 1: "Redirect URI mismatch" in Production
**Symptoms:** Error after Azure AD login
**Debug Steps:**
```
1. Check Azure AD app registration redirect URIs
2. Verify exact URL: https://dq-prod-dtma.vercel.app/
3. Check for trailing slash consistency
4. Verify HTTPS is used (not HTTP)
```

**Fix:**
```
1. Go to Azure AD app registration
2. Add redirect URI: https://dq-prod-dtma.vercel.app/
3. Save changes
4. Wait 5-10 minutes for propagation
```

#### Issue 2: Environment Variables Not Set
**Symptoms:** Debug panel shows missing variables
**Debug Steps:**
```
1. Check Vercel dashboard → Project → Settings → Environment Variables
2. Verify all VITE_* variables are present
3. Check variable names match exactly (case-sensitive)
```

**Fix:**
```
1. Add missing environment variables in Vercel
2. Redeploy application
3. Test again
```

#### Issue 3: Database Connection Failures
**Symptoms:** Supabase test fails in debug panel
**Debug Steps:**
```
1. Check Supabase project status
2. Verify database URL and key are correct
3. Check RLS policies are properly configured
4. Test database connection directly
```

### 6.2 Production Debug Commands

#### Check Production Environment
```javascript
// In browser console on production site
console.log('Production Environment Check:', {
  url: window.location.origin,
  clientId: import.meta.env.VITE_AZURE_CLIENT_ID?.substring(0, 8) + '...',
  tenantId: import.meta.env.VITE_AZURE_TENANT_ID?.substring(0, 8) + '...',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...'
});
```

#### Check MSAL State
```javascript
// Check MSAL authentication state
if (window.msal) {
  console.log('MSAL State:', {
    accounts: window.msal.getAllAccounts().length,
    activeAccount: !!window.msal.getActiveAccount()
  });
}
```

---

## 7. Performance Testing

### 7.1 Production Performance Metrics

Test these metrics on production:

| Metric | Target | Test Method |
|:-------|:-------|:------------|
| **Page Load Time** | < 3s | Browser DevTools Performance tab |
| **Authentication Flow** | < 5s | Time from login click to profile display |
| **Database Sync** | < 2s | Debug panel timing |
| **Protected Route Access** | < 1s | Navigation timing |

### 7.2 Load Testing Authentication

#### Simple Load Test
```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
cat > auth-load-test.yml << EOF
config:
  target: 'https://dq-prod-dtma.vercel.app'
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - name: "Load home page"
    requests:
      - get:
          url: "/"
  - name: "Load debug panel"
    requests:
      - get:
          url: "/auth-debug"
EOF

# Run load test
artillery run auth-load-test.yml
```

---

## 8. Security Validation

### 8.1 Production Security Checklist

#### HTTPS Verification
```bash
# Check SSL certificate
curl -I https://dq-prod-dtma.vercel.app/
# Should show: HTTP/2 200

# Check security headers
curl -I https://dq-prod-dtma.vercel.app/ | grep -i security
```

#### Authentication Security
```
✅ Azure AD B2C uses HTTPS
✅ Tokens stored in localStorage (MSAL standard)
✅ No credentials in client-side code
✅ Proper redirect URI validation
✅ RLS policies protect database access
```

### 8.2 Penetration Testing

#### Basic Security Tests
```
1. Try accessing protected routes without authentication
2. Attempt to manipulate localStorage tokens
3. Test with invalid redirect URIs
4. Verify database access is properly restricted
```

---

## Production Testing Checklist

### Pre-Testing Setup
- [ ] Azure AD redirect URIs configured for production
- [ ] Supabase database setup script executed
- [ ] Environment variables configured in Vercel
- [ ] Production deployment successful

### Manual Testing
- [ ] Debug panel loads and shows green status
- [ ] Supabase connection test passes
- [ ] Authentication flow works end-to-end
- [ ] Protected routes properly guarded
- [ ] User profile sync successful
- [ ] Logout flow works correctly
- [ ] Cross-browser compatibility verified

### Automated Testing
- [ ] Playwright production config created
- [ ] Production test suite implemented
- [ ] Tests pass on production environment
- [ ] Performance metrics within targets

### Monitoring Setup
- [ ] Console logging monitored
- [ ] Network requests verified
- [ ] Database activity tracked
- [ ] Error handling validated

### Security Validation
- [ ] HTTPS properly configured
- [ ] Authentication security verified
- [ ] Database access properly restricted
- [ ] No sensitive data exposed

---

## Quick Production Test Commands

```bash
# Test production deployment
curl -I https://dq-prod-dtma.vercel.app/

# Run automated production tests
npx playwright test --config=playwright.config.production.ts

# Monitor production logs (if available)
vercel logs dq-prod-dtma

# Check production environment
# Visit: https://dq-prod-dtma.vercel.app/auth-debug
```

This guide provides comprehensive testing procedures specifically designed for your production deployment at `https://dq-prod-dtma.vercel.app/`. Follow the manual testing steps first, then implement automated testing for ongoing monitoring.
