# Stage00 Testing Quick Checklist

## Quick Start (3 Terminals)

**Terminal 1 - Backend API:**
```cmd
cd api
node server.mjs
```
✅ Look for: "External CTA API: ✅ Configured"

**Terminal 2 - Automated Tests:**
```cmd
node test-stage00-landing.mjs
```
✅ Look for: "5/5 passed"

**Terminal 3 - Frontend:**
```cmd
npm run dev
```
✅ Open: http://localhost:5173/

## Manual Verification (5 minutes)

### 1. Browser DevTools Check
- [ ] Open http://localhost:5173/
- [ ] Press F12 → Network tab → Refresh
- [ ] Click any `.js` file
- [ ] Search for `enquiry1234` → Should NOT find it ❌
- [ ] Search for `kfrealexpressserver` → Should NOT find it ❌

### 2. API Endpoint Test
```cmd
curl -X POST http://localhost:4000/api/public/cta/contact -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"email\":\"test@example.com\",\"message\":\"Test\"}"
```
✅ Should return: `{"success":true,...}`

### 3. Validation Test
```cmd
curl -X POST http://localhost:4000/api/public/cta/contact -H "Content-Type: application/json" -d "{\"name\":\"Test\"}"
```
✅ Should return: `{"error":"Missing required fields:..."}` (400 status)

## Security Checklist

### Backend (api/)
- [ ] `api/.env` contains `KF_API_TOKEN=enquiry1234`
- [ ] `api/.env` contains `KF_API_BASE_URL=https://...`
- [ ] `api/server.mjs` has `publicCTAHandlers` defined
- [ ] Server logs show "External CTA API: ✅ Configured"

### Frontend (src/)
- [ ] `src/features/landing/components/CallToAction.tsx` has NO `Authorization: Bearer`
- [ ] `src/features/landing/components/CallToAction.tsx` calls `${apiBaseUrl}/public/cta/*`
- [ ] Root `.env` has `VITE_API_BASE_URL=http://localhost:4000/api`
- [ ] Root `.env` does NOT have `KF_API_TOKEN` ❌

## Pass Criteria

All must be ✅:
- [ ] Backend starts with "External CTA API: ✅ Configured"
- [ ] Automated tests show "5/5 passed"
- [ ] Landing page loads without console errors
- [ ] No `enquiry1234` found in browser bundle
- [ ] API endpoints return success responses
- [ ] Validation returns 400 errors correctly

## If Tests Fail

**Backend won't start:**
→ Check `api/.env` has `KF_API_TOKEN` and `VITE_SUPABASE_SERVICE_ROLE_KEY`

**Tests fail with connection error:**
→ Ensure backend is running on port 4000

**502 Bad Gateway errors:**
→ External API is down - this is OK, proxy is working

**Secrets found in bundle:**
→ Run `npm run build` and check again
→ Clear browser cache (Ctrl+Shift+Delete)

## Done!

When all checks pass:
```cmd
git add .
git commit -m "feat(stage00): implement landing page security remediation"
git push origin sprint0-stage00-fixes-Damarice
```

Then create a PR with test results! 🎉
