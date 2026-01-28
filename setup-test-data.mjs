/**
 * Setup Test Data for Lesson Access Testing
 * Creates test user and enrollment for testing server-side access control
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

// Test helper function
async function makeRequest(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`
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
  
  // 1. Create test user
  console.log('\n👤 Creating test user...')
  const userResult = await makeRequest('POST', '/test/create-user', {
    userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // Valid UUID format
    azureUserId: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User'
  })
  
  if (userResult.ok) {
    console.log('✅ Test user created/verified')
  } else {
    console.log('❌ Failed to create test user:', userResult.data)
    return false
  }
  
  // 2. Enroll test user in PLT course
  console.log('\n🎓 Enrolling test user in PLT course...')
  const enrollResult = await makeRequest('POST', '/enrollment/enroll', {
    courseSlug: 'perfecting-life-transactions',
    method: 'explicit'
  }, 'test-token')
  
  if (enrollResult.ok) {
    console.log('✅ Test user enrolled in course')
    console.log(`   Enrollment ID: ${enrollResult.data.enrollment?.id}`)
    console.log(`   Status: ${enrollResult.data.enrollment?.status}`)
  } else {
    console.log('❌ Failed to enroll test user:', enrollResult.data)
    return false
  }
  
  // 3. Verify enrollment
  console.log('\n🔍 Verifying enrollment...')
  const statusResult = await makeRequest('GET', '/enrollment/status/perfecting-life-transactions', null, 'test-token')
  
  if (statusResult.ok && statusResult.data.isEnrolled) {
    console.log('✅ Enrollment verified')
    console.log(`   Is Enrolled: ${statusResult.data.isEnrolled}`)
    console.log(`   Status: ${statusResult.data.enrollmentStatus}`)
  } else {
    console.log('❌ Enrollment verification failed:', statusResult.data)
    return false
  }
  
  console.log('\n🎉 Test data setup complete!')
  console.log('You can now run: node test-lesson-access-api.mjs')
  
  return true
}

// Check if API server is running
async function checkServerStatus() {
  console.log('🔍 Checking if API server is running...')
  
  try {
    const response = await fetch(`${API_BASE}/health`)
    if (response.ok) {
      console.log('✅ API server is running')
      return true
    } else {
      console.log('❌ API server responded with error:', response.status)
      return false
    }
  } catch (error) {
    console.log('❌ API server is not running or not accessible')
    console.log('   Please start the server with: npm run dev:api')
    return false
  }
}

// Main function
async function main() {
  const serverRunning = await checkServerStatus()
  
  if (serverRunning) {
    await setupTestData()
  } else {
    console.log('\n🚨 Cannot setup test data - API server is not accessible')
    console.log('Please start the API server first:')
    console.log('   npm run dev:api')
  }
}

main().catch(console.error)