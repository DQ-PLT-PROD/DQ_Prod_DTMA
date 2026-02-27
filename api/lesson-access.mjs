/**
 * Vercel Serverless Function: Lesson Access API
 * Handles lesson access checks and enforcement
 */
import { createClient } from '@supabase/supabase-js'
import { authenticateUser } from './middleware/auth.mjs'
import { applyRateLimit } from './middleware/rateLimiter.mjs'
import { logAccessEvent } from './middleware/requestLogger.mjs'

// Initialize Supabase client
const supabaseClient = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Helper to send JSON response
const sendJSON = (res, statusCode, data) => {
  res.status(statusCode).json(data)
}

// Helper to send error response
const sendError = (res, statusCode, message, details = null) => {
  const error = { error: message }
  if (details) error.details = details
  sendJSON(res, statusCode, error)
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // Apply rate limiting
    await applyRateLimit(req, res)

    // Get the action from query
    const { action, courseSlug, lessonId } = req.query

    // Route to appropriate handler
    if (req.method === 'GET' && action === 'check') {
      return await checkLessonAccess(req, res, courseSlug, lessonId)
    } else {
      return sendError(res, 404, 'Endpoint not found')
    }
  } catch (error) {
    console.error('API Error:', error)
    return sendError(res, 500, 'Internal server error', error.message)
  }
}

// Check lesson access
async function checkLessonAccess(req, res, courseSlug, lessonId) {
  // Get user (optional for preview lessons)
  const user = await authenticateUser(req, res, false)

  // Get lesson details
  const { data: lesson, error: lessonError } = await supabaseClient
    .from('lessons')
    .select('is_preview')
    .eq('id', lessonId)
    .eq('course_slug', courseSlug)
    .single()

  if (lessonError) {
    return sendError(res, 404, 'Lesson not found', lessonError.message)
  }

  // Preview lessons are always accessible
  if (lesson.is_preview) {
    logAccessEvent(user?.sub || 'anonymous', courseSlug, lessonId, true, 'preview')
    return sendJSON(res, 200, { 
      hasAccess: true, 
      reason: 'preview',
      isPreview: true 
    })
  }

  // Non-preview lessons require authentication
  if (!user) {
    logAccessEvent('anonymous', courseSlug, lessonId, false, 'not_authenticated')
    return sendJSON(res, 200, { 
      hasAccess: false, 
      reason: 'authentication_required',
      isPreview: false 
    })
  }

  // Check enrollment
  const { data: enrollment, error: enrollmentError } = await supabaseClient
    .from('user_enrollments')
    .select('status')
    .eq('user_id', user.sub)
    .eq('course_slug', courseSlug)
    .eq('status', 'active')
    .single()

  if (enrollmentError && enrollmentError.code !== 'PGRST116') {
    return sendError(res, 500, 'Database error', enrollmentError.message)
  }

  const hasAccess = !!enrollment
  logAccessEvent(user.sub, courseSlug, lessonId, hasAccess, hasAccess ? 'enrolled' : 'not_enrolled')

  return sendJSON(res, 200, { 
    hasAccess, 
    reason: hasAccess ? 'enrolled' : 'not_enrolled',
    isPreview: false 
  })
}
