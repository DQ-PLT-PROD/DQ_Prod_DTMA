/**
 * Setup Test Data for Lesson Access Testing
 * Creates test users, enrollments, and lesson data
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

try {
  const envPath = join(__dirname, '.env')
  const envFile = readFileSync(envPath, 'utf8')
  
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        process.env[key] = valueParts.join('=')
      }
    }
  })
  console.log('✅ Environment variables loaded')
} catch (err) {
  console.log('⚠️ No .env file found, using system environment variables')
}

const API_BASE = 'http://localhost:3001/api'
const TEST_TOKEN = 'test-token' // Special token for test mode
const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc' // Valid UUID format for test user

// Test helper function
async function makeRequest(method, endpoint, body = null, useAuth = true) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (useAuth) {
    options.headers['Authorization'] = `Bearer ${TEST_TOKEN}`
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options)
    const data = await response.json()
    
    return {
      status: response.status,
      ok: response.ok,
      data
    }
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    }
  }
}

async function setupTestData() {
  console.log('🔧 Setting up test data for lesson access testing...')
  
  // Check if API server is running
  try {
    const healthCheck = await makeRequest('GET', '/health', null, false)
    if (!healthCheck.ok) {
      console.log('❌ API server is not running')
      console.log('   Please start the server with: npm run dev:api')
      return false
    }
    console.log('✅ API server is running')
  } catch (error) {
    console.log('❌ Cannot connect to API server')
    console.log('   Please start the server with: npm run dev:api')
    return false
  }

  // Test authentication with test token
  console.log('\n🧪 Testing authentication with test token...')
  const authTest = await makeRequest('GET', '/enrollment/status/perfecting-life-transactions', null, true)
  
  if (authTest.ok) {
    console.log('✅ Test token authentication working')
  } else {
    console.log('❌ Test token authentication failed:', authTest.data)
    return false
  }

  // Create test user in database
  console.log('\n👤 Creating test user in database...')
  const userResult = await makeRequest('POST', '/test/create-user', {
    userId: TEST_USER_ID,
    azureUserId: TEST_USER_ID,
    email: 'test@example.com',
    name: 'Test User'
  }, false)

  if (userResult.ok) {
    console.log('✅ Test user created in database')
  } else {
    console.log('❌ Failed to create test user:', userResult.data)
    return false
  }

  // Create test enrollment
  console.log('\n🎓 Creating test enrollment...')
  const enrollmentResult = await makeRequest('POST', '/enrollment/enroll', {
    courseSlug: 'perfecting-life-transactions',
    method: 'explicit'
  }, true)

  if (enrollmentResult.ok) {
    console.log('✅ Test enrollment created successfully')
    console.log('   Enrollment ID:', enrollmentResult.data.enrollment?.id)
  } else if (enrollmentResult.data?.message === 'Already enrolled') {
    console.log('✅ Test user already enrolled (existing enrollment found)')
  } else {
    console.log('❌ Failed to create test enrollment:', enrollmentResult.data)
    return false
  }

  // Verify course access
  console.log('\n📚 Verifying course access...')
  const accessResult = await makeRequest('GET', '/lessons/course-access/perfecting-life-transactions', null, true)
  
  if (accessResult.ok) {
    console.log('✅ Course access verified')
    console.log('   Is Enrolled:', accessResult.data.isEnrolled)
    console.log('   Total Lessons:', accessResult.data.summary?.totalLessons)
    console.log('   Accessible Lessons:', accessResult.data.summary?.accessibleLessons)
  } else {
    console.log('❌ Failed to verify course access:', accessResult.data)
    return false
  }

  console.log('\n🎉 Test data setup completed successfully!')
  console.log('✅ Ready to run all test suites')
  return true
}

// Run setup
setupTestData().then(success => {
  if (success) {
    console.log('\n🚀 You can now run the test suites:')
    console.log('   node test-auth-api.mjs')
    console.log('   node test-lesson-access-api.mjs') 
    console.log('   node test-e2e-lesson-access.mjs')
    console.log('   node test-hardening-simple.mjs')
  } else {
    console.log('\n❌ Test data setup failed')
    process.exit(1)
  }
}).catch(error => {
  console.error('❌ Setup error:', error)
  process.exit(1)
})