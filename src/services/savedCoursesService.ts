/**
 * Saved Courses Service
 * Frontend API client for saved/bookmarked courses
 */

import { msalInstance } from '@/lib/auth/msal'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

async function getAccessToken(): Promise<string | null> {
  try {
    const activeAccount = msalInstance.getActiveAccount()
    if (!activeAccount) return null

    const response = await msalInstance.acquireTokenSilent({
      scopes: ['openid', 'profile', 'email'],
      account: activeAccount,
    })
    return response.idToken || response.accessToken
  } catch {
    return null
  }
}

async function makeRequest<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
  const token = await getAccessToken()
  if (!token) {
    throw new Error('Authentication required')
  }

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options)

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data?.error || `Request failed with status ${response.status}`)
  }

  return response.json()
}

export async function fetchSavedCourseIds(): Promise<string[]> {
  const data = await makeRequest<{ savedCourseIds: string[] }>('GET', '/saved-courses')
  return data.savedCourseIds
}

export async function saveCourse(courseId: string): Promise<boolean> {
  console.log('💾 Saving course:', courseId)
  const requestBody = { courseId }
  console.log('💾 Request body:', requestBody)
  const data = await makeRequest<{ saved: boolean }>('POST', '/saved-courses', requestBody)
  console.log('💾 Save response:', data)
  return data.saved
}

export async function unsaveCourse(courseId: string): Promise<boolean> {
  await makeRequest<{ saved: boolean }>('DELETE', `/saved-courses/${encodeURIComponent(courseId)}`)
  return true
}
