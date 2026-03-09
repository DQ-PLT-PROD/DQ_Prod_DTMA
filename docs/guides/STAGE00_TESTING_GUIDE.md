# Stage00 Landing Page Testing Guide

This guide walks you through testing the Stage00 security remediation changes.

## Prerequisites

1. Node.js installed
2. Both frontend and backend dependencies installed
3. Environment variables configured

## Step-by-Step Testing

### Step 1: Start the Backend API Server

Open a terminal and start the API server:

```cmd
cd api
node server.mjs
```

**Expected Output:**
```
✅ Environment variables loaded from .env
✅ Supabase service role client initialized
🚀 DTMA API Server listening on http://localhost:4000
📋 Available endpoints:
   GET  /api/health - Health check
   
   🌐 Public CTA Endpoints (No Auth):
   POST /api/public/cta/partner - Submit partnership form
   POST /api/public/cta/contact - Submit contact form
   ...
🔧 Configuration:
   Supabase: ✅ Connected
   Authentication: ✅ Configured
   External CTA API: ✅ Configured
```

**Troubleshooting:**
- If "External CTA API: ❌ Not configured", check that `KF_API_TOKEN` is in `api/.env`
- If port 4000 is in use, update `API_PORT` in `api/.env`

### Step 2: Run the Automated Test Suite

In a new terminal (keep the API server running):

```cmd
node test-stage00-landing.mjs
```

**Expected Output:**
```
🧪 Stage00 Landing Page Security Validation

Test 1: API Health Check
✅ API server is healthy

Test 2: Partner Form Proxy Endpoint
✅ Partner form endpoint works
   Response: Partnership request submitted successfully

Test 3: Contact Form Proxy Endpoint
✅ Contact form endpoint works
   Response: Contact request submitted successfully

Test 4: Input Validation
✅ Input validation works
   Error: Missing required fields: email, message

Test 5: Rate Limiting (Optional)
⏭️  Skipping rate limit test

==================================================

📊 Test Results: 5/5 passed

✅ All Stage00 security validations passed!
```

**Note:** If external API is down, you may see 502 errors - this is acceptable as it proves the proxy is working.

### Step 3: Start the Frontend Development Server

In a new terminal:

```cmd
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 4: Manual Landing Page Testing

Open your browser to `http://localhost:5173/`

#### Test 4.1: Landing Page Loads
- [ ] Page loads without errors
- [ ] No console errors in browser DevTools (F12)
- [ ] Hero section displays correctly
- [ ] All sections render properly

#### Test 4.2: Verify No Exposed Secrets
1. Open DevTools (F12) → Network tab
2. Refresh the page
3. Click on any JavaScript bundle file (e.g., `index-xxx.js`)
4. Search (Ctrl+F) for:
   - `enquiry1234` - Should NOT be found ❌
   - `Bearer enquiry` - Should NOT be found ❌
   - `kfrealexpressserver` - Should NOT be found ❌

**Expected:** None of these strings should appear in the frontend bundle.

#### Test 4.3: Test CTA Forms (If Visible)

**Note:** The current landing page has partner/contact forms hidden. To test them:

1. Scroll to the bottom CTA section
2. If forms are not visible, you can test the endpoints directly (see Step 5)

### Step 5: Manual API Endpoint Testing

Use these curl commands or a tool like Postman:

#### Test Partner Form Endpoint

```cmd
curl -X POST http://localhost:4000/api/public/cta/partner ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Partner\",\"email\":\"test@example.com\",\"serviceCategory\":\"Loans & Credit Facilities\",\"message\":\"Test message\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Partnership request submitted successfully"
}
```

#### Test Contact Form Endpoint

```cmd
curl -X POST http://localhost:4000/api/public/cta/contact ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"message\":\"Test message\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Contact request submitted successfully"
}
```

#### Test Input Validation

```cmd
curl -X POST http://localhost:4000/api/public/cta/contact ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\"}"
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Missing required fields: email, message"
}
```

#### Test Invalid Email

```cmd
curl -X POST http://localhost:4000/api/public/cta/contact ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"invalid-email\",\"message\":\"Test\"}"
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Invalid email format"
}
```

### Step 6: Security Verification Checklist

Run through this checklist:

#### Backend Security
- [ ] Bearer token NOT in frontend code
- [ ] Bearer token IS in `api/.env` as `KF_API_TOKEN`
- [ ] External API calls go through backend proxy
- [ ] Input validation works (tested in Step 5)
- [ ] Rate limiting is applied (check server logs)

#### Frontend Security
- [ ] No hardcoded tokens in `src/features/landing/components/CallToAction.tsx`
- [ ] Forms call `${apiBaseUrl}/public/cta/*` endpoints
- [ ] No direct calls to `kfrealexpressserver.vercel.app`
- [ ] No `Authorization: Bearer` headers in frontend code

#### Environment Variables
- [ ] `KF_API_TOKEN` in `api/.env` (backend only)
- [ ] `KF_API_BASE_URL` in `api/.env` (backend only)
- [ ] `VITE_API_BASE_URL` in root `.env` (frontend - safe)
- [ ] No `KF_*` variables in root `.env` (frontend)

### Step 7: Test Landing Page with RLS Enabled

The landing page should work even with strict RLS policies because it only:
1. Reads public course data (using anon key)
2. Submits CTA forms (through backend proxy)

**To verify:**
1. Ensure Supabase RLS is enabled on all tables
2. Load the landing page at `http://localhost:5173/`
3. Verify courses display correctly
4. Check browser console for no RLS errors

### Step 8: Production Readiness Check

Before deploying to production:

#### Environment Variables
- [ ] Update `VITE_API_BASE_URL` in production `.env` to production API URL
- [ ] Verify `KF_API_TOKEN` is set in production backend environment
- [ ] Verify `KF_API_BASE_URL` is set in production backend environment

#### API Server
- [ ] Backend API is deployed and accessible
- [ ] Health check endpoint works: `GET /api/health`
- [ ] CORS is configured for production domain

#### Frontend
- [ ] Build succeeds: `npm run build`
- [ ] No secrets in build output: `dist/assets/*.js`
- [ ] Landing page loads in production
- [ ] Forms submit successfully

## Common Issues & Solutions

### Issue: "External CTA API: ❌ Not configured"

**Solution:** Add to `api/.env`:
```
KF_API_TOKEN=enquiry1234
KF_API_BASE_URL=https://kfrealexpressserver.vercel.app/api/v1
```

### Issue: "Failed to connect to API"

**Solution:** 
1. Check API server is running on port 4000
2. Verify `VITE_API_BASE_URL` in root `.env` points to correct URL
3. Check for CORS errors in browser console

### Issue: Forms return 502 Bad Gateway

**Cause:** External Khalifa Fund API is down or unreachable

**Solution:** This is expected behavior - the backend proxy is working correctly. The 502 indicates the proxy tried to forward the request but the external service was unavailable.

### Issue: Rate limit errors (429 Too Many Requests)

**Cause:** Too many requests in short time period

**Solution:** Wait 15 minutes or adjust rate limits in `api/middleware/rateLimiter.mjs`

## Test Results Documentation

After completing all tests, document your results:

```
✅ Backend API server starts successfully
✅ Automated test suite passes (5/5)
✅ Landing page loads without errors
✅ No secrets found in frontend bundle
✅ CTA forms work through backend proxy
✅ Input validation works correctly
✅ RLS compatibility verified
✅ Production readiness confirmed
```

## Next Steps

Once all tests pass:

1. Commit changes to `sprint0-stage00-fixes-Damarice` branch
2. Push to GitHub
3. Create pull request with test results
4. Request code review
5. Deploy to staging for final validation

## Support

If you encounter issues not covered in this guide:
1. Check server logs for detailed error messages
2. Review browser console for frontend errors
3. Verify all environment variables are set correctly
4. Consult the remediation report: `docs/reports/SPRINT0_STAGE00_REMEDIATION.md`
