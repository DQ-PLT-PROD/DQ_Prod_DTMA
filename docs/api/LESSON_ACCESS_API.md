# Lesson Access API Documentation
## Feature 02.1 - Server-Side Access Enforcement

**Version:** 1.0  
**Date:** January 28, 2026  
**Status:** Production Ready

## Overview

The Lesson Access API provides server-side enforcement of lesson access rules, ensuring that only authorized users can access course content based on enrollment status and lesson type (preview vs full content).

## Base URL

```
http://localhost:3001/api
```

## Authentication

All lesson access endpoints support optional authentication via Azure AD Bearer tokens:

```http
Authorization: Bearer <azure_ad_token>
```

- **Unauthenticated requests:** Can access preview content only
- **Authenticated requests:** Can access full content based on enrollment status

## Endpoints

### 1. Check Lesson Access

Check if a user can access a specific lesson.

```http
GET /lessons/access/:courseSlug/:lessonId
```

**Parameters:**
- `courseSlug` (string): Course identifier
- `lessonId` (string): Lesson identifier

**Response:**
```json
{
  "success": true,
  "canAccess": true,
  "accessType": "preview|full|denied|sequential_blocked",
  "reason": "Human-readable access reason",
  "lesson": {
    "id": "lesson-123",
    "title": "Course Introduction",
    "isPreview": true,
    "orderIndex": 0
  },
  "requiredLessons": [
    {
      "id": "lesson-122",
      "title": "Previous Lesson",
      "orderIndex": -1
    }
  ],
  "enrollment": {
    "id": "enrollment-456",
    "status": "active"
  }
}
```

**Access Types:**
- `preview`: Preview lesson, accessible to all users
- `full`: Full access granted to enrolled user
- `denied`: Access denied (not enrolled or not authenticated)
- `sequential_blocked`: Access blocked due to incomplete prerequisites
- `error`: Access check failed

### 2. Get Course Access Summary

Get access status for all lessons in a course.

```http
GET /lessons/course-access/:courseSlug
```

**Parameters:**
- `courseSlug` (string): Course identifier

**Response:**
```json
{
  "success": true,
  "courseSlug": "perfecting-life-transactions",
  "userId": "user-123",
  "isEnrolled": false,
  "enrollmentStatus": null,
  "lessons": [
    {
      "lessonId": "lesson-123",
      "title": "Course Introduction",
      "orderIndex": 0,
      "isPreview": true,
      "canAccess": true,
      "accessType": "preview",
      "reason": "Preview lesson",
      "requiredLessons": []
    }
  ],
  "summary": {
    "totalLessons": 11,
    "previewLessons": 3,
    "accessibleLessons": 3,
    "blockedLessons": 8
  }
}
```

### 3. Get Lesson Content

Get lesson content with access control enforcement.

```http
GET /lessons/content/:courseSlug/:lessonId
```

**Parameters:**
- `courseSlug` (string): Course identifier
- `lessonId` (string): Lesson identifier

**Response (Success):**
```json
{
  "success": true,
  "lesson": {
    "id": "lesson-123",
    "title": "Course Introduction",
    "type": "intro",
    "orderIndex": 0,
    "estimatedDurationMinutes": 5,
    "isPreview": true,
    "content": "Welcome to the course...",
    "videoUrl": "https://example.com/video.mp4",
    "resourceUrl": "https://example.com/resource.pdf",
    "accessType": "preview"
  },
  "accessInfo": {
    "canAccess": true,
    "accessType": "preview",
    "reason": "Preview lesson"
  }
}
```

**Response (Access Denied):**
```json
{
  "error": "Access denied",
  "message": "Enrollment required",
  "details": {
    "accessType": "denied"
  }
}
```

**Status Codes:**
- `200`: Content accessible
- `401`: Authentication required
- `403`: Access denied (enrolled but blocked)
- `404`: Lesson not found

### 4. Update Lesson Progress

Update lesson completion progress (requires authentication).

```http
POST /lessons/progress/:courseSlug/:lessonId
```

**Parameters:**
- `courseSlug` (string): Course identifier
- `lessonId` (string): Lesson identifier

**Request Body:**
```json
{
  "completed": true,
  "watchTimeSeconds": 300
}
```

**Response:**
```json
{
  "success": true,
  "progress": {
    "lessonId": "lesson-123",
    "completed": true,
    "watchTimeSeconds": 300,
    "completedAt": "2026-01-28T07:30:00Z",
    "updatedAt": "2026-01-28T07:30:00Z"
  },
  "message": "Lesson progress updated successfully"
}
```

**Status Codes:**
- `200`: Progress updated successfully
- `401`: Authentication required
- `403`: Access denied (not enrolled)
- `404`: Lesson not found

## Access Control Rules

### 1. Preview Content
- **Rule:** Lessons with `is_preview = true` are accessible to all users
- **Authentication:** Not required
- **Enrollment:** Not required

### 2. Full Content
- **Rule:** Lessons with `is_preview = false` require active enrollment
- **Authentication:** Required
- **Enrollment:** Must have `status = 'active'` enrollment

### 3. Sequential Access
- **Rule:** Users must complete previous non-preview lessons to access next lessons
- **Check:** Based on `lesson_progress.completed = true`
- **Order:** Determined by `lessons.order_index`

### 4. Progress Tracking
- **Rule:** Only authenticated, enrolled users can update progress
- **Authentication:** Required (Azure AD token)
- **Enrollment:** Must have active enrollment

## Error Handling

### Common Error Responses

**Authentication Required (401):**
```json
{
  "error": "Authentication required",
  "message": "No authentication token provided"
}
```

**Access Denied (403):**
```json
{
  "error": "Access denied",
  "message": "Enrollment required",
  "details": {
    "accessType": "denied"
  }
}
```

**Lesson Not Found (404):**
```json
{
  "error": "Lesson not found",
  "details": {
    "accessType": "denied"
  }
}
```

**Server Error (500):**
```json
{
  "error": "Internal server error",
  "message": "Failed to check lesson access"
}
```

## Frontend Integration

### Using the Lesson Access API Client

```typescript
import { lessonAccessApiClient } from '@/lib/api/lessonAccessApiClient'

// Check if user can access a lesson
const accessResult = await lessonAccessApiClient.checkLessonAccess(
  'perfecting-life-transactions', 
  'lesson-123'
)

if (accessResult?.canAccess) {
  // User can access the lesson
  console.log('Access granted:', accessResult.accessType)
} else {
  // Access denied
  console.log('Access denied:', accessResult?.reason)
}

// Get course access summary
const summary = await lessonAccessApiClient.getCourseAccessSummary(
  'perfecting-life-transactions'
)

console.log(`User can access ${summary?.summary.accessibleLessons} lessons`)

// Get lesson content
const content = await lessonAccessApiClient.getLessonContent(
  'perfecting-life-transactions',
  'lesson-123'
)

if (content.success) {
  // Display lesson content
  console.log('Lesson:', content.lesson?.title)
  console.log('Video URL:', content.lesson?.videoUrl)
}

// Update lesson progress
const progressResult = await lessonAccessApiClient.updateLessonProgress(
  'perfecting-life-transactions',
  'lesson-123',
  true, // completed
  300   // watch time in seconds
)

if (progressResult.success) {
  console.log('Progress updated successfully')
}
```

### Using with React Components

```typescript
import { useEffect, useState } from 'react'
import { lessonAccessApiClient } from '@/lib/api/lessonAccessApiClient'

function LessonComponent({ courseSlug, lessonId }) {
  const [accessResult, setAccessResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      const result = await lessonAccessApiClient.checkLessonAccess(courseSlug, lessonId)
      setAccessResult(result)
      setLoading(false)
    }

    checkAccess()
  }, [courseSlug, lessonId])

  if (loading) return <div>Checking access...</div>

  if (!accessResult?.canAccess) {
    return (
      <div className="access-denied">
        <h3>Access Denied</h3>
        <p>{accessResult?.reason}</p>
        {accessResult?.accessType === 'sequential_blocked' && (
          <div>
            <p>Complete these lessons first:</p>
            <ul>
              {accessResult.requiredLessons?.map(lesson => (
                <li key={lesson.id}>{lesson.title}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="lesson-content">
      <h2>{accessResult.lesson?.title}</h2>
      <p>Access Type: {accessResult.accessType}</p>
      {/* Render lesson content */}
    </div>
  )
}
```

## Database Schema

### Lessons Table
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY,
  course_slug VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  order_index INTEGER NOT NULL,
  estimated_duration_minutes INTEGER,
  video_url VARCHAR,
  resource_url VARCHAR,
  content TEXT,
  is_preview BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### User Enrollments Table
```sql
CREATE TABLE user_enrollments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  course_slug VARCHAR NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  last_accessed_at TIMESTAMP,
  progress_pct INTEGER DEFAULT 0,
  status VARCHAR DEFAULT 'active',
  enrollment_method VARCHAR DEFAULT 'explicit',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_slug)
);
```

### Lesson Progress Table
```sql
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES user_enrollments(id),
  lesson_id UUID NOT NULL REFERENCES lessons(id),
  completed BOOLEAN DEFAULT FALSE,
  watch_time_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(enrollment_id, lesson_id)
);
```

## Security Considerations

### 1. Authentication
- Azure AD JWT tokens validated server-side
- Token signature verification using JWKS
- Proper issuer and audience validation

### 2. Authorization
- User can only access their own progress data
- Enrollment status checked for each request
- Sequential access enforced based on completion

### 3. Data Protection
- No sensitive data exposed in error messages
- Proper HTTP status codes for different scenarios
- Input validation on all parameters

### 4. Rate Limiting
- Consider implementing rate limiting for production
- Monitor for unusual access patterns
- Log security-relevant events

## Testing

### Running Tests

```bash
# Start the API server
npm run dev:api

# Run end-to-end tests
node test-e2e-lesson-access.mjs

# Run specific test suites
node test-lesson-access-api.mjs
node test-auth-api.mjs
```

### Test Coverage

- ✅ Authentication middleware
- ✅ Lesson access control
- ✅ Preview vs full content
- ✅ Sequential access logic
- ✅ Progress tracking
- ✅ Error handling
- ✅ Security boundaries

## Deployment

### Environment Variables

```bash
# Azure AD Configuration
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_AZURE_SUBDOMAIN=your-subdomain

# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Configuration
API_PORT=3001
```

### Production Checklist

- ✅ Environment variables configured
- ✅ Database migrations applied
- ✅ Authentication middleware enabled
- ✅ CORS configured for frontend domain
- ✅ Error logging implemented
- ✅ Health check endpoint available
- ✅ API documentation updated

## Support

For questions or issues with the Lesson Access API:

1. Check the test suite results
2. Verify environment configuration
3. Review server logs for errors
4. Consult this documentation
5. Contact the development team

---

**Last Updated:** January 28, 2026  
**Version:** 1.0  
**Status:** Production Ready