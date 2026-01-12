# DTMA Academy Authentication Testing Guide

**Version:** 1.0  
**Last Updated:** January 5, 2026  
**Purpose:** Comprehensive guide for running automated and manual end-to-end authentication tests

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Manual Testing Procedures](#3-manual-testing-procedures)
4. [Automated Testing Setup](#4-automated-testing-setup)
5. [Built-in Debug Tools](#5-built-in-debug-tools)
6. [Test Scenarios](#6-test-scenarios)
7. [Troubleshooting](#7-troubleshooting)
8. [Test Results Documentation](#8-test-results-documentation)

---

## 1. Overview

This guide provides step-by-step instructions for testing the DTMA Academy authentication system using both manual and automated approaches. The testing covers:

- Azure AD B2C authentication flows
- User profile synchronization with Supabase
- Protected route access
- Session management
- Database integration
- Error handling scenarios

---

## 2. Prerequisites

### 2.1 Environment Setup

Ensure you have the following configured:

```bash
# Required Environment Variables
VITE_AZURE_CLIENT_ID=your-client-id-here
VITE_AZURE_TENANT_ID=your-tenant-id-here
VITE_AZURE_SUBDOMAIN=your-subdomain

# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional Testing Variables
VITE_USE_MOCK_AUTH=false
VITE_BYPASS_AZURE_AUTH=false
```

### 2.2 Database Setup

Ensure Supabase database is configured:
```bash
# Run the setup script in Supabase SQL Editor
# File: supabase_auth_setup.sql
```

### 2.3 Azure AD Configuration

Verify Azure AD app registration includes:
- Correct redirect URIs for your environment
- Proper logout URLs
- Required API permissions

---

## 3. Manual Testing Procedures

### 3.1 Quick Start Manual Testing

#### Step 1: Access Debug Panel
1. Start your development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Navigate to the debug panel:
   ```
   http://localhost:3000/auth-debug
   ```

#### Step 2: Environment Validation
1. Check all environment variables show green checkmarks
2. Verify Supabase connection is working
3. Confirm Azure AD configuration is valid

#### Step 3: Basic Authentication Flow
1. Click "Test Login" button
2. Complete Azure AD authentication
3. Verify user information appears
4. Confirm database sync is successful
5. Check customer ID is generated
6. Test logout functionality

### 3.2 Comprehensive Manual Testing

#### 3.2.1 Authentication Flow Testing

**Test Case 1: First-Time User Registration**
```
1. Clear browser storage (localStorage, sessionStorage)
2. Navigate to http://localhost:3000
3. Click "Sign In" button
4. Complete Azure AD registration/login
5. Verify redirect back to application
6. Check user profile is displayed
7. Confirm database user is created
8. Verify customer ID is generated
```

**Expected Results:**
- ✅ Successful redirect to Azure AD
- ✅ User can complete authentication
- ✅ Redirect back to application
- ✅ User profile displayed in header
- ✅ Database user record created
- ✅ Customer ID in format: `CUST_{timestamp}_{random}`

**Test Case 2: Returning User Login**
```
1. Logout from application
2. Click "Sign In" button again
3. Complete Azure AD authentication
4. Verify user profile is restored
5. Check last_login timestamp is updated
```

**Expected Results:**
- ✅ Faster login (existing session)
- ✅ User profile restored
- ✅ Last login timestamp updated
- ✅ No duplicate user records created

#### 3.2.2 Protected Route Testing

**Test Case 3: Unauthenticated Access**
```
1. Ensure user is logged out
2. Navigate directly to http://localhost:3000/dashboard
3. Verify automatic redirect to login
4. Complete authentication
5. Verify redirect back to dashboard
```

**Expected Results:**
- ✅ Automatic redirect to Azure AD login
- ✅ After login, redirect to originally requested page
- ✅ Dashboard content loads successfully

**Test Case 4: Authenticated Access**
```
1. Ensure user is logged in
2. Navigate to http://localhost:3000/dashboard
3. Verify immediate access to dashboard
4. Check user profile in header
```

**Expected Results:**
- ✅ Immediate access to protected content
- ✅ No authentication prompts
- ✅ User profile visible

#### 3.2.3 Session Management Testing

**Test Case 5: Session Persistence**
```
1. Login to application
2. Close browser tab
3. Open new tab to application
4. Verify user remains logged in
```

**Expected Results:**
- ✅ User remains authenticated
- ✅ No re-authentication required
- ✅ Profile data persists

**Test Case 6: Logout Flow**
```
1. Ensure user is logged in
2. Click logout button
3. Verify redirect to Azure AD logout
4. Verify redirect back to home page
5. Confirm user is logged out
6. Try accessing protected route
```

**Expected Results:**
- ✅ Successful logout from Azure AD
- ✅ Local session cleared
- ✅ Protected routes require re-authentication

### 3.3 Database Integration Testing

#### Test Case 7: User Synchronization
```
1. Login with new user account
2. Check Supabase users table for new record
3. Verify all profile fields are populated
4. Confirm customer ID is unique
```

**SQL Query to Check:**
```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
```

**Expected Results:**
- ✅ New user record created
- ✅ Azure user ID matches
- ✅ Customer ID is unique
- ✅ Profile data populated

#### Test Case 8: Profile Updates
```
1. Login with existing user
2. Update profile in Azure AD (if possible)
3. Logout and login again
4. Verify profile updates are synced
```

**Expected Results:**
- ✅ Profile changes reflected in database
- ✅ Updated timestamp changed
- ✅ Last login timestamp updated

---

## 4. Automated Testing Setup

### 4.1 Install Testing Dependencies

```bash
# Install Playwright for E2E testing
npm install -D @playwright/test

# Install additional testing utilities
npm install -D dotenv
```

### 4.2 Create Playwright Configuration

Create `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 4.3 Create E2E Test Files

#### 4.3.1 Authentication Flow Tests

Create `tests/e2e/auth-flow.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should redirect to Azure AD login when accessing protected route', async ({ page }) => {
    // Navigate to protected route
    await page.goto('/dashboard');
    
    // Should redirect to Azure AD
    await expect(page).toHaveURL(/login\.microsoftonline\.com|ciamlogin\.com/);
    
    // Check for Azure AD login elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should show login button on home page when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Check for sign in button
    await expect(page.locator('text=Sign In')).toBeVisible();
    
    // Should not show user profile
    await expect(page.locator('[data-testid="user-profile"]')).not.toBeVisible();
  });

  test('should access debug panel and show environment status', async ({ page }) => {
    await page.goto('/auth-debug');
    
    // Check debug panel loads
    await expect(page.locator('h2:has-text("Authentication Debug Panel")')).toBeVisible();
    
    // Check environment variables section
    await expect(page.locator('text=Environment Configuration')).toBeVisible();
    
    // Should show Azure Client ID status
    await expect(page.locator('text=Azure Client ID')).toBeVisible();
  });
});
```

#### 4.3.2 Mock Authentication Tests

Create `tests/e2e/mock-auth.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Mock Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Set mock auth environment variable
    await page.addInitScript(() => {
      window.localStorage.setItem('VITE_USE_MOCK_AUTH', 'true');
    });
  });

  test('should login with mock authentication', async ({ page }) => {
    await page.goto('/auth-debug');
    
    // Enable mock auth mode
    await page.evaluate(() => {
      (window as any).__VITE_USE_MOCK_AUTH__ = 'true';
    });
    
    await page.reload();
    
    // Click test login
    await page.click('button:has-text("Test Login")');
    
    // Should show mock user profile
    await expect(page.locator('text=Mock User')).toBeVisible();
    
    // Should show authenticated status
    await expect(page.locator('text=Authenticated')).toBeVisible();
  });
});
```

#### 4.3.3 Database Integration Tests

Create `tests/e2e/database-integration.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Database Integration', () => {
  test('should test Supabase connection', async ({ page }) => {
    await page.goto('/auth-debug');
    
    // Click test Supabase button
    await page.click('button:has-text("Test Supabase")');
    
    // Wait for test results
    await page.waitForSelector('text=Supabase Test Results', { timeout: 10000 });
    
    // Check for success status
    await expect(page.locator('text=✅ Success')).toBeVisible();
    
    // Check for connection status
    await expect(page.locator('text=connection: OK')).toBeVisible();
  });

  test('should show database user information when authenticated', async ({ page }) => {
    // This test requires actual authentication or mock setup
    await page.goto('/auth-debug');
    
    // If user is authenticated, should show database user info
    const dbUserSection = page.locator('text=Database User Information');
    
    if (await dbUserSection.isVisible()) {
      await expect(page.locator('text=Customer ID')).toBeVisible();
      await expect(page.locator('text=Azure User ID')).toBeVisible();
    }
  });
});
```

### 4.4 Run Automated Tests

#### 4.4.1 Install Playwright Browsers
```bash
npx playwright install
```

#### 4.4.2 Run Tests
```bash
# Run all E2E tests
npx playwright test

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/e2e/auth-flow.spec.ts

# Run tests with debug mode
npx playwright test --debug

# Generate test report
npx playwright show-report
```

### 4.5 Continuous Integration Setup

Create `.github/workflows/e2e-tests.yml`:
```yaml
name: E2E Authentication Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - uses: actions/setup-node@v3
      with:
        node-version: 18
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
      
    - name: Run Playwright tests
      run: npx playwright test
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

---

## 5. Built-in Debug Tools

### 5.1 Authentication Debug Panel

**Location:** `http://localhost:3000/auth-debug`

**Features:**
- Environment variable validation
- Authentication status indicators
- Database sync verification
- Supabase connection testing
- User profile display
- Test login/logout functionality

### 5.2 Console Logging

The application provides extensive console logging:

```javascript
// Enable detailed logging in browser console
// Look for these log prefixes:
🔐 // Authentication events
🔄 // Database sync operations
✅ // Success confirmations
❌ // Error details
🔧 // Configuration checks
🎯 // Event processing
```

### 5.3 Browser Developer Tools

#### Network Tab Monitoring
1. Open Developer Tools (F12)
2. Go to Network tab
3. Perform authentication flow
4. Monitor requests to:
   - Azure AD endpoints
   - Supabase API calls
   - Application API calls

#### Application Tab Inspection
1. Check localStorage for MSAL tokens
2. Verify session storage
3. Inspect cookies (if any)

---

## 6. Test Scenarios

### 6.1 Happy Path Scenarios

#### Scenario 1: New User Registration
```
Given: User has never logged in before
When: User clicks "Sign In" and completes Azure AD registration
Then: 
  - User is redirected back to application
  - User profile is displayed
  - Database record is created
  - Customer ID is generated
  - User can access protected routes
```

#### Scenario 2: Returning User Login
```
Given: User has previously registered
When: User clicks "Sign In" and completes Azure AD login
Then:
  - User is authenticated quickly
  - Profile is restored
  - Last login timestamp is updated
  - User can access protected routes
```

### 6.2 Error Scenarios

#### Scenario 3: Network Failure During Login
```
Given: User initiates login
When: Network connection is lost during Azure AD redirect
Then:
  - User sees appropriate error message
  - Application remains in stable state
  - User can retry login
```

#### Scenario 4: Database Connection Failure
```
Given: User completes Azure AD authentication
When: Supabase database is unavailable
Then:
  - User authentication still succeeds
  - Warning is logged about database sync failure
  - User can still access application
  - Sync will retry on next login
```

### 6.3 Edge Cases

#### Scenario 5: Expired Session
```
Given: User has been inactive for extended period
When: User tries to access protected route
Then:
  - User is prompted to re-authenticate
  - After login, user is redirected to original destination
```

#### Scenario 6: Multiple Browser Tabs
```
Given: User is logged in with multiple tabs open
When: User logs out from one tab
Then:
  - All tabs reflect logged out state
  - Protected content is no longer accessible
```

---

## 7. Troubleshooting

### 7.1 Common Issues

#### Issue 1: "Redirect URI mismatch" Error
**Symptoms:** Error during Azure AD redirect
**Solution:**
1. Check Azure AD app registration
2. Verify redirect URIs include your domain
3. Ensure URIs end with `/`
4. Check environment variables

#### Issue 2: Database Sync Failures
**Symptoms:** User authenticated but no database record
**Solution:**
1. Check Supabase connection in debug panel
2. Verify environment variables
3. Check RLS policies
4. Review browser console for errors

#### Issue 3: Protected Routes Not Working
**Symptoms:** Can access dashboard without authentication
**Solution:**
1. Check ProtectedRoute component is wrapping routes
2. Verify AuthProvider is at app root level
3. Check authentication state in debug panel

### 7.2 Debug Commands

#### Check Environment Variables
```bash
# In browser console
console.log('Environment:', {
  clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
  tenantId: import.meta.env.VITE_AZURE_TENANT_ID,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL
});
```

#### Check Authentication State
```bash
# In browser console (when on app page)
console.log('Auth State:', {
  accounts: window.msal?.getAllAccounts(),
  activeAccount: window.msal?.getActiveAccount()
});
```

#### Check Database Connection
```bash
# Use the debug panel Supabase test button
# Or check browser network tab for Supabase requests
```

---

## 8. Test Results Documentation

### 8.1 Test Report Template

Create a test report for each testing session:

```markdown
# Authentication Test Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Development/Staging/Production]
**Browser:** [Chrome/Firefox/Safari]

## Test Results Summary

| Test Case | Status | Notes |
|:----------|:------:|:------|
| New User Registration | ✅/❌ | [Notes] |
| Returning User Login | ✅/❌ | [Notes] |
| Protected Route Access | ✅/❌ | [Notes] |
| Database Sync | ✅/❌ | [Notes] |
| Logout Flow | ✅/❌ | [Notes] |

## Issues Found

1. [Issue description]
   - **Severity:** High/Medium/Low
   - **Steps to reproduce:** [Steps]
   - **Expected:** [Expected behavior]
   - **Actual:** [Actual behavior]

## Environment Details

- Azure AD Tenant: [Tenant ID]
- Supabase Project: [Project URL]
- Application URL: [URL]
- Browser Version: [Version]
```

### 8.2 Automated Test Reports

Playwright generates HTML reports automatically:

```bash
# View latest test report
npx playwright show-report

# Reports are saved to: playwright-report/index.html
```

### 8.3 Performance Metrics

Track these metrics during testing:

| Metric | Target | Actual | Status |
|:-------|:-------|:-------|:-------|
| Login Time | < 3s | [Time] | ✅/❌ |
| Database Sync | < 2s | [Time] | ✅/❌ |
| Route Protection | < 100ms | [Time] | ✅/❌ |
| Token Refresh | < 1s | [Time] | ✅/❌ |

---

## Quick Reference Commands

### Manual Testing
```bash
# Start development server
npm run dev

# Access debug panel
http://localhost:3000/auth-debug

# Clear browser storage
# Developer Tools > Application > Storage > Clear
```

### Automated Testing
```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Run all tests
npx playwright test

# Run with UI
npx playwright test --ui

# Debug mode
npx playwright test --debug

# View report
npx playwright show-report
```

### Database Testing
```sql
-- Check user records
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- Check session records
SELECT * FROM user_sessions WHERE is_active = true;

-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

This comprehensive testing guide provides everything you need to thoroughly test your DTMA Academy authentication system both manually and automatically. The combination of manual testing procedures, automated E2E tests, and built-in debug tools ensures complete coverage of all authentication scenarios.