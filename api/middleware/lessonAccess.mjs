/**
 * Lesson Access Control Middleware
 * Learner access is now scoped to standalone modules.
 *
 * Existing API route shapes still pass a single slug parameter; that slug now
 * resolves against public.modules.slug instead of public.courses.slug.
 */

import { getCurrentUser } from './auth.mjs'

const resolveEnrollmentUserId = async (supabaseClient, authUserId) => {
  if (!authUserId) return null

  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('id')
      .eq('azure_user_id', authUserId)
      .single()

    if (!error && data?.id) {
      return data.id
    }
  } catch (error) {
    console.warn('Failed to resolve Azure user ID to DB user ID:', error)
  }

  return authUserId
}

const resolveModuleBySlug = async (supabaseClient, moduleSlug) => {
  if (!moduleSlug) {
    return null
  }

  const { data, error } = await supabaseClient
    .from('modules')
    .select('*')
    .eq('slug', moduleSlug)
    .single()

  if (error || !data) {
    console.warn('Failed to resolve module by slug:', moduleSlug, error?.message)
    return null
  }

  return data
}

const checkSequentialAccess = async (supabaseClient, enrollmentId, moduleId, currentLessonOrder) => {
  try {
    const { data: previousLessons, error: lessonsError } = await supabaseClient
      .from('lessons')
      .select('id, title, order_index, is_preview')
      .eq('module_id', moduleId)
      .lt('order_index', currentLessonOrder)
      .eq('is_preview', false)
      .order('order_index', { ascending: true })

    if (lessonsError) {
      console.error('Error fetching previous lessons:', lessonsError)
      return {
        canAccess: true,
        reason: 'Could not verify sequential access',
      }
    }

    if (!previousLessons || previousLessons.length === 0) {
      return {
        canAccess: true,
        reason: 'First lesson or no prerequisites',
      }
    }

    const previousLessonIds = previousLessons.map((lesson) => lesson.id)
    const { data: completedLessons, error: progressError } = await supabaseClient
      .from('module_lesson_progress')
      .select('lesson_id')
      .eq('enrollment_id', enrollmentId)
      .eq('completed', true)
      .in('lesson_id', previousLessonIds)

    if (progressError) {
      console.error('Error fetching module lesson progress:', progressError)
      return {
        canAccess: true,
        reason: 'Could not verify lesson progress',
      }
    }

    const completedLessonIds = new Set((completedLessons || []).map((progress) => progress.lesson_id))
    const incompleteLessons = previousLessons.filter((lesson) => !completedLessonIds.has(lesson.id))

    if (incompleteLessons.length > 0) {
      return {
        canAccess: false,
        reason: `Must complete ${incompleteLessons.length} previous lesson(s)`,
        requiredLessons: incompleteLessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          orderIndex: lesson.order_index,
        })),
      }
    }

    return {
      canAccess: true,
      reason: 'All prerequisites completed',
    }
  } catch (error) {
    console.error('Error checking sequential access:', error)
    return {
      canAccess: true,
      reason: 'Sequential access check failed',
    }
  }
}

export const checkLessonAccess = async (supabaseClient, userId, moduleSlug, lessonId, lessonData = null) => {
  try {
    const module = await resolveModuleBySlug(supabaseClient, moduleSlug)

    if (!module) {
      return {
        canAccess: false,
        reason: 'Module not found',
        accessType: 'denied',
      }
    }

    let lesson = lessonData

    if (!lesson) {
      const { data: lessonResult, error: lessonError } = await supabaseClient
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('module_id', module.id)
        .single()

      if (lessonError || !lessonResult) {
        console.error('Error fetching module lesson:', lessonError)
        return {
          canAccess: false,
          reason: 'Lesson not found',
          accessType: 'denied',
        }
      }

      lesson = lessonResult
    }

    if (lesson.is_preview) {
      return {
        canAccess: true,
        reason: 'Preview lesson',
        accessType: 'preview',
        lesson,
        module,
      }
    }

    if (!userId) {
      return {
        canAccess: false,
        reason: 'Authentication required for full content',
        accessType: 'denied',
        lesson,
        module,
      }
    }

    const enrollmentUserId = await resolveEnrollmentUserId(supabaseClient, userId)
    const { data: enrollment, error: enrollmentError } = await supabaseClient
      .from('module_enrollments')
      .select('*')
      .eq('user_id', enrollmentUserId)
      .eq('module_id', module.id)
      .eq('status', 'active')
      .single()

    if (enrollmentError || !enrollment) {
      return {
        canAccess: false,
        reason: 'Enrollment required',
        accessType: 'denied',
        lesson,
        module,
      }
    }

    const sequentialAccessResult = await checkSequentialAccess(
      supabaseClient,
      enrollment.id,
      module.id,
      lesson.order_index
    )

    if (!sequentialAccessResult.canAccess) {
      return {
        canAccess: false,
        reason: sequentialAccessResult.reason,
        accessType: 'sequential_blocked',
        lesson,
        module,
        requiredLessons: sequentialAccessResult.requiredLessons,
      }
    }

    return {
      canAccess: true,
      reason: 'Enrolled learner with sequential access',
      accessType: 'full',
      lesson,
      module,
      enrollment,
    }
  } catch (error) {
    console.error('Error checking lesson access:', error)
    return {
      canAccess: false,
      reason: 'Access check failed',
      accessType: 'error',
    }
  }
}

export const checkModuleAccess = async (supabaseClient, userId, moduleSlug) => {
  try {
    const module = await resolveModuleBySlug(supabaseClient, moduleSlug)

    if (!module) {
      return {
        canAccess: false,
        reason: 'Module not found',
        accessType: 'denied',
      }
    }

    return {
      canAccess: true,
      reason: 'Module overview is public content',
      accessType: 'module_intro',
      module,
      hasIntroContent: Boolean(module.description || module.thumbnail_url),
    }
  } catch (error) {
    console.error('Error checking module access:', error)
    return {
      canAccess: false,
      reason: 'Access check failed',
      accessType: 'error',
    }
  }
}

export const getCourseAccessSummary = async (supabaseClient, userId, moduleSlug) => {
  try {
    const module = await resolveModuleBySlug(supabaseClient, moduleSlug)

    if (!module) {
      return {
        success: false,
        error: 'Module not found',
      }
    }

    const { data: lessons, error: lessonsError } = await supabaseClient
      .from('lessons')
      .select('*')
      .eq('module_id', module.id)
      .order('order_index', { ascending: true })

    if (lessonsError) {
      console.error('Error fetching module lessons:', lessonsError)
      return {
        success: false,
        error: 'Could not fetch module lessons',
      }
    }

    const accessResults = []
    for (const lesson of lessons || []) {
      const accessResult = await checkLessonAccess(supabaseClient, userId, moduleSlug, lesson.id, lesson)
      accessResults.push({
        lessonId: lesson.id,
        moduleId: module.id,
        title: lesson.title,
        orderIndex: lesson.order_index,
        isPreview: lesson.is_preview,
        canAccess: accessResult.canAccess,
        accessType: accessResult.accessType,
        reason: accessResult.reason,
        requiredLessons: accessResult.requiredLessons,
      })
    }

    let enrollment = null
    if (userId) {
      const enrollmentUserId = await resolveEnrollmentUserId(supabaseClient, userId)
      const { data: enrollmentData } = await supabaseClient
        .from('module_enrollments')
        .select('*')
        .eq('user_id', enrollmentUserId)
        .eq('module_id', module.id)
        .eq('status', 'active')
        .single()

      enrollment = enrollmentData
    }

    return {
      success: true,
      courseSlug: module.slug,
      moduleSlug: module.slug,
      userId,
      isEnrolled: Boolean(enrollment),
      enrollmentStatus: enrollment?.status || null,
      hasModules: true,
      modules: [
        {
          id: module.id,
          title: module.title,
          description: module.description,
          orderIndex: module.order_index,
          thumbnailUrl: module.thumbnail_url,
          lessons: accessResults,
        },
      ],
      lessons: accessResults,
      summary: {
        totalLessons: lessons?.length || 0,
        totalModules: 1,
        previewLessons: (lessons || []).filter((lesson) => lesson.is_preview).length,
        accessibleLessons: accessResults.filter((result) => result.canAccess).length,
        blockedLessons: accessResults.filter((result) => !result.canAccess).length,
        modulesWithIntros: 0,
      },
    }
  } catch (error) {
    console.error('Error getting module access summary:', error)
    return {
      success: false,
      error: 'Failed to get module access summary',
    }
  }
}

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
          message: 'moduleSlug and lessonId are required',
        }))
        return
      }

      const supabaseClient = req.supabaseClient
      if (!supabaseClient) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          error: 'Database not available',
          message: 'Database connection not configured',
        }))
        return
      }

      const accessResult = await checkLessonAccess(
        supabaseClient,
        user?.azureUserId || null,
        courseSlug,
        lessonId
      )

      if (!allowPreview && !user && accessResult.accessType === 'preview') {
        res.statusCode = 401
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          error: 'Authentication required',
          message: 'Preview access disabled - authentication required',
          accessType: 'denied',
        }))
        return
      }

      if (!accessResult.canAccess) {
        let statusCode = 403
        if (accessResult.accessType === 'denied' && !user) {
          statusCode = 401
        }

        res.statusCode = statusCode
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          error: 'Access denied',
          message: accessResult.reason,
          accessType: accessResult.accessType,
          requiredLessons: accessResult.requiredLessons,
        }))
        return
      }

      req.lessonAccess = accessResult
      next()
    } catch (error) {
      console.error('Lesson access middleware error:', error)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({
        error: 'Access check failed',
        message: 'An error occurred while checking lesson access',
      }))
    }
  }
}

export default {
  checkLessonAccess,
  checkModuleAccess,
  getCourseAccessSummary,
  enforceLessonAccess,
}
