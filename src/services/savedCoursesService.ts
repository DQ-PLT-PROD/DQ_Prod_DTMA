import { msalInstance } from "@/lib/auth/msal";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504])

export class SavedCoursesServiceError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'SavedCoursesServiceError'
    this.status = status
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function getAccessToken(): Promise<string | null> {
  const activeAccount = msalInstance.getActiveAccount()
  if (!activeAccount) return null

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await msalInstance.acquireTokenSilent({
        scopes: ['openid', 'profile', 'email'],
        account: activeAccount,
      })
      return response.idToken || response.accessToken
    } catch (error) {
      if (attempt === 1) {
        return null
      }
      await sleep(250)
    }
  }

  return null
}

const parseResponse = async (response: Response): Promise<any> => {
  if (response.status === 204) {
    return {}
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return text ? { error: text } : {}
}

const shouldRetryError = (error: unknown): boolean => {
  if (error instanceof SavedCoursesServiceError) {
    return Boolean(error.status && RETRYABLE_STATUS.has(error.status))
  }

  if (!(error instanceof Error)) {
    return false
  }

  return /Failed to fetch|NetworkError|Load failed/i.test(error.message)
}

async function makeRequest<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
  const token = await getAccessToken()
  if (!token) {
    throw new SavedCoursesServiceError('Authentication required')
  }

  const maxRetries = method === 'GET' ? 2 : 1

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      const data = await parseResponse(response)

      if (!response.ok) {
        const error = new SavedCoursesServiceError(
          data?.error || `Request failed with status ${response.status}`,
          response.status,
        )

        if (attempt < maxRetries && shouldRetryError(error)) {
          await sleep(300 * (attempt + 1))
          continue
        }

        throw error
      }

      return data as T
    } catch (error) {
      if (attempt < maxRetries && shouldRetryError(error)) {
        await sleep(300 * (attempt + 1))
        continue
      }

      if (error instanceof SavedCoursesServiceError) {
        throw error
      }

      const message = error instanceof Error ? error.message : 'Request failed'
      throw new SavedCoursesServiceError(message)
    }
  }

  throw new SavedCoursesServiceError('Request failed after retries')
}

export async function fetchSavedCourseIds(): Promise<string[]> {
  const data = await makeRequest<{ savedCourseIds: string[] }>('GET', '/saved-courses')
  return Array.isArray(data.savedCourseIds) ? data.savedCourseIds : []
}

export async function saveCourse(courseId: string): Promise<boolean> {
  const data = await makeRequest<{ saved: boolean }>('POST', '/saved-courses', { courseId })
  return Boolean(data.saved)
}

export async function unsaveCourse(courseId: string): Promise<boolean> {
  const data = await makeRequest<{ saved: boolean }>('DELETE', `/saved-courses/${encodeURIComponent(courseId)}`)
  return data.saved === false
}
