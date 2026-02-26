import http from 'http'
import { parse } from 'url'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { authenticateUser, getCurrentUser, isAuthenticated } from './middleware/auth.mjs'
import { checkLessonAccess, checkModuleAccess, getCourseAccessSummary, enforceLessonAccess } from './middleware/lessonAccess.mjs'
import { applyRateLimit, applyStrictRateLimit } from './middleware/rateLimiter.mjs'
import { logRequest, logAuthEvent, logEnrollmentEvent, logAccessEvent } from './middleware/requestLogger.mjs'

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const loadEnvFile = (filePath) => {
  const file = readFileSync(filePath, 'utf8')
  file.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        process.env[key] = valueParts.join('=')
      }
    }
  })
}

try {
  // Try api/.env first (for deploy-specific overrides)
  loadEnvFile(join(__dirname, '.env'))
  console.log('✅ Environment variables loaded from api/.env')
} catch {
  try {
    // Fall back to root .env (standard development setup)
    loadEnvFile(join(__dirname, '../.env'))
    console.log('✅ Environment variables loaded from root .env')
  } catch {
    console.log('⚠️ No .env file found, using system environment variables')
  }
}

const PORT = process.env.API_PORT ? Number(process.env.API_PORT) : 3001

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Initialize Supabase client with service role
let supabaseClient = null
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  console.log('✅ Supabase service role client initialized')
} else {
  console.warn('⚠️ Supabase not configured - enrollment APIs will not work')
  console.warn('   SUPABASE_URL:', SUPABASE_URL ? 'set' : 'missing')
  console.warn('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing')
}

// Simple request body parser
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
};

// Helper to apply middleware to HTTP server
const applyMiddleware = (middleware, req, res) => {
  return new Promise((resolve, reject) => {
    middleware(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Helper to send JSON response
const sendJSON = (res, statusCode, data) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

// Helper to send error response
const sendError = (res, statusCode, message, details = null) => {
  const error = { error: message }
  if (details) error.details = details
  sendJSON(res, statusCode, error)
}

// Helper to validate required fields
const validateRequired = (body, fields) => {
  const missing = fields.filter(field => !body[field])
  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(', ')}`
  }
  return null
}

// Helper to map database row to CourseEnrollment
const mapRowToEnrollment = (row) => ({
  id: row.id,
  userId: row.user_id,
  courseSlug: row.course_slug,
  enrolledAt: row.started_at,
  status: row.status || 'active',
  enrollmentMethod: row.enrollment_method || 'auto',
  cancelledAt: row.cancelled_at || null,
})

const generateCustomerId = () =>
  `CUST_${Date.now()}_${Math.random().toString(36).slice(2, 11).toUpperCase()}`

const ensureUserRecord = async (azureUserId, authenticatedUser = null) => {
  const { data: existingUser, error: lookupError } = await supabaseClient
    .from('users')
    .select('id, azure_user_id, email, name')
    .eq('azure_user_id', azureUserId)
    .single()

  if (!lookupError && existingUser) {
    return { userData: existingUser, error: null }
  }

  if (lookupError && lookupError.code !== 'PGRST116') {
    return { userData: null, error: lookupError }
  }

  const payload = {
    azure_user_id: azureUserId,
    customer_id: generateCustomerId(),
    email: authenticatedUser?.email || `user-${azureUserId}@temp.com`,
    name: authenticatedUser?.name || 'User',
    last_login: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data: createdUser, error: createError } = await supabaseClient
    .from('users')
    .insert(payload)
    .select('id, azure_user_id, email, name')
    .single()

  if (!createError && createdUser) {
    return { userData: createdUser, error: null }
  }

  if (createError?.code === '23505') {
    const { data: conflictedUser, error: conflictLookupError } = await supabaseClient
      .from('users')
      .select('id, azure_user_id, email, name')
      .eq('azure_user_id', azureUserId)
      .single()

    if (!conflictLookupError && conflictedUser) {
      return { userData: conflictedUser, error: null }
    }
  }

  return { userData: null, error: createError || lookupError }
}

// Lesson Access API handlers
const lessonAccessHandlers = {
  // GET /api/lessons/access/:courseSlug/:lessonId
  async checkLessonAccess(req, res, courseSlug, lessonId) {
    const authenticatedUser = getCurrentUser(req);
    const userId = authenticatedUser ? authenticatedUser.azureUserId : null;

    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      console.log(`🔐 Checking lesson access for user ${userId} - course: ${courseSlug}, lesson: ${lessonId}`)

      const accessResult = await checkLessonAccess(
        supabaseClient,
        userId,
        courseSlug,
        lessonId
      )

      return sendJSON(res, 200, {
        success: true,
        canAccess: accessResult.canAccess,
        accessType: accessResult.accessType,
        reason: accessResult.reason,
        lesson: {
          id: accessResult.lesson?.id,
          title: accessResult.lesson?.title,
          isPreview: accessResult.lesson?.is_preview,
          orderIndex: accessResult.lesson?.order_index
        },
        requiredLessons: accessResult.requiredLessons,
        enrollment: accessResult.enrollment ? {
          id: accessResult.enrollment.id,
          status: accessResult.enrollment.status
        } : null
      })
    } catch (err) {
      console.error('Error checking lesson access:', err)
      return sendError(res, 500, 'Failed to check lesson access')
    }
  },

  // GET /api/lessons/course-access/:courseSlug
  async getCourseAccessSummary(req, res, courseSlug) {
    const authenticatedUser = getCurrentUser(req);
    const userId = authenticatedUser ? authenticatedUser.azureUserId : null;

    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      console.log(`📚 Getting course access summary for user ${userId} - course: ${courseSlug}`)

      const accessSummary = await getCourseAccessSummary(
        supabaseClient,
        userId,
        courseSlug
      )

      if (!accessSummary.success) {
        return sendError(res, 500, accessSummary.error)
      }

      return sendJSON(res, 200, accessSummary)
    } catch (err) {
      console.error('Error getting course access summary:', err)
      return sendError(res, 500, 'Failed to get course access summary')
    }
  },

  // GET /api/lessons/content/:courseSlug/:lessonId
  async getLessonContent(req, res, courseSlug, lessonId) {
    const authenticatedUser = getCurrentUser(req);
    const userId = authenticatedUser ? authenticatedUser.azureUserId : null;

    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      console.log(`📖 Getting lesson content for user ${userId} - course: ${courseSlug}, lesson: ${lessonId}`)

      // Check access first
      const accessResult = await checkLessonAccess(
        supabaseClient,
        userId,
        courseSlug,
        lessonId
      )

      if (!accessResult.canAccess) {
        const statusCode = accessResult.accessType === 'denied' && !userId ? 401 : 403
        return sendError(res, statusCode, accessResult.reason, {
          accessType: accessResult.accessType,
          requiredLessons: accessResult.requiredLessons
        })
      }

      // Get full lesson content
      const { data: lesson, error } = await supabaseClient
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('course_slug', courseSlug)
        .single()

      if (error) {
        console.error('Error fetching lesson content:', error)
        return sendError(res, 404, 'Lesson not found')
      }

      // Return appropriate content based on access type
      const lessonContent = {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        orderIndex: lesson.order_index,
        estimatedDurationMinutes: lesson.estimated_duration_minutes,
        isPreview: lesson.is_preview,
        content: lesson.content,
        accessType: accessResult.accessType
      }

      // Include media URLs only if user has access
      if (accessResult.canAccess) {
        lessonContent.videoUrl = lesson.video_url
        lessonContent.resourceUrl = lesson.resource_url
      }

      return sendJSON(res, 200, {
        success: true,
        lesson: lessonContent,
        accessInfo: {
          canAccess: accessResult.canAccess,
          accessType: accessResult.accessType,
          reason: accessResult.reason
        }
      })
    } catch (err) {
      console.error('Error getting lesson content:', err)
      return sendError(res, 500, 'Failed to get lesson content')
    }
  },

  // POST /api/lessons/progress/:courseSlug/:lessonId
  async updateLessonProgress(req, res, courseSlug, lessonId) {
    const authenticatedUser = getCurrentUser(req);

    if (!authenticatedUser) {
      return sendError(res, 401, 'Authentication required')
    }

    const userId = authenticatedUser.azureUserId;

    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      const body = await parseBody(req)
      const { completed = false, watchTimeSeconds = 0 } = body

      console.log(`📈 Updating lesson progress for user ${userId} - course: ${courseSlug}, lesson: ${lessonId}`)

      // Resolve Azure OID to Supabase DB user UUID
      const { data: userData, error: userLookupError } = await supabaseClient
        .from('users')
        .select('id')
        .eq('azure_user_id', userId)
        .single()

      if (userLookupError || !userData?.id) {
        return sendError(res, 403, 'Active enrollment required')
      }

      const dbUserId = userData.id

      // Check if user has access to this lesson
      const accessResult = await checkLessonAccess(
        supabaseClient,
        userId,
        courseSlug,
        lessonId
      )

      if (!accessResult.canAccess) {
        return sendError(res, 403, 'Cannot update progress for inaccessible lesson')
      }

      // Get enrollment ID
      const { data: enrollment, error: enrollmentError } = await supabaseClient
        .from('user_enrollments')
        .select('id')
        .eq('user_id', dbUserId)
        .eq('course_slug', courseSlug)
        .eq('status', 'active')
        .single()

      if (enrollmentError || !enrollment) {
        return sendError(res, 403, 'Active enrollment required')
      }

      // Update or create lesson progress
      const progressData = {
        enrollment_id: enrollment.id,
        lesson_id: lessonId,
        completed,
        watch_time_seconds: watchTimeSeconds,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }

      const { data: progress, error: progressError } = await supabaseClient
        .from('lesson_progress')
        .upsert(progressData, {
          onConflict: 'enrollment_id,lesson_id'
        })
        .select()
        .single()

      if (progressError) {
        console.error('Error updating lesson progress:', progressError)
        return sendError(res, 500, 'Failed to update lesson progress')
      }

      console.log('✅ Lesson progress updated successfully')
      return sendJSON(res, 200, {
        success: true,
        progress: {
          lessonId: progress.lesson_id,
          completed: progress.completed,
          watchTimeSeconds: progress.watch_time_seconds,
          completedAt: progress.completed_at,
          updatedAt: progress.updated_at
        },
        message: 'Lesson progress updated successfully'
      })
    } catch (err) {
      console.error('Error updating lesson progress:', err)
      return sendError(res, 500, 'Failed to update lesson progress')
    }
  },

  // GET /api/lessons/module-intro/:courseSlug/:moduleId
  async getModuleIntro(req, res, courseSlug, moduleId) {
    const authenticatedUser = getCurrentUser(req);
    const userId = authenticatedUser ? authenticatedUser.azureUserId : null;

    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      console.log(`🎬 Getting module intro for user ${userId} - course: ${courseSlug}, module: ${moduleId}`)
      
      // Check module access (module intros are always accessible)
      const accessResult = await checkModuleAccess(
        supabaseClient,
        userId,
        courseSlug,
        moduleId
      )

      if (!accessResult.canAccess) {
        return sendError(res, 404, accessResult.reason)
      }

      const module = accessResult.module

      return sendJSON(res, 200, {
        success: true,
        module: {
          id: module.id,
          title: module.title,
          description: module.description,
          orderIndex: module.order_index,
          introContent: module.intro_content,
          introVideoUrl: module.intro_video_url,
          introPosterUrl: module.intro_poster_url,
          hasIntroContent: accessResult.hasIntroContent
        },
        accessInfo: {
          canAccess: true,
          accessType: 'module_intro',
          reason: 'Module intro is public content'
        }
      })
    } catch (err) {
      console.error('Error getting module intro:', err)
      return sendError(res, 500, 'Failed to get module intro')
    }
  }
}

// Saved Courses API handlers
const savedCoursesHandlers = {
  // GET /api/saved-courses - list saved course slugs for authenticated user
  async listSavedCourses(req, res) {
    const authenticatedUser = getCurrentUser(req)
    if (!authenticatedUser) {
      return sendError(res, 401, 'Authentication required')
    }

    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      const azureUserId = authenticatedUser.azureUserId
      const { userData, error: userLookupError } = await ensureUserRecord(
        azureUserId,
        authenticatedUser
      )

      if (userLookupError || !userData) {
        console.error('Error ensuring user for saved courses list:', userLookupError)
        return sendError(res, 500, 'Failed to resolve user account')
      }

      const { data, error } = await supabaseClient
        .from('saved_courses')
        .select('course_id')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching saved courses:', error)
        return sendError(res, 500, 'Failed to fetch saved courses')
      }

      const savedCourseIds = (data || []).map(row => row.course_id)
      return sendJSON(res, 200, { savedCourseIds })
    } catch (err) {
      console.error('Error listing saved courses:', err)
      return sendError(res, 500, 'Internal server error')
    }
  },

  // POST /api/saved-courses - save a course { courseId }
  async saveCourse(req, res) {
    const authenticatedUser = getCurrentUser(req)
    if (!authenticatedUser) {
      return sendError(res, 401, 'Authentication required')
    }

    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      const body = await parseBody(req)
      const { courseId } = body

      if (!courseId) {
        return sendError(res, 400, 'Missing required field: courseId')
      }

      const azureUserId = authenticatedUser.azureUserId
      const { userData, error: userLookupError } = await ensureUserRecord(
        azureUserId,
        authenticatedUser
      )

      if (userLookupError || !userData) {
        console.error('Error ensuring user for save course:', userLookupError)
        return sendError(res, 500, 'Failed to resolve user account')
      }

      const { error } = await supabaseClient
        .from('saved_courses')
        .upsert(
          { user_id: userData.id, course_id: courseId },
          { onConflict: 'user_id,course_id' }
        )

      if (error) {
        console.error('Error saving course:', error)
        return sendError(res, 500, 'Failed to save course')
      }

      return sendJSON(res, 200, { saved: true, courseId })
    } catch (err) {
      console.error('Error saving course:', err)
      return sendError(res, 500, 'Internal server error')
    }
  },

  // DELETE /api/saved-courses/:courseId - unsave a course
  async unsaveCourse(req, res, courseId) {
    const authenticatedUser = getCurrentUser(req)
    if (!authenticatedUser) {
      return sendError(res, 401, 'Authentication required')
    }

    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      const azureUserId = authenticatedUser.azureUserId
      const { userData, error: userLookupError } = await ensureUserRecord(
        azureUserId,
        authenticatedUser
      )

      if (userLookupError || !userData) {
        console.error('Error ensuring user for unsave course:', userLookupError)
        return sendError(res, 500, 'Failed to resolve user account')
      }

      const { error } = await supabaseClient
        .from('saved_courses')
        .delete()
        .eq('user_id', userData.id)
        .eq('course_id', courseId)

      if (error) {
        console.error('Error unsaving course:', error)
        return sendError(res, 500, 'Failed to unsave course')
      }

      return sendJSON(res, 200, { saved: false, courseId })
    } catch (err) {
      console.error('Error unsaving course:', err)
      return sendError(res, 500, 'Internal server error')
    }
  }
}
// Enrollment API handlers
const enrollmentHandlers = {
  // GET /api/enrollment/status/:courseSlug?userId=xxx
  async getEnrollmentStatus(req, res, courseSlug) {
    const { query } = parse(req.url, true)
    const userId = query.userId

    // Get authenticated user
    const authenticatedUser = getCurrentUser(req);

    // If user is authenticated, use their Azure user ID instead of query param
    const targetUserId = authenticatedUser ? authenticatedUser.azureUserId : userId;

    if (!targetUserId) {
      return sendError(res, 400, 'User identification required')
    }

    // Security check: non-authenticated requests must provide userId, authenticated users can only check their own status
    if (authenticatedUser && userId && userId !== authenticatedUser.azureUserId) {
      return sendError(res, 403, 'Cannot check enrollment status for other users')
    }

    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      console.log(`🔍 Checking enrollment status for user ${targetUserId} in course ${courseSlug}`)

      // Resolve Azure OID to Supabase DB user UUID
      const { data: userData, error: userLookupError } = await supabaseClient
        .from('users')
        .select('id')
        .eq('azure_user_id', targetUserId)
        .single()

      if (userLookupError || !userData) {
        return sendJSON(res, 200, { isEnrolled: false, enrollmentStatus: null })
      }

      const dbUserId = userData.id

      const { data, error } = await supabaseClient
        .from('user_enrollments')
        .select('id, status')
        .eq('user_id', dbUserId)
        .eq('course_slug', courseSlug)
        .eq('status', 'active')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No record found - user is not enrolled
          return sendJSON(res, 200, { isEnrolled: false, enrollmentStatus: null })
        }
        console.error('Database error checking enrollment:', error)
        return sendError(res, 500, 'Failed to check enrollment status', error.message)
      }

      return sendJSON(res, 200, {
        isEnrolled: true,
        enrollmentStatus: data.status,
        enrollmentId: data.id
      })
    } catch (err) {
      console.error('Error checking enrollment status:', err)
      return sendError(res, 500, 'Internal server error')
    }
  },

  // GET /api/enrollment/details/:courseSlug?userId=xxx
  async getEnrollmentDetails(req, res, courseSlug) {
    const { query } = parse(req.url, true)
    const userId = query.userId

    // Get authenticated user
    const authenticatedUser = getCurrentUser(req);

    // If user is authenticated, use their Azure user ID instead of query param
    const targetUserId = authenticatedUser ? authenticatedUser.azureUserId : userId;

    if (!targetUserId) {
      return sendError(res, 400, 'User identification required')
    }

    // Security check: authenticated users can only check their own details
    if (authenticatedUser && userId && userId !== authenticatedUser.azureUserId) {
      return sendError(res, 403, 'Cannot access enrollment details for other users')
    }

    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      console.log(`📋 Getting enrollment details for user ${targetUserId} in course ${courseSlug}`)

      // Resolve Azure OID to Supabase DB user UUID
      const { data: userData, error: userLookupError } = await supabaseClient
        .from('users')
        .select('id')
        .eq('azure_user_id', targetUserId)
        .single()

      if (userLookupError || !userData) {
        return sendJSON(res, 404, { error: 'Enrollment not found' })
      }

      const dbUserId = userData.id

      const { data, error } = await supabaseClient
        .from('user_enrollments')
        .select('*')
        .eq('user_id', dbUserId)
        .eq('course_slug', courseSlug)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No record found
          return sendJSON(res, 404, { error: 'Enrollment not found' })
        }
        console.error('Database error getting enrollment:', error)
        return sendError(res, 500, 'Failed to get enrollment details', error.message)
      }

      return sendJSON(res, 200, {
        success: true,
        enrollment: mapRowToEnrollment(data)
      })
    } catch (err) {
      console.error('Error getting enrollment details:', err)
      return sendError(res, 500, 'Internal server error')
    }
  },

  // POST /api/enrollment/enroll
  async enrollInCourse(req, res) {
    let enrollmentCourseSlug = 'unknown'
    try {
      const body = await parseBody(req)

      // Get authenticated user
      const authenticatedUser = getCurrentUser(req);

      // If user is authenticated, use their Azure user ID, otherwise require userId in body
      const azureUserId = authenticatedUser ? authenticatedUser.azureUserId : body.userId;

      if (!azureUserId) {
        return sendError(res, 400, 'User identification required')
      }

      // Security check: authenticated users can only enroll themselves
      if (authenticatedUser && body.userId && body.userId !== authenticatedUser.azureUserId) {
        logAccessEvent('enrollment_attempt', `course:${body.courseSlug}`, authenticatedUser.azureUserId, 'denied', {
          reason: 'attempted_to_enroll_other_user',
          targetUserId: body.userId
        });
        return sendError(res, 403, 'Cannot enroll other users')
      }

      const validationError = validateRequired(body, ['courseSlug'])
      if (validationError) {
        return sendError(res, 400, validationError)
      }

      const { courseSlug, method = 'explicit' } = body
      enrollmentCourseSlug = courseSlug

      if (!supabaseClient) {
        return sendError(res, 503, 'Database not configured')
      }

      console.log(`🎯 Starting enrollment process for user ${azureUserId} in course ${courseSlug}`)
      logEnrollmentEvent('enrollment_attempt', courseSlug, azureUserId, { method });

      // Look up the database user ID from Azure user ID
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('id, azure_user_id, email, name')
        .eq('azure_user_id', azureUserId)
        .single()

      if (userError || !userData) {
        console.error('❌ User not found in database:', { azureUserId, error: userError })
        
        // Try to create the user if they don't exist
        if (userError?.code === 'PGRST116') {
          console.log('📝 Creating user in database...')
          
          const newUserData = {
            azure_user_id: azureUserId,
            customer_id: `CUST_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            email: authenticatedUser?.email || `user-${azureUserId}@temp.com`,
            name: authenticatedUser?.name || 'User',
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          const { data: createdUser, error: createError } = await supabaseClient
            .from('users')
            .insert(newUserData)
            .select('id')
            .single()

          if (createError || !createdUser) {
            console.error('❌ Failed to create user:', createError)
            logEnrollmentEvent('enrollment_error', courseSlug, azureUserId, { error: 'user_creation_failed' });
            return sendError(res, 500, 'Failed to create user account', createError?.message)
          }

          console.log('✅ User created:', createdUser.id)
          userData.id = createdUser.id
        } else {
          logEnrollmentEvent('enrollment_error', courseSlug, azureUserId, { error: 'user_lookup_failed' });
          return sendError(res, 500, 'Failed to lookup user', userError?.message)
        }
      }

      const dbUserId = userData.id
      console.log(`✅ Found database user ID: ${dbUserId} for Azure user: ${azureUserId}`)

      // Check if already enrolled
      const { data: existingData, error: checkError } = await supabaseClient
        .from('user_enrollments')
        .select('*')
        .eq('user_id', dbUserId)
        .eq('course_slug', courseSlug)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing enrollment:', checkError)
        logEnrollmentEvent('enrollment_error', courseSlug, azureUserId, { error: checkError.message });
        return sendError(res, 500, 'Failed to check existing enrollment', checkError.message)
      }

      // If already enrolled and active, return existing enrollment
      if (existingData && existingData.status === 'active') {
        console.log('✅ User already enrolled')
        logEnrollmentEvent('enrollment_duplicate', courseSlug, azureUserId, { status: existingData.status });
        return sendJSON(res, 200, {
          success: true,
          enrollment: mapRowToEnrollment(existingData),
          message: 'Already enrolled'
        })
      }

      // Create new enrollment
      console.log('📝 Creating new enrollment...')
      const enrollmentData = {
        user_id: dbUserId,
        course_slug: courseSlug,
        started_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
        progress_pct: 0,
        status: 'active',
        enrollment_method: method
      }

      const { data, error } = await supabaseClient
        .from('user_enrollments')
        .insert(enrollmentData)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating enrollment:', error)
        logEnrollmentEvent('enrollment_failed', courseSlug, azureUserId, { error: error.message });
        return sendError(res, 500, 'Failed to create enrollment', error.message)
      }

      console.log('✅ Enrollment created successfully')
      logEnrollmentEvent('enrollment_success', courseSlug, azureUserId, {
        enrollmentId: data.id,
        method: method
      });

      return sendJSON(res, 201, {
        success: true,
        enrollment: mapRowToEnrollment(data),
        message: 'Enrollment created successfully'
      })
    } catch (err) {
      console.error('Unexpected error in enrollment:', err)
      const azureUserId = getCurrentUser(req)?.azureUserId || 'unknown';
      logEnrollmentEvent('enrollment_error', enrollmentCourseSlug, azureUserId, {
        error: err.message
      });
      return sendError(res, 500, 'Internal server error')
    }
  },

  // GET /api/enrollment/user/:userId or /api/enrollment/user/me
  async getUserEnrollments(req, res, userId) {
    // Get authenticated user
    const authenticatedUser = getCurrentUser(req);

    // If userId is null (from 'me' endpoint), use authenticated user
    const azureUserId = !userId || userId === 'me' 
      ? (authenticatedUser ? authenticatedUser.azureUserId : null)
      : userId;

    if (!azureUserId) {
      return sendError(res, 401, 'Authentication required')
    }

    // Security check: authenticated users can only get their own enrollments
    if (authenticatedUser && userId && userId !== 'me' && userId !== authenticatedUser.azureUserId) {
      return sendError(res, 403, 'Cannot access enrollments for other users')
    }

    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      console.log(`📚 Getting all enrollments for Azure user ${azureUserId}`)

      // Look up the database user ID from Azure user ID
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('id')
        .eq('azure_user_id', azureUserId)
        .single()

      if (userError || !userData) {
        console.log('⚠️ User not found in database:', azureUserId)
        // Return empty enrollments if user doesn't exist yet
        return sendJSON(res, 200, {
          success: true,
          enrollments: [],
          count: 0
        })
      }

      const dbUserId = userData.id

      const { data, error } = await supabaseClient
        .from('user_enrollments')
        .select('*')
        .eq('user_id', dbUserId)
        .eq('status', 'active')
        .order('started_at', { ascending: false })

      if (error) {
        console.error('Database error getting user enrollments:', error)
        return sendError(res, 500, 'Failed to get user enrollments', error.message)
      }

      const enrollments = (data || []).map(mapRowToEnrollment)
      return sendJSON(res, 200, {
        success: true,
        enrollments,
        count: enrollments.length
      })
    } catch (err) {
      console.error('Error getting user enrollments:', err)
      return sendError(res, 500, 'Internal server error')
    }
  },

  // GET /api/enrollment/access/:courseSlug?userId=xxx
  async getAccessContract(req, res, courseSlug) {
    const { query } = parse(req.url, true)
    const userId = query.userId

    // Get authenticated user
    const authenticatedUser = getCurrentUser(req);

    // If user is authenticated, use their Azure user ID instead of query param
    const targetUserId = authenticatedUser ? authenticatedUser.azureUserId : userId;

    if (!targetUserId) {
      return sendError(res, 400, 'User identification required')
    }

    // Security check: authenticated users can only get their own access contract
    if (authenticatedUser && userId && userId !== authenticatedUser.azureUserId) {
      return sendError(res, 403, 'Cannot access contract for other users')
    }

    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      console.log(`🔐 Getting access contract for user ${targetUserId} in course ${courseSlug}`)

      // Resolve Azure OID to Supabase DB user UUID
      const { data: userData, error: userLookupError } = await supabaseClient
        .from('users')
        .select('id')
        .eq('azure_user_id', targetUserId)
        .single()

      if (userLookupError || !userData) {
        return sendJSON(res, 200, {
          isEnrolled: false,
          enrollmentStatus: null,
          subscriptionStatus: null,
          courseSlug,
          userId: targetUserId
        })
      }

      const dbUserId = userData.id

      // Get enrollment and subscription in parallel
      const [enrollmentResult, subscriptionResult] = await Promise.all([
        supabaseClient
          .from('user_enrollments')
          .select('*')
          .eq('user_id', dbUserId)
          .eq('course_slug', courseSlug)
          .single(),
        supabaseClient
          .from('subscriptions')
          .select('*')
          .eq('user_id', dbUserId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
      ])

      const enrollment = enrollmentResult.error?.code === 'PGRST116' ? null : enrollmentResult.data
      const subscription = subscriptionResult.error?.code === 'PGRST116' ? null : subscriptionResult.data

      const accessContract = {
        isEnrolled: enrollment?.status === 'active',
        enrollmentStatus: enrollment?.status || null,
        subscriptionStatus: subscription?.status || null,
        courseSlug,
        userId: targetUserId
      }

      return sendJSON(res, 200, accessContract)
    } catch (err) {
      console.error('Error getting access contract:', err)
      return sendError(res, 500, 'Internal server error')
    }
  },

  // POST /api/enrollment/cancel
  async cancelEnrollment(req, res) {
    try {
      const body = await parseBody(req)

      // Get authenticated user
      const authenticatedUser = getCurrentUser(req);

      // If user is authenticated, use their Azure user ID, otherwise require userId in body
      const targetUserId = authenticatedUser ? authenticatedUser.azureUserId : body.userId;

      if (!targetUserId) {
        return sendError(res, 400, 'User identification required')
      }

      // Security check: authenticated users can only cancel their own enrollments
      if (authenticatedUser && body.userId && body.userId !== authenticatedUser.azureUserId) {
        return sendError(res, 403, 'Cannot cancel enrollment for other users')
      }

      const validationError = validateRequired(body, ['courseSlug'])
      if (validationError) {
        return sendError(res, 400, validationError)
      }

      const { courseSlug } = body

      if (!supabaseClient) {
        return sendError(res, 503, 'Database not configured')
      }

      console.log(`❌ Cancelling enrollment for user ${targetUserId} in course ${courseSlug}`)

      // Resolve Azure OID to Supabase DB user UUID
      const { data: userData, error: userLookupError } = await supabaseClient
        .from('users')
        .select('id')
        .eq('azure_user_id', targetUserId)
        .single()

      if (userLookupError || !userData) {
        return sendError(res, 404, 'Active enrollment not found')
      }

      const dbUserId = userData.id

      const { data, error } = await supabaseClient
        .from('user_enrollments')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', dbUserId)
        .eq('course_slug', courseSlug)
        .eq('status', 'active')
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return sendError(res, 404, 'Active enrollment not found')
        }
        console.error('Error cancelling enrollment:', error)
        return sendError(res, 500, 'Failed to cancel enrollment', error.message)
      }

      console.log('✅ Enrollment cancelled successfully')
      return sendJSON(res, 200, {
        success: true,
        enrollment: mapRowToEnrollment(data),
        message: 'Enrollment cancelled successfully'
      })
    } catch (err) {
      console.error('Error cancelling enrollment:', err)
      return sendError(res, 500, 'Internal server error')
    }
  },

  // POST /api/test/create-user (for testing only)
  async createTestUser(req, res) {
    try {
      const body = await parseBody(req)

      const { userId, azureUserId, email, name } = body

      if (!supabaseClient) {
        return sendError(res, 503, 'Database not configured')
      }

      console.log(`🧪 Creating test user ${userId}`)

      const userData = {
        id: userId,
        azure_user_id: azureUserId || `azure-${userId}`,
        customer_id: `customer-${userId}`,
        email: email || `test-${userId}@example.com`,
        name: name || `Test User ${userId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabaseClient
        .from('users')
        .insert(userData)
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          // User already exists
          return sendJSON(res, 200, {
            success: true,
            message: 'User already exists',
            user: { id: userId }
          })
        }
        console.error('Error creating test user:', error)
        return sendError(res, 500, 'Failed to create test user', error.message)
      }

      console.log('✅ Test user created successfully')
      return sendJSON(res, 201, {
        success: true,
        user: data,
        message: 'Test user created successfully'
      })
    } catch (err) {
      console.error('Error creating test user:', err)
      return sendError(res, 500, 'Internal server error')
    }
  }
}

export const requestHandler = async (req, res) => {
  try {
    // Apply request logging middleware
    await applyMiddleware(logRequest, req, res);
    await applyMiddleware(logAuthEvent, req, res);

    // Apply rate limiting middleware
    await applyMiddleware(applyRateLimit, req, res);

    const { pathname, query } = parse(req.url || '', true)

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      return res.end();
    }

    console.log(`${req.method} ${pathname}`)

    // Health check (no auth required)
    if (pathname === '/api/health') {
      return sendJSON(res, 200, {
        ok: true,
        timestamp: new Date().toISOString(),
        supabaseConfigured: Boolean(supabaseClient)
      })
    }

    // Lesson Access API routes (authentication required)
    if (pathname.startsWith('/api/lessons/')) {
      // Apply authentication middleware
      try {
        await applyMiddleware(authenticateUser({ required: false }), req, res); // Allow unauthenticated for preview content
      } catch (authError) {
        console.error('❌ Authentication failed:', authError);
        return; // Response already sent by middleware
      }

      // Add supabase client to request for lesson access middleware
      req.supabaseClient = supabaseClient;

      const pathParts = pathname.split('/')

      // GET /api/lessons/access/:courseSlug/:lessonId
      if (pathParts[3] === 'access' && pathParts[4] && pathParts[5] && req.method === 'GET') {
        return await lessonAccessHandlers.checkLessonAccess(req, res, pathParts[4], pathParts[5])
      }

      // GET /api/lessons/course-access/:courseSlug
      if (pathParts[3] === 'course-access' && pathParts[4] && req.method === 'GET') {
        return await lessonAccessHandlers.getCourseAccessSummary(req, res, pathParts[4])
      }

      // GET /api/lessons/content/:courseSlug/:lessonId
      if (pathParts[3] === 'content' && pathParts[4] && pathParts[5] && req.method === 'GET') {
        return await lessonAccessHandlers.getLessonContent(req, res, pathParts[4], pathParts[5])
      }

      // POST /api/lessons/progress/:courseSlug/:lessonId
      if (pathParts[3] === 'progress' && pathParts[4] && pathParts[5] && req.method === 'POST') {
        return await lessonAccessHandlers.updateLessonProgress(req, res, pathParts[4], pathParts[5])
      }
      
      // GET /api/lessons/module-intro/:courseSlug/:moduleId
      if (pathParts[3] === 'module-intro' && pathParts[4] && pathParts[5] && req.method === 'GET') {
        return await lessonAccessHandlers.getModuleIntro(req, res, pathParts[4], pathParts[5])
      }
      
      return sendError(res, 404, 'Lesson endpoint not found')
    }

    // Saved Courses API routes (authentication required)
    if (pathname.startsWith('/api/saved-courses')) {
      // Apply authentication middleware
      try {
        await applyMiddleware(authenticateUser({ required: true }), req, res);
      } catch (authError) {
        console.error('❌ Authentication failed:', authError);
        return; // Response already sent by middleware
      }

      const pathParts = pathname.split('/')

      // GET /api/saved-courses — list saved courses
      if (req.method === 'GET' && !pathParts[3]) {
        return await savedCoursesHandlers.listSavedCourses(req, res)
      }

      // POST /api/saved-courses — save a course
      if (req.method === 'POST' && !pathParts[3]) {
        return await savedCoursesHandlers.saveCourse(req, res)
      }

      // DELETE /api/saved-courses/:courseId — unsave a course
      if (req.method === 'DELETE' && pathParts[3]) {
        return await savedCoursesHandlers.unsaveCourse(req, res, pathParts[3])
      }

      return sendError(res, 404, 'Saved courses endpoint not found')
    }

    // Enrollment API routes (authentication required)
    if (pathname.startsWith('/api/enrollment/')) {
      // Apply authentication middleware
      try {
        await applyMiddleware(authenticateUser({ required: true }), req, res);
      } catch (authError) {
        console.error('❌ Authentication failed:', authError);
        return; // Response already sent by middleware
      }

      const pathParts = pathname.split('/')

      // GET /api/enrollment/status/:courseSlug
      if (pathParts[3] === 'status' && pathParts[4] && req.method === 'GET') {
        return await enrollmentHandlers.getEnrollmentStatus(req, res, pathParts[4])
      }

      // GET /api/enrollment/details/:courseSlug
      if (pathParts[3] === 'details' && pathParts[4] && req.method === 'GET') {
        return await enrollmentHandlers.getEnrollmentDetails(req, res, pathParts[4])
      }

      // POST /api/enrollment/enroll
      if (pathParts[3] === 'enroll' && req.method === 'POST') {
        await applyMiddleware(applyStrictRateLimit, req, res);
        return await enrollmentHandlers.enrollInCourse(req, res)
      }

      // GET /api/enrollment/user/:userId or /api/enrollment/user/me
      if (pathParts[3] === 'user' && pathParts[4] && req.method === 'GET') {
        // If 'me', use authenticated user, otherwise use provided userId
        const userId = pathParts[4] === 'me' ? null : pathParts[4];
        return await enrollmentHandlers.getUserEnrollments(req, res, userId)
      }

      // GET /api/enrollment/access/:courseSlug
      if (pathParts[3] === 'access' && pathParts[4] && req.method === 'GET') {
        return await enrollmentHandlers.getAccessContract(req, res, pathParts[4])
      }

      // POST /api/enrollment/cancel
      if (pathParts[3] === 'cancel' && req.method === 'POST') {
        await applyMiddleware(applyStrictRateLimit, req, res);
        return await enrollmentHandlers.cancelEnrollment(req, res)
      }

      return sendError(res, 404, 'Enrollment endpoint not found')
    }

    // Test API routes (for development/testing only) - no auth required in dev
    if (pathname.startsWith('/api/test/')) {
      const pathParts = pathname.split('/')

      // POST /api/test/create-user
      if (pathParts[3] === 'create-user' && req.method === 'POST') {
        return await enrollmentHandlers.createTestUser(req, res)
      }

      return sendError(res, 404, 'Test endpoint not found')
    }

    // Stripe endpoints (existing) - no auth required for webhooks
    if (pathname === '/api/stripe/create-checkout-session' && req.method === 'POST') {
      const body = await parseBody(req);
      const { planId, priceAmount, currency, courseSlug, userId, successUrl, cancelUrl, metadata } = body;

      // Mock Stripe session for development
      const mockSessionId = `mock_session_${Date.now()}`;
      const mockUrl = `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id=${mockSessionId}`;

      return sendJSON(res, 200, {
        sessionId: mockSessionId,
        url: mockUrl,
        status: 'open',
      });
    }

    if (pathname === '/api/stripe/verify-session' && req.method === 'POST') {
      const body = await parseBody(req);
      const { sessionId } = body;

      // Mock verification - always return paid
      return sendJSON(res, 200, {
        paymentStatus: 'paid',
        metadata: {
          courseSlug: 'mock-course',
          userId: 'mock-user',
          planId: 'premium',
        },
      });
    }

    return sendError(res, 404, 'Endpoint not found')
  } catch (e) {
    console.error('Server error:', e)
    return sendError(res, 500, e?.message || 'Internal server error')
  }
}

const server = http.createServer(requestHandler)
const isDirectExecution = Boolean(process.argv[1]) && resolve(process.argv[1]) === __filename

if (isDirectExecution) {
  server.listen(PORT, () => {
    console.log(`🚀 DTMA API Server listening on http://localhost:${PORT}`)
    console.log(`📋 Available endpoints:`)
    console.log(`   GET  /api/health - Health check`)
    console.log(``)
    console.log(`   📚 Lesson Access Endpoints:`)
    console.log(`   GET  /api/lessons/access/:courseSlug/:lessonId - Check lesson access`)
    console.log(`   GET  /api/lessons/course-access/:courseSlug - Get course access summary`)
    console.log(`   GET  /api/lessons/content/:courseSlug/:lessonId - Get lesson content`)
    console.log(`   POST /api/lessons/progress/:courseSlug/:lessonId - Update lesson progress`)
    console.log(``)
    console.log(`   🔖 Saved Courses Endpoints:`)
    console.log(`   GET    /api/saved-courses - List saved course slugs`)
    console.log(`   POST   /api/saved-courses - Save a course`)
    console.log(`   DELETE /api/saved-courses/:courseId - Unsave a course`)
    console.log(``)
    console.log(`   🎓 Enrollment Endpoints:`)
    console.log(`   GET  /api/enrollment/status/:courseSlug?userId=xxx - Check enrollment status`)
    console.log(`   GET  /api/enrollment/details/:courseSlug?userId=xxx - Get enrollment details`)
    console.log(`   POST /api/enrollment/enroll - Enroll in course`)
    console.log(`   GET  /api/enrollment/user/:userId - Get user enrollments`)
    console.log(`   GET  /api/enrollment/access/:courseSlug?userId=xxx - Get access contract`)
    console.log(`   POST /api/enrollment/cancel - Cancel enrollment`)
    console.log(``)
    console.log(`   🧪 Development Endpoints:`)
    console.log(`   POST /api/test/create-user - Create test user (dev only)`)
    console.log(`   POST /api/stripe/* - Stripe mock endpoints`)
    console.log(``)
    console.log(`🔧 Configuration:`)
    console.log(`   Supabase: ${supabaseClient ? '✅ Connected' : '❌ Not configured'}`)
    console.log(`   Authentication: ${process.env.VITE_AZURE_TENANT_ID ? '✅ Configured' : '❌ Not configured'}`)
  })
}

export default requestHandler
