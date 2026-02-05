/**
 * Test script for Entra ID Authentication API
 * Tests the authentication middleware and enrollment endpoints
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

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...')
  const result = await makeRequest('GET', '/health')
  
  if (result.ok && result.data.ok) {
    console.log('✅ Health check passed')
    console.log(`   Timestamp: ${result.data.timestamp}`)
    console.log(`   Supabase: ${result.data.supabaseConfigured ? 'Configured' : 'Not configured'}`)
  } else {
    console.log('❌ Health check failed:', result.data || result.error)
  }
  
  return result.ok
}

async function testUnauthenticatedRequest() {
  console.log('\n🚫 Testing Unauthenticated Request...')
  const result = await makeRequest('GET', '/enrollment/status/test-course')
  
  if (result.status === 401) {
    console.log('✅ Unauthenticated request properly rejected')
    console.log(`   Status: ${result.status}`)
    console.log(`   Error: ${result.data.error}`)
  } else {
    console.log('❌ Unauthenticated request should have been rejected')
    console.log(`   Status: ${result.status}`)
    console.log(`   Data:`, result.data)
  }
  
  return result.status === 401
}

async function testTestTokenRequest() {
  console.log('\n🧪 Testing Test Token Request...')
  const result = await makeRequest('GET', '/enrollment/status/test-course', null, 'test-token')
  
  if (result.ok) {
    console.log('✅ Test token request accepted')
    console.log(`   Status: ${result.status}`)
    console.log(`   Data:`, result.data)
  } else {
    console.log('❌ Test token request failed')
    console.log(`   Status: ${result.status}`)
    console.log(`   Error:`, result.data)
  }
  
  return result.ok
}

async function testInvalidTokenRequest() {
  console.log('\n❌ Testing Invalid Token Request...')
  const result = await makeRequest('GET', '/enrollment/status/test-course', null, 'invalid-token')
  
  if (result.status === 401) {
    console.log('✅ Invalid token properly rejected')
    console.log(`   Status: ${result.status}`)
    console.log(`   Error: ${result.data.error}`)
  } else {
    console.log('❌ Invalid token should have been rejected')
    console.log(`   Status: ${result.status}`)
    console.log(`   Data:`, result.data)
  }
  
  return result.status === 401
}

async function testEnrollmentWithTestToken() {
  console.log('\n📚 Testing Enrollment with Test Token...')
  
  // Test enrollment creation
  const enrollResult = await makeRequest('POST', '/enrollment/enroll', {
    courseSlug: 'test-course',
    method: 'explicit'
  }, 'test-token')
  
  if (enrollResult.ok) {
    console.log('✅ Enrollment creation successful')
    console.log(`   Status: ${enrollResult.status}`)
    console.log(`   Message: ${enrollResult.data.message}`)
    console.log(`   Enrollment ID: ${enrollResult.data.enrollment?.id}`)
  } else {
    console.log('❌ Enrollment creation failed')
    console.log(`   Status: ${enrollResult.status}`)
    console.log(`   Error:`, enrollResult.data)
  }
  
  // Test enrollment status check
  const statusResult = await makeRequest('GET', '/enrollment/status/test-course', null, 'test-token')
  
  if (statusResult.ok) {
    console.log('✅ Enrollment status check successful')
    console.log(`   Is Enrolled: ${statusResult.data.isEnrolled}`)
    console.log(`   Status: ${statusResult.data.enrollmentStatus}`)
  } else {
    console.log('❌ Enrollment status check failed')
    console.log(`   Status: ${statusResult.status}`)
    console.log(`   Error:`, statusResult.data)
  }
  
  return enrollResult.ok && statusResult.ok
}

async function testAccessContract() {
  console.log('\n🔐 Testing Access Contract with Test Token...')
  
  const result = await makeRequest('GET', '/enrollment/access/test-course', null, 'test-token')
  
  if (result.ok) {
    console.log('✅ Access contract retrieval successful')
    console.log(`   Is Enrolled: ${result.data.isEnrolled}`)
    console.log(`   Enrollment Status: ${result.data.enrollmentStatus}`)
    console.log(`   Subscription Status: ${result.data.subscriptionStatus}`)
    console.log(`   User ID: ${result.data.userId}`)
  } else {
    console.log('❌ Access contract retrieval failed')
    console.log(`   Status: ${result.status}`)
    console.log(`   Error:`, result.data)
  }
  
  return result.ok
}

async function testUserEnrollments() {
  console.log('\n👤 Testing User Enrollments with Test Token...')
  
  const result = await makeRequest('GET', '/enrollment/user/test-user-123', null, 'test-token')
  
  if (result.ok) {
    console.log('✅ User enrollments retrieval successful')
    console.log(`   Enrollments Count: ${result.data.count}`)
    console.log(`   Enrollments:`, result.data.enrollments?.map(e => ({
      courseSlug: e.courseSlug,
      status: e.status,
      enrolledAt: e.enrolledAt
    })))
  } else {
    console.log('❌ User enrollments retrieval failed')
    console.log(`   Status: ${result.status}`)
    console.log(`   Error:`, result.data)
  }
  
  return result.ok
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Entra ID Authentication API Tests')
  console.log('=' .repeat(50))
  
  const results = []
  
  // Test 1: Health Check
  results.push(await testHealthCheck())
  
  // Test 2: Unauthenticated Request
  results.push(await testUnauthenticatedRequest())
  
  // Test 3: Test Token Request
  results.push(await testTestTokenRequest())
  
  // Test 4: Invalid Token Request
  results.push(await testInvalidTokenRequest())
  
  // Test 5: Enrollment with Test Token
  results.push(await testEnrollmentWithTestToken())
  
  // Test 6: Access Contract
  results.push(await testAccessContract())
  
  // Test 7: User Enrollments
  results.push(await testUserEnrollments())
  
  // Summary
  console.log('\n' + '=' .repeat(50))
  console.log('📊 Test Results Summary')
  console.log('=' .repeat(50))
  
  const passed = results.filter(r => r).length
  const total = results.length
  
  console.log(`✅ Passed: ${passed}/${total}`)
  console.log(`❌ Failed: ${total - passed}/${total}`)
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Entra ID authentication is working correctly.')
  } else {
    console.log('\n⚠️ Some tests failed. Please check the API server and configuration.')
  }
  
  console.log('\n📝 Next Steps:')
  console.log('1. Start the API server: npm run dev:api')
  console.log('2. Test with real Azure AD tokens from the frontend')
  console.log('3. Verify token validation with your Azure AD tenant')
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

// Run the tests
async function main() {
  const serverRunning = await checkServerStatus()
  
  if (serverRunning) {
    await runTests()
  } else {
    console.log('\n🚨 Cannot run tests - API server is not accessible')
    console.log('Please start the API server first:')
    console.log('   npm run dev:api')
  }
}

main().catch(console.error)