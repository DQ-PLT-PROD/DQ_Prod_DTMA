# Vercel Deployment Guide

This guide explains how the DTMA application is deployed on Vercel, including the backend API setup.

## Architecture Overview

### Local Development
- **Frontend**: Vite dev server on `http://localhost:3000`
- **Backend API**: Node.js HTTP server on `http://localhost:3001`

### Production (Vercel)
- **Frontend**: Static site served by Vercel CDN
- **Backend API**: Vercel Serverless Functions at `/api/*` endpoints

## Backend API Structure

### Serverless Functions

The backend API is split into serverless functions in the `api/` directory:

1. **`api/enrollment.mjs`** - Enrollment operations
   - `GET /api/enrollment?action=check&courseSlug=xxx` - Check enrollment status
   - `GET /api/enrollment?action=details&courseSlug=xxx` - Get enrollment details
   - `POST /api/enrollment?action=enroll&courseSlug=xxx` - Enroll in course

2. **`api/lesson-access.mjs`** - Lesson access control
   - `GET /api/lesson-access?action=check&courseSlug=xxx&lessonId=yyy` - Check lesson access

### How It Works

**Local Development:**
```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start backend API
npm run dev:api
# or
node api/server.mjs
```

**Vercel Deployment:**
- Vercel automatically detects `.mjs` files in the `api/` directory
- Each file becomes a serverless function endpoint
- No separate backend server needed
- Functions are invoked on-demand

## Environment Variables

### Required for Vercel

Set these in your Vercel project settings (Settings → Environment Variables):

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Azure MSAL
VITE_AZURE_CLIENT_ID=your_client_id
VITE_AZURE_TENANT_ID=your_tenant_id
VITE_AZURE_SUBDOMAIN=your_subdomain

# API Base URL (set to your Vercel domain)
VITE_API_BASE_URL=https://your-app.vercel.app/api
```

### Local Development

Create a `.env` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env

# Edit .env and set your values
VITE_API_BASE_URL=http://localhost:3001/api
```

## Deployment Steps

### 1. Initial Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link
```

### 2. Configure Environment Variables

```bash
# Set environment variables via CLI
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_SUPABASE_SERVICE_ROLE_KEY
vercel env add VITE_AZURE_CLIENT_ID
vercel env add VITE_AZURE_TENANT_ID
vercel env add VITE_AZURE_SUBDOMAIN
vercel env add VITE_API_BASE_URL

# Or set them in the Vercel dashboard:
# https://vercel.com/your-team/your-project/settings/environment-variables
```

### 3. Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## API Client Configuration

The frontend API clients automatically use the correct base URL:

```typescript
// src/lib/api/enrollmentApiClient.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
```

- **Local**: Uses `http://localhost:3001/api`
- **Production**: Uses `https://your-app.vercel.app/api`

## Vercel Configuration

The `vercel.json` file configures routing:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

This ensures:
- API requests go to serverless functions
- All other requests go to the SPA

## Testing Deployment

### 1. Test Locally with Vercel Dev

```bash
# Run Vercel dev server (simulates production)
npm run vercel:dev

# This starts:
# - Frontend on http://localhost:3000
# - API functions on http://localhost:3000/api
```

### 2. Test Production Deployment

After deploying to Vercel:

1. **Check API Health**
   ```bash
   curl https://your-app.vercel.app/api/enrollment?action=check&courseSlug=test
   ```

2. **Test Frontend**
   - Navigate to course details page
   - Check browser console for API calls
   - Verify enrollment button works
   - Test save course functionality

3. **Monitor Logs**
   ```bash
   # View real-time logs
   vercel logs --follow
   
   # Or check in dashboard:
   # https://vercel.com/your-team/your-project/logs
   ```

## Troubleshooting

### Issue: API calls fail with CORS errors

**Solution**: Ensure serverless functions have CORS headers:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*')
res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
```

### Issue: Environment variables not working

**Solution**: 
1. Check they're set in Vercel dashboard
2. Redeploy after adding new variables
3. Ensure they start with `VITE_` for frontend access

### Issue: Serverless function timeout

**Solution**: 
- Vercel free tier: 10s timeout
- Optimize database queries
- Add indexes to Supabase tables
- Consider upgrading Vercel plan

### Issue: Cold starts are slow

**Solution**:
- Serverless functions have cold starts (~1-2s)
- This is normal for first request
- Subsequent requests are fast
- Consider Vercel Pro for better performance

## Migration from Node.js Server

The old `api/server.mjs` HTTP server is kept for local development convenience. In production:

- ✅ Use serverless functions (`api/enrollment.mjs`, `api/lesson-access.mjs`)
- ❌ Don't deploy the HTTP server (Vercel doesn't support long-running processes)

## Performance Considerations

### Serverless Functions
- **Cold Start**: ~1-2 seconds (first request)
- **Warm**: <100ms (subsequent requests)
- **Timeout**: 10s (free), 60s (pro)

### Optimization Tips
1. Keep functions small and focused
2. Reuse Supabase client instances
3. Add database indexes
4. Use edge functions for better latency (future enhancement)

## Monitoring

### Vercel Analytics
- Enable in project settings
- Track API response times
- Monitor error rates

### Logs
```bash
# Real-time logs
vercel logs --follow

# Filter by function
vercel logs --follow api/enrollment.mjs
```

## Next Steps

1. ✅ Set up environment variables in Vercel
2. ✅ Deploy to preview environment
3. ✅ Test all API endpoints
4. ✅ Deploy to production
5. 🔄 Monitor logs and performance
6. 🔄 Set up alerts for errors

## Resources

- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
