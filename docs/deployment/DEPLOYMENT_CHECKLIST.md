# Deployment Checklist

Quick reference for deploying DTMA to Vercel.

## Pre-Deployment

- [ ] All tests passing (`npm test -- --run`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Environment variables documented in `.env.example`
- [ ] API endpoints tested locally

## Vercel Setup

- [ ] Vercel account created
- [ ] Project linked (`vercel link`)
- [ ] Environment variables configured in Vercel dashboard

### Required Environment Variables

```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
VITE_AZURE_CLIENT_ID=xxx
VITE_AZURE_TENANT_ID=xxx
VITE_AZURE_SUBDOMAIN=xxx
VITE_API_BASE_URL=https://your-app.vercel.app/api
```

## Deployment

- [ ] Deploy to preview: `vercel`
- [ ] Test preview deployment
- [ ] Deploy to production: `vercel --prod`

## Post-Deployment Testing

### Frontend
- [ ] Homepage loads
- [ ] Course catalog displays courses
- [ ] Course details page shows correct metadata
- [ ] Authentication works (Azure MSAL)

### API Endpoints
- [ ] Enrollment check: `/api/enrollment?action=check&courseSlug=test`
- [ ] Enrollment details: `/api/enrollment?action=details&courseSlug=test`
- [ ] Lesson access: `/api/lesson-access?action=check&courseSlug=test&lessonId=test`

### Course Details Feature (Bug Fixes)
- [ ] B4: Enroll button works (shows correct state)
- [ ] B5: Save course button works (persists state)
- [ ] B6: Lesson count matches schedule
- [ ] B7: Duration is correct (includes all lessons)
- [ ] B8: Related courses show duration

### Browser Console
- [ ] No CORS errors
- [ ] No 404 errors for API calls
- [ ] No authentication errors
- [ ] API calls use correct base URL

## Monitoring

- [ ] Check Vercel logs: `vercel logs --follow`
- [ ] Monitor error rates in Vercel dashboard
- [ ] Set up alerts for critical errors

## Rollback Plan

If issues occur:

```bash
# Rollback to previous deployment
vercel rollback

# Or redeploy specific commit
vercel --prod --force
```

## Common Issues

### API calls fail
- Check `VITE_API_BASE_URL` is set correctly
- Verify CORS headers in serverless functions
- Check Vercel function logs

### Authentication fails
- Verify Azure MSAL credentials
- Check redirect URIs in Azure portal
- Ensure `VITE_AZURE_*` variables are set

### Database errors
- Verify Supabase credentials
- Check RLS policies are correct
- Ensure service role key has proper permissions

## Success Criteria

✅ All tests passing
✅ No console errors
✅ All API endpoints responding
✅ Course Details feature working correctly
✅ Authentication working
✅ Enrollment flow working
✅ Save course working
