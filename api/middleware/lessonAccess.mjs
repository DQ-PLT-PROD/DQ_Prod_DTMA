/**
 * Lesson Access Control Middleware
 * Server-side enforcement of lesson access rules
 * Feature 02.1 - Day 2 Implementation
 */

import { getCurrentUser } from './auth.mjs'

/**
 * Lesson access rules:
 * 1. Preview lessons (is_preview = true) are accessible to everyone
 * 2. Full lessons require active enrollment
 * 3. Sequential access: users must complete previous lessons to access next ones
 * 4. Unauthenticated users can only access preview content
 */

/**
 * Check if user can access a specific lesson
 */
export const checkLessonAccess = async (supabaseClient, userId, courseSlug, lessonId, lessonData = null) => {
  try {
    // Get lesson data if not provided
    let lesson = lessonData
    if (!lesson) {
      const { data: lessonResult, error: lessonError } = await supabaseClient
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('course_slug', courseSlug)
        .single()

      if (lessonError) {
        console.error('Error fetching lesson:', lessonError)
        return {
          canAccess: false,
          reason: 'Lesson not found',
          accessType: 'denied'
        }
      }
      lesson = lessonResult
    }

    // Preview lessons are always accessible
    if (lesson.is_preview) {
      return {
        canAccess: true,
        reason: 'Preview lesson',
        accessType: 'preview',
        lesson
      }
    }

    // Non-authenticated users can only access preview content
    if (!userId) {
      return {
        canAccess: false,
        reason: 'Authentication required for full content',
        accessType: 'denied',
        lesson
      }
    }

    // Check enrollment status
    const { data: enrollment, error: enrollmentError } = await supabaseClient
      .from('user_enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_slug', courseSlug)
      .eq('status', 'active')
      .single()

    if (enrollmentError || !enrollment) {
      return {
        canAccess: false,
        reason: 'Enrollment required',
        accessType: 'denied',
        lesson
      }
    }

    // Check sequential access (if enabled for course)
    const sequentialAccessResult = await checkSequentialAccess(
      supabaseClient, 
      enrollment.id, 
      courseSlug, 
      lesson.order_index
    )

    if (!sequentialAccessResult.canAccess) {
      return {
        canAccess: false,
        reason: sequentialAccessResult.reason,
        accessType: 'sequential_blocked',
        lesson,
        requiredLessons: sequentialAccessResult.requiredLessons
      }
    }

    // Full access granted
    return {
      canAccess: true,
      reason: 'Enrolled user with sequential access',
      accessType: 'full',
      lesson,
      enrollment
    }

  } catch (error) {
    console.error('Error checking lesson access:', error)
    return {
      canAccess: false,
      reason: 'Access check failed',
      accessType: 'error'
    }
  }
}

/**
 * Check sequential access requirements
 * Users must complete previous lessons to access next ones
 */
const checkSequentialAccess = async (supabaseClient, enrollmentId, courseSlug, currentLessonOrder) => {
  try {
    // Get all lessons before current lesson in order
    const { data: previousLessons, error: lessonsError } = await supabaseClient
      .from('lessons')
      .select('id, title, order_index, is_preview')
      .eq('course_slug', courseSlug)
      .lt('order_index', currentLessonOrder)
      .eq('is_preview', false) // Only check non-preview lessons for sequential access
      .order('order_index', { ascending: true })

    if (lessonsError) {
      console.error('Error fetching previous lessons:', lessonsError)
      return {
        canAccess: true, // Default to allow access if we can't check
        reason: 'Could not verify sequential access'
      }
    }

    // If no previous lessons, access is allowed
    if (!previousLessons || previousLessons.length === 0) {
      return {
        canAccess: true,
        reason: 'First lesson or no prerequisites'
      }
    }

    // Check completion status of previous lessons
    const previousLessonIds = previousLessons.map(l => l.id)
    const { data: completedLessons, error: progressError } = await supabaseClient
      .from('lesson_progress')
      .select('lesson_id')
      .eq('enrollment_id', enrollmentId)
      .eq('completed', true)
      .in('lesson_id', previousLessonIds)

    if (progressError) {
      console.error('Error fetching lesson progress:', progressError)
      return {
        canAccess: true, // Default to allow access if we can't check
        reason: 'Could not verify lesson progress'
      }
    }

    const completedLessonIds = new Set((completedLessons || []).map(p => p.lesson_id))
    const incompleteLessons = previousLessons.filter(lesson => !completedLessonIds.has(lesson.id))

    if (incompleteLessons.length > 0) {
      return {
        canAccess: false,
        reason: `Must complete ${incompleteLessons.length} previous lesson(s)`,
        requiredLessons: incompleteLessons.map(l => ({
          id: l.id,
          title: l.title,
          orderIndex: l.order_index
        }))
      }
    }

    return {
      canAccess: true,
      reason: 'All prerequisites completed'
    }

  } catch (error) {
    console.error('Error checking sequential access:', error)
    return {
      canAccess: true, // Default to allow access on error
      reason: 'Sequential access check failed'
    }
  }
}

/**
 * Get lesson access summary for a course
 * Returns access status for all lessons in the course
 */
export const getCourseAccessSummary = async (supabaseClient, userId, courseSlug) => {
  try {
    // Get all lessons for the course
    const { data: lessons, error: lessonsError } = await supabaseClient
      .from('lessons')
      .select('*')
      .eq('course_slug', courseSlug)
      .order('order_index', { ascending: true })

    if (lessonsError) {
      console.error('Error fetching course lessons:', lessonsError)
      return {
        success: false,
        error: 'Could not fetch course lessons'
      }
    }

    // Check access for each lesson
    const accessResults = []
    for (const lesson of lessons) {
      const accessResult = await checkLessonAccess(supabaseClient, userId, courseSlug, lesson.id, lesson)
      accessResults.push({
        lessonId: lesson.id,
        title: lesson.title,
        orderIndex: lesson.order_index,
        isPreview: lesson.is_preview,
        canAccess: accessResult.canAccess,
        accessType: accessResult.accessType,
        reason: accessResult.reason,
        requiredLessons: accessResult.requiredLessons
      })
    }

    // Get enrollment info if user is authenticated
    let enrollment = null
    if (userId) {
      const { data: enrollmentData } = await supabaseClient
        .from('user_enrollments')
        .select('*')
        .eq('user_id', userId)
        .eq('course_slug', courseSlug)
        .eq('status', 'active')
        .single()
      
      enrollment = enrollmentData
    }

    return {
      success: true,
      courseSlug,
      userId,
      isEnrolled: !!enrollment,
      enrollmentStatus: enrollment?.status || null,
      lessons: accessResults,
      summary: {
        totalLessons: lessons.length,
        previewLessons: lessons.filter(l => l.is_preview).length,
        accessibleLessons: accessResults.filter(r => r.canAccess).length,
        blockedLessons: accessResults.filter(r => !r.canAccess).length
      }
    }

  } catch (error) {
    console.error('Error getting course access summary:', error)
    return {
      success: false,
      error: 'Failed to get course access summary'
    }
  }
}

/**
 * Middleware to enforce lesson access control
 * Use this on lesson content endpoints
 */
export const enforceLessonAccess = (options = {}) => {
  const { allowPreview = true } = options

  return async (req, res, next) => {
    try {
      const user = getCurrentUser(req)
      const { courseSlug, lessonId } = req.params

      if (!courseSlug || !lessonId) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          error: 'Missing required parameters',
          message: 'courseSlug and lessonId are required'
        }))
        return
      }

      // Get Supabase client from request context (set by main server)
      const supabaseClient = req.supabaseClient
      if (!supabaseClient) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          error: 'Database not available',
          message: 'Database connection not configured'
        }))
        return
      }

      // Check lesson access
      const accessResult = await checkLessonAccess(
        supabaseClient,
        user?.azureUserId || null,
        courseSlug,
        lessonId
      )

      if (!accessResult.canAccess) {
        // Different status codes based on access type
        let statusCode = 403
        if (accessResult.accessType === 'denied' && !user) {
          statusCode = 401 // Unauthorized - need to login
        }

        res.statusCode = statusCode
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          error: 'Access denied',
          message: accessResult.reason,
          accessType: accessResult.accessType,
          requiredLessons: accessResult.requiredLessons
        }))
        return
      }

      // Attach access info to request for use by handlers
      req.lessonAccess = accessResult
      next()

    } catch (error) {
      console.error('Lesson access middleware error:', error)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({
        error: 'Access check failed',
        message: 'An error occurred while checking lesson access'
      }))
    }
  }
}

export default {
  checkLessonAccess,
  getCourseAccessSummary,
  enforceLessonAccess
}