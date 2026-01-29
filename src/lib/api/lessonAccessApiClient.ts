/**
 * Lesson Access API Client
 * Frontend client for server-side lesson access enforcement
 * Feature 02.1 - Day 3 Implementation
 */

import { msalInstance } from '../auth/msal'

const API_BASE = 'http://localhost:3001/api'

interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  error?: string
  details?: string
}

export interface LessonAccessResult {
  canAccess: boolean
  accessType: 'preview' | 'full' | 'denied' | 'sequential_blocked' | 'error'
  reason: string
  lesson?: {
    id: string
    title: string
    isPreview: boolean
    orderIndex: number
  }
  requiredLessons?: Array<{
    id: string
    title: string
    orderIndex: number
  }>
  enrollment?: {
    id: string
    status: string
  }
}

export interface CourseAccessSummary {
  success: boolean
  courseSlug: string
  userId: string | null
  isEnrolled: boolean
  enrollmentStatus: string | null
  lessons: Array<{
    lessonId: string
    title: string
    orderIndex: number
    isPreview: boolean
    canAccess: boolean
    accessType: string
    reason: string
    requiredLessons?: Array<{
      id: string
      title: string
      orderIndex: number
    }>
  }>
  summary: {
    totalLessons: number
    previewLessons: number
    accessibleLessons: number
    blockedLessons: number
  }
}

export interface LessonContent {
  id: string
  title: string
  type: string
  orderIndex: number
  estimatedDurationMinutes: number
  isPreview: boolean
  content: string
  videoUrl?: string
  resourceUrl?: string
  accessType: string
}

export interface LessonProgress {
  lessonId: string
  completed: boolean
  watchTimeSeconds: number
  completedAt: string | null
  updatedAt: string
}

class LessonAccessApiClient {
  /**
   * Get access token for API requests
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      const activeAccount = msalInstance.getActiveAccount()
      if (!activeAccount) {
        console.warn('No active account found for lesson access API authentication')
        return null
      }

      const tokenRequest = {
        scopes: ['openid', 'profile', 'email'],
        account: activeAccount,
      }

      const response = await msalInstance.acquireTokenSilent(tokenRequest)
      return response.idToken || response.accessToken
    } catch (error) {
      console.error('Failed to acquire access token for lesson access:', error)
      return null
    }
  }

  private async makeRequest<T = any>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      // Get authentication token (optional for lesson access - allows preview content)
      const token = await this.getAccessToken()
      
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      // Add authentication header if token is available
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        }
      }

      if (body) {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(`${API_BASE}${endpoint}`, options)
      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'API request failed',
          details: data.details
        }
      }

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Lesson access API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  /**
   * Check if user can access a specific lesson
   */
  async checkLessonAccess(courseSlug: string, lessonId: string): Promise<LessonAccessResult | null> {
    const result = await this.makeRequest(
      'GET',
      `/lessons/access/${courseSlug}/${lessonId}`
    )

    if (result.success && result.data) {
      return {
        canAccess: result.data.canAccess,
        accessType: result.data.accessType,
        reason: result.data.reason,
        lesson: result.data.lesson,
        requiredLessons: result.data.requiredLessons,
        enrollment: result.data.enrollment
      }
    }

    return null
  }

  /**
   * Get course access summary for all lessons
   */
  async getCourseAccessSummary(courseSlug: string): Promise<CourseAccessSummary | null> {
    const result = await this.makeRequest(
      'GET',
      `/lessons/course-access/${courseSlug}`
    )

    if (result.success && result.data) {
      return result.data
    }

    return null
  }

  /**
   * Get lesson content with access control
   */
  async getLessonContent(courseSlug: string, lessonId: string): Promise<{
    success: boolean
    lesson?: LessonContent
    accessInfo?: {
      canAccess: boolean
      accessType: string
      reason: string
    }
    error?: string
  }> {
    const result = await this.makeRequest(
      'GET',
      `/lessons/content/${courseSlug}/${lessonId}`
    )

    if (result.success && result.data) {
      return {
        success: true,
        lesson: result.data.lesson,
        accessInfo: result.data.accessInfo
      }
    }

    return {
      success: false,
      error: result.error || 'Failed to get lesson content'
    }
  }

  /**
   * Update lesson progress (requires authentication)
   */
  async updateLessonProgress(
    courseSlug: string, 
    lessonId: string, 
    completed: boolean, 
    watchTimeSeconds: number = 0
  ): Promise<{
    success: boolean
    progress?: LessonProgress
    error?: string
    message?: string
  }> {
    const result = await this.makeRequest(
      'POST',
      `/lessons/progress/${courseSlug}/${lessonId}`,
      { completed, watchTimeSeconds }
    )

    if (result.success && result.data) {
      return {
        success: true,
        progress: result.data.progress,
        message: result.data.message
      }
    }

    return {
      success: false,
      error: result.error || 'Failed to update lesson progress'
    }
  }

  /**
   * Check if user can access lesson content (helper method)
   */
  async canAccessLesson(courseSlug: string, lessonId: string): Promise<boolean> {
    const accessResult = await this.checkLessonAccess(courseSlug, lessonId)
    return accessResult?.canAccess || false
  }

  /**
   * Get accessible lessons for a course (helper method)
   */
  async getAccessibleLessons(courseSlug: string): Promise<string[]> {
    const summary = await this.getCourseAccessSummary(courseSlug)
    if (!summary) return []

    return summary.lessons
      .filter(lesson => lesson.canAccess)
      .map(lesson => lesson.lessonId)
  }

  /**
   * Get next accessible lesson (helper method)
   */
  async getNextAccessibleLesson(courseSlug: string, currentLessonId: string): Promise<string | null> {
    const summary = await this.getCourseAccessSummary(courseSlug)
    if (!summary) return null

    const currentIndex = summary.lessons.findIndex(l => l.lessonId === currentLessonId)
    if (currentIndex === -1) return null

    // Find next accessible lesson
    for (let i = currentIndex + 1; i < summary.lessons.length; i++) {
      if (summary.lessons[i].canAccess) {
        return summary.lessons[i].lessonId
      }
    }

    return null
  }
}

// Export singleton instance
export const lessonAccessApiClient = new LessonAccessApiClient()
export default lessonAccessApiClient