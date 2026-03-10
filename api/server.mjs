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

const QUIZ_XP_AWARD = 100
const COURSE_XP_AWARD = 200
const LEARNER_PROFILE_SELECT =
  'id, azure_user_id, display_name, preferred_email, phone_number, country, timezone, role_track, goals, preferences, onboarding_completed, onboarding_completed_at, seniority_level, weekly_learning_capacity, transformation_experience'

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

const mapRowToLearnerProfile = (row) => ({
  azureUserId: row.azure_user_id,
  displayName: row.display_name ?? null,
  preferredEmail: row.preferred_email ?? null,
  phoneNumber: row.phone_number ?? null,
  country: row.country ?? null,
  timezone: row.timezone ?? null,
  roleTrack: row.role_track ?? null,
  goals: Array.isArray(row.goals) ? row.goals : [],
  preferences: Array.isArray(row.preferences) ? row.preferences : [],
  onboardingCompleted: Boolean(row.onboarding_completed),
  onboardingCompletedAt: row.onboarding_completed_at ?? null,
  seniorityLevel: row.seniority_level ?? null,
  weeklyLearningCapacity: row.weekly_learning_capacity ?? null,
  transformationExperience: row.transformation_experience ?? null,
})

const resolveAuthenticatedDbUser = async (req, options = {}) => {
  const { createIfMissing = false } = options
  const authenticatedUser = getCurrentUser(req)

  if (!authenticatedUser) {
    return {
      authenticatedUser: null,
      userData: null,
      error: new Error('Authentication required')
    }
  }

  if (!supabaseClient) {
    return {
      authenticatedUser,
      userData: null,
      error: new Error('Database not configured')
    }
  }

  if (createIfMissing) {
    const { userData, error } = await ensureUserRecord(
      authenticatedUser.azureUserId,
      authenticatedUser
    )

    return {
      authenticatedUser,
      userData,
      error: error || null
    }
  }

  const { data: userData, error } = await supabaseClient
    .from('users')
    .select('id, azure_user_id, email, name')
    .eq('azure_user_id', authenticatedUser.azureUserId)
    .single()

  return {
    authenticatedUser,
    userData: error ? null : userData,
    error: error || null
  }
}

const buildProfileUpdatePayload = (input = {}) => {
  const updateData = {
    updated_at: new Date().toISOString()
  }

  if (Object.prototype.hasOwnProperty.call(input, 'displayName')) {
    updateData.display_name = input.displayName
  }

  if (Object.prototype.hasOwnProperty.call(input, 'preferredEmail')) {
    updateData.preferred_email = input.preferredEmail
  }

  if (Object.prototype.hasOwnProperty.call(input, 'phoneNumber')) {
    updateData.phone_number = input.phoneNumber
  }

  if (Object.prototype.hasOwnProperty.call(input, 'country')) {
    updateData.country = input.country
  }

  if (Object.prototype.hasOwnProperty.call(input, 'timezone')) {
    updateData.timezone = input.timezone
  }

  if (Object.prototype.hasOwnProperty.call(input, 'roleTrack')) {
    updateData.role_track = input.roleTrack
  }

  if (Object.prototype.hasOwnProperty.call(input, 'goals')) {
    updateData.goals = input.goals
  }

  if (Object.prototype.hasOwnProperty.call(input, 'preferences')) {
    updateData.preferences = input.preferences
  }

  if (Object.prototype.hasOwnProperty.call(input, 'onboardingCompleted')) {
    updateData.onboarding_completed = input.onboardingCompleted
    if (input.onboardingCompleted) {
      updateData.onboarding_completed_at =
        input.onboardingCompletedAt || new Date().toISOString()
    } else if (!Object.prototype.hasOwnProperty.call(input, 'onboardingCompletedAt')) {
      updateData.onboarding_completed_at = null
    }
  }

  if (Object.prototype.hasOwnProperty.call(input, 'onboardingCompletedAt')) {
    updateData.onboarding_completed_at = input.onboardingCompletedAt
  }

  if (Object.prototype.hasOwnProperty.call(input, 'seniorityLevel')) {
    updateData.seniority_level = input.seniorityLevel
  }

  if (Object.prototype.hasOwnProperty.call(input, 'weeklyLearningCapacity')) {
    updateData.weekly_learning_capacity = input.weeklyLearningCapacity
  }

  if (Object.prototype.hasOwnProperty.call(input, 'transformationExperience')) {
    updateData.transformation_experience = input.transformationExperience
  }

  return updateData
}

const getBadgeDefinition = async (badgeSlug) => {
  const { data, error } = await supabaseClient
    .from('badges')
    .select('id, slug, title, description, icon_url, category, criteria_text')
    .eq('slug', badgeSlug)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

const mapEarnedBadge = (badgeDefinition, earnedBadgeRow, dbUserId) => ({
  id: earnedBadgeRow.id,
  userId: dbUserId,
  badgeId: badgeDefinition.id,
  earnedAt: earnedBadgeRow.earned_at,
  shareToken: earnedBadgeRow.share_token,
  badge: {
    id: badgeDefinition.id,
    slug: badgeDefinition.slug,
    title: badgeDefinition.title,
    description: badgeDefinition.description,
    iconUrl: badgeDefinition.icon_url,
    category: badgeDefinition.category,
    criteriaText: badgeDefinition.criteria_text,
  }
})

const awardBadgeIfMissing = async (dbUserId, badgeSlug, context = null) => {
  const badgeDefinition = await getBadgeDefinition(badgeSlug)

  if (!badgeDefinition) {
    return null
  }

  const { data: existingRow } = await supabaseClient
    .from('earned_badges')
    .select('id, earned_at, share_token')
    .eq('user_id', dbUserId)
    .eq('badge_id', badgeDefinition.id)
    .maybeSingle()

  if (existingRow?.id) {
    return null
  }

  const earnedAt = new Date().toISOString()
  const { data: earnedBadgeRow, error } = await supabaseClient
    .from('earned_badges')
    .upsert({
      user_id: dbUserId,
      badge_id: badgeDefinition.id,
      earned_at: earnedAt,
      context_type: context?.type,
      context_id: context?.id,
    }, {
      onConflict: 'user_id,badge_id'
    })
    .select('id, earned_at, share_token')
    .single()

  if (error || !earnedBadgeRow) {
    console.error(`Error awarding badge ${badgeSlug}:`, error)
    return null
  }

  return mapEarnedBadge(badgeDefinition, earnedBadgeRow, dbUserId)
}

const upsertUserXp = async (dbUserId, delta) => {
  const { data: existingXp } = await supabaseClient
    .from('user_xp')
    .select('user_id, total_xp')
    .eq('user_id', dbUserId)
    .maybeSingle()

  const totalXp = Math.max(0, Number(existingXp?.total_xp || 0) + Number(delta || 0))

  const { data, error } = await supabaseClient
    .from('user_xp')
    .upsert({
      user_id: dbUserId,
      total_xp: totalXp,
      updated_at: new Date().toISOString(),
    })
    .select('user_id, total_xp')
    .single()

  if (error || !data) {
    console.error('Error updating user XP:', error)
    return null
  }

  return {
    userId: data.user_id,
    totalXp: data.total_xp ?? 0
  }
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

      const [{ count: totalLessonCount }, { count: completedLessonCount }] = await Promise.all([
        supabaseClient
          .from('lessons')
          .select('id', { count: 'exact', head: true })
          .eq('course_slug', courseSlug),
        supabaseClient
          .from('lesson_progress')
          .select('id', { count: 'exact', head: true })
          .eq('enrollment_id', enrollment.id)
          .eq('completed', true)
      ])

      const totalLessons = Number(totalLessonCount || 0)
      const completedLessons = Number(completedLessonCount || 0)
      const progressPct = totalLessons > 0
        ? Math.min(100, Number(((completedLessons / totalLessons) * 100).toFixed(2)))
        : 0
      const now = new Date().toISOString()

      const { error: enrollmentUpdateError } = await supabaseClient
        .from('user_enrollments')
        .update({
          progress_pct: progressPct,
          last_accessed_at: now,
          updated_at: now,
          completed_at: progressPct >= 100 ? now : null
        })
        .eq('id', enrollment.id)

      if (enrollmentUpdateError) {
        console.error('Error updating enrollment progress after lesson update:', enrollmentUpdateError)
        return sendError(res, 500, 'Failed to update enrollment progress')
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
        enrollment: {
          progressPct,
          completedLessons,
          totalLessons,
          completedAt: progressPct >= 100 ? now : null
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
  // GET /api/enrollment/status/:courseSlug
  async getEnrollmentStatus(req, res, courseSlug) {
    const authenticatedUser = getCurrentUser(req)

    if (!authenticatedUser) {
      return sendError(res, 401, 'Authentication required')
    }

    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      console.log(`🔍 Checking enrollment status for user ${authenticatedUser.azureUserId} in course ${courseSlug}`)

      // Resolve Azure OID to Supabase DB user UUID
      const { data: userData, error: userLookupError } = await supabaseClient
        .from('users')
        .select('id')
        .eq('azure_user_id', authenticatedUser.azureUserId)
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

  // GET /api/enrollment/details/:courseSlug
  async getEnrollmentDetails(req, res, courseSlug) {
    const authenticatedUser = getCurrentUser(req)

    if (!authenticatedUser) {
      return sendError(res, 401, 'Authentication required')
    }

    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      console.log(`📋 Getting enrollment details for user ${authenticatedUser.azureUserId} in course ${courseSlug}`)

      // Resolve Azure OID to Supabase DB user UUID
      const { data: userData, error: userLookupError } = await supabaseClient
        .from('users')
        .select('id')
        .eq('azure_user_id', authenticatedUser.azureUserId)
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

      const authenticatedUser = getCurrentUser(req)

      if (!authenticatedUser) {
        return sendError(res, 401, 'Authentication required')
      }

      const validationError = validateRequired(body, ['courseSlug'])
      if (validationError) {
        return sendError(res, 400, validationError)
      }

      const { courseSlug, method = 'explicit' } = body
      enrollmentCourseSlug = courseSlug
      const azureUserId = authenticatedUser.azureUserId

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

  // GET /api/enrollment/user/me
  async getUserEnrollments(req, res) {
    const authenticatedUser = getCurrentUser(req)

    if (!authenticatedUser?.azureUserId) {
      return sendError(res, 401, 'Authentication required')
    }

    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      const azureUserId = authenticatedUser.azureUserId
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

  // GET /api/enrollment/access/:courseSlug
  async getAccessContract(req, res, courseSlug) {
    const authenticatedUser = getCurrentUser(req)

    if (!authenticatedUser) {
      return sendError(res, 401, 'Authentication required')
    }

    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      console.log(`🔐 Getting access contract for user ${authenticatedUser.azureUserId} in course ${courseSlug}`)

      // Resolve Azure OID to Supabase DB user UUID
      const { data: userData, error: userLookupError } = await supabaseClient
        .from('users')
        .select('id')
        .eq('azure_user_id', authenticatedUser.azureUserId)
        .single()

      if (userLookupError || !userData) {
        return sendJSON(res, 200, {
          isEnrolled: false,
          enrollmentStatus: null,
          subscriptionStatus: null,
          courseSlug,
          userId: authenticatedUser.azureUserId
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
        userId: authenticatedUser.azureUserId
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

      const authenticatedUser = getCurrentUser(req)

      if (!authenticatedUser) {
        return sendError(res, 401, 'Authentication required')
      }

      const validationError = validateRequired(body, ['courseSlug'])
      if (validationError) {
        return sendError(res, 400, validationError)
      }

      const { courseSlug } = body
      const targetUserId = authenticatedUser.azureUserId

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

const learningHandlers = {
  async getSnapshot(req, res, courseSlug) {
    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      const { authenticatedUser, userData, error } = await resolveAuthenticatedDbUser(req, {
        createIfMissing: true
      })

      if (!authenticatedUser) {
        return sendError(res, 401, 'Authentication required')
      }

      if (error || !userData?.id) {
        console.error('Error resolving user for learning snapshot:', error)
        return sendError(res, 500, 'Failed to resolve learner account')
      }

      const { data, error: snapshotError } = await supabaseClient.rpc('get_learning_snapshot', {
        p_course_slug: courseSlug,
        p_user_id: userData.id,
      })

      if (snapshotError) {
        console.error('Error fetching learning snapshot:', snapshotError)
        return sendError(res, 500, 'Failed to fetch learning snapshot', snapshotError.message)
      }

      const snapshotData = data || {}
      const sanitizedSnapshot = {
        ...snapshotData,
        lessons: Array.isArray(snapshotData.lessons)
          ? snapshotData.lessons.map((lesson) => ({
            id: lesson.id,
            course_slug: lesson.course_slug,
            module_id: lesson.module_id,
            title: lesson.title,
            type: lesson.type,
            order_index: lesson.order_index,
            estimated_duration_minutes: lesson.estimated_duration_minutes,
            is_preview: lesson.is_preview,
          }))
          : []
      }

      return sendJSON(res, 200, {
        success: true,
        snapshot: sanitizedSnapshot
      })
    } catch (err) {
      console.error('Error getting learning snapshot:', err)
      return sendError(res, 500, 'Internal server error')
    }
  },

  async recordQuizAttempt(req, res, courseSlug) {
    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      const body = await parseBody(req)
      const scorePct = Number(body.scorePct)
      const passed = Boolean(body.passed)

      if (Number.isNaN(scorePct)) {
        return sendError(res, 400, 'Missing or invalid scorePct')
      }

      const { authenticatedUser, userData, error } = await resolveAuthenticatedDbUser(req, {
        createIfMissing: true
      })

      if (!authenticatedUser) {
        return sendError(res, 401, 'Authentication required')
      }

      if (error || !userData?.id) {
        console.error('Error resolving user for quiz attempt:', error)
        return sendError(res, 500, 'Failed to resolve learner account')
      }

      const { data: existingAttempt } = await supabaseClient
        .from('quiz_attempts')
        .select('id')
        .eq('user_id', userData.id)
        .eq('course_slug', courseSlug)
        .maybeSingle()

      const now = new Date().toISOString()
      const { error: quizAttemptError } = await supabaseClient
        .from('quiz_attempts')
        .upsert({
          user_id: userData.id,
          course_slug: courseSlug,
          score_pct: scorePct,
          passed,
          completed_at: now,
          updated_at: now,
        }, {
          onConflict: 'user_id,course_slug'
        })

      if (quizAttemptError) {
        console.error('Error recording quiz attempt:', quizAttemptError)
        return sendError(res, 500, 'Failed to record quiz attempt', quizAttemptError.message)
      }

      let badge = null
      let xp = null
      if (!existingAttempt?.id) {
        badge = await awardBadgeIfMissing(userData.id, 'first_quiz_completed', {
          type: 'course',
          id: courseSlug
        })
        xp = await upsertUserXp(userData.id, QUIZ_XP_AWARD)
      }

      return sendJSON(res, 200, {
        success: true,
        badge,
        xp,
        message: 'Quiz attempt recorded successfully'
      })
    } catch (err) {
      console.error('Error recording quiz attempt:', err)
      return sendError(res, 500, 'Internal server error')
    }
  },

  async recordCourseCompletion(req, res, courseSlug) {
    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      const { authenticatedUser, userData, error } = await resolveAuthenticatedDbUser(req, {
        createIfMissing: true
      })

      if (!authenticatedUser) {
        return sendError(res, 401, 'Authentication required')
      }

      if (error || !userData?.id) {
        console.error('Error resolving user for course completion:', error)
        return sendError(res, 500, 'Failed to resolve learner account')
      }

      const now = new Date().toISOString()
      const { error: enrollmentUpdateError } = await supabaseClient
        .from('user_enrollments')
        .update({
          progress_pct: 100,
          completed_at: now,
          last_accessed_at: now,
          updated_at: now
        })
        .eq('user_id', userData.id)
        .eq('course_slug', courseSlug)
        .eq('status', 'active')

      if (enrollmentUpdateError) {
        console.error('Error updating course completion:', enrollmentUpdateError)
        return sendError(res, 500, 'Failed to record course completion', enrollmentUpdateError.message)
      }

      const badge = await awardBadgeIfMissing(userData.id, 'first_course_completed', {
        type: 'course',
        id: courseSlug
      })
      const xp = badge ? await upsertUserXp(userData.id, COURSE_XP_AWARD) : null

      return sendJSON(res, 200, {
        success: true,
        badge,
        xp,
        message: 'Course completion recorded successfully'
      })
    } catch (err) {
      console.error('Error recording course completion:', err)
      return sendError(res, 500, 'Internal server error')
    }
  }
}

const learnerProfileHandlers = {
  async getProfile(req, res) {
    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      const { authenticatedUser, userData, error } = await resolveAuthenticatedDbUser(req, {
        createIfMissing: true
      })

      if (!authenticatedUser) {
        return sendError(res, 401, 'Authentication required')
      }

      if (error || !userData?.id) {
        console.error('Error resolving user for learner profile:', error)
        return sendError(res, 500, 'Failed to resolve learner account')
      }

      const { data, error: profileError } = await supabaseClient
        .from('users')
        .select(LEARNER_PROFILE_SELECT)
        .eq('id', userData.id)
        .single()

      if (profileError || !data) {
        console.error('Error fetching learner profile:', profileError)
        return sendError(res, 500, 'Failed to fetch learner profile', profileError?.message)
      }

      return sendJSON(res, 200, {
        success: true,
        profile: mapRowToLearnerProfile(data)
      })
    } catch (err) {
      console.error('Error getting learner profile:', err)
      return sendError(res, 500, 'Internal server error')
    }
  },

  async updateProfile(req, res) {
    if (!supabaseClient) {
      return sendError(res, 503, 'Database not configured')
    }

    try {
      const body = await parseBody(req)
      const updateData = buildProfileUpdatePayload(body)

      const { authenticatedUser, userData, error } = await resolveAuthenticatedDbUser(req, {
        createIfMissing: true
      })

      if (!authenticatedUser) {
        return sendError(res, 401, 'Authentication required')
      }

      if (error || !userData?.id) {
        console.error('Error resolving user for learner profile update:', error)
        return sendError(res, 500, 'Failed to resolve learner account')
      }

      if (Object.keys(updateData).length === 1) {
        return await learnerProfileHandlers.getProfile(req, res)
      }

      const { data, error: updateError } = await supabaseClient
        .from('users')
        .update(updateData)
        .eq('id', userData.id)
        .select(LEARNER_PROFILE_SELECT)
        .single()

      if (updateError || !data) {
        console.error('Error updating learner profile:', updateError)
        return sendError(res, 500, 'Failed to update learner profile', updateError?.message)
      }

      return sendJSON(res, 200, {
        success: true,
        profile: mapRowToLearnerProfile(data)
      })
    } catch (err) {
      console.error('Error updating learner profile:', err)
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

    const { pathname } = parse(req.url || '', true)

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
        await applyMiddleware(authenticateUser({ required: true }), req, res);
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

      // GET /api/enrollment/user/me
      if (pathParts[3] === 'user' && pathParts[4] === 'me' && req.method === 'GET') {
        return await enrollmentHandlers.getUserEnrollments(req, res)
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

    // Learning API routes (authentication required)
    if (pathname.startsWith('/api/learning/')) {
      try {
        await applyMiddleware(authenticateUser({ required: true }), req, res);
      } catch (authError) {
        console.error('❌ Authentication failed:', authError);
        return;
      }

      const pathParts = pathname.split('/')

      if (pathParts[3] === 'snapshot' && pathParts[4] && req.method === 'GET') {
        return await learningHandlers.getSnapshot(req, res, pathParts[4])
      }

      if (pathParts[3] === 'quiz-attempt' && pathParts[4] && req.method === 'POST') {
        return await learningHandlers.recordQuizAttempt(req, res, pathParts[4])
      }

      if (pathParts[3] === 'course-completion' && pathParts[4] && req.method === 'POST') {
        return await learningHandlers.recordCourseCompletion(req, res, pathParts[4])
      }

      return sendError(res, 404, 'Learning endpoint not found')
    }

    // Learner profile routes (authentication required)
    if (pathname === '/api/learner/profile') {
      try {
        await applyMiddleware(authenticateUser({ required: true }), req, res);
      } catch (authError) {
        console.error('❌ Authentication failed:', authError);
        return;
      }

      if (req.method === 'GET') {
        return await learnerProfileHandlers.getProfile(req, res)
      }

      if (req.method === 'PUT') {
        return await learnerProfileHandlers.updateProfile(req, res)
      }

      return sendError(res, 405, 'Method not allowed')
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
    console.log(`   GET  /api/enrollment/status/:courseSlug - Check enrollment status`)
    console.log(`   GET  /api/enrollment/details/:courseSlug - Get enrollment details`)
    console.log(`   POST /api/enrollment/enroll - Enroll in course`)
    console.log(`   GET  /api/enrollment/user/me - Get current user enrollments`)
    console.log(`   GET  /api/enrollment/access/:courseSlug - Get access contract`)
    console.log(`   POST /api/enrollment/cancel - Cancel enrollment`)
    console.log(``)
    console.log(`   🧠 Learning Endpoints:`)
    console.log(`   GET  /api/learning/snapshot/:courseSlug - Get learning snapshot`)
    console.log(`   POST /api/learning/quiz-attempt/:courseSlug - Record quiz attempt`)
    console.log(`   POST /api/learning/course-completion/:courseSlug - Record course completion`)
    console.log(``)
    console.log(`   👤 Learner Profile Endpoints:`)
    console.log(`   GET  /api/learner/profile - Get learner profile`)
    console.log(`   PUT  /api/learner/profile - Update learner profile`)
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
