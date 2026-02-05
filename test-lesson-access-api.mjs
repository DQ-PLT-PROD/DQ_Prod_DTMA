/**
 * Test script for Lesson Access API
 * Tests server-side access enforcement for lessons
 * Feature 02.1 - Day 2 Implementation
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

async function testUnauthenticatedLessonAccess() {
  console.log('\n🚫 Testing Unauthenticated Lesson Access...')
  
  // Test access to a preview lesson (should be allowed)
  console.log('   Testing preview lesson access (Course Introduction)...')
  const previewResult = await makeRequest('GET', '/lessons/access/perfecting-life-transactions/intro-lesson')
  
  if (previewResult.ok) {
    console.log('✅ Preview lesson access check completed')
    console.log(`   Can Access: ${previewResult.data.canAccess}`)
    console.log(`   Access Type: ${previewResult.data.accessType}`)
    console.log(`   Reason: ${previewResult.data.reason}`)
  } else {
    console.log('❌ Preview lesson access failed:', previewResult.data)
  }
  
  // Test access to a full lesson (should be denied)
  console.log('   Testing full lesson access (Lesson 2)...')
  const fullResult = await makeRequest('GET', '/lessons/access/perfecting-life-transactions/lesson-2')
  
  if (fullResult.ok) {
    console.log('✅ Full lesson access check completed')
    console.log(`   Can Access: ${fullResult.data.canAccess}`)
    console.log(`   Access Type: ${fullResult.data.accessType}`)
    console.log(`   Reason: ${fullResult.data.reason}`)
  } else {
    console.log('❌ Full lesson access check failed:', fullResult.data)
  }
  
  return previewResult.ok && fullResult.ok
}

async function testAuthenticatedLessonAccess() {
  console.log('\n🔐 Testing Authenticated Lesson Access...')
  
  // Test with test token (enrolled user)
  const result = await makeRequest('GET', '/lessons/access/perfecting-life-transactions/lesson-2', null, 'test-token')
  
  if (result.ok) {
    console.log('✅ Authenticated lesson access check successful')
    console.log(`   Can Access: ${result.data.canAccess}`)
    console.log(`   Access Type: ${result.data.accessType}`)
    console.log(`   Reason: ${result.data.reason}`)
    
    if (result.data.lesson) {
      console.log(`   Lesson: ${result.data.lesson.title} (Order: ${result.data.lesson.orderIndex})`)
    }
  } else {
    console.log('❌ Authenticated lesson access check failed')
    console.log(`   Status: ${result.status}`)
    console.log(`   Error:`, result.data)
  }
  
  return result.ok
}

async function testCourseAccessSummary() {
  console.log('\n📚 Testing Course Access Summary...')
  
  // Test unauthenticated course access summary
  console.log('   Testing unauthenticated course summary...')
  const unauthResult = await makeRequest('GET', '/lessons/course-access/perfecting-life-transactions')
  
  if (unauthResult.ok) {
    console.log('✅ Unauthenticated course access summary successful')
    console.log(`   Is Enrolled: ${unauthResult.data.isEnrolled}`)
    console.log(`   Total Lessons: ${unauthResult.data.summary?.totalLessons || 0}`)
    console.log(`   Preview Lessons: ${unauthResult.data.summary?.previewLessons || 0}`)
    console.log(`   Accessible Lessons: ${unauthResult.data.summary?.accessibleLessons || 0}`)
  } else {
    console.log('❌ Unauthenticated course access summary failed:', unauthResult.data)
  }
  
  // Test authenticated course access summary
  console.log('   Testing authenticated course summary...')
  const authResult = await makeRequest('GET', '/lessons/course-access/perfecting-life-transactions', null, 'test-token')
  
  if (authResult.ok) {
    console.log('✅ Authenticated course access summary successful')
    console.log(`   Is Enrolled: ${authResult.data.isEnrolled}`)
    console.log(`   Total Lessons: ${authResult.data.summary?.totalLessons || 0}`)
    console.log(`   Accessible Lessons: ${authResult.data.summary?.accessibleLessons || 0}`)
    console.log(`   Blocked Lessons: ${authResult.data.summary?.blockedLessons || 0}`)
  } else {
    console.log('❌ Authenticated course access summary failed:', authResult.data)
  }
  
  return unauthResult.ok && authResult.ok
}

async function testLessonContent() {
  console.log('\n📖 Testing Lesson Content Access...')
  
  // Test preview lesson content (should be accessible)
  console.log('   Testing preview lesson content...')
  const previewResult = await makeRequest('GET', '/lessons/content/test-course/preview-lesson-1')
  
  if (previewResult.ok) {
    console.log('✅ Preview lesson content accessible')
    console.log(`   Lesson Title: ${previewResult.data.lesson?.title}`)
    console.log(`   Access Type: ${previewResult.data.accessInfo?.accessType}`)
    console.log(`   Has Video URL: ${!!previewResult.data.lesson?.videoUrl}`)
  } else {
    console.log('❌ Preview lesson content access failed:', previewResult.data)
  }
  
  // Test full lesson content without authentication (should be denied)
  console.log('   Testing full lesson content without auth...')
  const unauthResult = await makeRequest('GET', '/lessons/content/test-course/full-lesson-1')
  
  if (!unauthResult.ok && unauthResult.status === 401) {
    console.log('✅ Full lesson content properly denied for unauthenticated user')
    console.log(`   Status: ${unauthResult.status}`)
    console.log(`   Error: ${unauthResult.data.error}`)
  } else {
    console.log('❌ Full lesson content should be denied for unauthenticated user')
    console.log('   Result:', unauthResult.data)
  }
  
  // Test full lesson content with authentication
  console.log('   Testing full lesson content with auth...')
  const authResult = await makeRequest('GET', '/lessons/content/test-course/full-lesson-1', null, 'test-token')
  
  if (authResult.ok) {
    console.log('✅ Full lesson content accessible for authenticated user')
    console.log(`   Lesson Title: ${authResult.data.lesson?.title}`)
    console.log(`   Access Type: ${authResult.data.accessInfo?.accessType}`)
    console.log(`   Has Video URL: ${!!authResult.data.lesson?.videoUrl}`)
  } else {
    console.log('❌ Full lesson content access failed for authenticated user:', authResult.data)
  }
  
  return previewResult.ok && !unauthResult.ok && authResult.ok
}

async function testLessonProgress() {
  console.log('\n📈 Testing Lesson Progress Updates...')
  
  // Test progress update without authentication (should be denied)
  console.log('   Testing progress update without auth...')
  const unauthResult = await makeRequest('POST', '/lessons/progress/test-course/full-lesson-1', {
    completed: true,
    watchTimeSeconds: 300
  })
  
  if (!unauthResult.ok && unauthResult.status === 401) {
    console.log('✅ Progress update properly denied for unauthenticated user')
    console.log(`   Status: ${unauthResult.status}`)
    console.log(`   Error: ${unauthResult.data.error}`)
  } else {
    console.log('❌ Progress update should be denied for unauthenticated user')
    console.log('   Result:', unauthResult.data)
  }
  
  // Test progress update with authentication
  console.log('   Testing progress update with auth...')
  const authResult = await makeRequest('POST', '/lessons/progress/test-course/full-lesson-1', {
    completed: true,
    watchTimeSeconds: 300
  }, 'test-token')
  
  if (authResult.ok) {
    console.log('✅ Progress update successful for authenticated user')
    console.log(`   Lesson ID: ${authResult.data.progress?.lessonId}`)
    console.log(`   Completed: ${authResult.data.progress?.completed}`)
    console.log(`   Watch Time: ${authResult.data.progress?.watchTimeSeconds}s`)
  } else {
    console.log('❌ Progress update failed for authenticated user:', authResult.data)
  }
  
  return !unauthResult.ok && authResult.ok
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Lesson Access API Tests')
  console.log('=' .repeat(60))
  
  const results = []
  
  // Test 1: Health Check
  results.push(await testHealthCheck())
  
  // Test 2: Unauthenticated Lesson Access
  results.push(await testUnauthenticatedLessonAccess())
  
  // Test 3: Authenticated Lesson Access
  results.push(await testAuthenticatedLessonAccess())
  
  // Test 4: Course Access Summary
  results.push(await testCourseAccessSummary())
  
  // Test 5: Lesson Content Access
  results.push(await testLessonContent())
  
  // Test 6: Lesson Progress Updates
  results.push(await testLessonProgress())
  
  // Summary
  console.log('\n' + '=' .repeat(60))
  console.log('📊 Test Results Summary')
  console.log('=' .repeat(60))
  
  const passed = results.filter(r => r).length
  const total = results.length
  
  console.log(`✅ Passed: ${passed}/${total}`)
  console.log(`❌ Failed: ${total - passed}/${total}`)
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Server-side lesson access control is working correctly.')
  } else {
    console.log('\n⚠️ Some tests failed. Please check the API server and database setup.')
  }
  
  console.log('\n📝 Next Steps:')
  console.log('1. Set up test data in Supabase (courses, lessons, enrollments)')
  console.log('2. Test with real Azure AD tokens from the frontend')
  console.log('3. Verify sequential access logic with lesson progress')
  console.log('4. Test preview vs full lesson access enforcement')
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