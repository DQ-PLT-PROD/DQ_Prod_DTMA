/**
 * Vercel Serverless Function: Enrollment API
 * Handles enrollment operations for courses
 * 
 * Routes:
 * - GET /api/enrollment/status/:courseSlug
 * - GET /api/enrollment/details/:courseSlug
 * - POST /api/enrollment/enroll
 * - GET /api/enrollment/user/me
 * - GET /api/enrollment/access/:courseSlug
 */
import { createClient } from '@supabase/supabase-js'

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

// Helper to get authenticated user from token
const getAuthenticatedUser = (req) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  // For now, we'll extract user info from the token
  // In production, you should validate the JWT token properly
  try {
    const token = authHeader.split(' ')[1]
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    return {
      azureUserId: payload.oid || payload.sub,
      email: payload.email || payload.preferred_username,
      name: payload.name
    }
  } catch (error) {
    console.error('Failed to parse token:', error)
    return null
  }
}

// Helper to map database row to enrollment
const mapRowToEnrollment = (row) => ({
  id: row.id,
  userId: row.user_id,
  courseSlug: row.course_slug,
  enrolledAt: row.started_at,
  status: row.status || 'active',
  enrollmentMethod: row.enrollment_method || 'auto',
  cancelledAt: row.cancelled_at || null,
})

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
    // Parse the URL path to determine the route
    const url = new URL(req.url, `http://${req.headers.host}`)
    const pathParts = url.pathname.split('/').filter(Boolean)
    
    // Remove 'api' and 'enrollment' from path
    const routeParts = pathParts.slice(2) // ['status', 'courseSlug'] or ['enroll']
    
    console.log('📍 Enrollment API:', req.method, routeParts.join('/'))

    // Route to appropriate handler based on path
    if (req.method === 'GET' && routeParts[0] === 'status' && routeParts[1]) {
      return await getEnrollmentStatus(req, res, routeParts[1])
    } else if (req.method === 'GET' && routeParts[0] === 'details' && routeParts[1]) {
      return await getEnrollmentDetails(req, res, routeParts[1])
    } else if (req.method === 'POST' && routeParts[0] === 'enroll') {
      return await enrollInCourse(req, res)
    } else if (req.method === 'GET' && routeParts[0] === 'user' && routeParts[1] === 'me') {
      return await getUserEnrollments(req, res)
    } else if (req.method === 'GET' && routeParts[0] === 'access' && routeParts[1]) {
      return await getAccessContract(req, res, routeParts[1])
    } else {
      return sendError(res, 404, 'Endpoint not found')
    }
  } catch (error) {
    console.error('API Error:', error)
    return sendError(res, 500, 'Internal server error', error.message)
  }
}

// GET /api/enrollment/status/:courseSlug
async function getEnrollmentStatus(req, res, courseSlug) {
  const user = getAuthenticatedUser(req)
  
  if (!user) {
    return sendJSON(res, 200, { isEnrolled: false, enrollmentStatus: null })
  }

  try {
    // Look up database user by Azure user ID
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('azure_user_id', user.azureUserId)
      .single()

    if (userError || !userData) {
      return sendJSON(res, 200, { isEnrolled: false, enrollmentStatus: null })
    }

    const { data, error } = await supabaseClient
      .from('user_enrollments')
      .select('id, status')
      .eq('user_id', userData.id)
      .eq('course_slug', courseSlug)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') {
      return sendError(res, 500, 'Database error', error.message)
    }

    return sendJSON(res, 200, {
      isEnrolled: !!data,
      enrollmentStatus: data?.status || null,
      enrollmentId: data?.id || null
    })
  } catch (error) {
    console.error('Error checking enrollment:', error)
    return sendError(res, 500, 'Internal server error')
  }
}

// GET /api/enrollment/details/:courseSlug
async function getEnrollmentDetails(req, res, courseSlug) {
  const user = getAuthenticatedUser(req)
  
  if (!user) {
    return sendError(res, 401, 'Authentication required')
  }

  try {
    // Look up database user by Azure user ID
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('azure_user_id', user.azureUserId)
      .single()

    if (userError || !userData) {
      return sendJSON(res, 404, { error: 'Enrollment not found' })
    }

    const { data, error } = await supabaseClient
      .from('user_enrollments')
      .select('*')
      .eq('user_id', userData.id)
      .eq('course_slug', courseSlug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return sendJSON(res, 404, { error: 'Enrollment not found' })
      }
      return sendError(res, 500, 'Database error', error.message)
    }

    return sendJSON(res, 200, {
      success: true,
      enrollment: mapRowToEnrollment(data)
    })
  } catch (error) {
    console.error('Error getting enrollment details:', error)
    return sendError(res, 500, 'Internal server error')
  }
}

// POST /api/enrollment/enroll
async function enrollInCourse(req, res) {
  const user = getAuthenticatedUser(req)
  
  if (!user) {
    return sendError(res, 401, 'Authentication required')
  }

  try {
    const { courseSlug, method = 'explicit' } = req.body || {}

    if (!courseSlug) {
      return sendError(res, 400, 'Missing required field: courseSlug')
    }

    console.log('🎯 Enrolling user:', user.azureUserId, 'in course:', courseSlug)

    // Look up or create database user
    let { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('azure_user_id', user.azureUserId)
      .single()

    if (userError && userError.code === 'PGRST116') {
      // User doesn't exist, create them
      const { data: newUser, error: createError } = await supabaseClient
        .from('users')
        .insert({
          azure_user_id: user.azureUserId,
          customer_id: `CUST_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          email: user.email || `user-${user.azureUserId}@temp.com`,
          name: user.name || 'User',
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (createError) {
        return sendError(res, 500, 'Failed to create user', createError.message)
      }

      userData = newUser
    } else if (userError) {
      return sendError(res, 500, 'Failed to lookup user', userError.message)
    }

    // Check if already enrolled
    const { data: existing } = await supabaseClient
      .from('user_enrollments')
      .select('*')
      .eq('user_id', userData.id)
      .eq('course_slug', courseSlug)
      .single()

    if (existing && existing.status === 'active') {
      return sendJSON(res, 200, {
        success: true,
        enrollment: mapRowToEnrollment(existing),
        message: 'Already enrolled'
      })
    }

    // Create enrollment
    const { data, error } = await supabaseClient
      .from('user_enrollments')
      .insert({
        user_id: userData.id,
        course_slug: courseSlug,
        started_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
        progress_pct: 0,
        status: 'active',
        enrollment_method: method
      })
      .select()
      .single()

    if (error) {
      return sendError(res, 500, 'Failed to create enrollment', error.message)
    }

    console.log('✅ Enrollment created successfully')

    return sendJSON(res, 201, {
      success: true,
      enrollment: mapRowToEnrollment(data),
      message: 'Enrollment created successfully'
    })
  } catch (error) {
    console.error('Error enrolling in course:', error)
    return sendError(res, 500, 'Internal server error')
  }
}

// GET /api/enrollment/user/me
async function getUserEnrollments(req, res) {
  const user = getAuthenticatedUser(req)
  
  if (!user) {
    return sendError(res, 401, 'Authentication required')
  }

  try {
    // Look up database user by Azure user ID
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('azure_user_id', user.azureUserId)
      .single()

    if (userError || !userData) {
      return sendJSON(res, 200, {
        success: true,
        enrollments: [],
        count: 0
      })
    }

    const { data, error } = await supabaseClient
      .from('user_enrollments')
      .select('*')
      .eq('user_id', userData.id)
      .eq('status', 'active')
      .order('started_at', { ascending: false })

    if (error) {
      return sendError(res, 500, 'Database error', error.message)
    }

    const enrollments = (data || []).map(mapRowToEnrollment)
    return sendJSON(res, 200, {
      success: true,
      enrollments,
      count: enrollments.length
    })
  } catch (error) {
    console.error('Error getting user enrollments:', error)
    return sendError(res, 500, 'Internal server error')
  }
}

// GET /api/enrollment/access/:courseSlug
async function getAccessContract(req, res, courseSlug) {
  const user = getAuthenticatedUser(req)
  
  if (!user) {
    return sendJSON(res, 200, {
      isEnrolled: false,
      enrollmentStatus: null,
      subscriptionStatus: null,
      courseSlug,
      userId: null
    })
  }

  try {
    // Look up database user by Azure user ID
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('azure_user_id', user.azureUserId)
      .single()

    if (userError || !userData) {
      return sendJSON(res, 200, {
        isEnrolled: false,
        enrollmentStatus: null,
        subscriptionStatus: null,
        courseSlug,
        userId: user.azureUserId
      })
    }

    // Get enrollment
    const { data: enrollment } = await supabaseClient
      .from('user_enrollments')
      .select('*')
      .eq('user_id', userData.id)
      .eq('course_slug', courseSlug)
      .single()

    return sendJSON(res, 200, {
      isEnrolled: enrollment?.status === 'active',
      enrollmentStatus: enrollment?.status || null,
      subscriptionStatus: null,
      courseSlug,
      userId: user.azureUserId
    })
  } catch (error) {
    console.error('Error getting access contract:', error)
    return sendError(res, 500, 'Internal server error')
  }
}
