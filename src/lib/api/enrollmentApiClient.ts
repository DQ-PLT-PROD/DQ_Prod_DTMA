/**
 * Enrollment API Client
 * Frontend client for Feature 02.1 backend enrollment APIs
 * Replaces direct Supabase calls with API calls
 */

import { msalInstance } from '../auth/msal'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  error?: string
  details?: string
}

class EnrollmentApiClient {
  private async parseResponseBody(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      return response.json()
    }

    const text = await response.text()
    return text ? { error: text.slice(0, 250) } : null
  }

  /**
   * Get access token for API requests
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      const activeAccount = msalInstance.getActiveAccount()
      if (!activeAccount) {
        console.warn('No active account found for API authentication')
        return null
      }

      // Try to get token silently first
      const tokenRequest = {
        scopes: ['openid', 'profile', 'email'],
        account: activeAccount,
      }

      const response = await msalInstance.acquireTokenSilent(tokenRequest)
      return response.idToken || response.accessToken
    } catch (error) {
      console.error('Failed to acquire access token:', error)
      return null
    }
  }

  private async makeRequest<T = any>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      // Get authentication token
      const token = await this.getAccessToken()
      
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }

      // Add authentication header if token is available
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        }
      } else {
        console.warn('Making API request without authentication token')
      }

      if (body) {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(`${API_BASE}${endpoint}`, options)
      const data = await this.parseResponseBody(response)

      if (!response.ok) {
        const statusError = `API request failed with status ${response.status}`
        return {
          success: false,
          error: data?.error || statusError,
          details: data?.details
        }
      }

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  /**
   * Check if user is enrolled in a course
   * Note: userId parameter is now optional - backend will use authenticated user
   */
  async isUserEnrolled(courseSlug: string, userId?: string): Promise<boolean> {
    const queryParam = userId ? `?userId=${userId}` : ''
    const result = await this.makeRequest(
      'GET',
      `/enrollment/status/${courseSlug}${queryParam}`
    )

    if (result.success && result.data) {
      return result.data.isEnrolled || false
    }

    return false
  }

  /**
   * Get enrollment details for a user and course
   * Note: userId parameter is now optional - backend will use authenticated user
   */
  async getEnrollment(courseSlug: string, userId?: string) {
    const queryParam = userId ? `?userId=${userId}` : ''
    const result = await this.makeRequest(
      'GET',
      `/enrollment/details/${courseSlug}${queryParam}`
    )

    if (result.success && result.data) {
      return result.data.enrollment
    }

    return null
  }

  /**
   * Enroll user in a course
   * Backend uses authenticated user from token - do not pass userId
   */
  async enrollInCourse(courseSlug: string, method: 'explicit' | 'auto' = 'explicit') {
    const requestBody = { courseSlug, method }

    const result = await this.makeRequest(
      'POST',
      '/enrollment/enroll',
      requestBody
    )

    return {
      success: result.success || false,
      enrollment: result.data?.enrollment,
      error: result.error,
      message: result.data?.message
    }
  }

  /**
   * Get all enrollments for a user
   * Backend uses authenticated user from token - do not pass userId
   */
  async getUserEnrollments() {
    // Backend will use authenticated user's ID from token
    const endpoint = '/enrollment/user/me'
    
    const result = await this.makeRequest(
      'GET',
      endpoint
    )

    if (result.success && result.data) {
      return result.data.enrollments || []
    }

    return []
  }

  /**
   * Get access contract for a user and course
   * Note: userId parameter is now optional - backend will use authenticated user
   */
  async getAccessContract(courseSlug: string, userId?: string) {
    const queryParam = userId ? `?userId=${userId}` : ''
    const result = await this.makeRequest(
      'GET',
      `/enrollment/access/${courseSlug}${queryParam}`
    )

    if (result.success && result.data) {
      return {
        isEnrolled: result.data.isEnrolled || false,
        enrollmentStatus: result.data.enrollmentStatus,
        subscriptionStatus: result.data.subscriptionStatus
      }
    }

    return {
      isEnrolled: false,
      enrollmentStatus: null,
      subscriptionStatus: null
    }
  }

  /**
   * Cancel enrollment
   * Backend uses authenticated user from token - do not pass userId
   */
  async cancelEnrollment(courseSlug: string) {
    const requestBody = { courseSlug }

    const result = await this.makeRequest(
      'POST',
      '/enrollment/cancel',
      requestBody
    )

    return {
      success: result.success || false,
      enrollment: result.data?.enrollment,
      error: result.error,
      message: result.data?.message
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    const result = await this.makeRequest('GET', '/health')
    return result.success && result.data?.ok
  }
}

// Export singleton instance
export const enrollmentApiClient = new EnrollmentApiClient()
export default enrollmentApiClient
